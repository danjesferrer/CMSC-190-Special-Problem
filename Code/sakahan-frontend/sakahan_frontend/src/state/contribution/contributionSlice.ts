import { type PayloadAction, createSlice } from "@reduxjs/toolkit";
import type { ContributionState, Crop, CropElement, Record, SuitabilityLevel } from "@/types";

const initialState: ContributionState = {
  cropList: [],
  cropElementList: [],
  suitabilityLevelList: [],
  isCropAdding: false,
  isCropElementAdding: false,
  title: "",
  address: "",
  description: "",
  addedCrop: "",
  addedCropElement: "",
  selectedCrop: null,
  selectedCropElement: null,
  selectedSuitabilityLevel: null,
  hasFileChanges: false,
  previewRecord: null,
};

export const contributionSlice = createSlice({
  name: "contribution",
  initialState,
  reducers: {
    changeCropList: (state, action: PayloadAction<Crop[]>) => {
      state.cropList = action.payload;
    },
    changeCropElementList: (state, action: PayloadAction<CropElement[]>) => {
      state.cropElementList = action.payload;
    },
    changeSuitabilityLevelList: (state, action: PayloadAction<SuitabilityLevel[]>) => {
      state.suitabilityLevelList = action.payload;
    },
    toggleIsCropAdding: (state) => {
      state.isCropAdding = !state.isCropAdding;
    },
    toggleIsCropElementAdding: (state, action: PayloadAction<boolean | undefined>) => {
      if (action.payload !== undefined) state.isCropElementAdding = action.payload;
      else state.isCropElementAdding = !state.isCropElementAdding;
    },
    changeTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
    },
    changeAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
    },
    changeDescription: (state, action: PayloadAction<string>) => {
      state.description = action.payload;
    },
    changeAddedCrop: (state, action: PayloadAction<string>) => {
      state.addedCrop = action.payload;
    },
    changeAddedCropElement: (state, action: PayloadAction<string>) => {
      state.addedCropElement = action.payload;
    },
    changeSelectedCrop: (state, action: PayloadAction<Crop | null>) => {
      state.selectedCrop = action.payload;
    },
    changeSelectedCropElement: (state, action: PayloadAction<CropElement | null>) => {
      state.selectedCropElement = action.payload;
    },
    changeSelectedSuitabilityLevel: (state, action: PayloadAction<SuitabilityLevel | null>) => {
      state.selectedSuitabilityLevel = action.payload;
    },
    changeHasFileChanges: (state, action: PayloadAction<boolean>) => {
      state.hasFileChanges = action.payload;
    },
    setPreviewRecord: (state, action: PayloadAction<Record | null>) => {
      state.previewRecord = action.payload;
      state.hasFileChanges = false;
    },
    populateContributions: (state, action: PayloadAction<Record & { step: number }>) => {
      const { title, address, description, crop, crop_element, suitability_level } = action.payload;

      // First step: Set Crop and Suitability Level upon availability.
      // Also include other information about the area.
      if (action.payload.step === 1) {
        state.title = title;
        state.address = address;
        state.description = description;
        state.selectedSuitabilityLevel = suitability_level;

        // if (crop.published) state.selectedCrop = crop;
        // else {
        state.isCropAdding = true;
        state.addedCrop = crop.name;
        if (crop_element) {
          state.isCropElementAdding = true;
          state.addedCropElement = crop_element.name;
        }
        // }
      }

      // Second step: Set Crop Element upon availability.
      if (crop_element && action.payload.step === 2) {
        // if (crop_element.published) state.selectedCropElement = crop_element;
        // else {
        state.isCropElementAdding = true;
        state.addedCropElement = crop_element.name;
        // }
      }
    },
    resetContributions: () => initialState,
  },
});

export const {
  changeCropList,
  changeCropElementList,
  changeSuitabilityLevelList,
  toggleIsCropAdding,
  toggleIsCropElementAdding,
  changeTitle,
  changeAddress,
  changeDescription,
  changeSelectedCrop,
  changeSelectedCropElement,
  changeSelectedSuitabilityLevel,
  changeAddedCrop,
  changeAddedCropElement,
  changeHasFileChanges,
  setPreviewRecord,
  populateContributions,
  resetContributions,
} = contributionSlice.actions;

export default contributionSlice.reducer;
