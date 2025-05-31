import { type LatLngTuple } from "leaflet";
import { type Record } from "@/types";

export interface Crop {
  id: number;
  name: string;
  code: string;
  published: boolean;
  isDeleted: boolean;
}

export interface CropElement {
  id: number;
  name: string;
  code: string;
  category: Crop | null;
  published: boolean;
  isDeleted: boolean;
}

export interface SuitabilityLevel {
  id: number;
  name: string;
  label: string;
  code: string;
  color: string;
}

export interface Contribution {
  author: number;
  title: string;
  address: string;
  description: string;
  crop: string | number;
  crop_element: string | number | null;
  suitability_level: number;
  status: number;
  geom: LatLngTuple[][];
}

export interface FileObject extends File {
  identifier: string;
  url: string | null;
}

export interface ContributionState {
  cropList: Crop[];
  cropElementList: CropElement[];
  suitabilityLevelList: SuitabilityLevel[];
  title: string;
  address: string;
  description: string;
  selectedCrop: Crop | null;
  selectedCropElement: CropElement | null;
  selectedSuitabilityLevel: SuitabilityLevel | null;
  isCropAdding: boolean;
  isCropElementAdding: boolean;
  addedCrop: string;
  addedCropElement: string;
  hasFileChanges: boolean;
  previewRecord: Record | null;
}
