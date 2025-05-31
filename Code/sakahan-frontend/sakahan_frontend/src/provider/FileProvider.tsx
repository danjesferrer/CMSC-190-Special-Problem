"use client";

import { type ReactNode, createContext, useContext, useState } from "react";
import { type FileObject } from "@/types";

type FileContextType = {
  files: FileObject[];
  setFiles: (file: FileObject[]) => void;
};

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
  const [files, setFiles] = useState<FileObject[]>([]);

  return <FileContext.Provider value={{ files, setFiles }}>{children}</FileContext.Provider>;
};

export const useFile = (): FileContextType => {
  const context = useContext(FileContext);

  if (!context) {
    throw new Error("The useFile hook must be used only within a FileProvider");
  }
  return context;
};
