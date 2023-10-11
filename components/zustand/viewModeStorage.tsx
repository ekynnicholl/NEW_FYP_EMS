import create from 'zustand';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface ViewModeStore {
    viewMode: number;
    setViewMode: (newViewMode: number) => void;
}

const useViewModeStore = create<ViewModeStore>((set) => ({

    viewMode: 1,

    setViewMode: (newViewMode) => set({ viewMode: newViewMode }),
}));

export default useViewModeStore;