import { create } from "zustand";

interface MobileState {
    isMobileOpen: boolean;
    setIsMobileOpen: (isOpen: boolean) => void;
    isInitialized: boolean;
    setInitialized: (initialized: boolean) => void;
}

export const useMobile = create<MobileState>((set) => ({
    isMobileOpen: false,
    setIsMobileOpen: (isOpen: boolean) => set({ isMobileOpen: isOpen }),
    isInitialized: false,
    setInitialized: (initialized: boolean) => set({ isInitialized: initialized }),
}));