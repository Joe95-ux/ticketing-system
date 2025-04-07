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
  private notificationSound: HTMLAudioElement | null = null;
  private commentSound: HTMLAudioElement | null = null;
  private volume: number = 0.5;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.notificationSound = new Audio("/sounds/notification.mp3");
      this.commentSound = new Audio("/sounds/comment.mp3");
    }
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public setVolume(volume: number) {
    this.volume = volume;
    if (this.notificationSound) {
      this.notificationSound.volume = volume;
    }
    if (this.commentSound) {
      this.commentSound.volume = volume;
    }
  }

  private getVolume(): number {
    return this.volume;
  }

  public playNotification() {
    if (this.notificationSound) {
      this.notificationSound.currentTime = 0;
      this.notificationSound.volume = this.getVolume();
      this.notificationSound.play().catch(err => {
        console.error("Failed to play notification sound:", err);
      });
    }
  }

  public playComment() {
    if (this.commentSound) {
      this.commentSound.currentTime = 0;
      this.commentSound.volume = this.getVolume();
      this.commentSound.play().catch(err => {
        console.error("Failed to play comment sound:", err);
      });
    }
  }
}

export const soundManager = SoundManager.getInstance(); 