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
        borderRadius: '1vw',
        padding: '1.2vw',
        backgroundColor: 'rgba(255, 255, 255, 0.28)',
        backdropFilter: 'blur(0.7vw)',
        border: '0.07vw solid rgba(15,23,42,0.08)',
        boxShadow: '0 0.85vw 1.65vw rgba(15,23,42,0.08)',
        ...sx,
      }}
      {...props}
    >
      {children}
    </Card>
  );
};

export default GlassCard;