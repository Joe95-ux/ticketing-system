"use client";

import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";
import { soundManager } from "./notification-sounds";
import { create } from "zustand";

interface SoundStore {
  volume: number;
  muted: boolean;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

const useSoundStore = create<SoundStore>((set) => ({
  volume: 0.5,
  muted: false,
  setVolume: (volume) => {
    set({ volume });
    soundManager.setVolume(volume);
  },
  toggleMute: () => {
    set((state) => {
      const muted = !state.muted;
      soundManager.setVolume(muted ? 0 : state.volume);
      return { muted };
    });
  },
}));

export function SoundControl() {
  const { muted, toggleMute } = useSoundStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMute}
      title={muted ? "Unmute notifications" : "Mute notifications"}
    >
      {muted ? (
        <VolumeX className="h-5 w-5" />
      ) : (
        <Volume2 className="h-5 w-5" />
      )}
    </Button>
  );
} 