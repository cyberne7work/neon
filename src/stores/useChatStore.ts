import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  timestamp?: string;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  addMessage: (message) => {
    // Convert 'error' type to 'system' type for consistency
    const type = message.type === 'error' ? 'system' : message.type;
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          type,
          id: uuidv4(),
          timestamp: new Date().toISOString()
        }
      ]
    }));
  },
  setLoading: (loading) => set({ isLoading: loading }),
  clearMessages: () => set({ messages: [] })
}));

export default useChatStore;
