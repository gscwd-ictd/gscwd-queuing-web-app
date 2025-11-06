// TODO: Persistence of dateTransactionEnded, timerPausedAt, totalPausedDuration

import { NowServingTicket } from "@/lib/types/prisma/queuingTicket";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type QueuingTicketStore = {
  previousTicket: NowServingTicket | null;
  nowServingTicket: NowServingTicket | null;
  isTicketNumberBlinking: boolean;
  // selectedRegularLaneQueuingTicketId: string;
  // selectedSpecialLaneQueuingTicketId: string;
  selectedIncomingQueuingTicketId: string;
  elapsedTime: string;
  isTimerPaused: boolean;
  dateTransactionStarted: string | null;
  dateTransactionEnded: string | null;
  timerPausedAt: Date | null;
  totalPausedDuration: number;
  selectedTransactionId: string;
  selectedUserId: string;
  selectedServiceTypeId: string;
  otherServiceType: string;
  remarks: string;
  setPreviousTicket: (ticket: NowServingTicket | null) => void;
  setNowServingTicket: (ticket: NowServingTicket | null) => void;
  setIsTicketNumberBlinking: (isTicketNumberBlinking: boolean) => void;
  clearNowServingTicket: () => void;
  // setSelectedRegularLaneQueuingTicketId: (id: string) => void;
  // setSelectedSpecialLaneQueuingTicketId: (id: string) => void;
  setSelectedIncomingQueuingTicketId: (id: string) => void;
  setElapsedTime: (elapsedTime: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  setDateTransactionEnded: (date: string | null) => void;
  resetTimerState: () => void;
  setSelectedTransactionId: (id: string) => void;
  setSelectedUserId: (id: string) => void;
  setOtherServiceType: (id: string) => void;
  setSelectedServiceTypeId: (id: string) => void;
  setRemarks: (remarks: string) => void;
  resetServiceTypeRemarksForm: () => void;
  resetTransferForm: () => void;
};

export const useQueuingTicketStore = create<QueuingTicketStore>()(
  persist(
    (set) => ({
      previousTicket: null,
      nowServingTicket: null,
      isTicketNumberBlinking: false,
      // selectedRegularLaneQueuingTicketId: "",
      // selectedSpecialLaneQueuingTicketId: "",
      selectedIncomingQueuingTicketId: "",
      elapsedTime: "00:00:00",
      isTimerPaused: false,
      dateTransactionStarted: null,
      dateTransactionEnded: null,
      timerPausedAt: null,
      totalPausedDuration: 0,
      selectedTransactionId: "",
      selectedUserId: "",
      selectedServiceTypeId: "",
      otherServiceType: "",
      remarks: "",
      setPreviousTicket: (ticket) => set({ previousTicket: ticket }),
      setNowServingTicket: (ticket) =>
        set({
          nowServingTicket: ticket,
        }),
      setIsTicketNumberBlinking: (isTicketNumberBlinking) =>
        set({ isTicketNumberBlinking }),
      clearNowServingTicket: () =>
        set({
          nowServingTicket: null,
          elapsedTime: "00:00:00",
          isTimerPaused: false,
          dateTransactionStarted: null,
          dateTransactionEnded: null,
        }),
      // setSelectedRegularLaneQueuingTicketId: (id) =>
      //   set({
      //     selectedRegularLaneQueuingTicketId: id,
      //     selectedSpecialLaneQueuingTicketId: "",
      //     selectedIncomingQueuingTicketId: "",
      //   }),
      // setSelectedSpecialLaneQueuingTicketId: (id) =>
      //   set({
      //     selectedSpecialLaneQueuingTicketId: id,
      //     selectedRegularLaneQueuingTicketId: "",
      //     selectedIncomingQueuingTicketId: "",
      //   }),
      setSelectedIncomingQueuingTicketId: (id) =>
        set({
          selectedIncomingQueuingTicketId: id,
          // selectedRegularLaneQueuingTicketId: "",
          // selectedSpecialLaneQueuingTicketId: "",
        }),
      setElapsedTime: (elapsedTime) =>
        set({
          elapsedTime,
        }),
      pauseTimer: () =>
        set((state) => {
          const now = new Date();
          const actualEndTime = new Date(
            now.getTime() - state.totalPausedDuration
          );

          return {
            isTimerPaused: true,
            timerPausedAt: now,
            dateTransactionEnded: actualEndTime.toISOString(),
          };
        }),
      resumeTimer: () =>
        set((state) => {
          if (!state.isTimerPaused || !state.timerPausedAt) return state;

          const now = new Date();
          const pauseDuration = now.getTime() - state.timerPausedAt.getTime();

          return {
            isTimerPaused: false,
            timerPausedAt: null,
            totalPausedDuration: state.totalPausedDuration + pauseDuration,
          };
        }),
      setDateTransactionEnded: (date) => set({ dateTransactionEnded: date }),
      resetTimerState: () =>
        set({
          elapsedTime: "00:00:00",
          isTimerPaused: false,
          dateTransactionEnded: null,
          dateTransactionStarted: null,
          timerPausedAt: null,
          totalPausedDuration: 0,
        }),
      setSelectedTransactionId: (id) => set({ selectedTransactionId: id }),
      setSelectedUserId: (id) =>
        set({
          selectedUserId: id,
        }),
      setSelectedServiceTypeId: (id) => set({ selectedServiceTypeId: id }),
      setOtherServiceType: (otherServiceType) => set({ otherServiceType }),
      setRemarks: (remarks) => set({ remarks }),
      resetServiceTypeRemarksForm: () =>
        set({
          selectedServiceTypeId: "",
          otherServiceType: "",
          remarks: "",
        }),
      resetTransferForm: () =>
        set({
          selectedTransactionId: "",
          selectedUserId: "",
        }),
    }),
    {
      name: `queuing-ticket-store`,
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<QueuingTicketStore>),
      }),
      partialize: (state) => ({
        dateTransactionEnded: state.dateTransactionEnded,
        timerPausedAt: state.timerPausedAt,
        totalPausedDuration: state.totalPausedDuration,
      }),
    }
  )
);
