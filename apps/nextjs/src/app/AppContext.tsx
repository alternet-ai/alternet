'use client';

import React, { createContext, useContext, useState } from 'react';
import type { Page } from './types';
import { HOME_PAGE } from './static/constants';

interface AppContextType {
  pageCache: Record<string, Page>;
  setPageCache: React.Dispatch<React.SetStateAction<Record<string, Page>>>;
  model: string;
  setModel: React.Dispatch<React.SetStateAction<string>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [pageCache, setPageCache] = useState<Record<string, Page>>({
    [HOME_PAGE.cacheKey]: HOME_PAGE,
  });
  const [model, setModel] = useState('claude-3-sonnet-20240229');

  return (
    <AppContext.Provider value={{ pageCache, setPageCache, model, setModel }}>
      {children}
    </AppContext.Provider>
  );
};