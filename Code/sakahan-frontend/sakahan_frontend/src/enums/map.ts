export enum CardType {
  NONE = "none",
  BASEMAP = "basemap",
  SEARCH = "search",
  FILTER = "filter",
  CLASSIFICATION = "classification",
  CONTRIBUTE = "contribute",
  RECORD = "record",
}

export enum BasemapType {
  WORLD_IMAGERY = "World Imagery",
  OPEN_STREET_MAP = "Open Street Map",
  WORLD_TOPO_MAP = "World Topo Map",
  TOP_PLUS_OPEN = "Top Plus Open",
  WORLD_STREET_MAP = "World Street Map",
  CYCLEOSM_MAP = "CycleOSM Map",
  CARTO_POSITRON = "Carto Positron",
  CARTO_VOYAGER = "Carto Voyager",
}

export enum ToastType {
  SUCCESS = "success",
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
}

export enum UserType {
  STAKEHOLDER = "Stakeholder",
  CONTRIBUTOR = "Contributor",
  ADMIN = "Administrator",
}

export enum ToolType {
  NONE = "None",
  DRAW = "Draw",
  EDIT = "Edit",
  DELETE = "Delete",
  METER = "Meter",
}

export enum AidType {
  SUBMIT = "Submit",
  SAVE = "Save",
  CANCEL = "Cancel",
  EXIT = "Exit",
  UNDO = "Undo",
  REDO = "Redo",
  NEXT = "Next",
  PREVIOUS = "Previous",
}

export enum CategoryType {
  NONE = "None",
  LEGACY = "Legacy",
  CURRENT = "Current",
}

export enum StatusType {
  ALL = "All",
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}

export enum RecordType {
  MY_CONTRIBUTIONS = "My Contributions",
  OTHER_CONTRIBUTIONS = "Other Contributions",
}
