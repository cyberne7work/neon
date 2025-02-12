import React from 'react';
import { ChatMessage as ChatMessageType } from '../../stores/useChatStore';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const getMessageStyle = () => {
    const baseStyle = {
      padding: '1rem',
      borderRadius: '0.5rem',
      marginBottom: '0.5rem',
      whiteSpace: 'pre-wrap' as const,
      wordBreak: 'break-word' as const,
      maxWidth: '80%',
    };

    switch (message.type) {
      case 'user':
        return {
          ...baseStyle,
          backgroundColor: 'var(--color-bg-secondary)',
          color: 'var(--color-text-primary)',
          marginLeft: 'auto',
          borderTopRightRadius: '0',
        };
      case 'assistant':
        return {
          ...baseStyle,
          backgroundColor: 'var(--color-accent)',
          color: 'white',
          marginRight: 'auto',
          borderTopLeftRadius: '0',
        };
      case 'system':
        return {
          ...baseStyle,
          backgroundColor: 'var(--color-bg-secondary)',
          color: 'var(--color-text-secondary)',
          width: '100%',
          maxWidth: '100%',
          fontSize: '0.875rem',
          padding: '0.75rem',
          borderStyle: 'solid',
          borderWidth: '1px',
          borderColor: 'var(--color-border)',
        };
      default:
        return baseStyle;
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col">
      <div style={getMessageStyle()}>
        {message.content}
      </div>
      {message.timestamp && (
        <div
          className="text-xs"
          style={{
            color: 'var(--color-text-secondary)',
            marginLeft: message.type === 'user' ? 'auto' : '0',
            marginRight: message.type === 'assistant' ? 'auto' : '0',
            marginTop: '0.25rem',
            paddingLeft: '0.5rem',
            paddingRight: '0.5rem',
          }}
        >
          {formatTimestamp(message.timestamp)}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
