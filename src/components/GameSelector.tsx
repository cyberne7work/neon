import { useRef, useState } from 'react';
import useGamesStore from '../stores/useGamesStore';
import { Game } from '../types/game';

interface GameSelectorProps {
  isOpen: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onToggle: () => void;
  onNewGame: () => void;
  buttonClass: string;
}

export default function GameSelector({
  isOpen,
  searchQuery,
  onSearchChange,
  onToggle,
  onNewGame,
  buttonClass
}: GameSelectorProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { games, activeGameId, setActiveGame } = useGamesStore();

  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeGame = games.find(game => game.id === activeGameId);

  const handleGameSelect = async (gameId: string) => {
    setIsConnecting(true);
    try {
      await setActiveGame(gameId);
    } finally {
      setIsConnecting(false);
      onSearchChange('');
      onToggle();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Game Selection Button */}
      <button
        onClick={onToggle}
        className={`${buttonClass} min-w-[200px] justify-between`}
        style={{ 
          backgroundColor: 'var(--color-bg-secondary)',
          color: 'var(--color-text-primary)',
          borderColor: 'var(--color-border)',
          borderWidth: '1px'
        }}
      >
        <span className="truncate flex items-center gap-2">
          {isConnecting && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {activeGame?.name || 'Select Game'}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute z-10 mt-2 w-80 rounded-lg shadow-lg overflow-hidden transition-all duration-200 transform origin-top"
          style={{ 
            backgroundColor: 'var(--color-bg-primary)',
            borderColor: 'var(--color-border)',
            borderWidth: '1px'
          }}
        >
          {/* Search Input */}
          <div className="p-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-md text-sm transition-colors focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border)',
                  borderWidth: '1px'
                }}
              />
              <svg 
                className="absolute left-3 top-2.5 w-4 h-4" 
                style={{ color: 'var(--color-text-secondary)' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Games List */}
          <div 
            className="max-h-[300px] overflow-y-auto scrollbar-thin"
            style={{ backgroundColor: 'var(--color-bg-primary)' }}
          >
            {filteredGames.map(game => (
              <div
                key={game.id}
                onClick={() => handleGameSelect(game.id)}
                className="relative px-4 py-3 cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md"
                style={{ 
                  backgroundColor: activeGameId === game.id ? 'var(--color-bg-secondary)' : 'transparent',
                  color: 'var(--color-text-primary)',
                  borderLeft: activeGameId === game.id ? '3px solid var(--color-accent)' : '3px solid transparent'
                }}
              >
                <div className="font-medium truncate">{game.name}</div>
                <div className="text-xs mt-1 flex items-center gap-2">
                  <span style={{ color: 'var(--color-text-secondary)' }}>
                    Last modified: {game.lastModified ? new Date(game.lastModified).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Never'}
                  </span>
                </div>
              </div>
            ))}

            {filteredGames.length === 0 && (
              <div className="px-4 py-3 text-sm text-center" style={{ color: 'var(--color-text-secondary)' }}>
                No games found
              </div>
            )}
          </div>

          {/* New Game Button */}
          <div 
            className="p-3 border-t"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <button
              onClick={onNewGame}
              className={`${buttonClass} w-full justify-center`}
              style={{
                backgroundColor: 'var(--color-accent)',
                color: 'white'
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}