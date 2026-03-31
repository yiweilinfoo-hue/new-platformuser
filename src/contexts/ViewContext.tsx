import React, { createContext, useContext, useState } from 'react';
import { ViewType } from '../types';

interface ViewContextType {
  viewType: ViewType;
  setViewType: (view: ViewType) => void;
  currentOrg: string;
  setCurrentOrg: (org: string) => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export const ViewProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewType, setViewType] = useState<ViewType>(ViewType.GROUP);
  const [currentOrg, setCurrentOrg] = useState<string>("速运福建区");

  return (
    <ViewContext.Provider value={{ viewType, setViewType, currentOrg, setCurrentOrg }}>
      {children}
    </ViewContext.Provider>
  );
};

export const useView = () => {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return context;
};
