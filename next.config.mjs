// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: '/models',
        permanent: false,
      },
    ]
  },
  async rewrites() {
    // Dynamic Target Resolver
    // These MUST be set in .env or Vercel Environment Variables.
    // If they are missing during build, we fallback to '/' to prevent build failure.
    
    const DOCS_TARGET = process.env.NEXT_PUBLIC_DOCS_URL || '';
    const COMMUNITY_TARGET = process.env.NEXT_PUBLIC_COMMUNITY_URL || '';
    const DASHBOARD_TARGET = process.env.NEXT_PUBLIC_DASHBOARD_URL || '';

    if (!DOCS_TARGET || !COMMUNITY_TARGET || !DASHBOARD_TARGET) {
      console.warn("CRITICAL: Missing Federated Service URLs in Environment Variables.");
    }

    const rewrites = [
      // Proxy the External High-Fidelity Demo (Temporary Studio)
      { source: '/studio/:path*', destination: 'https://openxai-studio-demo.vercel.app/:path*' },
    ];

    // Helper to add rewrites only if target is defined and valid
    const addRewrite = (source, targetPath) => {
      if (targetPath && (targetPath.startsWith('http') || targetPath.startsWith('/'))) {
        rewrites.push({ source, destination: targetPath });
      }
    };

    // Federated Submodule Proxies
    addRewrite('/community/:path*', `${COMMUNITY_TARGET}/community/:path*`);
    addRewrite('/c/:path*', `${COMMUNITY_TARGET}/c/:path*`);
    addRewrite('/t/:path*', `${COMMUNITY_TARGET}/t/:path*`);
    addRewrite('/x/:path*', `${COMMUNITY_TARGET}/x/:path*`);
    addRewrite('/auth/:path*', `${COMMUNITY_TARGET}/auth/:path*`);
    addRewrite('/build-grow/:path*', `${COMMUNITY_TARGET}/build-grow/:path*`);
    addRewrite('/contributors/:path*', `${COMMUNITY_TARGET}/contributors/:path*`);
    addRewrite('/forums/:path*', `${COMMUNITY_TARGET}/forums/:path*`);
    addRewrite('/activity/:path*', `${COMMUNITY_TARGET}/activity/:path*`);
    addRewrite('/courses/:path*', `${COMMUNITY_TARGET}/courses/:path*`);
    
    addRewrite('/docs/:path*', `${DOCS_TARGET}/docs/:path*`);
    
    addRewrite('/dashboard/:path*', `${DASHBOARD_TARGET}/dashboard/:path*`);
    addRewrite('/ecosystem/:path*', `${DASHBOARD_TARGET}/ecosystem/:path*`);
    addRewrite('/token/:path*', `${DASHBOARD_TARGET}/token/:path*`);
    addRewrite('/claims/:path*', `${DASHBOARD_TARGET}/claims/:path*`);
    addRewrite('/earn/:path*', `${DASHBOARD_TARGET}/earn/:path*`);

    // API Proxies
    addRewrite('/api/ecosystem/:path*', `${DASHBOARD_TARGET}/api/ecosystem/:path*`);
    addRewrite('/api/courses/:path*', `${COMMUNITY_TARGET}/api/courses/:path*`);
    addRewrite('/api/progress/:path*', `${COMMUNITY_TARGET}/api/progress/:path*`);
    addRewrite('/api/user/:path*', `${COMMUNITY_TARGET}/api/user/:path*`);
    addRewrite('/api/forums/:path*', `${COMMUNITY_TARGET}/api/forums/:path*`);

    return rewrites;
  },
};

export default nextConfig;
