/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          "o2nszixfo0pgpcyj.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
