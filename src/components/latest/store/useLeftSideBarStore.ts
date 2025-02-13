import { create } from 'zustand';

interface LeftSideBarStore {
  leftSidebarVisible: boolean;
  toggleLeftSidebar: () => void;
}

const useLeftSideBarStore = create<LeftSideBarStore>((set) => ({
  leftSidebarVisible: false,
  toggleLeftSidebar: () =>
    set((state) => ({ leftSidebarVisible: !state.leftSidebarVisible }))
}));

export default useLeftSideBarStore;
