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
    qualities: [25, 50, 65, 69, 71, 72, 75, 100],
  },
};

export default nextConfig;
