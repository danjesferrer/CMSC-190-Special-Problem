import { createSlice } from "@reduxjs/toolkit";
import { type PayloadAction } from "@reduxjs/toolkit";
import { type LatLngTuple } from "leaflet";
import type { PolygonReference, Record, ToolState } from "@/types";

const initialState: ToolState = {
  drawingVertices: [],
  drawingComplete: [],
  previewPolygon: [],
  editingVertices: [],
  alteringDraft: [],
  referencePolygon: null,
  past: [],
  future: [],
  polygonIndex: 0,
};

export const toolSlice = createSlice({
  name: "tool",
  initialState,
  reducers: {
    changeDrawingVertices: (state, action: PayloadAction<LatLngTuple[]>) => {
      state.drawingVertices = action.payload;
      state.future = []; // Reset the history when drawing vertices.
    },
    changePreviewPolygon: (state, action: PayloadAction<LatLngTuple[]>) => {
      state.previewPolygon = action.payload;
    },
    changeDrawingComplete: (state, action: PayloadAction<LatLngTuple[][]>) => {
      state.drawingComplete = action.payload;
    },
    changeEditingVertices: (state, action: PayloadAction<LatLngTuple[]>) => {
      state.editingVertices = action.payload;
    },
    changeAlteringDraft: (state, action: PayloadAction<LatLngTuple[][]>) => {
      state.alteringDraft = action.payload;
    },
    changeReferencePolygon: (state, action: PayloadAction<PolygonReference | null>) => {
      state.referencePolygon = action.payload;
    },
    resetAllProgressDraft: (state) => {
      state.drawingVertices = initialState.drawingVertices;
      state.previewPolygon = initialState.previewPolygon;

      state.editingVertices = initialState.editingVertices;
      state.referencePolygon = initialState.referencePolygon;
    },
    saveAlteringDraft: (state) => {
      // use only for edit and delete tools
      state.drawingComplete = state.alteringDraft;
    },
    populateAlteringDraft: (state) => {
      state.alteringDraft = state.drawingComplete;
    },
    autoCompleteVertices: (state) => {
      // Use only for add tool.
      if (state.drawingVertices.length < 3) return;

      state.drawingComplete = [...state.drawingComplete, [...state.drawingVertices, state.drawingVertices[0]]]; // Add the last point to close the polygon.
    },
    undoSnapshot: (state) => {
      if (state.past.length === 0) return;

      // Get the last state from past
      const previousState = state.past.pop();

      if (!previousState) return;

      // Save current state to future for redo
      state.future.push({
        drawingVertices: [...state.drawingVertices],
        previewPolygon: [...state.previewPolygon],
        drawingComplete: [...state.drawingComplete],
        editingVertices: [...state.editingVertices],
        alteringDraft: [...state.alteringDraft],
        referencePolygon: state.referencePolygon,
      });

      // Restore the previous state
      state.drawingVertices = previousState.drawingVertices;
      state.drawingComplete = previousState.drawingComplete;
      state.previewPolygon = previousState.previewPolygon;
      state.editingVertices = previousState.editingVertices;
      state.alteringDraft = previousState.alteringDraft;
    },
    redoSnapshot: (state) => {
      if (state.future.length === 0) return;

      // Get the next state from future
      const nextState = state.future.pop();

      if (!nextState) return;

      // Save current state to past for undo
      state.past.push({
        drawingVertices: [...state.drawingVertices],
        previewPolygon: [...state.previewPolygon],
        drawingComplete: [...state.drawingComplete],
        editingVertices: [...state.editingVertices],
        alteringDraft: [...state.alteringDraft],
        referencePolygon: state.referencePolygon,
      });

      // Restore the next state
      state.drawingVertices = nextState.drawingVertices;
      state.drawingComplete = nextState.drawingComplete;
      state.previewPolygon = nextState.previewPolygon;
      state.editingVertices = nextState.editingVertices;
      state.alteringDraft = nextState.alteringDraft;
    },
    incrementPolygonIndex: (state, action: PayloadAction<number>) => {
      state.polygonIndex = action.payload;
    },
    decrementPolygonIndex: (state, action: PayloadAction<number>) => {
      state.polygonIndex = action.payload;
    },
    setPreviewGeometries: (state, action: PayloadAction<Record>) => {
      // This is use for previewing the polygon from record.
      state.drawingComplete = action.payload.geom;
      state.alteringDraft = action.payload.geom;
    },
    populateHistory: (state) => {
      // use for pushing in the history.
      state.past.push({
        drawingVertices: [...state.drawingVertices],
        previewPolygon: [...state.previewPolygon],
        drawingComplete: [...state.drawingComplete],
        editingVertices: [...state.editingVertices],
        alteringDraft: [...state.alteringDraft],
        referencePolygon: state.referencePolygon,
      });
    },
    resetHistory: (state) => {
      state.past = [];
      state.future = [];
    },
    resetTools: () => initialState,
  },
});

// Action creators are generated for each case reducer function
export const {
  changeDrawingVertices,
  changePreviewPolygon,
  changeDrawingComplete,
  changeEditingVertices,
  changeAlteringDraft,
  changeReferencePolygon,
  resetAllProgressDraft,
  saveAlteringDraft,
  populateAlteringDraft,
  autoCompleteVertices,
  undoSnapshot,
  redoSnapshot,
  incrementPolygonIndex,
  decrementPolygonIndex,
  setPreviewGeometries,
  populateHistory,
  resetHistory,
  resetTools,
} = toolSlice.actions;

export default toolSlice.reducer;
