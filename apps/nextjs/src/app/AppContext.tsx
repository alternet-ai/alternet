"use client";

import React, { createContext, useContext, useRef, useState } from "react";

import type { Page } from "./types";
import { HOME_PAGE } from "./static/constants";

interface AppContextType {
  pageCache: React.MutableRefObject<Record<string, Page>>;
  modelIndex: number;
  setModelIndex: React.Dispatch<React.SetStateAction<number>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const pageCache = useRef<Record<string, Page>>({
    [HOME_PAGE.id]: HOME_PAGE,
  });
  const [modelIndex, setModelIndex] = useState(2);

  return (
    <AppContext.Provider value={{ pageCache, modelIndex, setModelIndex }}>
      {children}
    </AppContext.Provider>
  );
};
