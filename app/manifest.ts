import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Butlaxispro - Online Marketplace",
    short_name: "Butlaxispro",
    description: "Best Online store to connect vendors to vendors and vendors to customers",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#dc2626",
    orientation: "portrait-primary",
    categories: ["shopping", "marketplace", "business"],
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/screenshot-wide.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
      },
      {
        src: "/screenshot-narrow.png",
        sizes: "750x1334",
        type: "image/png",
        form_factor: "narrow",
      },
    ],
  }
}
