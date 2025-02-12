import { useEffect } from 'react';
import useAssetsStore, { Asset } from '../../stores/useAssetsStore';
import wsClient from '../../utils/websocket';
import { notify } from '../../utils/notifications';
import FileUpload from '../shared/FileUpload';

const SoundAssetsTab = () => {
  const { sounds, setSounds, isLoading, setLoading, addSound } = useAssetsStore();

  useEffect(() => {
    const fetchSounds = async () => {
      const loadingToast = notify.loading('Loading sounds...');
      try {
        setLoading(true);
        const response = await fetch('/api/assets/sounds/', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setSounds(data.map((filename: string) => ({
            id: crypto.randomUUID(),
            filename,
            url: `/static/sounds/${filename}`,
            type: 'sound' as const,
            createdAt: new Date().toISOString()
          })));
          notify.dismiss(loadingToast);
        } else {
          throw new Error('Failed to load sounds');
        }
      } catch (error) {
        console.error('Error fetching sounds:', error);
        notify.dismiss(loadingToast);
        notify.error('Failed to load sounds');
      } finally {
        setLoading(false);
      }
    };

    fetchSounds();

    wsClient.registerHandler('asset_uploaded', (data) => {
      if (data.type === 'sound') {
        setSounds((currentSounds: Asset[]) => [...currentSounds, {
          id: crypto.randomUUID(),
          filename: data.filename,
          url: `/static/sounds/${data.filename}`,
          type: 'sound' as const,
          createdAt: new Date().toISOString()
        } as Asset]);
      }
    });

    return () => {
      wsClient.unregisterHandler('asset_uploaded');
    };
  }, [setSounds, setLoading]);

  const handleCopyFilename = async (filename: string) => {
    try {
      await navigator.clipboard.writeText(filename);
      notify.copied();
    } catch (error) {
      console.error('Failed to copy filename:', error);
      notify.error('Failed to copy filename to clipboard');
    }
  };

  const handleUploadComplete = (url: string, filename: string) => {
    addSound({
      id: crypto.randomUUID(),
      filename,
      url,
      type: 'sound',
      createdAt: new Date().toISOString()
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading sounds...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-4 h-full max-h-[calc(100vh-8rem)]" style={{
      backgroundColor: 'var(--color-bg-primary)'
    }}>
      <FileUpload
        type="sound"
        accept="audio/*"
        onUploadComplete={handleUploadComplete}
        className="w-full"
      />
      {sounds.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p style={{ color: 'var(--color-text-secondary)' }}>No sounds available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sounds.map((sound) => (
            <div 
              key={sound.id} 
              className="flex items-center gap-3 p-4 rounded-lg"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border)',
                borderWidth: '1px'
              }}
            >
              <audio
                controls
                src={sound.url}
                className="flex-1"
              >
                Your browser does not support the audio element.
              </audio>
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {new Date(sound.createdAt).toLocaleTimeString()}
                </span>
                <button
                  onClick={() => handleCopyFilename(sound.filename)}
                  className="transition-colors hover:brightness-90"
                  style={{ color: 'var(--color-accent)' }}
                  title="Copy filename"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SoundAssetsTab;
