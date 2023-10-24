import create from 'zustand';

interface darkLight {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
}

const useDarkLight = create<darkLight>((set) => ({
    isDarkMode: false,

    toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));

export default useDarkLight;