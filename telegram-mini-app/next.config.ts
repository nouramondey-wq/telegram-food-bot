import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🔥 Static export for Firebase Hosting
  output: "export",

  // Optimize for Telegram Mini App (mobile WebView)
  images: {
    unoptimized: true, // Firebase Hosting doesn't support Next.js image optimization
  },

  // Disable trailing slashes for cleaner URLs
  trailingSlash: true,

  // Production source maps (disable for smaller builds)
  productionBrowserSourceMaps: false,

  // Remove console.log in production (keep errors/warnings)
  compiler: {
    removeConsole: {
      exclude: ["error", "warn"],
    },
  },
};

export default nextConfig;
