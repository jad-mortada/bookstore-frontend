import React from 'react';
import { Box, Typography } from '@mui/material';

const SectionHeader = ({ title, subtitle, align = 'center', sx = {} }) => {
  return (
    <Box sx={{ textAlign: align, ...sx }}>
      <Typography
        variant="h2"
        sx={{
          fontWeight: 800,
          backgroundImage: 'linear-gradient(90deg, #1e88e5 0%, #66bb6a 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: 0.2,
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="subtitle1" sx={{ color: 'text.secondary', mt: 1 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default SectionHeader;
