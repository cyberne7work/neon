import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Game, CreateGameRequest } from '../types/game';
import gameWsClient from '../utils/gameWebsocket';
import { notify } from '../utils/notifications';

interface GamesState {
  games: Game[];
  activeGameId: string | null;
  setGames: (games: Game[]) => void;
  addGame: (game: Game) => void;
  updateGame: (game: Game) => void;
  removeGame: (gameId: string) => void;
  setActiveGame: (gameId: string | null) => void;
}

const useGamesStore = create<GamesState>()(
  persist(
    (set) => ({
      games: [],
      activeGameId: null,
      setGames: (games) => set({ games }),
      addGame: (game) => set((state) => ({
        games: [...state.games, game]
      })),
      updateGame: (game) => set((state) => ({
        games: state.games.map(g => g.id === game.id ? game : g)
      })),
      removeGame: (gameId) => set((state) => ({
        games: state.games.filter(g => g.id !== gameId),
        activeGameId: state.activeGameId === gameId ? null : state.activeGameId
      })),
      setActiveGame: async (gameId) => {
        // First disconnect any existing game WebSocket connection
        gameWsClient.disconnect();
        
        // Update the active game ID
        set({ activeGameId: gameId });
        
        if (gameId) {
          try {
            // Attempt to establish new WebSocket connection for the selected game
            await gameWsClient.connect();
            notify.success('Connected to game server');
          } catch (error) {
            console.error('Failed to connect game WebSocket:', error);
            notify.error('Failed to connect to game server');
          }
        }
      }
    }),
    {
      name: 'games-storage',
      partialize: (state) => ({
        activeGameId: state.activeGameId
      })
    }
  )
);

export default useGamesStore;
