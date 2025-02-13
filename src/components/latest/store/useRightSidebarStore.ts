import { create } from 'zustand';

interface RightSideBarStore {
  rightSidebarVisible: boolean;
  toggleRightSidebar: () => void;
}

const useRightSidebarStore = create<RightSideBarStore>((set) => ({
  rightSidebarVisible: false,
  toggleRightSidebar: () =>
    set((state) => ({ rightSidebarVisible: !state.rightSidebarVisible }))
}));

export default useRightSidebarStore;
