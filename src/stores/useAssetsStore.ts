import { create } from 'zustand';

interface Asset {
  id: string;
  filename: string;
  url: string;
  type: 'image' | 'sound';
  createdAt: string;
}

interface AssetsState {
  images: Asset[];
  sounds: Asset[];
  isLoading: boolean;
  setImages: (images: Asset[] | ((prev: Asset[]) => Asset[])) => void;
  setSounds: (sounds: Asset[] | ((prev: Asset[]) => Asset[])) => void;
  addImage: (image: Asset) => void;
  addSound: (sound: Asset) => void;
  removeImage: (id: string) => void;
  removeSound: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

const useAssetsStore = create<AssetsState>((set) => ({
  images: [],
  sounds: [],
  isLoading: false,
  setImages: (images) => set((state) => ({
    images: typeof images === 'function' ? images(state.images) : images
  })),
  setSounds: (sounds) => set((state) => ({
    sounds: typeof sounds === 'function' ? sounds(state.sounds) : sounds
  })),
  addImage: (image) => set((state) => ({
    images: [...state.images, image]
  })),
  addSound: (sound) => set((state) => ({
    sounds: [...state.sounds, sound]
  })),
  removeImage: (id) => set((state) => ({
    images: state.images.filter(image => image.id !== id)
  })),
  removeSound: (id) => set((state) => ({
    sounds: state.sounds.filter(sound => sound.id !== id)
  })),
  setLoading: (loading) => set({ isLoading: loading })
}));

export type { Asset };
export default useAssetsStore;
