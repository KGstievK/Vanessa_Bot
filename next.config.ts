const nextConfig = {
  env: {
    TELEGRAM_API_TOKEN: process.env.NEXT_PUBLIC_TELEGRAM_API_TOKEN,
  },
  webpack: (config: { resolve: { fallback: { fs: boolean; }; }; }) => {
    config.resolve.fallback = { fs: false };
    return config;
  }
};