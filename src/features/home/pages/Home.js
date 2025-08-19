import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, CardActionArea, CardContent, Badge, Divider } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ClassIcon from '@mui/icons-material/Class';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { Link } from 'react-router-dom';
import AppFooter from '../../../shared/components/layout/AppFooter';
import tempOrderService from '../../../api/tempOrders.api';
import BackgroundFX from '../../../shared/components/ui/BackgroundFX';
import GlassCard from '../../../shared/components/ui/GlassCard';
import SectionHeader from '../../../shared/components/ui/SectionHeader';

const managementLinks = [
  { to: '/schools', label: 'Schools', icon: <SchoolIcon fontSize="large" sx={{ color: 'primary.main' }} /> },
  { to: '/classes', label: 'Classes', icon: <ClassIcon fontSize="large" sx={{ color: 'primary.main' }} /> },
  { to: '/books', label: 'Books', icon: <MenuBookIcon fontSize="large" sx={{ color: 'primary.main' }} /> },
  { to: '/yearly-lists', label: 'Yearly Book Lists', icon: <MenuBookIcon fontSize="large" sx={{ color: 'primary.main' }} /> },
  { to: '/list-books-link', label: 'Link Books', icon: <MenuBookIcon fontSize="large" sx={{ color: 'primary.main' }} /> },
];

const operationLinksBase = [
  { to: '/customer-orders', label: 'Customer Orders', key: 'orders', icon: <ShoppingCartIcon fontSize="large" sx={{ color: 'primary.main' }} /> },
  { to: '/draft-approvals', label: 'Draft Approvals', key: 'drafts', icon: <ListAltIcon fontSize="large" sx={{ color: 'primary.main' }} /> },
];

const Home = () => {
  const [submittedDraftsCount, setSubmittedDraftsCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await tempOrderService.listSubmitted();
        if (mounted) setSubmittedDraftsCount(Array.isArray(res?.data) ? res.data.length : 0);
      } catch (e) {
        if (mounted) setSubmittedDraftsCount(0);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const operationLinks = operationLinksBase.map(l => {
    if (l.key === 'drafts') {
      return { ...l, badge: submittedDraftsCount };
    }
    return l;
  });

  return (
  <BackgroundFX>
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        pb: 0,
      }}
    >
    <GlassCard elevation={8} sx={{ borderRadius: 6, maxWidth: 1200, mx: 'auto', mt: { xs: 3, sm: 5 }, px: { xs: 1.5, sm: 3, md: 5 }, py: { xs: 3, md: 3.5 }, width: '100%', border: '1px solid rgba(15,23,42,0.08)' }}>
      <SectionHeader
        title="Bookstore Management"
        subtitle="Effortlessly manage schools, classes, books, yearly lists, drafts, and customer orders."
      />
      <CardContent>
        {/* Operations section */}
        <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1, ml: 0.5 }}>Operations</Typography>
        <Grid container spacing={2.5} sx={{ mt: 0.5, mb: 2 }}>
          {operationLinks.map(link => (
            <Grid key={link.to} item xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
              <GlassCard elevation={3} sx={{ borderRadius: 4, width: '100%', transition: 'transform 0.18s, box-shadow 0.18s', '&:hover': { transform: 'translateY(-6px)', boxShadow: 10 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 150, border: '1px solid rgba(15,23,42,0.08)' }}>
                <CardActionArea
                  component={Link}
                  to={link.to}
                  sx={{ height: '100%', borderRadius: 4 }}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      py: 3,
                    }}
                  >
                    {link.badge ? (
                      <Badge badgeContent={link.badge} color="error" overlap="circular">
                        {link.icon}
                      </Badge>
                    ) : (
                      link.icon
                    )}
                    <Typography variant="h6" sx={{ mt: 2, fontWeight: 700, color: 'primary.dark', textAlign: 'center' }}>
                      {link.label}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </GlassCard>
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ my: 1 }} />
        {/* Management section */}
        <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1, ml: 0.5 }}>Management</Typography>
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          {managementLinks.map(link => (
            <Grid key={link.to} item xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
              <GlassCard elevation={3} sx={{ borderRadius: 4, width: '100%', transition: 'transform 0.18s, box-shadow 0.18s', '&:hover': { transform: 'translateY(-6px)', boxShadow: 10 }, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: 150, border: '1px solid rgba(15,23,42,0.08)' }}>
                <CardActionArea
                  component={Link}
                  to={link.to}
                  sx={{ height: '100%', borderRadius: 4 }}
                >
                  <CardContent
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      py: 3,
                    }}
                  >
                    {link.icon}
                    <Typography variant="h6" sx={{ mt: 2, fontWeight: 700, color: 'primary.dark', textAlign: 'center' }}>
                      {link.label}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </GlassCard>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </GlassCard>
    {/* Footer */}
    <AppFooter />
  </Box>
  </BackgroundFX>
  );
};

export default Home;