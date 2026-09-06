import type { StyleSpecification } from "maplibre-gl";
import { siteConfig } from "@/lib/site-config";

/**
 * Plain raster tiles (OpenStreetMap by default, or whatever
 * NEXT_PUBLIC_MAP_TILES_URL points at). Isolated here so swapping to
 * Mapbox/Google/a vector basemap later means changing this one file, not
 * every place that renders a map (the "swappable MapProvider" seam from
 * the spec).
 */
export const osmRasterStyle: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: [siteConfig.mapTilesUrl],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
      maxzoom: 19,
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};
