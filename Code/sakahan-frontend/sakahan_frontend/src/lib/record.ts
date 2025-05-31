import { bbox } from "@turf/turf";
import type { Feature, FeatureCollection, Polygon } from "geojson";
import { type LatLngTuple } from "leaflet";

export const convertToLatLng = (geometries: FeatureCollection) => {
  return geometries.features.map((feature: Feature) => {
    const geometry = feature.geometry as Polygon;

    return geometry.coordinates[0].map(([lng, lat]): LatLngTuple => [lat, lng]);
  });
};

export const computeBoundingBox = (geometries: FeatureCollection) => {
  const bounds = bbox(geometries);

  // Check if bbox returned invalid bounds
  if (bounds[0] === Infinity || bounds[1] === Infinity || bounds[2] === -Infinity || bounds[3] === -Infinity) return [];

  const southWest: LatLngTuple = [bounds[1], bounds[0]];
  const northEast: LatLngTuple = [bounds[3], bounds[2]];

  return [southWest, northEast];
};
