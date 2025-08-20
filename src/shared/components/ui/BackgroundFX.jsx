/**
  * BackgroundFX.jsx
  * Lightweight decorative background wrapper that renders subtle radial gradients
  * and a slow spinning conic overlay behind its children. Uses only MUI `Box`
  * and CSS animations (no runtime logic). Intended for page-level sections.
  *
  * This file adds documentation comments only and does not change behavior.
  */
 import React from 'react';
 import { Box } from '@mui/material';
 
 /**
  * BackgroundFX
  *
  * Wraps content with a full-viewport decorative background. All content is
  * rendered above the effects layer using `zIndex: 1`.
  *
  * @param {Object} props
  * @param {React.ReactNode} props.children - Content to render above the background effects.
  * @returns {JSX.Element}
  */
 const BackgroundFX = ({ children }) => {
  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
      <Box
        aria-hidden
        sx={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          background: `
            radial-gradient(800px 400px at 10% 10%, rgba(124,58,237,0.16) 0%, transparent 60%),
            radial-gradient(700px 350px at 90% 20%, rgba(16,185,129,0.14) 0%, transparent 60%),
            radial-gradient(600px 300px at 30% 85%, rgba(124,58,237,0.10) 0%, transparent 70%),
            linear-gradient(180deg, rgba(245,247,251,1) 0%, transparent 100%)
          `,
          '&:after': {
            content: '""', position: 'absolute', inset: -100, background:
              'conic-gradient(from 0deg, rgba(255,255,255,0.06), rgba(255,255,255,0.0), rgba(255,255,255,0.06))',
            filter: 'blur(40px)', opacity: 0.5,
            animation: 'spinSlow 26s linear infinite',
          },
          '@keyframes spinSlow': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          },
        }}
      />
      <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>{children}</Box>
    </Box>
  );
};

export default BackgroundFX;
