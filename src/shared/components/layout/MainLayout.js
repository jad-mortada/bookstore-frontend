/**
 * MainLayout.js
 * App-wide shell with AppBar, Drawer navigation, and content outlet.
 * - Shows role-based nav links.
 * - Pulls user avatar via `profileService.getMe()` and listens to `avatar:updated` events.
 * - Wraps content with background effects and global loading backdrop.
 */
import React, { useContext, useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Box, CssBaseline, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Divider, Avatar, useTheme, Tooltip, Menu, MenuItem, useMediaQuery } from '@mui/material';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import BackgroundFX from '../ui/BackgroundFX';
import { MenuBook, School, Class, ListAlt, Link as LinkIcon, Logout, Home, ShoppingCart, Menu as MenuIcon } from '@mui/icons-material';
import { AuthContext } from '../../../shared/contexts/AuthContext';
import { useLoading } from '../../../shared/contexts/LoadingContext';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import profileService from '../../../api/profile.api';

const drawerWidth = '19.5vw';
// Mini (closed) drawer width on lg+; keeps icons visible (viewport units only)
const miniDrawerWidth = '5vw';

const navLinks = [
  { label: 'Home', to: '/', icon: <Home /> },
  { label: 'Schools', to: '/schools', icon: <School /> },
  { label: 'Classes', to: '/classes', icon: <Class /> },
  { label: 'Books', to: '/books', icon: <MenuBook /> },
  { label: 'Yearly Lists', to: '/yearly-lists', icon: <ListAlt /> },
  { label: 'List-Books Link', to: '/list-books-link', icon: <LinkIcon /> },
  { label: 'Customer Orders', to: '/customer-orders', icon: <ShoppingCart /> },
  { label: 'Draft Approvals', to: '/draft-approvals', icon: <ListAlt /> },
  { label: 'My Orders', to: '/my-orders', icon: <ShoppingCart /> },
  { label: 'Place Order', to: '/order', icon: <ShoppingCart /> },
];


/**
 * Main application layout.
 * @param {{ children?: React.ReactNode }} props
 */
export default function MainLayout({ children }) {
  const location = useLocation();
  const theme = useTheme();
  // Use temporary drawer on smaller screens, persistent on lg+
  const isAtLeastLg = useMediaQuery(theme.breakpoints.up('lg'));
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { loading } = useLoading();
  const [avatarMenuAnchor, setAvatarMenuAnchor] = React.useState(null);
  const [avatarUrl, setAvatarUrl] = useState();
  const [adminMenuAnchor, setAdminMenuAnchor] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        // Only fetch if logged in
        if (user) {
          const me = await profileService.getMe();
          if (mounted) setAvatarUrl(me?.avatarUrl);
        }
      } catch {
        // ignore
      }
    };
    load();
    return () => { mounted = false; };
  }, [user]);

  // Live update header avatar when profile page uploads/removes photo
  useEffect(() => {
    const onAvatarUpdated = (e) => {
      const next = e?.detail?.avatarUrl || undefined;
      setAvatarUrl(next);
    };
    window.addEventListener('avatar:updated', onAvatarUpdated);
    return () => window.removeEventListener('avatar:updated', onAvatarUpdated);
  }, []);

  // Auto-close the temporary drawer when navigating to a new route (only on smaller screens)
  useEffect(() => {
    if (!isAtLeastLg) setMobileOpen(false);
  }, [location.pathname, isAtLeastLg]);

  // Ensure sensible defaults when crossing breakpoints
  useEffect(() => {
    // On lg+ default to open (persistent drawer)
    if (isAtLeastLg) setMobileOpen(true);
    // On below lg leave it closed by default; open is controlled by toggle
  }, [isAtLeastLg]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Avatar editing is handled within the Profile page only

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: theme.palette.background.default }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, background: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(prev => !prev)}
            sx={{ mr: '2vw' }}
            aria-label="open navigation drawer"
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'inherit' }}>
            Bookstore Management
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={e => setAvatarMenuAnchor(e.currentTarget)} size="small">
                <Avatar
                  sx={{ bgcolor: theme.palette.primary.light, width: { xs: '8vw', md: '2.8vw' }, height: { xs: '8vw', md: '2.8vw' }, fontWeight: 700, fontSize: { xs: '4vw', md: '1.5vw' }, cursor: 'pointer' }}
                  src={avatarUrl || undefined}
                >
                  {!avatarUrl && (user?.firstName ? user.firstName.charAt(0) : user?.email?.charAt(0)?.toUpperCase())}
                </Avatar>
              </IconButton>
              {user?.roles?.includes('ROLE_SUPER_ADMIN') && (
                <IconButton size="small" sx={{ p: 0 }} onClick={(e) => setAdminMenuAnchor(e.currentTarget)}>
                  <Box sx={{
                    px: '1.2vw',
                    py: '0.5vh',
                    borderRadius: '0.9vw',
                    background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main} 20%, ${theme.palette.success.main} 100%)`,
                    color: (theme) => theme.palette.getContrastText(theme.palette.primary.main),
                    fontWeight: 700,
                    fontSize: { xs: '2.8vw', md: '0.9vw' },
                    letterSpacing: { xs: '0.2vw', md: '0.1vw' },
                    boxShadow: 1,
                    ml: { xs: '1vw', md: '0.5vw' }
                  }}>
                    SUPER ADMIN
                  </Box>
                </IconButton>
              )}
            </Box>
            <Menu
              anchorEl={avatarMenuAnchor}
              open={Boolean(avatarMenuAnchor)}
              onClose={() => setAvatarMenuAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={() => { setAvatarMenuAnchor(null); navigate('/profile'); }}>Profile</MenuItem>
              <MenuItem onClick={() => { setAvatarMenuAnchor(null); handleLogout(); }}>Logout</MenuItem>
            </Menu>
            <Menu
              anchorEl={adminMenuAnchor}
              open={Boolean(adminMenuAnchor)}
              onClose={() => setAdminMenuAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={() => { setAdminMenuAnchor(null); navigate('/admins'); }}>Manage Admins</MenuItem>
            </Menu>
            <Tooltip title="Logout">
              <IconButton color="inherit" onClick={handleLogout}>
                <Logout />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      {(!isAtLeastLg ? (
        <SwipeableDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onOpen={() => setMobileOpen(true)}
          sx={{
            [`& .MuiDrawer-paper`]: {
              width: '56vw', // make it a little wider on phones; uses viewport units
            }
          }}
        >
          <Toolbar />
          <Divider />
          <List>
            {navLinks
              .filter(link => {
                const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_SUPER_ADMIN');
                const isUser = user?.roles?.includes('ROLE_USER');
                if (link.label === 'Home') return true;
                if (['Schools','Classes','Books','Yearly Lists','List-Books Link','Customer Orders','Draft Approvals'].includes(link.label)) {
                  return isAdmin;
                }
                if (link.label === 'My Orders') {
                  return isUser;
                }
                if (link.label === 'Place Order') {
                  return isUser;
                }
                return true;
              })
              .map(link => (
                <ListItem key={link.label} disablePadding>
                  <ListItemButton component={Link} to={link.to} selected={location.pathname === link.to} onClick={() => setMobileOpen(false)}>
                    <ListItemIcon sx={{ color: 'inherit', mr: '2vw' }}>{link.icon}</ListItemIcon>
                    <ListItemText
                      primary={link.label}
                      slotProps={{ primary: { sx: { color: 'inherit' } } }}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
        </SwipeableDrawer>
      ) : (
        <Drawer
          variant="persistent"
          open={isAtLeastLg ? true : mobileOpen}
          sx={{
            width: { lg: mobileOpen ? drawerWidth : miniDrawerWidth },
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: mobileOpen ? drawerWidth : miniDrawerWidth,
              boxSizing: 'border-box',
              background: theme.palette.background.paper,
              color: theme.palette.text.primary,
              overflowX: 'hidden',
            }
          }}
        >
          <Toolbar />
          <Divider />
          <List>
            {navLinks
              .filter(link => {
                const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_SUPER_ADMIN');
                const isUser = user?.roles?.includes('ROLE_USER');
                if (link.label === 'Home') return true;
                if (['Schools','Classes','Books','Yearly Lists','List-Books Link','Customer Orders','Draft Approvals'].includes(link.label)) {
                  return isAdmin;
                }
                if (link.label === 'My Orders') {
                  return isUser;
                }
                if (link.label === 'Place Order') {
                  return isUser;
                }
                return true;
              })
              .map(link => (
                <ListItem key={link.label} disablePadding>
                  <Tooltip title={!mobileOpen ? link.label : ''} placement="right">
                    <ListItemButton
                      component={Link}
                      to={link.to}
                      selected={location.pathname === link.to}
                      sx={{
                        justifyContent: mobileOpen ? 'initial' : 'center',
                        px: mobileOpen ? '1.2vw' : '0.6vw',
                      }}
                    >
                      <ListItemIcon sx={{
                        color: 'inherit',
                        minWidth: 0,
                        mr: mobileOpen ? '1.2vw' : 0,
                        justifyContent: 'center',
                        '& .MuiSvgIcon-root': { fontSize: '2vw' }
                      }}>
                        {link.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={link.label}
                        slotProps={{ primary: { sx: { color: 'inherit' } } }}
                        sx={{ display: mobileOpen ? 'block' : 'none' }}
                      />
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              ))}
          </List>
        </Drawer>
      ))}
      <BackgroundFX>
      <Box component="main" sx={{
        flexGrow: 1,
        pr: { xs: '0.5vw', lg: '0.4vw' },
        pt: { xs: '2vh', lg: '2vh' },
        pb: { xs: '2vh', lg: '2vh' },
        pl: 0,
        // Reduce the gap by contentOffset on lg+
        ml: {
          xs: 0,
          lg: mobileOpen
            ? `calc(${drawerWidth} - 17vw)`         
            : `calc(${miniDrawerWidth} - 3vw)`     
        },
        width: {
          xs: '100%',
          lg: mobileOpen
            ? `calc(100% - calc(${drawerWidth} - 17vw))`
            : `calc(100% - calc(${miniDrawerWidth} - 1vw))`
        },
        mt: '8vh'
}}>
          {children ? children : <Outlet />}
        </Box>
      </BackgroundFX>
      <Backdrop sx={{ color: (theme) => theme.palette.text.primary, zIndex: (theme) => theme.zIndex.drawer + 999 }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}
