"use client";

import React, { createContext, useContext, useSyncExternalStore } from "react";
import { AnalysisDetail } from "@/types";

interface AnalysisContextType {
  importedAnalysis: AnalysisDetail | null;
  setImportedAnalysis: (data: AnalysisDetail | null) => void;
  clearImportedAnalysis: () => void;
  isHydrated: boolean;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

const STORAGE_KEY = "nara_imported_analysis";

let memoryData: AnalysisDetail | null = null;
let initialized = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function getSnapshot(): AnalysisDetail | null {
  if (!initialized && typeof window !== "undefined") {
    initialized = true;
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        memoryData = JSON.parse(stored);
      }
    } catch {
      // ignore
    }
  }
  return memoryData;
}

function getServerSnapshot(): AnalysisDetail | null {
  return null;
}

const emptySubscribe = () => () => {};

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const importedAnalysis = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isHydrated = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const setImportedAnalysis = (data: AnalysisDetail | null) => {
    memoryData = data;
    try {
      if (data) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } else {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore
    }
    notify();
  };

  const clearImportedAnalysis = () => {
    memoryData = null;
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    notify();
  };

  return (
    <AnalysisContext.Provider
      value={{
        importedAnalysis,
        setImportedAnalysis,
        clearImportedAnalysis,
        isHydrated,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
}
