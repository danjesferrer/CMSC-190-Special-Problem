import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RecordType, StatusType } from "@/enums";
import type { Record, RecordState } from "@/types";

const initialState: RecordState = {
  selectedTab: RecordType.MY_CONTRIBUTIONS,
  selectedFilter: StatusType.ALL,
  selectedPage: 1,
  selectedRecord: null,
  isExpanded: false,
};

export const recordSlice = createSlice({
  name: "record",
  initialState,
  reducers: {
    changeSelectedTab: (state, action: PayloadAction<RecordType>) => {
      state.selectedTab = action.payload;
    },
    changeSelectedFilter: (state, action: PayloadAction<StatusType>) => {
      state.selectedFilter = action.payload;
    },
    changeSelectedPage: (state, action: PayloadAction<number>) => {
      state.selectedPage = action.payload;
    },
    changeSelectedRecord: (state, action: PayloadAction<Record | null>) => {
      state.selectedRecord = action.payload;
    },
    toggleIsExpanded: (state) => {
      state.isExpanded = !state.isExpanded;
    },
    populateRecord: (state, action: PayloadAction<Record>) => {
      state.selectedRecord = action.payload;
      state.isExpanded = true;
    },
    resetConfiguration: (state) => {
      state.selectedTab = initialState.selectedTab;
      state.selectedFilter = initialState.selectedFilter;
      state.selectedPage = initialState.selectedPage;
    },
    resetRecord: () => initialState,
  },
});

// Action creators are generated for each case reducer function
export const {
  changeSelectedTab,
  changeSelectedFilter,
  changeSelectedPage,
  changeSelectedRecord,
  toggleIsExpanded,
  populateRecord,
  resetConfiguration,
  resetRecord,
} = recordSlice.actions;

export default recordSlice.reducer;
