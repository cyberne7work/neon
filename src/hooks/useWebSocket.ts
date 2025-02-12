import { useEffect } from 'react';
import useAppStore from '../stores/useAppStore';
import wsClient from '../utils/websocket';
import { notify } from '../utils/notifications';
import { getAuthTokenFromResponse, validateToken } from '../utils/auth';

export const useWebSocket = (setIsCheckingAuth: (value: boolean) => void) => {
  const { isAuthenticated, setAuthenticated, logout, authToken } = useAppStore();

  useEffect(() => {
    let isInitialConnection = true;
    let connectionAttemptTimeout: NodeJS.Timeout;

    const handleOpen = () => {
      notify.connectionStatus('connected');
      isInitialConnection = false;
    };

    const handleClose = () => {
      if (!isInitialConnection) {
        notify.connectionStatus('disconnected');
      }
    };

    const handleError = () => {
      notify.error('Connection failed - check your network connection');
    };

    // Set up event listeners
    wsClient.addEventListener('open', handleOpen);
    wsClient.addEventListener('close', handleClose);
    wsClient.addEventListener('error', handleError);

    // Check authentication and connect
    const checkAuthAndConnect = async () => {
      // Skip auth check if we're explicitly logging out
      if (!isAuthenticated && !authToken) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const response = await fetch('/api/check-auth', {
          credentials: 'include'
        });

        const data = await response.json();
        
        if (data.authenticated) {
          const token = data.access_token || getAuthTokenFromResponse(data);
          
          // Validate token before using it
          if (token && validateToken(token)) {
            setAuthenticated(true, token, data.id);
            
            // Only initialize WebSocket if not already connecting
            notify.connectionStatus('connecting');
            
            // Add a small delay to ensure token is properly set
            connectionAttemptTimeout = setTimeout(() => {
              wsClient.connect().catch(error => {
                console.error('WebSocket connection error:', error);
                notify.error('Failed to connect - please try refreshing the page');
              });
            }, 100);
          } else {
            console.error('Invalid or expired token during auth check');
            notify.error('Session expired - please log in again');
            logout();
          }
        } else {
          if (isAuthenticated) {
            notify.error('Session expired - please log in again');
          }
          logout();
        }
      } catch (error) {
        console.error('Auth check error:', error);
        notify.error('Failed to authenticate - please try logging in again');
        logout();
      } finally {
        setIsCheckingAuth(false);
      }
    };

    // Start authentication check
    checkAuthAndConnect();

    // Cleanup
    return () => {
      wsClient.removeEventListener('open', handleOpen);
      wsClient.removeEventListener('close', handleClose);
      wsClient.removeEventListener('error', handleError);
      wsClient.disconnect();
      clearTimeout(connectionAttemptTimeout);
    };
  }, [isAuthenticated, authToken, setAuthenticated, logout, setIsCheckingAuth]);
};