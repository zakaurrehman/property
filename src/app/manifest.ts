import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description:
      "DHA Lahore property — verified listings, real file rates, agents who answer.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0b1f3a",
    lang: "en",
    categories: ["business", "finance", "lifestyle"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Search properties",
        url: "/properties",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "File rates",
        url: "/file-rates",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Saved",
        url: "/saved",
        icons: [{ src: "/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
