import React from 'react';
import { Box, Typography, Grid, useTheme, useMediaQuery, Container } from '@mui/material';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import SecurityIcon from '@mui/icons-material/Security';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';

const FeatureCard = styled(motion.div)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(0.625rem)',
  borderRadius: '1rem',
  padding: theme.spacing(4, 3),
  height: '100%',
  border: '0.0625rem solid',
  borderColor: 'rgba(255, 255, 255, 0.08)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  '&:hover': {
    transform: 'translateY(-0.5rem)',
    boxShadow: '0 1.25rem 1.5625rem -0.3125rem rgba(0, 0, 0, 0.1), 0 0.625rem 0.625rem -0.3125rem rgba(0, 0, 0, 0.04)',
    borderColor: theme.palette.primary.main,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
}));

const features = [
  {
    icon: <LibraryBooksIcon sx={{ fontSize: '2em' }} />,
    title: 'Book Management',
    description: 'Easily manage your school\'s book inventory with our intuitive interface.'
  },
  {
    icon: <AnalyticsIcon sx={{ fontSize: '1.25rem' }} />,
    title: 'Real-time Analytics',
    description: 'Get insights into book usage, popular titles, and inventory status.'
  },
  {
    icon: <AutorenewIcon sx={{ fontSize: '1.25rem' }} />,
    title: 'Automated Workflows',
    description: 'Streamline book checkouts, returns, and reservations.'
  },
  {
    icon: <PhoneIphoneIcon sx={{ fontSize: '1.25rem' }} />,
    title: 'Mobile Friendly',
    description: 'Access the platform from any device, anywhere, anytime.'
  },
  {
    icon: <SecurityIcon sx={{ fontSize: '1.25rem' }} />,
    title: 'Secure Access',
    description: 'Role-based access control ensures data security and privacy.'
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: '1.25rem' }} />,
    title: 'Growth Ready',
    description: 'Scalable solution that grows with your institution\'s needs.'
  }
];

const Features = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      }
    },
  };

  return (
    <Box sx={{ 
      py: { xs: 6, md: 10 },
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%',
        background: 'radial-gradient(circle at 20% 30%, rgba(37, 99, 235, 0.1) 0%, transparent 30%)',
        zIndex: -1,
      },
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: '60%',
        height: '100%',
        background: 'radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
        zIndex: -1,
      }
    }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -100px 0px' }}
          transition={{ duration: 0.8 }}
        >
          <Typography 
            variant="h3" 
            component="h2" 
            sx={{ 
              textAlign: 'center', 
              mb: 2,
              fontWeight: 800,
              background: 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              lineHeight: 1.2,
            }}
          >
            Powerful Features
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              textAlign: 'center', 
              color: 'text.secondary',
              maxWidth: '700px',
              mx: 'auto',
              mb: { xs: 4, md: 6 },
              fontSize: { xs: '1rem', md: '1.125rem' },
              px: { xs: 2, sm: 0 },
              lineHeight: 1.7,
            }}
          >
            Everything you need to manage your school's book inventory efficiently and effectively
          </Typography>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          <Grid container spacing={3} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} lg={4} key={index} sx={{ display: 'flex' }}>
                <FeatureCard>
                  <Box sx={{
                    width: '4.5rem',
                    height: '4.5rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
                    border: '0.0625rem solid',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  }}>
                    <Box sx={{ 
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      '& svg': {
                        fontSize: '1.25rem',
                        background: 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textFillColor: 'transparent',
                      }
                    }}>
                      {feature.icon}
                    </Box>
                  </Box>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    sx={{ 
                      mb: 2, 
                      fontWeight: 700,
                      textAlign: 'center',
                      color: 'text.primary',
                      fontSize: '1.25rem',
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'text.secondary',
                      textAlign: 'center',
                      lineHeight: 1.7,
                      fontSize: '1rem',
                      maxWidth: '320px',
                      mx: 'auto',
                    }}
                  >
                    {feature.description}
                  </Typography>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Features;
