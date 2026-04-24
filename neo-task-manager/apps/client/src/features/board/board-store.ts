import type { Task } from "@neo/types";
import { create } from "zustand";

interface BoardStore {
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
}

export const useBoardStore = create<BoardStore>((set) => ({
  selectedTask: null,
  setSelectedTask: (selectedTask) => set({ selectedTask })
}));

