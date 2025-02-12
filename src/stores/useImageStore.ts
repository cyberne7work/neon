import { create } from 'zustand';
import { AssetGenerationRequest } from '../types/websocket';

type ImageSize = AssetGenerationRequest['size'];

interface GeneratedImage {
  id: string;
  url: string;
  name: string;
  size: string;
  createdAt: string;
}

interface ImageState {
  images: GeneratedImage[];
  isGenerating: boolean;
  selectedType: 'single' | 'game';
  selectedSize: NonNullable<ImageSize>;
  setSelectedType: (type: 'single' | 'game') => void;
  setSelectedSize: (size: NonNullable<ImageSize>) => void;
  setGenerating: (generating: boolean) => void;
  addImage: (image: GeneratedImage) => void;
  clearImages: () => void;
}

const useImageStore = create<ImageState>((set) => ({
  images: [],
  isGenerating: false,
  selectedType: 'single',
  selectedSize: '1024x1024',
  setSelectedType: (type) => set({ selectedType: type }),
  setSelectedSize: (size) => set({ selectedSize: size }),
  setGenerating: (generating) => set({ isGenerating: generating }),
  addImage: (image) => set((state) => ({
    images: [image, ...state.images]
  })),
  clearImages: () => set({ images: [] })
}));

export type { ImageSize, GeneratedImage };
export default useImageStore;
