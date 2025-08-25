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
        borderRadius: { 
          xs: '1.5rem 0.5rem 1.5rem 0.5rem', 
          sm: '2rem 0.75rem 2rem 0.75rem', 
          md: '2.5rem 1rem 2.5rem 1rem' 
        },
        padding: { xs: '1.25rem', sm: '1.75rem', md: '2.25rem' },
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(0.75rem) saturate(180%)',
        border: '0.0625rem solid rgba(255, 255, 255, 0.18)',
        boxShadow: { 
          xs: '0 0.5rem 1.5rem -0.5rem rgba(31, 38, 135, 0.15)', 
          md: '0 1rem 2.5rem -0.75rem rgba(31, 38, 135, 0.2)' 
        },
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        '&:hover': {
          transform: 'translateY(-0.25rem)',
          boxShadow: {
            xs: '0 0.75rem 2rem -0.5rem rgba(31, 38, 135, 0.2)',
            md: '0 1.5rem 3rem -0.75rem rgba(31, 38, 135, 0.25)'
          },
          '&::before': {
            opacity: 0.08,
            transform: 'translate(10%, 10%) scale(1.1)'
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0) 70%)',
          borderRadius: '50%',
          opacity: 0.05,
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Card>
  );
};

export default GlassCard;
