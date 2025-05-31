import { area, convertArea, convertLength, length, multiLineString, multiPolygon, polygon } from "@turf/turf";
import { type Geometry } from "geojson";
import type { LatLngExpression, LatLngTuple } from "leaflet";
import { type SearchType } from "@/types";

export const computeSearchArea = (search: SearchType) => {
  const geometry: Geometry | undefined = search.geojson;

  switch (geometry?.type) {
    case "Polygon":
      return convertArea(area(polygon(geometry.coordinates)));

    case "MultiLineString":
      return convertArea(area(multiLineString(geometry.coordinates)));

    case "MultiPolygon":
      return convertArea(area(multiPolygon(geometry.coordinates)));

    default:
      return 0;
  }
};

export const computeSearchPerimeter = (search: SearchType) => {
  const geometry: Geometry | undefined = search.geojson;

  switch (geometry?.type) {
    case "Polygon":
      return convertLength(length(polygon(geometry.coordinates)));
    case "MultiLineString":
      return convertLength(length(multiLineString(geometry.coordinates)));
    case "MultiPolygon":
      return convertLength(length(multiPolygon(geometry.coordinates)));
    default:
      return 0;
  }
};

const extractPointCoordinates = (coordinates: LatLngExpression) => {
  const [lon, lat] = coordinates as LatLngTuple;
  const result = [lat, lon];

  return result as LatLngExpression;
};

const extractLineStringMultiPointCoordinates = (coordinates: LatLngExpression[]) => {
  const result = coordinates.map((coordinate) => {
    const [lon, lat] = coordinate as LatLngTuple;

    return [lat, lon];
  });

  return result as LatLngExpression[];
};

const extractPolygonMultiLineStringCoordinates = (coordinates: LatLngExpression[][]) => {
  const result = coordinates.map((polygon) =>
    polygon.map((coordinate) => {
      const [lon, lat] = coordinate as LatLngTuple;
      return [lat, lon];
    }),
  );

  return result as LatLngExpression[][];
};

const extractMultiPolygonCoordinates = (coordinates: LatLngExpression[][][]) => {
  const result = coordinates.map((multiPolygon) =>
    multiPolygon.map((polygon) =>
      polygon.map((coordinate) => {
        const [lon, lat] = coordinate as LatLngTuple;
        return [lat, lon];
      }),
    ),
  );

  return result as LatLngExpression[][][];
};

export const extractGeometryCoordinates = (search: SearchType | null) => {
  if (!search) return null;

  const geometry: Geometry | undefined = search.geojson;
  if (!geometry) {
    const bound = search.boundingbox.map((bound) => Number.parseFloat(bound));
    if (typeof window !== "undefined") {
      const L = require("leaflet");

      const bbox = new L.LatLngBounds([bound[0], bound[2]], [bound[1], bound[3]]);

      const center = bbox.getCenter();

      return [center.lat, center.lng] as LatLngExpression;
    }

    return null;
  }

  switch (geometry.type) {
    case "Point":
      return extractPointCoordinates(geometry.coordinates as LatLngExpression); // [lon, lat]

    case "LineString":
    case "MultiPoint":
      return extractLineStringMultiPointCoordinates(geometry.coordinates as LatLngExpression[]); // [[lon, lat], [lon, lat], ...]

    case "Polygon":
    case "MultiLineString":
      return extractPolygonMultiLineStringCoordinates(geometry.coordinates as LatLngExpression[][]); // [[[lon, lat], [lon, lat], ...], ...]

    case "MultiPolygon":
      return extractMultiPolygonCoordinates(geometry.coordinates as LatLngExpression[][][]); // [[[[lon, lat], [lon, lat]], ...], ...]

    default:
      console.log("Unsupported geometry type");
      return null;
  }
};

export const getDegree = (coordinates: LatLngTuple) => {
  const [lat, lng] = coordinates;

  const latDegree = Math.floor(lat);
  const latMinute = Math.floor((lat - latDegree) * 60);
  const latSecond = ((lat - latDegree) * 60 - latMinute) * 60;
  const latDirection = lat >= 0 ? "N" : "S";

  const lngDegree = Math.floor(lng);
  const lngMinute = Math.floor((lng - lngDegree) * 60);
  const lngSecond = ((lng - lngDegree) * 60 - lngMinute) * 60;
  const lngDirection = lng >= 0 ? "E" : "W";

  return `${Math.abs(latDegree)}° ${Math.abs(latMinute)}' ${Math.abs(latSecond).toFixed(2)}" ${latDirection}, ${Math.abs(lngDegree)}° ${Math.abs(lngMinute)}' ${Math.abs(lngSecond).toFixed(2)}" ${lngDirection}`;
};

export const getCoordinate = (coordinates: LatLngTuple) => {
  const [lat, lng] = coordinates;

  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
};

export const getPolygonArea = (vertices: LatLngTuple[]) => {
  if (vertices.length < 3) return 0;

  const coordinates = vertices.map((vertex) => {
    const [lat, lng] = vertex;
    return [lng, lat];
  });

  return convertArea(area(polygon([coordinates])), "meters", "hectares");
};

export const getPathPerimeter = (vertices: LatLngTuple[]) => {
  const coordinates = vertices.map((vertex) => {
    const [lat, lng] = vertex;
    return [lng, lat];
  });

  return convertLength(length(multiLineString([coordinates])));
};
