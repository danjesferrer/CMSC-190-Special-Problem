import type { LatLngTuple } from "leaflet";
import type { RecordType, StatusType } from "@/enums";
import type { Crop, CropElement, SuitabilityLevel, User } from "@/types";

export interface Record {
  id: number;
  author: User;
  title: string;
  address: string;
  description: string;
  crop: Crop;
  crop_element: CropElement | null;
  suitability_level: SuitabilityLevel;
  status: Exclude<StatusType, StatusType.ALL>;
  date_published: Date;
  last_modified: Date;
  contributors: User[];
  geom: LatLngTuple[][];
  boundingbox: LatLngTuple[];
}

export interface Comment {
  id: number;
  contribution: number;
  author: User;
  content: string;
  date_created: Date;
}

export interface RecordState {
  selectedTab: RecordType;
  selectedFilter: StatusType;
  selectedPage: number;
  selectedRecord: Record | null;
  isExpanded: boolean;
}
