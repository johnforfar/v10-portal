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
    return [
      // Proxy the External High-Fidelity Demo (Temporary Studio)
      { source: '/studio/:path*', destination: 'https://openxai-studio-demo.vercel.app/:path*' },
      
      // Proxy the Local Federated Services (Native Performance)
      { source: '/builder/:path*', destination: 'http://127.0.0.1:8501/:path*' },
      { source: '/community/:path*', destination: 'http://127.0.0.1:3002/:path*' },
      { source: '/c/:path*', destination: 'http://127.0.0.1:3002/c/:path*' },
      { source: '/t/:path*', destination: 'http://127.0.0.1:3002/t/:path*' },
      { source: '/x/:path*', destination: 'http://127.0.0.1:3002/x/:path*' },
      { source: '/auth/:path*', destination: 'http://127.0.0.1:3002/auth/:path*' },
      { source: '/build-grow/:path*', destination: 'http://127.0.0.1:3002/build-grow/:path*' },
      { source: '/contributors/:path*', destination: 'http://127.0.0.1:3002/contributors/:path*' },
      { source: '/forums/:path*', destination: 'http://127.0.0.1:3002/forums/:path*' },
      { source: '/activity/:path*', destination: 'http://127.0.0.1:3002/activity/:path*' },
      { source: '/docs/:path*', destination: 'http://127.0.0.1:3003/:path*' },
      { source: '/dashboard/:path*', destination: 'http://127.0.0.1:3004/dashboard/:path*' },
      { source: '/ecosystem/:path*', destination: 'http://127.0.0.1:3004/ecosystem/:path*' },
      { source: '/token/:path*', destination: 'http://127.0.0.1:3004/token/:path*' },
      { source: '/claims/:path*', destination: 'http://127.0.0.1:3004/claims/:path*' },
      { source: '/earn/:path*', destination: 'http://127.0.0.1:3004/earn/:path*' },

      // API Proxies for Federated Services
      { source: '/api/ecosystem/:path*', destination: 'http://127.0.0.1:3004/api/ecosystem/:path*' },
      { source: '/api/courses/:path*', destination: 'http://127.0.0.1:3002/api/courses/:path*' },
      { source: '/api/progress/:path*', destination: 'http://127.0.0.1:3002/api/progress/:path*' },
      { source: '/api/user/:path*', destination: 'http://127.0.0.1:3002/api/user/:path*' },
      { source: '/api/forums/:path*', destination: 'http://127.0.0.1:3002/api/forums/:path*' },
    ]
  },
};

export default nextConfig;
