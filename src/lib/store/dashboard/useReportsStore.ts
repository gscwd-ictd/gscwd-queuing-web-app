// lib/store/dashboard/useReportsStore.ts
import { create } from 'zustand';

interface ReportParams {
  startDate: Date;
  endDate: Date;
  reportType: 'summary' | 'detailed';
  userId?: string;
  serviceTypeId?: string;
}

interface ReportsStore {
  // Keep filters for form state if needed
  filters: {
    startDate?: Date;
    endDate?: Date;
    reportType?: 'summary' | 'detailed';
    userId?: string;
    serviceType?: string;
  };
  // New: parameters for the current active report
  reportParams: ReportParams | null;

  // Actions
  setFilters: (filters: Partial<ReportsStore['filters']>) => void;
  clearFilters: () => void;
  setReportParams: (params: ReportParams) => void;
  clearReportParams: () => void;
}

export const useReportsStore = create<ReportsStore>((set) => ({
  filters: {
    startDate: undefined,
    endDate: undefined,
    reportType: undefined,
    userId: undefined,
    serviceType: undefined,
  },
  reportParams: null,

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  clearFilters: () =>
    set({
      filters: {
        startDate: undefined,
        endDate: undefined,
        reportType: undefined,
        userId: undefined,
        serviceType: undefined,
      },
    }),

  setReportParams: (params) => set({ reportParams: params }),

  clearReportParams: () => set({ reportParams: null }),
}));
