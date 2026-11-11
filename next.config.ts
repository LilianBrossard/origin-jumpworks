import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Site 100 % statique : `next build` produit le dossier `out/`.
  output: "export",
  trailingSlash: true,
  // Les images sont déjà optimisées (AVIF/WebP) par `scripts/harvest.ts`.
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
