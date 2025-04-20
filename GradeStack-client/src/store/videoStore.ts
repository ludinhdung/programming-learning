import { create } from 'zustand';

interface VideoState {
    currentTime: number;
    setCurrentTime: (time: number) => void;
}

export const useVideoStore = create<VideoState>((set) => ({
    currentTime: 0,
    setCurrentTime: (time) => set({ currentTime: time }),
})); 