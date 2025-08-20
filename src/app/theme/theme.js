/**
 * @file theme.js
 * @description Centralized MUI theme configuration for the application.
 * 
 * This module exports a theme object that creates a consistent
 * design system with custom colors, typography, and component overrides.
 * The theme follows Material Design principles while adding custom brand styling.
 * 
 * @module theme
 */

import { createTheme } from '@mui/material/styles';

/**
 * Creates and returns a customized MUI theme object with light mode only.
 * 
 * @function getTheme
 * @returns {import('@mui/material/styles').Theme} A complete MUI theme object.
 * 
 * @example
 * // Basic usage
 * const theme = getTheme();
 */
const getTheme = () => createTheme({
  /**
   * Color palette configuration for the theme.
   * Uses a modern, accessible color scheme with sufficient contrast.
   * 
   * @property {Object} palette - Color definitions for the theme
   * @property {Object} palette.primary - Primary brand color and its contrast text
   * @property {string} palette.primary.main - Main primary color (purple)
   * @property {string} palette.primary.contrastText - Text color that contrasts with primary
   * @property {Object} palette.secondary - Secondary brand color
   * @property {Object} palette.error - Color for error states
   * @property {Object} palette.warning - Color for warning states
   * @property {Object} palette.info - Color for informational states
   * @property {Object} palette.success - Color for success states
   * @property {Object} palette.background - Background colors for different surfaces
   * @property {Object} palette.text - Text colors for primary and secondary content
   * @property {string} palette.divider - Color for dividers and borders
   */
  palette: {
    mode: 'light',
    primary: { main: '#7c3aed', contrastText: '#ffffff' }, // Purple
    secondary: { main: '#10b981' }, // Emerald
    error: { main: '#ef4444' }, // Red
    warning: { main: '#f59e0b' }, // Amber
    info: { main: '#0ea5e9' }, // Sky blue
    success: { main: '#22c55e' }, // Green
    background: { 
      default: '#f6f7fb', // Light gray
      paper: '#ffffff' // White
    },
    text: { 
      primary: '#0f172a', // Dark blue
      secondary: 'rgba(15, 23, 42, 0.68)'
    },
    divider: 'rgba(15, 23, 42, 0.12)'
  },

  /**
   * Global shape configuration
   * @property {Object} shape - Shape properties for components
   * @property {number} shape.borderRadius - Default border radius in pixels
   */
  shape: { 
    borderRadius: 12 // Consistent border radius across components
  },

  /**
   * Typography configuration
   * Uses Inter as the primary font family with a responsive type scale
   * 
   * @property {Object} typography - Typography settings
   * @property {string} typography.fontFamily - Font stack with fallbacks
   * @property {Object} typography.h1-h6 - Heading styles (h1-h6)
   * @property {Object} typography.body1-body2 - Body text styles
   * @property {Object} typography.button - Button text styles
   * @property {Object} typography.subtitle1-subtitle2 - Subtitle styles
   */
  typography: {
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif",
    // Heading styles with responsive sizes and weights
    h1: { 
      fontSize: '2.875rem', // 46px
      lineHeight: 1.2, 
      fontWeight: 800, 
      letterSpacing: '0.0125em' 
    },
    h2: { 
      fontSize: '2.25rem', // 36px
      lineHeight: 1.25, 
      fontWeight: 800, 
      letterSpacing: '0.0125em' 
    },
    h3: { 
      fontSize: '1.875rem', // 30px
      lineHeight: 1.28, 
      fontWeight: 700 
    },
    h4: { 
      fontSize: '1.375rem', // 22px
      lineHeight: 1.35, 
      fontWeight: 700 
    },
    h5: { 
      fontSize: '1.125rem', // 18px
      lineHeight: 1.4, 
      fontWeight: 600 
    },
    h6: { 
      fontSize: '1rem', // 16px
      lineHeight: 1.5, 
      fontWeight: 600 
    },
    // Body text styles
    body1: { 
      fontSize: '1rem', // 16px
      lineHeight: 1.65 
    },
    body2: { 
      fontSize: '0.915rem', // 14.64px
      lineHeight: 1.65 
    },
    // Button text styles
    button: { 
      textTransform: 'none', // Disable uppercase transformation
      fontWeight: 700, 
      letterSpacing: '0.0125em' 
    },
    // Subtitle styles
    subtitle1: { 
      fontWeight: 600 
    },
    subtitle2: { 
      fontWeight: 600 
    },
  },
  /**
   * Component style overrides
   * Customize MUI components to match the design system
   * 
   * @property {Object} components - Component style overrides
   * @property {Object} components.MuiCssBaseline - Global CSS baseline styles
   * @property {Object} components.MuiTypography - Default typography props
   * @property {Object} components.MuiAppBar - App bar styling
   * @property {Object} components.MuiDrawer - Navigation drawer styling
   * @property {Object} components.MuiListItemButton - List item button styling
   */
  components: {
    /**
     * Global baseline styles
     * Applies consistent styling to HTML elements
     */
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        // Base document styles
        body: {
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          transition: 'background-color 0.3s, color 0.3s',
        },
        // Link styles
        a: {
          color: theme.palette.primary.main,
          textDecorationColor: 'rgba(124, 58, 237, 0.5)',
          transition: 'color 0.2s, text-decoration-color 0.2s',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
        // Table styles
        table: {
          color: 'inherit',
          borderCollapse: 'separate',
          borderSpacing: 0,
        },
        'th, td': {
          borderColor: 'rgba(15, 23, 42, 0.12)',
          padding: theme.spacing(1.5, 2),
        },
        th: {
          fontWeight: 600,
          textAlign: 'left',
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
        },
        // Horizontal rule
        hr: {
          borderColor: 'rgba(15, 23, 42, 0.12)',
          borderWidth: '0.07vw 0 0',
          margin: '2vh 0',
        },
      }),
    },

    /**
     * Typography component defaults
     */
    MuiTypography: {
      defaultProps: { 
        color: 'text.primary',
        variantMapping: {
          h1: 'h1',
          h2: 'h2',
          h3: 'h3',
          h4: 'h4',
          h5: 'h5',
          h6: 'h6',
          subtitle1: 'p',
          subtitle2: 'p',
          body1: 'p',
          body2: 'p',
        },
      },
    },

    /**
     * App Bar component
     * Features a frosted glass effect and subtle shadow
     */
    MuiAppBar: {
      styleOverrides: {
        root: ({
          backdropFilter: 'saturate(180%) blur(0.42vw)',
          boxShadow: '0 0.55vw 1.65vw rgba(2, 6, 23, 0.08)',
          background: 'rgba(255, 255, 255, 0.8)',
          borderBottom: '0.07vw solid rgba(15, 23, 42, 0.12)',
        }),
      },
      defaultProps: {
        elevation: 0, // We use custom shadow
        color: 'transparent', // Remove default background
      },
    },

    /**
     * Drawer component
     * Used for navigation drawers
     */
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '0.07vw solid rgba(15, 23, 42, 0.12)',
          background: '#ffffff',
          width: '19.5vw', // Standard drawer width (viewport-based)
          boxSizing: 'border-box',
        },
      },
    },

    /**
     * List Item Button component
     * Used for navigation items in drawers and lists
     */
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.8vw',
          margin: '0.15vw 0.55vw',
          padding: '0.55vw 1.1vw',
          transition: 'background-color 0.2s, color 0.2s',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)', // Light gray hover
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(124, 58, 237, 0.12)',
            color: '#7c3aed', // Primary color
            '&:hover': {
              backgroundColor: 'rgba(124, 58, 237, 0.18)',
            },
            '& .MuiListItemIcon-root': {
              color: '#7c3aed', // Primary color
            },
          },
          '& .MuiListItemIcon-root': {
            minWidth: '2.8vw',
            color: 'rgba(15, 23, 42, 0.68)',
          },
        },
      },
    },
    // Buttons: pill-like radius and gradient primary variant
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '0.8vw',
          color: undefined,
        },
        containedPrimary: {
          backgroundImage: 'linear-gradient(90deg, #7c3aed 0%, #10b981 100%)',
          boxShadow: '0 0.7vw 1.65vw rgba(124,58,237,0.28)',
          '&:hover': {
            backgroundImage: 'linear-gradient(90deg, #6d28d9 0%, #059669 100%)',
            boxShadow: '0 0.85vw 1.95vw rgba(124,58,237,0.34)'
          },
        },
        text: {
          '&:hover': {
            backgroundColor: undefined,
          }
        }
      },
      defaultProps: { disableElevation: true },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: undefined,
        }
      }
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: { color: undefined }
      }
    },
    MuiTextField: {
      defaultProps: { variant: 'filled' },
    },
    // Inputs: soft backgrounds and removed default underlines
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(2, 6, 23, 0.035)',
          borderRadius: '0.8vw',
          backdropFilter: 'blur(0.42vw)',
          '&:before, &:after': { borderBottom: 'none' },
        },
        input: { color: '#0f172a' },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(2,6,23,0.02)'
        },
        input: { color: '#0f172a' }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { color: 'rgba(15, 23, 42, 0.68)' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '1.1vw',
          boxShadow: '0 1.1vw 2.2vw rgba(15,23,42,0.08)'
        },
      },
      defaultProps: { elevation: 1 },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          color: '#0f172a'
        }
      }
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          color: '#0f172a'
        }
      }
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          color: '#0f172a'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '1.1vw',
          boxShadow: '0 0.97vw 1.94vw rgba(15,23,42,0.08)'
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: '0.7vw' },
        outlined: {
          borderColor: 'rgba(15,23,42,0.12)'
        }
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: 'rgba(15,23,42,0.6)',
          '&.Mui-checked': { color: '#7c3aed' },
          '&:hover': { backgroundColor: 'rgba(15,23,42,0.06)' }
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(15,23,42,0.035)'
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          letterSpacing: '0.0125em',
          color: '#0f172a'
        },
        body: { fontSize: '0.95rem', color: '#0f172a', borderColor: 'rgba(15,23,42,0.12)' },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(15,23,42,0.03)'
          }
        }
      }
    },
    // DataGrid: align with paper background and subtle hover states
    MuiDataGrid: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#0f172a',
          borderColor: 'rgba(15,23,42,0.12)',
        },
        columnHeaders: {
          backgroundColor: 'rgba(15,23,42,0.035)',
          borderBottom: '0.07vw solid rgba(15,23,42,0.12)',
          color: '#0f172a',
        },
        cell: {
          borderColor: 'rgba(15,23,42,0.12)',
          color: '#0f172a',
        },
        footerContainer: {
          borderTop: '0.07vw solid rgba(15,23,42,0.12)',
        },
        row: {
          '&:hover': {
            backgroundColor: 'rgba(15,23,42,0.03)'
          }
        }
      }
    },
  },
});

export default getTheme;