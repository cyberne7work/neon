export const getAuthToken = (): string | undefined => {
  // Try to get token from cookie
  const cookies = document.cookie.split(';');
  const tokenCookie = cookies.find(c => c.trim().startsWith('access_token='));
  if (tokenCookie) {
    const token = tokenCookie.split('=')[1].trim();
    // Verify token is not empty or 'undefined'
    if (token && token !== 'undefined') {
      return token;
    }
  }
  return undefined;
};

export const getAuthTokenFromResponse = (data: any): string | undefined => {
  // First try to get access_token from response
  if (data.access_token && data.access_token !== 'undefined') {
    return data.access_token;
  }
  
  // If no token in response, try to get from cookie
  return getAuthToken();
};

export const validateToken = (token?: string): boolean => {
  if (!token || token === 'undefined' || token === '') {
    return false;
  }

  try {
    // Check if token is a valid JWT
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Check if token is expired
    const payload = JSON.parse(atob(parts[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    if (Date.now() >= exp) { 
      return false;
    }

    // Verify required fields are present
    if (!payload.user_id || !payload.email) {
      return false;
    }

    return true;
  } catch (error) {
    console.error('Token validation error:', error, 'Token:', token);
    return false;
  }
};

export const setAuthCookie = (token: string) => {
  // Set cookie with proper SameSite attribute and secure flag
  document.cookie = `access_token=${token}; path=/; SameSite=Strict; secure`;
};

export const clearAuthCookie = () => {
  document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; secure';
};

export const getWebSocketCredentials = () => {
  const token = getAuthToken();
  if (!token || !validateToken(token)) {
    return { userId: undefined, token: undefined };
  }

  try {
    // Extract user ID from token payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: payload.user_id,
      token: token
    };
  } catch (error) {
    console.error('Error extracting credentials from token:', error);
    return { userId: undefined, token: undefined };
  }
};