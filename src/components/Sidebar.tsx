import { useEffect, useState } from 'react';
import useGamesStore from '../stores/useGamesStore';
import useFilesStore from '../stores/useFilesStore';
import wsClient from '../utils/websocket';
import { GameFile, FileCreatedEvent, FileUpdatedEvent, FileDeletedEvent } from '../types/file';

const Sidebar = () => {
  const { activeGameId } = useGamesStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { files, activeFilePath, setFiles, addFile, updateFile, deleteFile, setActiveFile } = useFilesStore();

  useEffect(() => {
    if (!activeGameId) {
      setFiles([]);
      setError(null);
      return;
    }

    // Fetch files for active game
    const fetchFiles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/games/${activeGameId}/files`, {
          credentials: 'include'
        });
        if (response.ok) {
          const { files: gameFiles } = await response.json();
          setFiles(gameFiles);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch game files');
        }
      } catch (error) {
        console.error('Error fetching game files:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch game files');
        setFiles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();

    // Register WebSocket handlers for real-time updates
    wsClient.registerHandler<'file_created'>('file_created', (data) => {
      addFile(data as GameFile);
    });

    wsClient.registerHandler<'file_updated'>('file_updated', (data) => {
      updateFile(data as GameFile);
    });

    wsClient.registerHandler<'file_deleted'>('file_deleted', (data) => {
      const { filePath } = data;
      deleteFile(filePath);
    });

    // Cleanup handlers on unmount
    return () => {
      wsClient.unregisterHandler('file_created');
      wsClient.unregisterHandler('file_updated');
      wsClient.unregisterHandler('file_deleted');
    };
  }, [activeGameId, setFiles, addFile, updateFile, deleteFile]);

  const renderFile = (file: GameFile) => {
    const isDirectory = file.type === 'directory';
    const isActive = activeFilePath === file.path;
    
    return (
      <div
        key={file.path}
        onClick={() => !isDirectory && setActiveFile(file.path)}
        className={`p-2 rounded-md cursor-pointer transition-colors hover:brightness-95 ${
          isActive ? '' : 'hover:bg-opacity-50'
        }`}
        style={{
          backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
          color: isActive ? 'white' : 'var(--color-text-primary)'
        }}
      >
        <div className="flex items-center gap-2">
          {isDirectory ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )}
          <span className="font-medium">{file.name}</span>
        </div>
        {file.lastModified && (
          <div className="text-xs ml-6" style={{ 
            color: isActive 
              ? 'rgba(255, 255, 255, 0.8)' 
              : 'var(--color-text-secondary)' 
          }}>
            Last modified: {new Date(file.lastModified).toLocaleDateString()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 shadow-sm p-3 flex flex-col" style={{
      backgroundColor: 'var(--color-bg-primary)',
      borderRight: '1px solid var(--color-border)'
    }}>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Game Files
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {isLoading ? (
          <div className="text-sm text-center p-4" style={{ color: 'var(--color-text-secondary)' }}>
            Loading files...
          </div>
        ) : error ? (
          <div className="text-sm text-center p-4 text-red-500">
            {error}
          </div>
        ) : files.length === 0 ? (
          <div className="text-sm text-center p-4" style={{ color: 'var(--color-text-secondary)' }}>
            {activeGameId ? 'No files found' : 'Select a game to view files'}
          </div>
        ) : (
          files
            .filter(file => !file.name.startsWith('.'))
            .map(renderFile)
        )}
      </div>
    </div>
  );
};

export default Sidebar;
