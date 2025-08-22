import React from 'react';
import { Box, Typography, CardContent, Stack } from '@mui/material';
import BackgroundFX from '../../../shared/components/ui/BackgroundFX';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../../shared/components/ui/GlassCard';
import GradientButton from '../../../shared/components/ui/GradientButton';
import SectionHeader from '../../../shared/components/ui/SectionHeader';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <BackgroundFX>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 3, md: 4 },
          background:
            'radial-gradient(1200px 600px at 10% 10%, rgba(37,99,235,0.16), transparent 60%),' +
            'radial-gradient(1000px 500px at 90% 20%, rgba(16,185,129,0.16), transparent 60%),' +
            'linear-gradient(180deg, rgba(15,23,42,0.03), rgba(15,23,42,0.03))',
        }}
      >
        <GlassCard sx={{ 
          maxWidth: { xs: '90%', sm: '80%', md: 960 }, 
          width: '100%', 
          p: { xs: 3, sm: 4, md: 6 } 
        }}>
          <SectionHeader
            title="Bookstore Management"
            subtitle="Streamline school book operations with a modern, calm experience"
            titleSx={{ 
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              lineHeight: { xs: 1.2, sm: 1.3, md: 1.4 }
            }}
            subtitleSx={{ 
              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
              lineHeight: { xs: 1.4, sm: 1.5, md: 1.6 }
            }}
          />

          <CardContent>
            <Stack spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mt: { xs: 2, sm: 3, md: 4 } }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  textAlign: 'center', 
                  color: 'text.secondary', 
                  fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' }, 
                  fontWeight: 500,
                  lineHeight: 1.6
                }}
              >
                Choose an option to get started
              </Typography>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={{ xs: 2, sm: 3, md: 4 }} 
                justifyContent="center"
                sx={{ width: '100%' }}
              >
                <GradientButton 
                  size="large" 
                  onClick={() => navigate('/login')} 
                  sx={{ 
                    px: { xs: 4, sm: 5, md: 6 },
                    py: { xs: 1.5, sm: 2, md: 2.5 },
                    fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                    minWidth: { xs: '100%', sm: 'auto' },
                    maxWidth: { xs: '100%', sm: 'none' }
                  }}
                >
                  Log In
                </GradientButton>
                <GradientButton 
                  size="large" 
                  onClick={() => navigate('/register')} 
                  sx={{ 
                    px: { xs: 4, sm: 5, md: 6 },
                    py: { xs: 1.5, sm: 2, md: 2.5 },
                    fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
                    minWidth: { xs: '100%', sm: 'auto' },
                    maxWidth: { xs: '100%', sm: 'none' }
                  }}
                >
                  Sign Up
                </GradientButton>
              </Stack>
            </Stack>
          </CardContent>
        </GlassCard>
      </Box>
    </BackgroundFX>
  );
};

export default Landing;
