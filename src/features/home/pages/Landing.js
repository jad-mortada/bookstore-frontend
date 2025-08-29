import React, { lazy, Suspense, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  CardContent,
  Stack,
  useMediaQuery,
  useTheme,
  Fade,
  Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import BackgroundFX from '../../../shared/components/ui/BackgroundFX';
import GlassCard from '../../../shared/components/ui/GlassCard';
import GradientButton from '../../../shared/components/ui/GradientButton';
import SectionHeader from '../../../shared/components/ui/SectionHeader';

// Lazy load heavy components
const LazyFeatures = lazy(() => import('./components/Features'));
const LazyTestimonials = lazy(() => import('./components/testimonials'));

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.3 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
};

// Error Boundary
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);
  const handleCatch = useCallback(() => setHasError(true), []);
  if (hasError) return <Box textAlign="center" p={4}><Typography color="error">Something went wrong while loading this section.</Typography></Box>;
  return children;
};
ErrorBoundary.propTypes = { children: PropTypes.node.isRequired };

// Skeleton Loader
const ButtonSkeleton = () => (
  <Skeleton
    variant="rounded"
    width="100%"
    height="3.5rem"
    sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)' }}
  />
);

const Landing = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Preload critical routes
  useEffect(() => {
    ['/login', '/register'].forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });
  }, []);

  const handleNavigation = useCallback((path) => {
    document.body.style.opacity = '0';
    const timer = setTimeout(() => {
      navigate(path);
      requestAnimationFrame(() => { document.body.style.opacity = '1'; });
    }, 200);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Fade in timeout={800}>
      <Box>
        <Helmet>
          <title>Bookstore Management - Streamline Your School's Book Operations</title>
          <meta name="description" content="Efficiently manage school book operations with our modern, user-friendly platform. Sign up now to streamline your workflow." />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
          <meta name="theme-color" content={theme.palette.primary.main} />
        </Helmet>

        <BackgroundFX>
          <Box
            component="main"
            role="main"
            aria-live="polite"
            sx={{
              minHeight: '100dvh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 2, sm: 3, md: 4 },
              position: 'relative',
              background: {
                xs: 'radial-gradient(100% 50% at 50% 10%, rgba(37,99,235,0.12), transparent 70%), radial-gradient(100% 50% at 50% 90%, rgba(16,185,129,0.1), transparent 70%)',
                sm: 'radial-gradient(80vw 40vw at 10% 10%, rgba(37,99,235,0.16), transparent 60%), radial-gradient(70vw 35vw at 90% 20%, rgba(16,185,129,0.16), transparent 60%)',
                md: 'radial-gradient(60vw 40vw at 10% 10%, rgba(37,99,235,0.16), transparent 60%), radial-gradient(50vw 30vw at 90% 20%, rgba(16,185,129,0.16), transparent 60%)'
              },
              backgroundAttachment: 'fixed',
              backgroundSize: 'cover',
              overflowX: 'hidden',
              willChange: 'transform',
              transition: 'opacity 0.3s ease-in-out'
            }}
          >
            <GlassCard
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              sx={{
                width: '100%',
                maxWidth: { xs: '95%', sm: '90%', md: '75%', lg: '65%' },
                m: { xs: 2, sm: 3, md: 4 },
                p: { xs: '2rem', sm: '2.5rem', md: '3rem', lg: '4rem' },
                backdropFilter: 'blur(1rem)',
                borderRadius: '1rem',
                transition: 'all 0.3s ease-in-out',
                '&:hover': { boxShadow: '0 0.75rem 1.75rem rgba(0,0,0,0.18)' }
              }}
            >
              <SectionHeader
                title="Bookstore Management"
                subtitle="Streamline school book operations with a modern, calm experience"
                titleSx={{
                  fontSize: { xs: 'clamp(1.75rem, 8vw, 2.5rem)', sm: 'clamp(2rem, 4vw, 3rem)' },
                  lineHeight: { xs: 1.2, sm: 1.25, md: 1.3 },
                  mb: { xs: 1.5, sm: 2 },
                  textAlign: { xs: 'center', sm: 'left' },
                  background: 'linear-gradient(90deg, #0f172a 0%, #1e40af 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
                subtitleSx={{
                  fontSize: { xs: 'clamp(0.9rem,1.25vw,1.1rem)', md: '1.25rem' },
                  lineHeight: { xs: 1.5, md: 1.6 },
                  textAlign: { xs: 'center', sm: 'left' },
                  color: 'text.secondary',
                  mt: 1
                }}
              />

              <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
                <motion.div variants={containerVariants} initial="hidden" animate="visible">
                  <Stack spacing={{ xs: 3, sm: 4, md: 5 }} sx={{ mt: { xs: 3, sm: 4, md: 5 }, width: '100%' }}>
                    <motion.div variants={itemVariants}>
                      <Typography
                        component="p"
                        variant="body1"
                        sx={{
                          textAlign: 'center',
                          color: 'text.secondary',
                          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                          fontWeight: 500,
                          lineHeight: 1.6,
                          px: { xs: 1, sm: 2 },
                          maxWidth: '48rem',
                          mx: 'auto',
                          mb: 3
                        }}
                      >
                        Choose an option to get started with our intuitive platform
                      </Typography>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 2, sm: 3, md: 4 }}
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                          width: '100%',
                          '& > *': {
                            width: '100%',
                            maxWidth: { xs: '11.25rem', sm: '12.5rem' },
                            minWidth: { xs: '10rem', sm: '11.25rem' },
                            mx: 'auto',
                            '& button': {
                              width: '100%',
                              minHeight: 'auto',
                              py: { xs: 1.25, sm: 1.5 },
                              px: { xs: 3, sm: 4 },
                              fontSize: { xs: '0.95rem', sm: '1rem', md: '1.05rem' }
                            }
                          }
                        }}
                      >
                        <GradientButton
                          variant="contained"
                          size={isMobile ? 'medium' : 'large'}
                          onClick={() => handleNavigation('/login')}
                          fullWidth
                          aria-label="Log in to your account"
                          sx={{
                            '&:hover': { transform: 'translateY(-0.125rem)', boxShadow: 3 },
                            transition: 'all 0.2s ease-in-out',
                            fontWeight: 600,
                            letterSpacing: '0.03125rem'
                          }}
                        >
                          Log In
                        </GradientButton>

                        <GradientButton
                          variant="outlined"
                          size={isMobile ? 'medium' : 'large'}
                          onClick={() => handleNavigation('/register')}
                          fullWidth
                          aria-label="Create a new account"
                          sx={{
                            color: 'primary.contrastText',
                            borderColor: 'rgba(255,255,255,0.5)',
                            '&:hover': {
                              transform: 'translateY(-0.125rem)',
                              boxShadow: 3,
                              borderColor: 'primary.main',
                              backgroundColor: 'rgba(255,255,255,0.05)'
                            },
                            transition: 'all 0.2s ease-in-out',
                            fontWeight: 600,
                            letterSpacing: '0.03125rem',
                            backdropFilter: 'blur(0.5rem)'
                          }}
                        >
                          Sign Up
                        </GradientButton>
                      </Stack>
                    </motion.div>
                  </Stack>
                </motion.div>
              </CardContent>
            </GlassCard>

            {/* Lazy loaded sections */}
            <Suspense
              fallback={
                <Box sx={{ width: '100%', p: 3, mt: 4 }}>
                  <Skeleton variant="rectangular" width="100%" height={400} />
                </Box>
              }
            >
              <ErrorBoundary>
                <Box sx={{ width: '100%', mt: 6 }}>
                  <LazyFeatures />
                  <LazyTestimonials />
                </Box>
              </ErrorBoundary>
            </Suspense>
          </Box>
        </BackgroundFX>
      </Box>
    </Fade>
  );
};

Landing.propTypes = {};
export default React.memo(Landing);
