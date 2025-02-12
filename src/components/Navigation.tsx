import { useState, useEffect, useRef } from "react";
import ConfirmDialog from "./shared/ConfirmDialog";
import RenameDialog from "./shared/RenameDialog";
import NewGameDialog from "./shared/NewGameDialog";
import { notify } from "../utils/notifications";
import useAppStore from '../stores/useAppStore';
import useGamesStore from '../stores/useGamesStore';
import { Game, CreateGameRequest } from '../types/game';
import wsClient from '../utils/websocket';
import ThemeToggle from './ThemeToggle';
import GameSelector from './GameSelector';

interface User {
  name: string;
  avatar: string;
}

const Navigation = (): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showNewGameDialog, setShowNewGameDialog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const setAuthenticated = useAppStore(state => state.setAuthenticated);
  const { games, activeGameId, setGames, setActiveGame, addGame, updateGame, removeGame } = useGamesStore();
  const [user, setUser] = useState<User>({
    name: 'User',
    avatar: ''
  });

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/verify-token', {
          credentials: 'include'
        });
        if (response.ok) {
          const userData = await response.json();
          setUser({
            name: userData.name,
            avatar: userData.avatar || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  // Register WebSocket handlers for real-time updates
  useEffect(() => {
    const handleGameCreated = (data: unknown) => {
      addGame(data as Game);
    };

    const handleGameUpdated = (data: unknown) => {
      const updatedGame = data as Game;
      updateGame(updatedGame);
    };

    const handleGameDeleted = (data: { gameId: string }) => {
      const { gameId } = data;
      removeGame(gameId);
      if (activeGameId === gameId) {
        setActiveGame(null);
      }
    };

    wsClient.registerHandler<'game_created'>('game_created', handleGameCreated);
    wsClient.registerHandler<'game_updated'>('game_updated', handleGameUpdated);
    wsClient.registerHandler<'game_deleted'>('game_deleted', handleGameDeleted);

    return () => {
      wsClient.unregisterHandler('game_created');
      wsClient.unregisterHandler('game_updated');
      wsClient.unregisterHandler('game_deleted');
    };
  }, [activeGameId, addGame, updateGame, removeGame, setActiveGame]);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch initial games list
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/games/', {
          credentials: 'include'
        });
        if (response.ok) {
          const gamesData = await response.json() as Game[];
          setGames(gamesData);
        }
      } catch (error) {
        console.error('Error fetching games:', error);
      }
    };

    fetchGames();
  }, []); // Only fetch on mount

  const handleNewGame = () => {
    setShowNewGameDialog(true);
  };

  const createGame = async (name: string) => {
    try {
      const userId = document.cookie
        .split('; ')
        .find(row => row.startsWith('user_id='))
        ?.split('=')[1];
      
      if (!userId) {
        notify.error('Session expired. Please log in again.');
        return;
      }

      const newGameRequest: CreateGameRequest = {
        name,
        user_id: userId,
        folder_path: ''
      };

      const response = await fetch('/api/games/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(newGameRequest)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(errorData.detail || 'Failed to create game');
      }

      const newGame = await response.json() as Game;
      addGame(newGame);
      setShowNewGameDialog(false);
      notify.success('Game created successfully');
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Failed to create game');
    }
  };

  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeGame = games.find(game => game.id === activeGameId);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setAuthenticated(false);
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const buttonClass = "flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:shadow-sm";

  return (
    <nav className="px-4 py-2 flex justify-between items-center border-b" style={{ 
      backgroundColor: 'var(--color-bg-primary)',
      borderColor: 'var(--color-border)'
    }}>
      <div className="flex items-center gap-6">
        <div className="user-info flex items-center gap-2">
          <img 
            src={user.avatar || '/static/images/default-avatar.png'}
            alt="User Avatar" 
            className="w-8 h-8 rounded-full"
          />
          <span style={{ color: 'var(--color-text-primary)' }}>{user.name}</span>
        </div>

        <GameSelector
          isOpen={isDropdownOpen}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onToggle={() => setIsDropdownOpen(!isDropdownOpen)}
          onNewGame={handleNewGame}
          buttonClass={buttonClass}
        />

        {activeGame && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (activeGame.preview_url) {
                  window.open(activeGame.preview_url, '_blank');
                }
              }}
              className={buttonClass}
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'white'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </button>
            
            <button
              onClick={() => {
                if (activeGame.repository_url) {
                  window.open(activeGame.repository_url, '_blank');
                }
              }}
              className={buttonClass}
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Code
            </button>

            <button
              onClick={async () => {
                try {
                  const response = await fetch(`/api/games/${activeGame.id}/deploy`, {
                    method: 'POST',
                    credentials: 'include'
                  });
                  if (response.ok) {
                    const result = await response.json();
                    window.open(result.preview_url, '_blank');
                  }
                } catch (error) {
                  console.error('Deploy error:', error);
                }
              }}
              className={buttonClass}
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'white'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Deploy
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className={buttonClass}
              style={{
                backgroundColor: '#EF4444',
                color: 'white'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {activeGame && (
          <button
            onClick={() => {
              setShowRenameDialog(true);
            }}
            className={buttonClass}
            style={{
              backgroundColor: 'var(--color-accent)',
              color: 'white'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Rename
          </button>
        )}

        <ThemeToggle />

        <button 
          onClick={handleLogout}
          className={buttonClass}
          style={{
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)'
          }}
        >
          Logout
        </button>
      </div>

      {activeGame && (
        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Game"
          message="Are you sure you want to delete this game? This action cannot be undone."
          onConfirm={async () => {
            try {
              const userId = document.cookie
                .split('; ')
                .find(row => row.startsWith('user_id='))
                ?.split('=')[1];
              
              if (!userId) {
                notify.error('Session expired. Please log in again.');
                return;
              }

              const response = await fetch(`/api/games/${userId}/${activeGame.id}`, {
                method: "DELETE",
                credentials: "include",
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: response.statusText }));
                throw new Error(errorData.detail || 'Failed to delete game');
              }

              setShowDeleteConfirm(false);
              notify.success('Game deleted successfully');
            } catch (error) {
              notify.error(error instanceof Error ? error.message : 'Failed to delete game');
            }
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {activeGame && (
        <RenameDialog
          isOpen={showRenameDialog}
          title="Rename Game"
          currentName={activeGame.name}
          onRename={async (newName) => {
            try {
              const userId = document.cookie
                .split('; ')
                .find(row => row.startsWith('user_id='))
                ?.split('=')[1];
              
              if (!userId) {
                notify.error('Session expired. Please log in again.');
                return;
              }

              const response = await fetch(`/api/games/${userId}/${activeGame.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                  name: newName
                })
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: response.statusText }));
                throw new Error(errorData.detail || 'Failed to rename game');
              }

              const updatedGame = await response.json();
              setGames(games.map(game =>
                game.id === updatedGame.id ? updatedGame : game
              ));
              setShowRenameDialog(false);
              notify.success('Game renamed successfully');
            } catch (error) {
              notify.error(error instanceof Error ? error.message : 'Failed to rename game');
            }
          }}
          onCancel={() => setShowRenameDialog(false)}
        />
      )}

      <NewGameDialog
        isOpen={showNewGameDialog}
        onSubmit={createGame}
        onCancel={() => setShowNewGameDialog(false)}
      />
    </nav>
  );
};

export default Navigation;
