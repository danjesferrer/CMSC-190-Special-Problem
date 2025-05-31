import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";

export const minZoom = 5;
export const maxZoom = 18;
export const maxBounds: LatLngBoundsExpression = [
  [-90, Number.NEGATIVE_INFINITY],
  [90, Number.POSITIVE_INFINITY],
];
export const defaultZoom = 13;
export const defaultPosition: LatLngExpression = [14.1651, 121.2402];
export const defaultBoundingBox: LatLngBoundsExpression = [
  [5.58100332277, 117.17427453],
  [18.5052273625, 126.537423944],
];

export const maxWidth = 100;
export const snapTolerance = 20; // Use for determining when to join points to form the polygon.
export const mapId = "map_container";
export const defaultSelectValue = "none";
export const defaultCategoryValue = "category";
export const defaultAddValue = "add";
export const maxTitleLength = 30;
export const maxAddressLength = 100;
export const maxDescriptionLength = 1500;
export const pageSize = 10;
export const maxFiles = 5;
export const maxFileSize = 5 * 1024 * 1024; // 5MB default
export const maxFileNameLength = 100;
export const acceptedFileTypes = ["application/pdf", ".pdf"]; // Changed to PDF only
