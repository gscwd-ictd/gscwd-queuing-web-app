// lib/store/dashboard/useReportsStore.ts
import { create } from "zustand";

type ReportType = "detailed" | "summary" | null;

type ReportsStore = {
  filters: {
    userId?: string;
    startDate: Date | null;
    endDate: Date | null;
    reportType: ReportType;
    serviceType?: string;
  };
  setFilters: (filters: Partial<ReportsStore["filters"]>) => void;
  resetFilters: () => void;
};

export const useReportsStore = create<ReportsStore>((set) => ({
  filters: {
    startDate: null,
    endDate: null,
    reportType: null,
    userId: undefined,
    serviceType: undefined,
  },

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  resetFilters: () =>
    set({
      filters: {
        startDate: null,
        endDate: null,
        reportType: null,
        userId: undefined,
        serviceType: undefined,
      },
    }),
}));
