import { createSlice } from "@reduxjs/toolkit";
import { type PayloadAction } from "@reduxjs/toolkit";
import type { Feature, FeatureCollection } from "geojson";
import { type LatLngLiteral } from "leaflet";
import { defaultZoom } from "@/constants";
import { BasemapType, CardType, CategoryType, ToolType } from "@/enums";
import type { ClassificationType, FilterType, MapState, SearchType } from "@/types";

const initialState: MapState = {
  basemap: BasemapType.WORLD_IMAGERY,
  search: null,
  searchList: [],
  zoom: defaultZoom,
  pointer: { lat: 0, lng: 0 },
  scale: "",
  card: CardType.NONE,
  filter: null,
  filterList: [],
  classification: [],
  classificationList: {},
  tool: ToolType.NONE, // Not included in reset, so that we can keep the tool state when resetting the map
  category: CategoryType.NONE,
  geometryFeatures: null,
  selectedGeometryFeature: null,
};

export const mapSlice = createSlice({
  name: "map",
  initialState,
  reducers: {
    changeBasemap: (state, action: PayloadAction<BasemapType>) => {
      state.basemap = action.payload;
    },
    changeSearch: (state, action: PayloadAction<SearchType | null>) => {
      state.search = action.payload;
    },
    changeSearchList: (state, action: PayloadAction<SearchType[]>) => {
      state.searchList = action.payload;
    },
    changeZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },
    changePointer: (state, action: PayloadAction<LatLngLiteral>) => {
      state.pointer = action.payload;
    },
    changeScale: (state, action: PayloadAction<string>) => {
      state.scale = action.payload;
    },
    changeCard: (state, action: PayloadAction<CardType>) => {
      state.card = action.payload;
    },
    changeFilter: (state, action: PayloadAction<FilterType | null>) => {
      state.filter = action.payload;
    },
    changeFilterList: (state, action: PayloadAction<FilterType[]>) => {
      state.filterList = action.payload;
    },
    changeClassification: (state, action: PayloadAction<ClassificationType[]>) => {
      state.classification = action.payload;
    },
    changeClassificationList: (state, action: PayloadAction<Record<string, ClassificationType[]>>) => {
      state.classificationList = action.payload;
    },
    changeTool: (state, action: PayloadAction<ToolType>) => {
      state.tool = action.payload;
    },
    changeCategory: (state, action: PayloadAction<CategoryType>) => {
      state.category = action.payload;
    },
    changeGeometryFeatures: (state, action: PayloadAction<FeatureCollection | null>) => {
      state.geometryFeatures = action.payload;
    },
    changeSelectedGeometryFeature: (state, action: PayloadAction<Feature | null>) => {
      state.selectedGeometryFeature = action.payload;
    },
    resetOtherMenu: (state) => {
      state.filter = initialState.filter;
      state.filterList = initialState.filterList;
      state.search = initialState.search;
      state.searchList = initialState.searchList;
      state.geometryFeatures = initialState.geometryFeatures;
      state.selectedGeometryFeature = initialState.selectedGeometryFeature;
    },
    resetMap: () => initialState,
  },
});

// Action creators are generated for each case reducer function
export const {
  changeBasemap,
  changeSearch,
  changeSearchList,
  changeZoom,
  changePointer,
  changeScale,
  changeCard,
  changeFilter,
  changeFilterList,
  changeClassification,
  changeClassificationList,
  changeTool,
  changeCategory,
  changeGeometryFeatures,
  changeSelectedGeometryFeature,
  resetOtherMenu,
  resetMap,
} = mapSlice.actions;

export default mapSlice.reducer;
