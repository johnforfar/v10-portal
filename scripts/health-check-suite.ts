import { chromium, Browser, Page, Response } from 'playwright';

async function runTests() {
  console.log('--- Starting V10 Platform Deep Scan & Sidebar Audit ---');
  const browser: Browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page: Page = await context.newPage();

  // Start at Apex
  console.log('Navigating to Portal Apex: http://localhost:3000');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // Get all sidebar links
  const links = await page.evaluate(() => {
    const sidebarLinks = Array.from(document.querySelectorAll('nav a'));
    return sidebarLinks.map(link => ({
      name: (link as HTMLElement).innerText.trim() || 'Link',
      href: (link as HTMLAnchorElement).href,
      localPath: (link as HTMLAnchorElement).getAttribute('href') || ''
    }));
  });

  console.log(`Found ${links.length} sidebar links. Starting click-through...`);

  const results = [];

  for (const link of links) {
    // Skip external links for now as they might be slow or unstable
    if (link.href.startsWith('http') && !link.href.includes('localhost:3000') && !link.href.includes('127.0.0.1')) {
      console.log(`Skipping external link: ${link.name} (${link.href})`);
      results.push({ name: link.name, status: 'SKIPPED (External)', latency: 'N/A', error: 'N/A', identityStrip: 'N/A' });
      continue;
    }

    console.log(`\nTesting: ${link.name} -> ${link.href}`);
    const startTime = Date.now();
    const consoleErrors: string[] = [];
    
    const consoleHandler = (msg: any) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    };
    page.on('console', consoleHandler);

    try {
      const response: Response | null = await page.goto(link.href, { 
        waitUntil: 'networkidle', 
        timeout: 20000 
      });
      
      const latency = Date.now() - startTime;
      const status = response?.status() || 'No Status';
      const bodyContent = await page.content();
      
      const isInternalError = bodyContent.includes('Internal Server Error') || bodyContent.includes('500');
      const is404 = bodyContent.includes('404') || status === 404;
      const isBlank = bodyContent.length < 500;
      const hasIdentityStrip = bodyContent.includes('bg-blue-600') || bodyContent.includes('#2563eb');
      
      // Extract title to verify content
      const pageTitle = await page.title();

      results.push({
        name: link.name,
        status,
        latency: `${latency}ms`,
        error: isInternalError ? '500' : (is404 ? '404' : (isBlank ? 'Blank' : 'OK')),
        title: pageTitle.substring(0, 30),
        identityStrip: hasIdentityStrip ? 'YES' : 'NO',
        consoleErrors: consoleErrors.length,
        url: link.href
      });

      console.log(`[${link.name}] Status: ${status} | Latency: ${latency}ms | Title: ${pageTitle}`);
    } catch (e: any) {
      console.error(`FAILED ${link.name}: ${e.message}`);
      results.push({ 
        name: link.name, 
        status: 'FAIL/TIMEOUT', 
        latency: 'N/A', 
        error: e.message,
        url: link.href 
      });
    }
    
    page.off('console', consoleHandler);
  }

  console.log('\n--- FINAL V10 PLATFORM AUDIT ---');
  console.table(results);
  
  await browser.close();
}

runTests().catch(console.error);
