"use client";

import { create } from "zustand";

interface SoundStore {
  volume: number;
  muted: boolean;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

export const useSoundStore = create<SoundStore>((set) => ({
  volume: 0.5,
  muted: false,
  setVolume: (volume) => set({ volume }),
  toggleMute: () => set((state) => ({ muted: !state.muted })),
}));

class SoundManager {
  private static instance: SoundManager;
  private notificationSound: HTMLAudioElement;
  private commentSound: HTMLAudioElement;

  private constructor() {
    this.notificationSound = new Audio("/sounds/notification.mp3");
    this.commentSound = new Audio("/sounds/comment.mp3");
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private getVolume(): number {
    const { volume, muted } = useSoundStore.getState();
    return muted ? 0 : volume;
  }

  public playNotification() {
    this.notificationSound.volume = this.getVolume();
    this.notificationSound.play().catch(() => {
      // Ignore autoplay errors
    });
  }

  public playComment() {
    this.commentSound.volume = this.getVolume();
    this.commentSound.play().catch(() => {
      // Ignore autoplay errors
    });
  }
}

export const soundManager = SoundManager.getInstance(); 