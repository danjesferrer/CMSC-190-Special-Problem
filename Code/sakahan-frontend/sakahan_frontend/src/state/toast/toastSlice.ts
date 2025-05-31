import { createSlice } from "@reduxjs/toolkit";
import { type PayloadAction } from "@reduxjs/toolkit";
import { ToastType } from "@/enums";
import { type ToastState } from "@/types";

const initialState: ToastState = {
  openToast: false,
  title: "",
  message: "",
  severity: ToastType.SUCCESS,
};

export const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    openToast: (state, action: PayloadAction<ToastState>) => {
      state.openToast = action.payload.openToast;
      state.title = action.payload.title;
      state.message = action.payload.message;
      state.severity = action.payload.severity;
    },
    closeToast: (state) => {
      state.openToast = false;
    },
  },
});

// Action creators are generated for each case reducer function
export const { openToast, closeToast } = toastSlice.actions;

export default toastSlice.reducer;
