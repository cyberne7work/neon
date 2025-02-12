import { ReactNode, useEffect } from 'react';
import useThemeStore from '../stores/useThemeStore';

interface ThemeProviderProps {
  children: ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  useEffect(() => {
    // Update data-theme attribute on root element
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return <>{children}</>;
}