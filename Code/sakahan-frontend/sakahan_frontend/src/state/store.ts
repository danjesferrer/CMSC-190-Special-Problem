import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "@/state/api/apiSlice";
import authReducer from "@/state/auth/authSlice";
import contributionReducer from "@/state/contribution/contributionSlice";
import mapReducer from "@/state/map/mapSlice";
import recordReducer from "@/state/record/recordSlice";
import toastReducer from "@/state/toast/toastSlice";
import toolReducer from "@/state/tool/toolSlice";
import userReducer from "@/state/user/userSlice";

export const store = configureStore({
  reducer: {
    map: mapReducer,
    auth: authReducer,
    toast: toastReducer,
    user: userReducer,
    tool: toolReducer,
    record: recordReducer,
    contribution: contributionReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
