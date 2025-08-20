/**
  * SectionHeader.jsx
  * Reusable section header that renders a large gradient-clipped title with an
  * optional subtitle. Alignment and extra styles can be customized via props.
  *
  * Documentation-only change; behavior remains the same.
  */
 import React from 'react';
 import { Box, Typography } from '@mui/material';
 
 /**
  * SectionHeader
  *
  * @param {Object} props
  * @param {string|React.ReactNode} props.title - Main section title.
  * @param {string|React.ReactNode} [props.subtitle] - Optional subtitle text.
  * @param {'left'|'center'|'right'|string} [props.align='center'] - Text alignment for the container.
  * @param {object} [props.sx] - Additional MUI `sx` overrides for the container.
  * @returns {JSX.Element}
  */
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
