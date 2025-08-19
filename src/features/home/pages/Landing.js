import React from 'react';
import { Box, Typography, CardContent, Stack } from '@mui/material';
import BackgroundFX from '../../../shared/components/ui/BackgroundFX';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../../shared/components/ui/GlassCard';
import GradientButton from '../../../shared/components/ui/GradientButton';
import SectionHeader from '../../../shared/components/ui/SectionHeader';
// Dark mode toggle removed

const Landing = () => {
  const navigate = useNavigate();
  // Dark mode toggle removed

  return (
    <BackgroundFX>
      {/* Dark mode toggle removed */}
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
          background:
            'radial-gradient(1200px 600px at 10% 10%, rgba(37,99,235,0.16), transparent 60%),' +
            'radial-gradient(1000px 500px at 90% 20%, rgba(16,185,129,0.16), transparent 60%),' +
            'linear-gradient(180deg, rgba(15,23,42,0.03), rgba(15,23,42,0.03))',
        }}
      >
        <GlassCard sx={{ maxWidth: 960, width: '100%', p: { xs: 3, md: 6 } }}>
          <SectionHeader
            title="Bookstore Management"
            subtitle="Streamline school book operations with a modern, calm experience"
          />

          <CardContent>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', fontSize: 18, fontWeight: 500 }}>
                Choose an option to get started
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <GradientButton size="large" onClick={() => navigate('/login')} sx={{ px: 5 }}>
                  Log In
                </GradientButton>
                <GradientButton size="large" onClick={() => navigate('/register')} sx={{ px: 5 }}>
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