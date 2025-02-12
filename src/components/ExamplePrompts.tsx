import { useState } from 'react';

interface ExamplePrompt {
  title: string;
  content: string;
}

const examplePrompts: ExamplePrompt[] = [
  {
    title: 'Pacman Game Example',
    content: `Build a simple Pac-Man game using HTML5 Canvas and vanilla JavaScript. The game should include:

Core Requirements:
1. Game Basics
- Responsive canvas display
- Basic maze with walls and dots
- Pac-Man character with basic movement
- Simple scoring system
- Verify movement in all directions
- Add 4 ghosts with random movement
- Background music (background.mp3)

2. Game Components:
- Game canvas: 400x400 pixels
- Maze: 20x20 grid layout
- Pac-Man: Basic yellow circle
- Dots: Small white circles
- Score display: Top of screen

3. Controls:
- Arrow keys for movement
- WASD keys as alternative controls

4. Features:
- Wall collision detection
- Dot collection mechanics
- Score tracking
- Continuous background music

Technical Details:
- Use HTML5 Canvas for rendering
- Pure JavaScript (no frameworks)
- Single index.html file
- CSS for basic styling
- Audio element for background music

Core Files:
- index.html (main game file)  use utf-8 encoding
- background.mp3 (music file)`
  },
  {
    title: 'Snake Game Example',
    content: `Build a classic Snake game using HTML5 Canvas and vanilla JavaScript. The game should include:
Core Requirements:
1. Game Basics:
- Canvas-based game board (400x400 pixels)
- Snake that grows when eating food
- Randomly spawning food
- Game over on wall or self-collision
- Score tracking system

2. Game Elements:
- Snake: Series of connected squares
- Food: Single colored square
- Score display: Top of screen
- Grid-based movement (20x20 grid)

3. Controls:
- Arrow keys for direction
- Optional WASD support
- No reverse direction allowed (can't go right when moving left)

4. Game Mechanics:
- Snake moves continuously in current direction
- Speed increases as score grows
- Snake grows by one segment when eating food
- Game ends if snake hits wall or itself
- Score increases with each food eaten
- Optional: Pause functionality (Spacebar)

Technical Requirements:
- HTML5 Canvas for rendering
- Pure JavaScript (no frameworks)
- CSS for basic styling
- Single file implementation

Core Files:
- index.html (contains game code and styling)

Game States:
- Start screen
- Playing state
- Game over screen with final score

Optional Features:
- High score storage using localStorage
- Basic sound effects for eating and game over
- Basic animations for food spawn
- Grid background for better visibility
   Main file is index.html use utf-8 encoding`
  }
];

const ExamplePrompts = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // TODO: Add toast notification for success
    } catch (error) {
      console.error('Failed to copy:', error);
      // TODO: Add toast notification for error
    }
  };

  return (
    <div className="w-96 bg-white rounded-lg shadow-sm p-3 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-800">Example Prompts</h3>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg 
            className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </button>
      </div>
      {isExpanded && (
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {examplePrompts.map((prompt, index) => (
            <div key={index} className="example-prompt relative group bg-gray-50 rounded-lg p-3">
              <button
                onClick={() => handleCopy(prompt.content)}
                className="copy-btn absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-blue-500 text-white p-1 rounded hover:bg-blue-600 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
                  />
                </svg>
              </button>
              <h4 className="font-medium text-gray-700 mb-2 pr-8">{prompt.title}</h4>
              <pre className="whitespace-pre-wrap text-sm text-gray-600 bg-white p-2 rounded-md border">
                {prompt.content}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamplePrompts;
