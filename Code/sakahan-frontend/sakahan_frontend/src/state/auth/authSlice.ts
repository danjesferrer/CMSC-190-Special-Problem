import { createSlice } from "@reduxjs/toolkit";
import { type PayloadAction } from "@reduxjs/toolkit";
import { type AuthState } from "@/types";

const initialState: AuthState = {
  openAuth: false,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    changeOpenAuth: (state, action: PayloadAction<boolean>) => {
      state.openAuth = action.payload;
    },
    setAuth: (state) => {
      state.isAuthenticated = true;
    },
    unsetAuth: (state) => {
      state.isAuthenticated = false;
    },
  },
});

// Action creators are generated for each case reducer function
export const { changeOpenAuth, setAuth, unsetAuth } = authSlice.actions;

export default authSlice.reducer;
