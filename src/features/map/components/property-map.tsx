"use client";

import * as React from "react";
import * as maplibregl from "maplibre-gl";
import Supercluster, { type ClusterFeature, type PointFeature } from "supercluster";
import "maplibre-gl/dist/maplibre-gl.css";
import { useRouter } from "@/i18n/navigation";
import { formatPriceShort } from "@/lib/currency";
import { osmRasterStyle } from "../style";

export interface MapProperty {
  id: string;
  slug: string;
  refCode: string;
  lat: number;
  lng: number;
  price: bigint | number;
  priceOnRequest: boolean;
  purpose: "SALE" | "RENT";
}

interface PropertyMapProps {
  properties: MapProperty[];
  hoveredId?: string | null;
  onHoverPin?: (id: string | null) => void;
  onBoundsChange?: (bounds: [number, number, number, number]) => void;
  className?: string;
}

const LAHORE_CENTER: [number, number] = [74.3587, 31.5204];

type LeafProps = {
  id: string;
  slug: string;
  refCode: string;
  label: string;
  purpose: string;
};

function toPointFeatures(properties: MapProperty[]): PointFeature<LeafProps>[] {
  return properties.map((p) => ({
    type: "Feature",
    properties: {
      id: p.id,
      slug: p.slug,
      refCode: p.refCode,
      label: formatPriceShort(p.price, { priceOnRequest: p.priceOnRequest }),
      purpose: p.purpose,
    },
    geometry: { type: "Point", coordinates: [p.lng, p.lat] },
  }));
}

/**
 * Clustering runs here, on the main thread, via the `supercluster` library
 * directly — MapLibre's built-in `cluster: true` GeoJSON source delegates
 * the same computation to a background worker, which isn't something this
 * component's render markers depend on either way.
 */
export function PropertyMap({
  properties,
  hoveredId,
  onHoverPin,
  onBoundsChange,
  className,
}: PropertyMapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<maplibregl.Map | null>(null);
  const markersRef = React.useRef<Map<string | number, maplibregl.Marker>>(new Map());
  const clusterIndexRef = React.useRef<Supercluster<LeafProps>>(null);
  const router = useRouter();

  const goToProperty = React.useEffectEvent((slug: string) =>
    router.push(`/properties/${slug}`),
  );
  const notifyHoverPin = React.useEffectEvent((id: string | null) => onHoverPin?.(id));
  const notifyBoundsChange = React.useEffectEvent(
    (bounds: [number, number, number, number]) => {
      onBoundsChange?.(bounds);
    },
  );

  const withValidCoords = React.useMemo(
    () => properties.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)),
    [properties],
  );

  const renderClusters = React.useEffectEvent(() => {
    const map = mapRef.current;
    const index = clusterIndexRef.current;
    if (!map || !index) return;

    const bounds = map.getBounds();
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];
    const zoom = Math.round(map.getZoom());
    const clusters = index.getClusters(bbox, zoom);

    const seen = new Set<string | number>();

    for (const feature of clusters) {
      const [lng, lat] = feature.geometry.coordinates;
      const isCluster = "cluster" in feature.properties && feature.properties.cluster;
      const key: string | number = isCluster
        ? (feature.properties as ClusterFeature<LeafProps>["properties"]).cluster_id
        : (feature.properties as LeafProps).id;
      seen.add(key);

      let marker = markersRef.current.get(key);
      if (marker) {
        marker.setLngLat([lng, lat]);
        continue;
      }

      const el = document.createElement("button");
      el.type = "button";

      if (isCluster) {
        const count = (feature.properties as ClusterFeature<LeafProps>["properties"])
          .point_count;
        const size = count < 10 ? 36 : count < 30 ? 44 : 52;
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.className =
          "flex items-center justify-center rounded-full border-2 border-accent-500 bg-brand-900 text-sm font-bold text-white shadow-md cursor-pointer hover:bg-brand-700 transition-colors";
        el.textContent = String(count);
        el.addEventListener("click", () => {
          const expansionZoom = Math.min(
            index.getClusterExpansionZoom(key as number),
            20,
          );
          map.easeTo({ center: [lng, lat], zoom: expansionZoom });
        });
      } else {
        const props = feature.properties as LeafProps;
        el.dataset.propertyId = props.id;
        el.className =
          "rounded-full border-2 border-white bg-brand-900 px-2.5 py-1 text-xs font-semibold text-white shadow-md hover:bg-accent-500 hover:text-brand-900 transition-colors cursor-pointer";
        el.textContent = props.label;
        el.addEventListener("mouseenter", () => notifyHoverPin(props.id));
        el.addEventListener("mouseleave", () => notifyHoverPin(null));
        el.addEventListener("click", () => goToProperty(props.slug));
      }

      marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([lng, lat])
        .addTo(map);
      markersRef.current.set(key, marker);
    }

    for (const [key, marker] of markersRef.current) {
      if (!seen.has(key)) {
        marker.remove();
        markersRef.current.delete(key);
      }
    }
  });

  // Init map once.
  React.useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: osmRasterStyle,
      center: LAHORE_CENTER,
      zoom: 11,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", renderClusters);
    map.on("move", renderClusters);
    map.on("moveend", () => {
      const b = map.getBounds();
      notifyBoundsChange([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
    });

    const markers = markersRef.current;
    return () => {
      for (const marker of markers.values()) marker.remove();
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Rebuild the cluster index whenever the property list changes, then
  // redraw immediately using the map's current viewport.
  React.useEffect(() => {
    const index = new Supercluster<LeafProps>({ radius: 50, maxZoom: 16 });
    index.load(toPointFeatures(withValidCoords));
    clusterIndexRef.current = index;
    if (mapRef.current?.isStyleLoaded()) renderClusters();
  }, [withValidCoords]);

  // Reflect hover state from the list onto individual (non-cluster) markers.
  React.useEffect(() => {
    for (const [, marker] of markersRef.current) {
      const el = marker.getElement();
      const id = el.dataset.propertyId;
      if (!id) continue;
      const isHovered = id === hoveredId;
      el.classList.toggle("ring-4", isHovered);
      el.classList.toggle("ring-accent-500", isHovered);
      el.classList.toggle("z-10", isHovered);
    }
  }, [hoveredId]);

  return <div ref={containerRef} className={className} />;
}
