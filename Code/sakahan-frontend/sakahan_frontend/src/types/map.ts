import type { Feature, FeatureCollection, Geometry } from "geojson";
import { type LatLngLiteral } from "leaflet";
import { type SVGProps } from "react";
import type { AidType, BasemapType, CardType, CategoryType, ToastType, ToolType } from "@/enums";

export interface MapState {
  basemap: BasemapType;
  search: SearchType | null;
  searchList: SearchType[];
  zoom: number;
  pointer: LatLngLiteral;
  scale: string;
  card: CardType;
  filter: FilterType | null;
  filterList: FilterType[];
  classification: ClassificationType[];
  classificationList: Record<string, ClassificationType[]>;
  tool: ToolType;
  category: CategoryType;
  geometryFeatures: FeatureCollection | null;
  selectedGeometryFeature: Feature | null;
}

export interface BasemapProps {
  url: string;
  attribution: string;
}

export type SearchType = {
  search_query: string;
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  class: string;
  type: string;
  place_rank: number;
  importance: number;
  addresstype: string;
  name: string;
  display_name: string;
  boundingbox: string[];
  geojson: Geometry | undefined;
};

export interface FilterCategory {
  category: Filter | null;
}

export interface Filter {
  id: number;
  name: string;
  code: string;
  published: boolean;
  isDeleted: boolean;
}

export type FilterType = Filter & FilterCategory;

export interface ClassificationSelect {
  selected: boolean;
}

export interface Classification {
  id: number;
  name: string;
  label: string;
  gridcode: number;
  color: string;
}

export type ClassificationType = Classification & ClassificationSelect;

export interface ToastState {
  openToast: boolean;
  title: string;
  message: string;
  severity: ToastType;
}

export interface ProviderProps {
  children: React.ReactNode;
}

export interface IconButtonProps {
  type: CardType | ToolType | AidType;
  Icon: React.FC<SVGProps<SVGElement>>;
  label?: string;
}
