import { useState, useEffect } from 'react';
import useImageStore, { ImageSize } from '../../stores/useImageStore';
import wsClient from '../../utils/websocket';
import { AssetGenerationRequest } from '../../types/websocket';
import { notify } from '../../utils/notifications';

const examples = [
  'Create a pixel art character sprite of a warrior with sword and shield, 32x32 pixels',
  'Generate a game background of a magical forest with glowing mushrooms and floating particles',
  'Design a set of UI buttons with a fantasy theme, including play, settings, and inventory icons'
];

const imageSizes: NonNullable<ImageSize>[] = ['256x256', '512x512', '1024x1024'];

const ImageTab = () => {
  const [input, setInput] = useState('');
  const [gameType, setGameType] = useState('');
  const {
    images,
    isGenerating,
    selectedType,
    selectedSize,
    setSelectedType,
    setSelectedSize,
    setGenerating,
    addImage
  } = useImageStore();

  useEffect(() => {
    wsClient.registerHandler('image_generated', (data) => {
      addImage({
        id: crypto.randomUUID(),
        url: data.url,
        name: data.name,
        size: data.size,
        createdAt: new Date().toISOString()
      });
      setGenerating(false);
    });

    return () => {
      wsClient.unregisterHandler('image_generated');
    };
  }, [addImage, setGenerating]);

  const handleGenerate = async () => {
    if (!input.trim()) return;

    const loadingToast = notify.loading('Generating image...');
    setGenerating(true);

    try {
      const response = await fetch('/api/assets/image/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: input.trim(),
          type: selectedType,
          size: selectedSize,
          ...(selectedType === 'game' && { game_type: gameType })
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      if (data.success) {
        if (selectedType === 'game' && data.images) {
          Object.entries(data.images).forEach(([name, url]) => {
            addImage({
              id: crypto.randomUUID(),
              url: url as string,
              name,
              size: selectedSize,
              createdAt: new Date().toISOString()
            });
          });
        } else if (data.image_url) {
          const name = data.image_url.split('/').pop() || 'generated-image';
          addImage({
            id: crypto.randomUUID(),
            url: data.image_url,
            name,
            size: selectedSize,
            createdAt: new Date().toISOString()
          });
        }
        notify.success('Image generated successfully');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      notify.error('Failed to generate image');
    } finally {
      notify.dismiss(loadingToast);
      setGenerating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {/* Examples Section */}
        <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
          <h4 className="font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Game Image Examples
          </h4>
          <div className="space-y-2">
            {examples.map((example, index) => (
              <div
                key={index}
                onClick={() => setInput(example)}
                className="p-2 rounded cursor-pointer transition-colors hover:brightness-95"
                style={{
                  backgroundColor: 'var(--color-bg-primary)',
                  borderColor: 'var(--color-border)',
                  borderWidth: '1px',
                  color: 'var(--color-text-secondary)'
                }}
              >
                <p className="text-sm">{example}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Section */}
        <div className="rounded-lg p-3" style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderColor: 'var(--color-border)',
          borderWidth: '1px'
        }}>
          <div className="grid grid-cols-2 gap-3">
            {images.map((image) => (
              <div key={image.id} className="space-y-2">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-auto rounded-lg shadow-sm"
                />
                <div className="flex justify-between items-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <span>{image.size}</span>
                  <span>{new Date(image.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
            {images.length === 0 && (
              <p className="text-center text-sm py-4 col-span-2" style={{ color: 'var(--color-text-secondary)' }}>
                Generated images will appear here
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Image Generation Controls */}
      <div className="border-t p-3" style={{
        backgroundColor: 'var(--color-bg-primary)',
        borderColor: 'var(--color-border)'
      }}>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'single' | 'game')}
              className="rounded-lg p-2 text-sm"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border)',
                borderWidth: '1px'
              }}
            >
              <option value="single">Single Image</option>
              <option value="game">Game Images</option>
            </select>
            {selectedType === 'game' && (
              <input
                type="text"
                value={gameType}
                onChange={(e) => setGameType(e.target.value)}
                placeholder="Game type (e.g., arcade, platformer)"
                className="flex-1 rounded-lg p-2 text-sm"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  borderColor: 'var(--color-border)',
                  borderWidth: '1px'
                }}
              />
            )}
            <select
              value={selectedSize}
              onChange={(e) => {
                const size = e.target.value as NonNullable<ImageSize>;
                setSelectedSize(size);
              }}
              className="rounded-lg p-2 text-sm"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border)',
                borderWidth: '1px'
              }}
            >
              {imageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full rounded-lg p-2 focus:outline-none focus:ring-2 resize-none text-sm"
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              borderColor: 'var(--color-border)',
              borderWidth: '1px'
            }}
            placeholder="Describe the image you want to generate..."
            rows={2}
            disabled={isGenerating}
          />
          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !input.trim()}
              className="px-4 py-1.5 rounded-md text-sm transition-colors hover:brightness-90 disabled:opacity-50"
              style={{
                backgroundColor: isGenerating || !input.trim() 
                  ? 'var(--color-bg-secondary)'
                  : 'var(--color-accent)',
                color: isGenerating || !input.trim()
                  ? 'var(--color-text-secondary)'
                  : 'white'
              }}
            >
              {isGenerating ? 'Generating...' : 'Generate Image'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageTab;
