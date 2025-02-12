import toast from 'react-hot-toast';

export const notify = {
  // Authentication
  success: (message: string) => 
    toast.success(message),
  
  // authError: (message: string) => 
    // toast.error(`Authentication error: ${message}`),
  
  connectionStatus: (status: 'connecting' | 'connected' | 'disconnected') => {
    // Dismiss any existing connection status toasts
    toast.dismiss('connection-status');
    
    switch (status) {
      // case 'connecting':
      //   return toast.loading('Connecting to server...', { id: 'connection-status' });
      case 'connected':
        return toast.success('Connected to server', { id: 'connection-status', duration: 3000 });
      case 'disconnected':
        return toast.error('Disconnected from server. Attempting to reconnect...', { id: 'connection-status' });
    }
  },

  // Asset Operations
  assetUploaded: (type: 'image' | 'sound') => 
    toast.success(`${type === 'image' ? 'Image' : 'Sound'} uploaded successfully`),
  
  copied: () => 
    toast.success('Filename copied to clipboard'),
  
  // Generation Operations
  generationComplete: (type: 'image' | 'sound') => 
    toast.success(`${type === 'image' ? 'Image' : 'Sound'} generated successfully`),
  
  // Loading States
  loading: (message: string) => 
    toast.loading(message, {
      duration: Infinity
    }),
  
  // Error States
  error: (message: string) => 
    toast.error(message),
  
  // Utility Functions
  dismiss: (toastId: string) => 
    toast.dismiss(toastId),
  
  // WebSocket States
  connected: () => 
    toast.success('Connected to server'),
  
  disconnected: () => 
    toast.error('Disconnected from server. Attempting to reconnect...'),
  
  reconnected: () => 
    toast.success('Reconnected to server'),
  
  // Custom Notifications
  custom: (message: string, type: 'success' | 'error' | 'loading') => {
    switch (type) {
      case 'success':
        return toast.success(message);
      case 'error':
        return toast.error(message);
      case 'loading':
        return toast.loading(message);
      default:
        return toast(message);
    }
  }
};
