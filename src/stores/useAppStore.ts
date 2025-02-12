import { create } from 'zustand';
import { setAuthCookie, clearAuthCookie } from '../utils/auth';
import wsClient from '../utils/websocket';
import gameWsClient from '../utils/gameWebsocket';

interface AppState {
  isAuthenticated: boolean;
  authToken: string | undefined;
  userId: string | undefined;
  setAuthenticated: (isAuthenticated: boolean, token?: string, userId?: string) => void;
  logout: () => void;
}

const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  authToken: undefined,
  userId: undefined,
  setAuthenticated: (isAuthenticated: boolean, token?: string, userId?: string) => {
    if (isAuthenticated && token) {
      // Store token in cookie with proper attributes
      setAuthCookie(token);
      set({ isAuthenticated, authToken: token, userId });
    } else {
      clearAuthCookie();
      set({ isAuthenticated: false, authToken: undefined, userId: undefined });
    }
  },
  logout: () => {
    // First disconnect all websockets
    wsClient.disconnect();
    gameWsClient.disconnect();
    
    // Then clear auth state
    clearAuthCookie();
    set({ isAuthenticated: false, authToken: undefined, userId: undefined });
    
    // Navigate to login without reload
    window.location.href = '/login';
  },
}));

export default useAppStore;
