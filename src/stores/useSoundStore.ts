import { create } from 'zustand';
import { AssetGenerationRequest } from '../types/websocket';

interface GeneratedSound {
  id: string;
  url: string;
  name: string;
  createdAt: string;
}

interface SoundState {
  sounds: GeneratedSound[];
  isGenerating: boolean;
  selectedType: 'single' | 'game';
  setSelectedType: (type: 'single' | 'game') => void;
  setGenerating: (generating: boolean) => void;
  addSound: (sound: GeneratedSound) => void;
  clearSounds: () => void;
}

const useSoundStore = create<SoundState>((set) => ({
  sounds: [],
  isGenerating: false,
  selectedType: 'single',
  setSelectedType: (type) => set({ selectedType: type }),
  setGenerating: (generating) => set({ isGenerating: generating }),
  addSound: (sound) => set((state) => ({
    sounds: [sound, ...state.sounds]
  })),
  clearSounds: () => set({ sounds: [] })
}));

export type { GeneratedSound };
export default useSoundStore;
