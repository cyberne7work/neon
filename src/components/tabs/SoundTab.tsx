import { useState } from 'react';
import useSoundStore from '../../stores/useSoundStore';
import { notify } from '../../utils/notifications';

const examples = [
  'Create a retro game jump sound effect with an upward pitch bend and slight echo',
  'Generate an 8-bit coin collection sound with a bright, cheerful tone',
  'Create a power-up sound with ascending notes and a magical sparkle effect'
];

const SoundTab = () => {
  const [input, setInput] = useState('');
  const [gameType, setGameType] = useState('');
  const {
    sounds,
    isGenerating,
    selectedType,
    setSelectedType,
    setGenerating,
    addSound
  } = useSoundStore();

  const handleGenerate = async () => {
    if (!input.trim()) return;

    const loadingToast = notify.loading('Generating sound...');
    setGenerating(true);
    
    try {
      const response = await fetch('/api/assets/sound/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: input,
          type: selectedType,
          game_type: selectedType === 'game' ? gameType : undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate sound effects');
      }

      const data = await response.json();
      
      if (data.success) {
        if (selectedType === 'game' && data.sounds) {
          Object.entries(data.sounds).forEach(([name, url]) => {
            addSound({
              id: crypto.randomUUID(),
              url: url as string,
              name,
              createdAt: new Date().toISOString()
            });
          });
          notify.success(`Generated ${Object.keys(data.sounds).length} sound effects!`);
        } else if (data.sound_url) {
          addSound({
            id: crypto.randomUUID(),
            url: data.sound_url,
            name: 'Generated Sound',
            createdAt: new Date().toISOString()
          });
          notify.success('Sound generated successfully!');
        }
      } else {
        throw new Error('Failed to generate sound effects');
      }
    } catch (error) {
      console.error('Error generating sounds:', error);
      notify.error(error instanceof Error ? error.message : 'Failed to generate sound effects');
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
            Sound Effects Examples
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
          <div className="space-y-3">
            {sounds.map((sound) => (
              <div key={sound.id} className="flex items-center gap-3 p-2 rounded" style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderColor: 'var(--color-border)',
                borderWidth: '1px'
              }}>
                <audio
                  controls
                  src={sound.url}
                  className="flex-1"
                >
                  Your browser does not support the audio element.
                </audio>
                <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  {new Date(sound.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {sounds.length === 0 && (
              <p className="text-center text-sm py-4" style={{ color: 'var(--color-text-secondary)' }}>
                Generated sounds will appear here
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sound Generation Controls */}
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
              <option value="single">Single Sound</option>
              <option value="game">Game Sounds</option>
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
            placeholder="Describe the sound effect or music you want..."
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
              {isGenerating ? 'Generating...' : 'Generate Sound'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoundTab;
