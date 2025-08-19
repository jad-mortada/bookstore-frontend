import React from 'react';
import { Box, Typography, Grid, CardActionArea, CardContent, Tooltip } from '@mui/material';
import ShoppingCartRounded from '@mui/icons-material/ShoppingCartRounded';
import ListAltRounded from '@mui/icons-material/ListAltRounded';
import { Link } from 'react-router-dom';
import AppFooter from '../../../shared/components/layout/AppFooter';
import BackgroundFX from '../../../shared/components/ui/BackgroundFX';
import GlassCard from '../../../shared/components/ui/GlassCard';
import SectionHeader from '../../../shared/components/ui/SectionHeader';

const links = [
  { to: '/order', label: 'Place an Order', icon: <ShoppingCartRounded fontSize="large" sx={{ color: 'secondary.main' }} /> },
  { to: '/my-orders', label: 'My Orders', icon: <ListAltRounded fontSize="large" sx={{ color: 'secondary.main' }} /> },
];

const CustomerHome = () => (
  <BackgroundFX>
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
      }}
    >
    <GlassCard elevation={8} sx={{ borderRadius: 6, maxWidth: 1040, mx: 'auto', mt: { xs: 5, sm: 7 }, px: { xs: 2, sm: 4, md: 7 }, py: { xs: 4, md: 5 }, width: '100%', border: '1px solid rgba(15,23,42,0.08)' }}>
      <SectionHeader
        title="Welcome to Your Bookstore"
        subtitle="Place a new order or review your existing orders."
      />
      <CardContent>
        <Grid container spacing={4.5} sx={{ mt: 2 }}>
          {links.map(link => (
            <Grid key={link.to} item xs={12} sm={6} md={4} sx={{ display: 'flex' }}>
              <GlassCard elevation={3} sx={{ borderRadius: 4, width: '100%', transition: 'transform 0.18s, box-shadow 0.18s', '&:hover': { transform: 'translateY(-7px) scale(1.045)', boxShadow: 8 }, minHeight: 190, border: '1px solid rgba(15,23,42,0.08)' }}>
                <Tooltip title={link.label} placement="top">
                  <CardActionArea component={Link} to={link.to} aria-label={link.label} sx={{ height: '100%', borderRadius: 4 }}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5.5 }}>
                      {link.icon}
                      <Typography variant="h6" sx={{ mt: 2, fontWeight: 700, color: 'primary.dark' }}>
                        {link.label}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Tooltip>
              </GlassCard>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </GlassCard>
    <AppFooter />
  </Box>
  </BackgroundFX>
);

export default CustomerHome;
