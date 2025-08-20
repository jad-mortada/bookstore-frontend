/**
 * ThemeContext.js
 * Provides a centralized Material UI theme and exposes mode/toggle through context.
 * Currently fixed to 'light' mode, but API is ready to support toggling.
 */

import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import getTheme from '../../app/theme/theme';

/**
 * @typedef {{mode: 'light'|'dark', toggleMode: ()=>void}} ThemeModeValue
 */

/**
 * Context containing current theme mode and a toggler.
 * Default is a no-op toggle and 'light' mode.
 * @type {React.Context<ThemeModeValue>}
 */
const ThemeModeContext = createContext({ mode: 'light', toggleMode: () => {} });

/**
 * Provides MUI Theme and exposes theme mode via context to the app tree.
 */
export function ThemeModeProvider({ children }) {
  // Currently fixed to 'light'; API allows future dark-mode toggle without refactors
  const mode = 'light';
  const toggleMode = useCallback(() => {}, []); // no-op for now

  // Memoize context value to avoid unnecessary re-renders of consumers
  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);
  // Regenerate MUI theme only when mode changes
  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

/**
 * Hook to access theme mode and toggler.
 * @returns {ThemeModeValue}
 */
export function useThemeMode() {
  return useContext(ThemeModeContext);
}
