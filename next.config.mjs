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
    // If they are missing, the platform will fail to proxy correctly.
    
    const DOCS_TARGET = process.env.NEXT_PUBLIC_DOCS_URL;
    const COMMUNITY_TARGET = process.env.NEXT_PUBLIC_COMMUNITY_URL;
    const DASHBOARD_TARGET = process.env.NEXT_PUBLIC_DASHBOARD_URL;

    if (!DOCS_TARGET || !COMMUNITY_TARGET || !DASHBOARD_TARGET) {
      console.warn("CRITICAL: Missing Federated Service URLs in Environment Variables.");
    }

    return [
      // Proxy the External High-Fidelity Demo (Temporary Studio)
      { source: '/studio/:path*', destination: 'https://openxai-studio-demo.vercel.app/:path*' },
      
      // Federated Submodule Proxies
      { source: '/community/:path*', destination: `${COMMUNITY_TARGET}/community/:path*` },
      { source: '/c/:path*', destination: `${COMMUNITY_TARGET}/c/:path*` },
      { source: '/t/:path*', destination: `${COMMUNITY_TARGET}/t/:path*` },
      { source: '/x/:path*', destination: `${COMMUNITY_TARGET}/x/:path*` },
      { source: '/auth/:path*', destination: `${COMMUNITY_TARGET}/auth/:path*` },
      { source: '/build-grow/:path*', destination: `${COMMUNITY_TARGET}/build-grow/:path*` },
      { source: '/contributors/:path*', destination: `${COMMUNITY_TARGET}/contributors/:path*` },
      { source: '/forums/:path*', destination: `${COMMUNITY_TARGET}/forums/:path*` },
      { source: '/activity/:path*', destination: `${COMMUNITY_TARGET}/activity/:path*` },
      { source: '/courses/:path*', destination: `${COMMUNITY_TARGET}/courses/:path*` },
      
      { source: '/docs/:path*', destination: `${DOCS_TARGET}/docs/:path*` },
      
      { source: '/dashboard/:path*', destination: `${DASHBOARD_TARGET}/dashboard/:path*` },
      { source: '/ecosystem/:path*', destination: `${DASHBOARD_TARGET}/ecosystem/:path*` },
      { source: '/token/:path*', destination: `${DASHBOARD_TARGET}/token/:path*` },
      { source: '/claims/:path*', destination: `${DASHBOARD_TARGET}/claims/:path*` },
      { source: '/earn/:path*', destination: `${DASHBOARD_TARGET}/earn/:path*` },

      // API Proxies
      { source: '/api/ecosystem/:path*', destination: `${DASHBOARD_TARGET}/api/ecosystem/:path*` },
      { source: '/api/courses/:path*', destination: `${COMMUNITY_TARGET}/api/courses/:path*` },
      { source: '/api/progress/:path*', destination: `${COMMUNITY_TARGET}/api/progress/:path*` },
      { source: '/api/user/:path*', destination: `${COMMUNITY_TARGET}/api/user/:path*` },
      { source: '/api/forums/:path*', destination: `${COMMUNITY_TARGET}/api/forums/:path*` },
    ]
  },
};

export default nextConfig;
