/**
  * GlassCard.jsx
  * Frosted-glass styled wrapper around MUI `Card` with responsive styling
  * for mobile devices using theme breakpoints.
  *
  * Updated to use responsive units instead of fixed viewport units
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
        borderRadius: { xs: 12, sm: 16, md: 20 },
        padding: { xs: 2, sm: 3, md: 4 },
        backgroundColor: 'rgba(255, 255, 255, 0.28)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(15,23,42,0.08)',
        boxShadow: { xs: '0 4px 12px rgba(15,23,42,0.08)', md: '0 8px 24px rgba(15,23,42,0.08)' },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Card>
  );
};

export default GlassCard;
