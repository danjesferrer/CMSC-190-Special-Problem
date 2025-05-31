import { bbox } from "@turf/turf";
import { type Polygon } from "geojson";
import type { LatLngTuple, Map as LeafletMap } from "leaflet";

export const convertToLngLat = (drawing: LatLngTuple[][]) => {
  return drawing.map((coordinate) => coordinate.map(([lat, lng]): LatLngTuple => [lng, lat]));
};

export const changePolygonView = (map: LeafletMap, newIndex: number, polygonList: LatLngTuple[][]) => {
  const coords = polygonList[newIndex];

  const geoJsonPolygon: Polygon = {
    type: "Polygon",
    coordinates: [[...coords.map(([lat, lng]) => [lng, lat])]],
  };

  const bounds = bbox(geoJsonPolygon);
  const southWest: LatLngTuple = [bounds[1], bounds[0]];
  const northEast: LatLngTuple = [bounds[3], bounds[2]];
  const boundingbox = [southWest, northEast];

  map.flyToBounds(boundingbox, {
    animate: true,
    padding: [20, 20],
    duration: 0.5,
  });
};
