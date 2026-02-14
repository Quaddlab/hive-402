"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface UIStateContextType {
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  isNotifOpen: boolean;
  setNotifOpen: (open: boolean) => void;
}

const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

export const UIStateProvider = ({ children }: { children: ReactNode }) => {
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);

  return (
    <UIStateContext.Provider
      value={{
        isSearchOpen,
        setSearchOpen,
        isNotifOpen,
        setNotifOpen,
      }}
    >
      {children}
    </UIStateContext.Provider>
  );
};

export const useUIState = () => {
  const context = useContext(UIStateContext);
  if (!context) {
    throw new Error("useUIState must be used within a UIStateProvider");
  }
  return context;
};
