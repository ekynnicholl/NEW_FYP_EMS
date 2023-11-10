import {create} from 'zustand';

interface ViewModeStore {
    viewMode: number;
    setViewMode: (newViewMode: number) => void;
}

const useViewModeStore = create<ViewModeStore>((set) => ({

    viewMode: 1,

    setViewMode: (newViewMode) => set({ viewMode: newViewMode }),
}));

export default useViewModeStore;