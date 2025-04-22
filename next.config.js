//next.config.js
// This is a Next.js configuration file that sets up environment variables and headers for API routes.

/** @type {import('next').NextConfig} */
const nextConfig = {

    // Environment variables to be used client-side
    env: {
      APP_URL: process.env.APP_URL || 'http://localhost:3000',
    },
    
    // Headers to allow cross-origin requests (if needed)
    async headers() {
      return [
        {
          source: '/api/:path*',
          headers: [
            { key: 'Access-Control-Allow-Credentials', value: 'true' },
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
            { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
          ],
        },
      ]
    },
  }
  
  module.exports = nextConfig