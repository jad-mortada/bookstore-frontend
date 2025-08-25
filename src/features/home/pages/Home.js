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
        <GlassCard elevation={8} sx={{ 
          borderRadius: { xs: 4, sm: 5, md: 6 }, 
          maxWidth: { xs: '95%', sm: '95%', md: '75rem', lg: '87.5rem' }, 
          mx: 'auto', 
          mt: { xs: 4, sm: 3, md: 5 }, 
          mb: { xs: 1, sm: 3, md: 5 },
          px: { xs: 1.5, sm: 3, md: 4, lg: 5 }, 
          py: { xs: 1.5, sm: 3, md: 3.5 }, 
          width: '100%', 
          border: '0.0625rem solid rgba(15,23,42,0.08)' 
        }}>
          <SectionHeader
            title="Bookstore Management"
            subtitle="Effortlessly manage schools, classes, books, yearly lists, drafts, and customer orders."
          />
          <CardContent>
            {/* Operations section */}
            <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1, ml: 0.5 }}>Operations</Typography>
            <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mt: 0.5, mb: 2 }}>
              {operationLinks.map(link => (
                <Grid key={link.to} item xs={6} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
                  <GlassCard elevation={3} sx={{ 
                    borderRadius: { xs: 2.5, sm: 4 }, 
                    width: '100%', 
                    transition: 'transform 0.18s, box-shadow 0.18s', 
                    '&:hover': { transform: 'translateY(-0.375rem)', boxShadow: 10 }, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: { xs: '6.25rem', sm: '8.125rem', md: '9.375rem' },
                    p: { xs: 1, sm: 2 },
                    border: '0.0625rem solid rgba(15,23,42,0.08)' 
                  }}>
                    <CardActionArea
                      component={Link}
                      to={link.to}
                      sx={{ height: '100%', borderRadius: { xs: 3, sm: 4 } }}
                    >
                      <CardContent
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          py: { xs: 2, sm: 2.5, md: 3 },
                        }}
                      >
                        {link.badge ? (
                          <Badge badgeContent={link.badge} color="error" overlap="circular">
                            {link.icon}
                          </Badge>
                        ) : (
                          link.icon
                        )}
                        <Typography variant={window.innerWidth < 600 ? 'subtitle1' : 'h6'} sx={{ 
                          mt: { xs: 1, sm: 1.5 }, 
                          fontWeight: 700, 
                          color: 'primary.dark', 
                          textAlign: 'center',
                          fontSize: { xs: '0.875rem', sm: '1rem' } 
                        }}>
                          {link.label}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </GlassCard>
                </Grid>
              ))}
            </Grid>
            <Divider sx={{ my: { xs: 0.5, sm: 1 } }} />
            {/* Management section */}
            <Typography variant="overline" sx={{ 
              color: 'text.secondary', 
              letterSpacing: 1, 
              ml: 0.5, 
              fontSize: { xs: '0.7rem', sm: '0.75rem' } 
            }}>
              Management
            </Typography>
            <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ mt: 0.5 }}>
              {managementLinks.map(link => (
                <Grid key={link.to} item xs={6} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
                  <GlassCard elevation={3} sx={{ 
                    borderRadius: { xs: 2.5, sm: 4 }, 
                    width: '100%', 
                    transition: 'transform 0.18s, box-shadow 0.18s', 
                    '&:hover': { transform: 'translateY(-0.375rem)', boxShadow: 10 }, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: { xs: '6.25rem', sm: '8.125rem', md: '9.375rem' },
                    p: { xs: 1, sm: 2 },
                    border: '0.0625rem solid rgba(15,23,42,0.08)' 
                  }}>
                    <CardActionArea
                      component={Link}
                      to={link.to}
                      sx={{ height: '100%', borderRadius: { xs: 3, sm: 4 } }}
                    >
                      <CardContent
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          py: { xs: 2, sm: 2.5, md: 3 },
                        }}
                      >
                        {link.icon}
                        <Typography variant={window.innerWidth < 600 ? 'subtitle1' : 'h6'} sx={{ 
                          mt: { xs: 1, sm: 1.5 }, 
                          fontWeight: 700, 
                          color: 'primary.dark', 
                          textAlign: 'center',
                          fontSize: { xs: '0.875rem', sm: '1rem' } 
                        }}>
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
        <Box sx={{ width: '100%', mt: { xs: 2, sm: 'auto' } }}>
          <AppFooter />
        </Box>
      </Box>
    </BackgroundFX>
  );
};

export default Home;