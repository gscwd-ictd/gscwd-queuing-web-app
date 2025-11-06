import { QueuingTicketReport } from "@/lib/types/prisma/queuingTicket";
import { create } from "zustand";

type ReportsStore = {
  filters: {
    userId?: string;
    startDate: Date;
    endDate: Date;
    reportType: "detailed" | "summary" | null;
    serviceType?: string;
  };
  setFilters: (filters: Partial<ReportsStore["filters"]>) => void;
  clearFilters: () => void;

  reportData: QueuingTicketReport | null;
  setReportData: (reportData: QueuingTicketReport | null) => void;
  reportStartDate: Date;
  setReportStartDate: (reportStartDate: Date) => void;
  reportEndDate: Date;
  setReportEndDate: (reportEndDate: Date) => void;
  serviceType?: string;
  setServiceType?: (serviceType: string) => void;

  reportType: "detailed" | "summary" | null;
  setReportType: (reportType: "detailed" | "summary" | null) => void;
};

export const useReportsStore = create<ReportsStore>((set) => ({
  filters: {
    startDate: new Date(),
    endDate: new Date(),
    reportType: null,
    userId: "",
    serviceType: "",
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  clearFilters: () => {
    set({
      filters: {
        startDate: new Date(),
        endDate: new Date(),
        reportType: null,
        serviceType: "",
        userId: "",
      },
    });
  },

  reportData: null,
  setReportData: (reportData: QueuingTicketReport | null) => {
    set({
      reportData: reportData,
    });
  },

  reportStartDate: new Date(),
  setReportStartDate: (reportStartDate: Date) => {
    set({ reportStartDate });
  },

  reportEndDate: new Date(),
  setReportEndDate: (reportEndDate: Date) => {
    set({ reportEndDate });
  },

  reportType: null,
  setReportType: (reportType: "detailed" | "summary" | null) => {
    set({ reportType });
  },

  serviceType: "",
  setServiceType: (serviceType: string) => {
    set({ serviceType });
  },
}));
