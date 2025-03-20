import { create } from "zustand";

interface MobileState {
    isMobileOpen: boolean;
    setIsMobileOpen: (isOpen: boolean) => void;
}

export const useMobile = create<MobileState>((set) => ({
    isMobileOpen: false,
    setIsMobileOpen: (isOpen: boolean) => set({ isMobileOpen: isOpen }),
}));