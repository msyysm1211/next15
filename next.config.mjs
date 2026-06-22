/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      { hostname: 'zos.alipayobjects.com' },
      { hostname: 'gw.alipayobjects.com' },
    ],
  },
};

export default nextConfig;
