import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Signed-in surfaces and API routes carry no public content.
      disallow: [
        "/admin",
        "/dashboard",
        "/profile",
        "/api/",
        "/ur/admin",
        "/ur/dashboard",
        "/ur/profile",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
