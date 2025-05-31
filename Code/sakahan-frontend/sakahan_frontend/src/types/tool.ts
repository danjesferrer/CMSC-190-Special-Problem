import { type LatLngTuple } from "leaflet";

export interface PolygonReference {
  polygonId: number;
}

export interface Snapshot {
  previewPolygon: LatLngTuple[];
  drawingVertices: LatLngTuple[];
  drawingComplete: LatLngTuple[][];
  editingVertices: LatLngTuple[];
  alteringDraft: LatLngTuple[][];
  referencePolygon: PolygonReference | null;
}

export interface ToolState {
  previewPolygon: LatLngTuple[];
  drawingVertices: LatLngTuple[];
  drawingComplete: LatLngTuple[][];
  editingVertices: LatLngTuple[];
  alteringDraft: LatLngTuple[][];
  referencePolygon: PolygonReference | null;
  past: Snapshot[];
  future: Snapshot[];
  polygonIndex: number;
}
