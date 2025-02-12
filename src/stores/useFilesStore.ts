import { create } from 'zustand';
import { GameFile } from '../types/file';

interface FilesStore {
  files: GameFile[];
  activeFilePath: string | null;
  setFiles: (files: GameFile[]) => void;
  addFile: (file: GameFile) => void;
  updateFile: (file: GameFile) => void;
  deleteFile: (filePath: string) => void;
  setActiveFile: (filePath: string | null) => void;
}

const useFilesStore = create<FilesStore>((set) => ({
  files: [],
  activeFilePath: null,
  setFiles: (files) => set({ files }),
  addFile: (file) => set((state) => ({ 
    files: [...state.files, file] 
  })),
  updateFile: (updatedFile) => set((state) => ({
    files: state.files.map(file => 
      file.path === updatedFile.path ? updatedFile : file
    )
  })),
  deleteFile: (filePath) => set((state) => ({
    files: state.files.filter(file => file.path !== filePath),
    activeFilePath: state.activeFilePath === filePath ? null : state.activeFilePath
  })),
  setActiveFile: (filePath) => set({ activeFilePath: filePath })
}));

export default useFilesStore;
