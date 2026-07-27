import { create } from "zustand";

type State = {
  showAllWards: boolean;
  setShowAllWards: (b: boolean) => void;
  showCalculation: boolean;
  setShowCalculation: (b: boolean) => void;
};

export const useLeaderboardStore = create<State>((set) => ({
  showAllWards: false,
  setShowAllWards: (b) => set({ showAllWards: b }),
  showCalculation: false,
  setShowCalculation: (b) => set({ showCalculation: b }),
}));
