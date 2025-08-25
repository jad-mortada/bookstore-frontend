/**
 * Navbar.js
 * Top navigation bar showing links based on the authenticated user's role.
 */
import React, { useContext, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../contexts/AuthContext";

/**
 * Displays app navigation.
 * - Admins see management links.
 * - Users see ordering/dashboard links.
 */
const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isAdmin = user?.roles?.includes("ROLE_ADMIN");
  const isUser = user?.roles?.includes("ROLE_USER");

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{
        backgroundColor: "rgba(255,255,255,0.6)",
        backdropFilter: "saturate(150%) blur(0.55vw)",
        borderBottom: "0.07vw solid rgba(15,23,42,0.06)",
        color: (theme) => theme.palette.text.primary,
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: "8vh", md: "6.5vh" },
          color: (t) => t.palette.text.primary,
          px: { xs: 1, sm: 2 },
          gap: 1,
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            minWidth: 0,
          }}
        >
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            noWrap
            sx={{
              fontWeight: 800,
              letterSpacing: "0.02em",
              color: "inherit",
              fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
              textOverflow: "ellipsis",
              overflow: "hidden",
              flexShrink: 1,
              minWidth: 0,
            }}
          >
            Bookstore Management
          </Typography>
          {isAdmin && (
            <Box
              component="span"
              sx={{
                ml: 1,
                px: 1,
                py: 0.25,
                bgcolor: "primary.main",
                color: "white",
                borderRadius: 1,
                fontSize: "0.65rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Admin
            </Box>
          )}
        </Box>
        {isMobile ? (
          <>
            <IconButton
              size="large"
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuOpen}
              sx={{ ml: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="mobile-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                style: {
                  width: "60vw",
                  maxWidth: "18.75rem",
                },
              }}
            >
              <MenuItem component={Link} to="/" onClick={handleMenuClose}>
                Home
              </MenuItem>
              {isAdmin && [
                <MenuItem
                  key="schools"
                  component={Link}
                  to="/schools"
                  onClick={handleMenuClose}
                >
                  Schools
                </MenuItem>,
                <MenuItem
                  key="classes"
                  component={Link}
                  to="/classes"
                  onClick={handleMenuClose}
                >
                  Classes
                </MenuItem>,
                <MenuItem
                  key="books"
                  component={Link}
                  to="/books"
                  onClick={handleMenuClose}
                >
                  Books
                </MenuItem>,
                <MenuItem
                  key="yearly-lists"
                  component={Link}
                  to="/yearly-lists"
                  onClick={handleMenuClose}
                >
                  Yearly Lists
                </MenuItem>,
                <MenuItem
                  key="link-books"
                  component={Link}
                  to="/list-books-link"
                  onClick={handleMenuClose}
                >
                  Link Books
                </MenuItem>,
              ]}
              {isUser && [
                <MenuItem
                  key="order"
                  component={Link}
                  to="/order"
                  onClick={handleMenuClose}
                >
                  Order
                </MenuItem>,
                <MenuItem
                  key="dashboard"
                  component={Link}
                  to="/dashboard"
                  onClick={handleMenuClose}
                >
                  Dashboard
                </MenuItem>,
              ]}
              {user ? (
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    handleLogout();
                  }}
                >
                  Logout
                </MenuItem>
              ) : (
                <>
                  <MenuItem
                    component={Link}
                    to="/login"
                    onClick={handleMenuClose}
                  >
                    Login
                  </MenuItem>
                  <MenuItem
                    component={Link}
                    to="/register"
                    onClick={handleMenuClose}
                  >
                    Sign Up
                  </MenuItem>
                </>
              )}
            </Menu>
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              color: "inherit",
              gap: 0.5,
            }}
          >
            <Button
              color="inherit"
              component={Link}
              to="/"
              size="small"
              sx={{
                color: "inherit",
                "&:hover": { backgroundColor: (t) => t.palette.action.hover },
                fontSize: "0.85rem",
                px: 1,
                minWidth: "auto",
              }}
            >
              Home
            </Button>
            {isAdmin &&
              [
                { to: "/schools", label: "Schools" },
                { to: "/classes", label: "Classes" },
                { to: "/books", label: "Books" },
                { to: "/yearly-lists", label: "Yearly Lists" },
                { to: "/list-books-link", label: "Link Books" },
              ].map((item) => (
                <Button
                  key={item.to}
                  color="inherit"
                  component={Link}
                  to={item.to}
                  size="small"
                  sx={{
                    color: "inherit",
                    "&:hover": {
                      backgroundColor: (t) => t.palette.action.hover,
                    },
                    fontSize: "0.85rem",
                    px: 1,
                    minWidth: "auto",
                    display: { xs: "none", md: "inline-flex" },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            {isUser &&
              [
                { to: "/order", label: "Order" },
                { to: "/dashboard", label: "Dashboard" },
              ].map((item) => (
                <Button
                  key={item.to}
                  color="inherit"
                  component={Link}
                  to={item.to}
                  size="small"
                  sx={{
                    color: "inherit",
                    "&:hover": {
                      backgroundColor: (t) => t.palette.action.hover,
                    },
                    fontSize: "0.85rem",
                    px: 1,
                    minWidth: "auto",
                    display: { xs: "none", md: "inline-flex" },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            {user ? (
              <IconButton
                color="inherit"
                onClick={handleLogout}
                size="small"
                sx={{
                  "&:hover": { backgroundColor: (t) => t.palette.action.hover },
                  p: 0.75,
                  ml: 0.5,
                }}
                aria-label="Logout"
                title="Logout"
              >
                <svg
                  width="1.25rem"
                  height="1.25rem"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17 16L21 12M21 12L17 8M21 12H9M13 16V17C13 17.7956 12.6839 18.5587 12.1213 19.1213C11.5587 19.6839 10.7956 20 10 20H6C5.20435 20 4.44129 19.6839 3.87868 19.1213C3.31607 18.5587 3 17.7956 3 17V7C3 6.20435 3.31607 5.44129 3.87868 4.87868C4.44129 4.31607 5.20435 4 6 4H10C10.7956 4 11.5587 4.31607 12.1213 4.87868C12.6839 5.44129 13 6.20435 13 7V8"
                    stroke="currentColor"
                    strokeWidth="0.125rem"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </IconButton>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/login"
                  size="small"
                  sx={{
                    color: "inherit",
                    "&:hover": {
                      backgroundColor: (t) => t.palette.action.hover,
                    },
                    fontSize: "0.85rem",
                    px: 1,
                    minWidth: "auto",
                  }}
                >
                  Login
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/register"
                  size="small"
                  sx={{
                    color: "inherit",
                    "&:hover": {
                      backgroundColor: (t) => t.palette.action.hover,
                    },
                    fontSize: "0.85rem",
                    px: 1,
                    minWidth: "auto",
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
