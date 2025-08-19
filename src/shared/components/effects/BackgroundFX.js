import React from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';

const BackgroundFX = ({ children }) => {
  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
      <Box
        aria-hidden
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: `radial-gradient(circle at 70% 20%, rgba(124,58,237,0.16) 25vw, transparent 50vw),
             radial-gradient(circle at 20% 80%, rgba(16,185,129,0.16) 22vw, transparent 60vw),
             linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.42) 100%)`,
          '&:before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 100%)',
          },
        }}
        component={motion.div}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        sx={{ position: 'relative', zIndex: 1, width: '100%' }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default BackgroundFX;
