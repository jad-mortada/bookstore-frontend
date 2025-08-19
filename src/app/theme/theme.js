// src/theme.js
import { createTheme } from '@mui/material/styles';

const getTheme = () => createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#7c3aed', contrastText: '#ffffff' },
    secondary: { main: '#10b981' },
    error: { main: '#ef4444' },
    warning: { main: '#f59e0b' },
    info: { main: '#0ea5e9' },
    success: { main: '#22c55e' },
    background: { default: '#f6f7fb', paper: '#ffffff' },
    text: { primary: '#0f172a', secondary: 'rgba(15, 23, 42, 0.68)' },
    divider: 'rgba(15,23,42,0.12)'
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif",
    h1: { fontSize: '2.875rem', lineHeight: 1.2, fontWeight: 800, letterSpacing: '0.2px' },
    h2: { fontSize: '2.25rem', lineHeight: 1.25, fontWeight: 800, letterSpacing: '0.2px' },
    h3: { fontSize: '1.875rem', lineHeight: 1.28, fontWeight: 700 },
    h4: { fontSize: '1.375rem', lineHeight: 1.35, fontWeight: 700 },
    h5: { fontSize: '1.125rem', lineHeight: 1.4, fontWeight: 600 },
    h6: { fontSize: '1rem', lineHeight: 1.5, fontWeight: 600 },
    body1: { fontSize: '1rem', lineHeight: 1.65 },
    body2: { fontSize: '0.915rem', lineHeight: 1.65 },
    button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.2px' },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f6f7fb',
          color: '#0f172a',
        },
        a: {
          color: '#7c3aed',
          textDecorationColor: 'rgba(124,58,237,0.5)'
        },
        table: {
          color: 'inherit'
        },
        'th, td': {
          borderColor: 'rgba(15,23,42,0.12)'
        },
        hr: {
          borderColor: 'rgba(15,23,42,0.12)'
        },
      },
    },
    MuiTypography: {
      defaultProps: { color: 'text.primary' },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backdropFilter: 'saturate(180%) blur(6px)',
          boxShadow: '0 8px 24px rgba(2,6,23,0.08)'
        },
      },
      defaultProps: {
        elevation: 1,
        color: 'primary'
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(15,23,42,0.06)'
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(124, 58, 237, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(124, 58, 237, 0.18)'
            }
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          color: undefined,
        },
        containedPrimary: {
          backgroundImage: 'linear-gradient(90deg, #7c3aed 0%, #10b981 100%)',
          boxShadow: '0 10px 24px rgba(124,58,237,0.28)',
          '&:hover': {
            backgroundImage: 'linear-gradient(90deg, #6d28d9 0%, #059669 100%)',
            boxShadow: '0 12px 28px rgba(124,58,237,0.34)'
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
    MuiFilledInput: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(2, 6, 23, 0.035)',
          borderRadius: 12,
          backdropFilter: 'blur(6px)',
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
          borderRadius: 16,
          boxShadow: '0 16px 32px rgba(15,23,42,0.08)'
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
          borderRadius: 16,
          boxShadow: '0 14px 28px rgba(15,23,42,0.08)'
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 10 },
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
          letterSpacing: '0.2px',
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
    MuiDataGrid: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#0f172a',
          borderColor: 'rgba(15,23,42,0.12)',
        },
        columnHeaders: {
          backgroundColor: 'rgba(15,23,42,0.035)',
          borderBottom: '1px solid rgba(15,23,42,0.12)',
          color: '#0f172a',
        },
        cell: {
          borderColor: 'rgba(15,23,42,0.12)',
          color: '#0f172a',
        },
        footerContainer: {
          borderTop: '1px solid rgba(15,23,42,0.12)',
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