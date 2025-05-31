"use client";

import { Provider } from "react-redux";
import { type ProviderProps } from "@/types";
import { store } from "@/state/store";

export const ReduxProvider = ({ children }: ProviderProps) => {
  return <Provider store={store}>{children}</Provider>;
};
