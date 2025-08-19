
import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import getTheme from '../../app/theme/theme';

const ThemeModeContext = createContext({ mode: 'light', toggleMode: () => {} });

export function ThemeModeProvider({ children }) {

  const mode = 'light';
  const toggleMode = useCallback(() => {}, []);

  const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);
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

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
