import { create } from 'zustand';

interface WorkerStoreState {
  searchQuery:     string;
  filterAvailable: boolean;
}
interface WorkerStoreActions {
  setSearchQuery:     (q: string) => void;
  setFilterAvailable: (v: boolean) => void;
}

export const useWorkerStore = create<WorkerStoreState & WorkerStoreActions>((set) => ({
  searchQuery:     '',
  filterAvailable: false,
  setSearchQuery:     (searchQuery)     => set({ searchQuery }),
  setFilterAvailable: (filterAvailable) => set({ filterAvailable }),
}));
