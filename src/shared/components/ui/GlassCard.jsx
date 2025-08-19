
import React from 'react';
import Card from '@mui/material/Card';

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
