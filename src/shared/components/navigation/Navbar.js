/**
 * Navbar.js
 * Top navigation bar showing links based on the authenticated user's role.
 */
import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../contexts/AuthContext';


/**
 * Displays app navigation.
 * - Admins see management links.
 * - Users see ordering/dashboard links.
 */
const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
 

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.roles?.includes('ROLE_ADMIN');
  const isUser = user?.roles?.includes('ROLE_USER');

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{
        backgroundColor: 'rgba(255,255,255,0.6)',
        backdropFilter: 'saturate(150%) blur(0.55vw)',
        borderBottom: '0.07vw solid rgba(15,23,42,0.06)',
        color: (theme) => theme.palette.text.primary,
      }}
    >
      <Toolbar sx={{ minHeight: { xs: '8vh', md: '6.5vh' }, color: (t) => t.palette.text.primary }}>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800, letterSpacing: '0.02em', color: 'inherit' }}>
          Bookstore Management
        </Typography>
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
            <Button color="inherit" component={Link} to="/" sx={{ mr: 0.5, color: 'inherit', '&:hover': { backgroundColor: (t) => t.palette.action.hover } }}>Home</Button>
            {isAdmin && (
              <>
                <Button color="inherit" component={Link} to="/schools" sx={{ color: 'inherit', '&:hover': { backgroundColor: (t) => t.palette.action.hover } }}>Schools</Button>
                <Button color="inherit" component={Link} to="/classes" sx={{ color: 'inherit', '&:hover': { backgroundColor: (t) => t.palette.action.hover } }}>Classes</Button>
                <Button color="inherit" component={Link} to="/books" sx={{ color: 'inherit', '&:hover': { backgroundColor: (t) => t.palette.action.hover } }}>Books</Button>
                <Button color="inherit" component={Link} to="/yearly-lists" sx={{ color: 'inherit', '&:hover': { backgroundColor: (t) => t.palette.action.hover } }}>Yearly Book Lists</Button>
                <Button color="inherit" component={Link} to="/list-books-link" sx={{ color: 'inherit', '&:hover': { backgroundColor: (t) => t.palette.action.hover } }}>Link Books</Button>
              </>
            )}
            {isUser && (
              <>
                <Button color="inherit" component={Link} to="/order" sx={{ color: 'inherit', '&:hover': { backgroundColor: (t) => t.palette.action.hover } }}>Order</Button>
                <Button color="inherit" component={Link} to="/dashboard" sx={{ color: 'inherit', '&:hover': { backgroundColor: (t) => t.palette.action.hover } }}>Dashboard</Button>
              </>
            )}
            <Button color="inherit" onClick={handleLogout} sx={{ color: 'inherit', '&:hover': { backgroundColor: (t) => t.palette.action.hover } }}>Logout</Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'inherit' }}>
            <Button color="inherit" component={Link} to="/login" sx={{ color: 'inherit', '&:hover': { backgroundColor: (t) => t.palette.action.hover } }}>Login</Button>
            <Button color="inherit" component={Link} to="/register" sx={{ color: 'inherit', '&:hover': { backgroundColor: (t) => t.palette.action.hover } }}>Sign Up</Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;