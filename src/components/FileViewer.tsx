import { useEffect, useState } from 'react';
import useGamesStore from '../stores/useGamesStore';
import useFilesStore from '../stores/useFilesStore';
import FileContentDialog from './shared/FileContentDialog';

const FileViewer = () => {
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { activeGameId } = useGamesStore();
  const { activeFilePath } = useFilesStore();

  // Process content to handle newlines and special characters
  const processContent = (text: string): string => {
    try {
      // Try parsing as JSON first in case it's a JSON string with escaped characters
      const parsed = JSON.parse(`"${text.replace(/"/g, '\\"')}"`);
      return parsed;
    } catch {
      // If not valid JSON, process directly
      let processed = text;
      // Handle various newline formats
      processed = processed
        .replace(/\\n/g, '\n')  // Replace \n with actual newlines
        .replace(/\\r\\n/g, '\n')  // Replace \r\n with newlines
        .replace(/\r\n/g, '\n')  // Replace Windows CRLF with LF
        .replace(/\r/g, '\n')  // Replace any remaining CR with LF
        .replace(/\\t/g, '\t'); // Replace \t with actual tabs
      
      return processed;
    }
  };

  // Fetch file content when game or file changes
  useEffect(() => {
    if (!activeGameId || !activeFilePath) {
      setContent('');
      setError('');
      setIsDialogOpen(false);
      return;
    }

    const fetchFileContent = async () => {
      try {
        const response = await fetch(`/api/games/${activeGameId}/files/${encodeURIComponent(activeFilePath)}`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const text = await response.text();
          // Process the content to handle newlines properly
          const processedText = processContent(text);
          setContent(processedText);
          setError('');
          setIsDialogOpen(true);
        } else {
          throw new Error('Failed to fetch file content');
        }
      } catch (error) {
        console.error('Error fetching file content:', error);
        setError('Failed to load file content');
        setContent('');
      }
    };

    fetchFileContent();
  }, [activeGameId, activeFilePath]);

  return (
    <div 
      className="flex-1 flex items-center justify-center"
      style={{ color: 'var(--color-text-secondary)' }}
    >
      {!activeGameId ? (
        <div className="text-center">
          <span>Select a game to view files</span>
        </div>
      ) : !activeFilePath ? (
        <div className="text-center">
          <span>Select a file to view its contents</span>
        </div>
      ) : error ? (
        <div className="text-center">
          <span style={{ color: '#EF4444' }}>{error}</span>
        </div>
      ) : (
        <FileContentDialog
          isOpen={isDialogOpen}
          filePath={activeFilePath}
          content={content}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default FileViewer;
