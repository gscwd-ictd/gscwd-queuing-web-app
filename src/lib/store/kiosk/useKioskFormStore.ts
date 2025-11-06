import { GeneratedQueuingTicket } from "@/lib/types/prisma/queuingTicket";
import { create } from "zustand";

type KioskFormStore = {
  currentStep: number;
  nextStep: () => void;
  previousStep: () => void;

  queuingTicket: Partial<GeneratedQueuingTicket> | null;
  setQueuingTicket: (ticket: Partial<GeneratedQueuingTicket> | null) => void;

  showPaymentTransactionConfirmation: boolean;
  setShowPaymentTransactionConfirmation: (showConfirmation: boolean) => void;
  resetForm: () => void;
};

export const useKioskFormStore = create<KioskFormStore>((set) => ({
  currentStep: 0,
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  previousStep: () => set((state) => ({ currentStep: state.currentStep - 1 })),

  queuingTicket: null,
  setQueuingTicket: (ticket) => set({ queuingTicket: ticket }),

  showPaymentTransactionConfirmation: false,
  setShowPaymentTransactionConfirmation: (showConfirmation) =>
    set({ showPaymentTransactionConfirmation: showConfirmation }),
  resetForm: () => set({ currentStep: 0 }),
}));
