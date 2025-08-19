import React, { useContext } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Box, CssBaseline, Drawer, AppBar, Toolbar, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, Divider, Avatar, useTheme, Tooltip, Menu, MenuItem } from '@mui/material';
import BackgroundFX from '../ui/BackgroundFX';
import { MenuBook, School, Class, ListAlt, Link as LinkIcon, Logout, Home, ShoppingCart } from '@mui/icons-material';
import { AuthContext } from '../../../shared/contexts/AuthContext';
import { useLoading } from '../../../shared/contexts/LoadingContext';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

const drawerWidth = 220;

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


export default function MainLayout({ children }) {
  const location = useLocation();
  const theme = useTheme();
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { loading } = useLoading();
  const [avatarMenuAnchor, setAvatarMenuAnchor] = React.useState(null);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: theme.palette.background.default }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, background: theme.palette.primary.main, color: theme.palette.primary.contrastText }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, color: 'inherit' }}>
            Bookstore Management
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <IconButton onClick={e => setAvatarMenuAnchor(e.currentTarget)} size="small">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ bgcolor: theme.palette.primary.light, width: 40, height: 40, fontWeight: 700, fontSize: 22, cursor: 'pointer' }}>
                  {user?.firstName ? user.firstName.charAt(0) : user?.email?.charAt(0)?.toUpperCase()}
                </Avatar>
                {user?.roles?.includes('ROLE_SUPER_ADMIN') && (
                  <Box sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main} 20%, ${theme.palette.success.main} 100%)`,
                    color: (theme) => theme.palette.getContrastText(theme.palette.primary.main),
                    fontWeight: 700,
                    fontSize: 13,
                    letterSpacing: 1,
                    boxShadow: 1,
                    ml: 0.5
                  }}>
                    SUPER ADMIN
                  </Box>
                )}
              </Box>
            </IconButton>
            <Menu
              anchorEl={avatarMenuAnchor}
              open={Boolean(avatarMenuAnchor)}
              onClose={() => setAvatarMenuAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={() => { setAvatarMenuAnchor(null); navigate('/profile'); }}>Profile</MenuItem>
              {user?.roles?.includes('ROLE_SUPER_ADMIN') && (
                <MenuItem onClick={() => { setAvatarMenuAnchor(null); navigate('/admins'); }}>Manage Admins</MenuItem>
              )}
              <MenuItem onClick={() => { setAvatarMenuAnchor(null); handleLogout(); }}>Logout</MenuItem>
            </Menu>
            <Tooltip title="Logout">
              <IconButton color="inherit" onClick={handleLogout}>
                <Logout />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: theme.palette.background.paper,
            color: theme.palette.text.primary
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
                <ListItemButton component={Link} to={link.to} selected={location.pathname === link.to}>
                  <ListItemIcon sx={{ color: 'inherit' }}>{link.icon}</ListItemIcon>
                  <ListItemText primary={link.label} primaryTypographyProps={{ color: 'inherit' }} />
                </ListItemButton>
              </ListItem>
            ))}
        </List>
      </Drawer>
      <BackgroundFX>
        <Box component="main" sx={{ flexGrow: 1, p: 3, ml: `${drawerWidth}px`, mt: 8 }}>
          {children ? children : <Outlet />}
        </Box>
      </BackgroundFX>
      <Backdrop sx={{ color: (theme) => theme.palette.text.primary, zIndex: (theme) => theme.zIndex.drawer + 999 }} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}
