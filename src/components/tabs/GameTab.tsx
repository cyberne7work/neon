import React, { useState, useRef, useEffect } from 'react';
import { useGameWebSocket } from '../../hooks/useGameWebSocket';
import useChatStore from '../../stores/useChatStore';
import useGamesStore from '../../stores/useGamesStore';
import useAppStore from '../../stores/useAppStore';
import ChatMessage from '../chat/ChatMessage';
import gameWsClient from '../../utils/gameWebsocket';
import { GameFile } from '../../types/file';
import { examplePrompt } from '../../constants/prompts';
import ProgressBar from '../shared/ProgressBar';

interface TaskStatus {
  taskId: string;
  status: string;
  progress: number;
  message: string;
}

const GameTab = () => {
  const [input, setInput] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout>();
  const { messages, addMessage, isLoading, setLoading } = useChatStore();
  const activeGameId = useGamesStore(state => state.activeGameId);

  // Initialize game WebSocket connection
  useGameWebSocket(setIsConnecting);

  // Poll task status
  const pollTaskStatus = async (taskId: string) => {
    try {
      const response = await fetch(`/api/task/${taskId}`);
      if (!response.ok) throw new Error('Failed to fetch task status');
      
      const data = await response.json();
      setTaskStatus({
        taskId,
        status: data.status,
        progress: data.progress,
        message: data.message
      });

      // Handle task completion
      if (data.status === 'completed' && data.result) {
        addMessage({
          type: 'assistant',
          content: data.result.content
        });
        setTaskStatus(null);
        setLoading(false);
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      } else if (data.status === 'failed') {
        addMessage({
          type: 'system',
          content: `Error: ${data.message}`
        });
        setTaskStatus(null);
        setLoading(false);
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      }
    } catch (error) {
      console.error('Error polling task status:', error);
    }
  };

  // Register game message handlers
  useEffect(() => {
    const handleTaskStarted = (data: { task_id: string, message: string }) => {
      if (!pollIntervalRef.current) {
        setTaskStatus({
          taskId: data.task_id,
          status: 'started',
          progress: 0,
          message: data.message
        });
        
        pollIntervalRef.current = setInterval(() => pollTaskStatus(data.task_id), 1000);
      }
      
      console.log('Task started:', data);
    };

    const handleProgressUpdate = (data: {
      game_id: string,
      status: string,
      progress: number,
      message: string
    }) => {
      if (taskStatus?.taskId) {
        setTaskStatus({
          taskId: taskStatus?.taskId || '',
          status: data.status,
          progress: data.progress,
          message: data.message
        });
        
        addMessage({
          type: 'system',
          content: data.message
        });
      }
      
      console.log('Progress update:', data);
    };

    gameWsClient.registerHandler('task_started', handleTaskStarted);
    gameWsClient.registerHandler('progress_update', handleProgressUpdate);

    return () => {
      // Only unregister handlers, let useGameWebSocket handle the connection
      gameWsClient.unregisterHandler('task_started');
      gameWsClient.unregisterHandler('progress_update');
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [addMessage, taskStatus]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !activeGameId) return;

    addMessage({
      type: 'user',
      content: input
    });

    gameWsClient.send('chat_message', {
      game: {
        id: activeGameId
      },
      content: input,
      files: []
    });

    setInput('');
    setLoading(true);
  };

  const handleCheckErrors = () => {
    if (!activeGameId) return;
    
    gameWsClient.send('check_errors', {
      game: {
        id: activeGameId
      },
      files: []
    });
  };

  const handleGenerateSound = async () => {
    if (!activeGameId || !input.trim()) return;

    setLoading(true);
    addMessage({
      type: 'system',
      content: 'Generating sound effects...'
    });

    try {
      const response = await fetch('/api/assets/sound', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: input,
          type: 'game',
          game_type: 'arcade'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate sound effects');
      }

      const data = await response.json();
      
      if (data.success) {
        addMessage({
          type: 'system',
          content: `Sound effects generated successfully!\nSuggested effects: ${data.suggested_effects.join(', ')}\nGenerated sounds: ${Object.keys(data.sounds).join(', ')}`
        });
      } else {
        throw new Error('Failed to generate sound effects');
      }
    } catch (error) {
      console.error('Error generating sounds:', error);
      addMessage({
        type: 'system',
        content: 'Failed to generate sound effects. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnhance = async () => {
    if (!activeGameId || !input.trim()) return;

    setLoading(true);
    
    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: input,
          example: examplePrompt
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to enhance prompt');
      }

      const data = await response.json();
      setEnhancedPrompt(data.enhancedPrompt);
      setInput(data.enhancedPrompt);
      
      addMessage({
        type: 'system',
        content: 'Prompt enhanced! Review the changes and press Send to start game generation.'
      });
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      addMessage({
        type: 'system',
        content: 'Failed to enhance prompt. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (isConnecting) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
      <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-0 max-h-[calc(100vh-280px)]">
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      {taskStatus && (
        <div className="px-4 py-2 border-t" style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderColor: 'var(--color-border)'
        }}>
          <ProgressBar
            progress={taskStatus.progress}
            status={taskStatus.status}
          />
          <div className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            {taskStatus.message}
          </div>
        </div>
      )}
      <div className="border-t p-3 sticky bottom-0" style={{
        backgroundColor: 'var(--color-bg-primary)',
        borderColor: 'var(--color-border)'
      }}>
        <div className="chat-input-container flex flex-col gap-2">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={isLoading}
              className="w-full rounded-lg p-2 focus:outline-none focus:ring-2 resize-none text-sm min-h-[80px] whitespace-pre-wrap leading-normal"
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border)',
                minHeight: '80px',
                lineHeight: 'normal'
              }}
              placeholder="Describe your game idea..."
            />
            <div
              className="absolute top-0 left-0 w-full h-full p-2 pointer-events-none whitespace-pre-wrap text-sm font-[inherit] leading-normal"
              style={{ minHeight: '80px', lineHeight: 'normal' }}
            >
              {input.split(' ').map((word, i, arr) => (
                <React.Fragment key={i}>
                  {word.startsWith('@') ? (
                    <span className="text-red-500" style={{ font: 'inherit' }}>{word}</span>
                  ) : (
                    <span className="opacity-0">{word}</span>
                  )}
                  {i < arr.length - 1 && <span className="opacity-0"> </span>}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="flex justify-end gap-2 min-w-max pb-1">
              <button
                onClick={handleCheckErrors}
                className="btn text-sm text-white hover:brightness-90"
                style={{ backgroundColor: 'var(--color-accent)' }}
                disabled={isLoading || !activeGameId}
              >
                Check Errors
              </button>
              <button
                onClick={handleGenerateSound}
                className="btn text-sm text-white hover:brightness-90"
                style={{ backgroundColor: 'var(--color-accent)' }}
                disabled={isLoading || !activeGameId || !input.trim()}
              >
                Generate Sound
              </button>
              <button
                onClick={handleEnhance}
                className="btn text-sm text-white hover:brightness-90"
                style={{ backgroundColor: 'var(--color-accent)' }}
                disabled={isLoading || !activeGameId || !input.trim()}
              >
                Enhance
              </button>
              <button
                onClick={handleSend}
                className="btn text-sm text-white hover:brightness-90"
                style={{ backgroundColor: 'var(--color-accent)' }}
                disabled={isLoading || !input.trim() || !activeGameId}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameTab;
