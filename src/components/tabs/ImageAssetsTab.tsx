import { useEffect } from 'react';
import useAssetsStore, { Asset } from '../../stores/useAssetsStore';
import wsClient from '../../utils/websocket';
import { notify } from '../../utils/notifications';
import FileUpload from '../shared/FileUpload';

const ImageAssetsTab = () => {
  const { images, setImages, isLoading, setLoading, addImage } = useAssetsStore();

  useEffect(() => {
    const fetchImages = async () => {
      const loadingToast = notify.loading('Loading images...');
      try {
        setLoading(true);
        const response = await fetch('/api/assets/images/', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setImages(data.map((filename: string) => ({
            id: crypto.randomUUID(),
            filename,
            url: `/static/images/${filename}`,
            type: 'image' as const,
            createdAt: new Date().toISOString()
          })));
          notify.dismiss(loadingToast);
        } else {
          throw new Error('Failed to load images');
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        notify.dismiss(loadingToast);
        notify.error('Failed to load images');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();

    wsClient.registerHandler('asset_uploaded', (data) => {
      if (data.type === 'image') {
        setImages((currentImages: Asset[]) => [...currentImages, {
          id: crypto.randomUUID(),
          filename: data.filename,
          url: `/static/images/${data.filename}`,
          type: 'image' as const,
          createdAt: new Date().toISOString()
        } as Asset]);
      }
    });

    return () => {
      wsClient.unregisterHandler('asset_uploaded');
    };
  }, [setImages, setLoading]);

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
    addImage({
      id: crypto.randomUUID(),
      filename,
      url,
      type: 'image',
      createdAt: new Date().toISOString()
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-4 flex items-center justify-center">
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading images...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 overflow-y-auto space-y-4 h-full max-h-[calc(100vh-8rem)]" style={{
      backgroundColor: 'var(--color-bg-primary)'
    }}>
      <FileUpload
        type="image"
        accept="image/*"
        onUploadComplete={handleUploadComplete}
        className="w-full"
      />
      {images.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p style={{ color: 'var(--color-text-secondary)' }}>No images available</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {images.map((image) => (
            <div 
              key={image.id} 
              className="p-4 rounded-lg shadow-sm"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border)',
                borderWidth: '1px'
              }}
            >
              <img
                src={image.url}
                alt={image.filename}
                className="w-full h-48 object-cover rounded mb-2"
              />
              <div className="flex items-center justify-between">
                <p className="text-sm truncate flex-1 mr-2" style={{ color: 'var(--color-text-secondary)' }}>
                  {image.filename}
                </p>
                <button
                  onClick={() => handleCopyFilename(image.filename)}
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

export default ImageAssetsTab;
