/** @type {import('next').NextConfig} */
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      ...(supabaseHostname
        ? [{ protocol: 'https', hostname: supabaseHostname, pathname: '/storage/v1/object/public/**' }]
        : []),
    ],
  },
};

export default nextConfig;
