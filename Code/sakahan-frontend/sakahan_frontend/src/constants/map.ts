import RejectedIcon from "@mui/icons-material/Cancel";
import ApprovedIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import { type OverridableComponent } from "@mui/material/OverridableComponent";
import { type SvgIconTypeMap } from "@mui/material/SvgIcon";
import Basemap from "@/components/Cards/Basemap";
import Classification from "@/components/Cards/Classification";
import Contribute from "@/components/Cards/Contribute";
import Filter from "@/components/Cards/Filter";
import Record from "@/components/Cards/Record";
import Search from "@/components/Cards/Search";
import {
  AreaIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CancelIcon,
  ClassificationIcon,
  ContributeIcon,
  DeleteIcon,
  DoorIcon,
  EditIcon,
  FilterIcon,
  LayerIcon,
  MeterIcon,
  RecordIcon,
  RedoIcon,
  SaveIcon,
  SearchFilledIcon,
  UndoIcon,
  UploadIcon,
} from "@/components/Icons/";
import { AidType, BasemapType, CardType, CategoryType, StatusType, ToolType } from "@/enums";
import type { BasemapProps, IconButtonProps } from "@/types";

export const buttons: IconButtonProps[] = [
  {
    type: CardType.BASEMAP,
    label: "Basemaps",
    Icon: LayerIcon,
  },
  {
    type: CardType.SEARCH,
    label: "Search Area",
    Icon: SearchFilledIcon,
  },
  {
    type: CardType.FILTER,
    label: "Crop Suitability",
    Icon: FilterIcon,
  },
  {
    type: CardType.CLASSIFICATION,
    label: "Suitability Level",
    Icon: ClassificationIcon,
  },
  {
    type: CardType.CONTRIBUTE,
    label: "Contribute Data",
    Icon: ContributeIcon,
  },
  {
    type: CardType.RECORD,
    label: "Record Book",
    Icon: RecordIcon,
  },
];

export const tools: IconButtonProps[] = [
  { type: ToolType.DRAW, Icon: AreaIcon },
  { type: ToolType.EDIT, Icon: EditIcon },
  { type: ToolType.DELETE, Icon: DeleteIcon },
  { type: ToolType.METER, Icon: MeterIcon },
];

export const aids: IconButtonProps[] = [
  { type: AidType.SUBMIT, Icon: UploadIcon },
  { type: AidType.SAVE, Icon: SaveIcon },
  { type: AidType.CANCEL, Icon: CancelIcon },
  { type: AidType.EXIT, Icon: DoorIcon },
];

export const extras: IconButtonProps[] = [
  { type: AidType.UNDO, Icon: UndoIcon },
  { type: AidType.REDO, Icon: RedoIcon },
  { type: AidType.PREVIOUS, Icon: ArrowLeftIcon },
  { type: AidType.NEXT, Icon: ArrowRightIcon },
];

export const categories: CategoryType[] = [CategoryType.NONE, CategoryType.LEGACY, CategoryType.CURRENT];

export const statuses: Record<StatusType, number> = {
  [StatusType.ALL]: -1,
  [StatusType.PENDING]: 0,
  [StatusType.APPROVED]: 1,
  [StatusType.REJECTED]: 2,
};

export const statusColors: Record<StatusType, string> = {
  [StatusType.ALL]: "var(--primary)",
  [StatusType.APPROVED]: "var(--approved)",
  [StatusType.PENDING]: "var(--pending)",
  [StatusType.REJECTED]: "var(--rejected)",
};

export const statusIcons: Record<
  Exclude<StatusType, StatusType.ALL>,
  OverridableComponent<SvgIconTypeMap> & {
    muiName: string;
  }
> = {
  [StatusType.APPROVED]: ApprovedIcon,
  [StatusType.PENDING]: PendingIcon,
  [StatusType.REJECTED]: RejectedIcon,
};

export const cards: Record<CardType, React.FC> = {
  [CardType.NONE]: () => null,
  [CardType.BASEMAP]: Basemap,
  [CardType.SEARCH]: Search,
  [CardType.FILTER]: Filter,
  [CardType.CLASSIFICATION]: Classification,
  [CardType.CONTRIBUTE]: Contribute,
  [CardType.RECORD]: Record,
};

export const basemaps: Record<BasemapType, BasemapProps> = {
  [BasemapType.WORLD_IMAGERY]: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  },
  [BasemapType.OPEN_STREET_MAP]: {
    url: "https://tile.openstreetmap.de/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  [BasemapType.WORLD_TOPO_MAP]: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community",
  },
  [BasemapType.TOP_PLUS_OPEN]: {
    url: "https://sgx.geodatenzentrum.de/wmts_topplus_open/tile/1.0.0/web/default/WEBMERCATOR/{z}/{y}/{x}.png",
    attribution: 'Map data: &copy; <a href="http://www.govdata.de/dl-de/by-2-0">dl-de/by-2-0</a>',
  },
  [BasemapType.WORLD_STREET_MAP]: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
  },
  [BasemapType.CYCLEOSM_MAP]: {
    url: "https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png",
    attribution:
      '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  [BasemapType.CARTO_POSITRON]: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  [BasemapType.CARTO_VOYAGER]: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
};
