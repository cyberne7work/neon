import { useEffect, useCallback } from 'react';
import useAppStore from '../stores/useAppStore';
import useGamesStore from '../stores/useGamesStore';
import gameWsClient from '../utils/gameWebsocket';
import { notify } from '../utils/notifications';
import { validateToken } from '../utils/auth';

export const useGameWebSocket = (setIsConnecting?: (value: boolean) => void) => {
  const { isAuthenticated, authToken } = useAppStore();
  const { activeGameId } = useGamesStore();

  // Memoize setIsConnecting to prevent unnecessary effect re-runs
  const setIsConnectingStable = useCallback((value: boolean) => {
    setIsConnecting?.(value);
  }, []);

  useEffect(() => {
    // Ensure any existing connection is closed
    gameWsClient.disconnect();
    
    let isInitialConnection = true;
    let connectionAttemptTimeout: NodeJS.Timeout;

    const handleOpen = () => {
      notify.connectionStatus('connected');
      isInitialConnection = false;
      setIsConnectingStable(false);
    };

    const handleClose = () => {
      if (!isInitialConnection) {
        notify.connectionStatus('disconnected');
      }
      setIsConnectingStable(false);
    };

    const handleError = () => {
      notify.error('Game connection failed - check your network connection');
      setIsConnectingStable(false);
    };

    // Set up event listeners
    gameWsClient.addEventListener('open', handleOpen);
    gameWsClient.addEventListener('close', handleClose);
    gameWsClient.addEventListener('error', handleError);

    // Connect if we have an active game and valid token
    const connectToGame = async () => {
      // Skip connection if we're explicitly logging out
      if (!isAuthenticated && !authToken) {
        setIsConnectingStable(false);
        return;
      }

      if (isAuthenticated && activeGameId && authToken) {
        // Validate token before attempting connection
        if (!validateToken(authToken)) {
          console.error('Invalid or expired game token');
          notify.error('Session expired - please log in again');
          setIsConnectingStable(false);
          return;
        }

        try {
          setIsConnectingStable(true);
          notify.connectionStatus('connecting');
          
          // Add a small delay to ensure token is properly set
          connectionAttemptTimeout = setTimeout(() => {
            gameWsClient.connect().catch(error => {
              console.error('Game WebSocket connection error:', error);
              notify.error('Failed to connect to game - please try refreshing the page');
              setIsConnectingStable(false);
            });
          }, 100);
        } catch (error) {
          console.error('Failed to connect to game:', error);
          notify.error('Failed to connect to game server');
          setIsConnectingStable(false);
        }
      }
    };

    // Attempt connection
    connectToGame();

    // Cleanup
    return () => {
      gameWsClient.removeEventListener('open', handleOpen);
      gameWsClient.removeEventListener('close', handleClose);
      gameWsClient.removeEventListener('error', handleError);
      clearTimeout(connectionAttemptTimeout);
      setIsConnectingStable(false);
    };
  }, [isAuthenticated, activeGameId, authToken, setIsConnectingStable]);
};