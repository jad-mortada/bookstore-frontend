/**
 * GradientButton.jsx
 * Wrapper around MUI Button that applies a branded gradient style when variant !== 'text'.
 * Falls back to a text-style button with subtle hover when variant === 'text'.
 */

import React from 'react';
import Button from '@mui/material/Button';

/**
 * @param {Object} props
 * @param {React.ReactNode} props.children Button contents
 * @param {object} [props.sx] Extra MUI sx overrides
 * @param {'inherit'|'primary'|'secondary'|'success'|'error'|'info'|'warning'} [props.color='primary']
 * @param {'text'|'outlined'|'contained'} [props.variant='contained']
 */
const GradientButton = ({ children, sx = {}, color = 'primary', variant = 'contained', ...props }) => {
  return (
    <Button
      variant={variant}
      color={color}
      sx={{
        borderRadius: 2.5,
        fontWeight: 800,
        letterSpacing: 0.4,
        textTransform: 'none',
        ...(variant === 'text'
          ? {
              background: 'transparent',
              color: 'primary.main',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: 'transparent',
                color: 'primary.dark',
                textDecoration: 'underline',
                boxShadow: 'none',
              },
            }
          : {
              backgroundImage: 'linear-gradient(90deg, #7c3aed 0%, #10b981 100%)',
              boxShadow: '0 10px 24px rgba(124,58,237,0.28)',
              '&:hover': {
                backgroundImage: 'linear-gradient(90deg, #6d28d9 0%, #059669 100%)',
                boxShadow: '0 12px 28px rgba(124,58,237,0.34)',
              },
            }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default GradientButton;
