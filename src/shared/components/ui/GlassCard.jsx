/**
  * GlassCard.jsx
  * Frosted-glass styled wrapper around MUI `Card` with sensible defaults for
  * padding, border, blur, and shadow. Accepts `sx` to further customize styles.
  *
  * Documentation-only change; behavior remains the same.
  */
 
 import React from 'react';
 import Card from '@mui/material/Card';
 
 /**
  * GlassCard
  *
  * @param {Object} props
  * @param {React.ReactNode} props.children - Content to render inside the card.
  * @param {object} [props.sx] - MUI `sx` style overrides merged with defaults.
  * @param {number} [props.elevation=10] - MUI elevation for the card shadow.
  * @returns {JSX.Element}
  */
 const GlassCard = ({ children, sx = {}, elevation = 10, ...props }) => {
  return (
    <Card
      elevation={elevation}
      sx={{
        borderRadius: 3,
        p: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.28)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(15,23,42,0.08)',
        boxShadow: '0 12px 24px rgba(15,23,42,0.08)',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Card>
  );
};

export default GlassCard;
