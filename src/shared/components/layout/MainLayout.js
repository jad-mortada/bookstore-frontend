/**
 * MainLayout.js
 * App-wide shell with AppBar, Drawer navigation, and content outlet.
 * - Shows role-based nav links.
 * - Pulls user avatar via `profileService.getMe()` and listens to `avatar:updated` events.
 * - Wraps content with background effects and global loading backdrop.
 */
import React, { useContext, useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Avatar,
  useTheme,
  Tooltip,
  Menu,
  MenuItem,
  useMediaQuery,
} from "@mui/material";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import BackgroundFX from "../ui/BackgroundFX";
import {
  MenuBook,
  School,
  Class,
  ListAlt,
  Link as LinkIcon,
  Logout,
  Home,
  ShoppingCart,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { AuthContext } from "../../../shared/contexts/AuthContext";
import { useLoading } from "../../../shared/contexts/LoadingContext";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import profileService from "../../../api/profile.api";

// Using viewport width units for better responsiveness
const drawerWidth = { lg: "14rem", xl: "16rem" }; // Reduced from 17.5rem/20rem
// Mini (closed) drawer width on lg+ using rem
const miniDrawerWidth = "4rem"; // Reduced from 5rem

const navLinks = [
  { label: "Home", to: "/", icon: <Home /> },
  { label: "Schools", to: "/schools", icon: <School /> },
  { label: "Classes", to: "/classes", icon: <Class /> },
  { label: "Books", to: "/books", icon: <MenuBook /> },
  { label: "Yearly Lists", to: "/yearly-lists", icon: <ListAlt /> },
  { label: "List-Books Link", to: "/list-books-link", icon: <LinkIcon /> },
  { label: "Customer Orders", to: "/customer-orders", icon: <ShoppingCart /> },
  { label: "Draft Approvals", to: "/draft-approvals", icon: <ListAlt /> },
  { label: "My Orders", to: "/my-orders", icon: <ShoppingCart /> },
  { label: "Place Order", to: "/order", icon: <ShoppingCart /> },
];

/**
 * Main application layout.
 * @param {{ children?: React.ReactNode }} props
 */
export default function MainLayout({ children }) {
  const location = useLocation();
  const theme = useTheme();
  // Use temporary drawer on smaller screens, persistent on lg+
  const isAtLeastLg = useMediaQuery(theme.breakpoints.up("lg"));
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
    return () => {
      mounted = false;
    };
  }, [user]);

  // Live update header avatar when profile page uploads/removes photo
  useEffect(() => {
    const onAvatarUpdated = (e) => {
      const next = e?.detail?.avatarUrl || undefined;
      setAvatarUrl(next);
    };
    window.addEventListener("avatar:updated", onAvatarUpdated);
    return () => window.removeEventListener("avatar:updated", onAvatarUpdated);
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
    navigate("/");
  };

  // Avatar editing is handled within the Profile page only

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background: theme.palette.background.default,
      }}
    >
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(0.5rem)",
          color: theme.palette.text.primary,
          borderBottom: `0.0625rem solid ${theme.palette.divider}`,
          boxShadow: "0 0.0625rem 0.1875rem rgba(0,0,0,0.05)",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen((prev) => !prev)}
            sx={{ mr: { xs: 2, sm: 3 } }}
            aria-label="open navigation drawer"
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              color: "inherit",
              fontWeight: 700,
              letterSpacing: "0.03125rem",
              background: theme.palette.primary.main,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textFillColor: "transparent",
              backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              fontSize: { xs: "1.1rem", sm: "1.25rem" },
              mr: 1,
            }}
          >
            Bookstore
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.5, sm: 1.5 },
              mr: { xs: 0.5, sm: 2 },
            }}
          >
            {user?.roles?.includes("ROLE_SUPER_ADMIN") && (
              <Box>
                <Box
                  onClick={(e) => setAdminMenuAnchor(e.currentTarget)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    px: { xs: 1, sm: 1.5 },
                    py: { xs: 0.5, sm: 0.75 },
                    borderRadius: 2,
                    background: (theme) =>
                      `linear-gradient(90deg, ${theme.palette.primary.main} 20%, ${theme.palette.success.main} 100%)`,
                    color: (theme) =>
                      theme.palette.getContrastText(theme.palette.primary.main),
                    fontWeight: 700,
                    fontSize: { xs: "0.6rem", sm: "0.7rem", md: "0.8rem" },
                    letterSpacing: { xs: "0.05em", sm: "0.06em" },
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    "&:hover": {
                      opacity: 0.9,
                      transform: "translateY(-0.0625rem)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  ADMIN
                </Box>
                <Menu
                  anchorEl={adminMenuAnchor}
                  open={Boolean(adminMenuAnchor)}
                  onClose={() => setAdminMenuAnchor(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <MenuItem
                    onClick={() => {
                      setAdminMenuAnchor(null);
                      navigate("/admins");
                    }}
                  >
                    Manage Admins
                  </MenuItem>
                </Menu>
              </Box>
            )}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <IconButton
                onClick={(e) => setAvatarMenuAnchor(e.currentTarget)}
                size="small"
                sx={{ p: 0.5 }}
              >
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.light,
                    width: { xs: 32, sm: 40, md: 48 },
                    height: { xs: 32, sm: 40, md: 48 },
                    fontWeight: 600,
                    fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem" },
                    border: `0.125rem solid ${theme.palette.background.paper}`,
                    boxShadow: 1,
                  }}
                  src={avatarUrl || undefined}
                >
                  {!avatarUrl &&
                    (user?.firstName
                      ? user.firstName.charAt(0)
                      : user?.email?.charAt(0)?.toUpperCase())}
                </Avatar>
              </IconButton>
            </Box>
            <Menu
              anchorEl={avatarMenuAnchor}
              open={Boolean(avatarMenuAnchor)}
              onClose={() => setAvatarMenuAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: "11.25rem",
                  boxShadow: "0 0.25rem 1.25rem rgba(0,0,0,0.1)",
                  "& .MuiMenuItem-root": {
                    fontSize: "0.9rem",
                    py: 1.5,
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                    },
                  },
                },
              }}
            >
              <MenuItem
                onClick={() => {
                  setAvatarMenuAnchor(null);
                  navigate("/profile");
                }}
              >
                <Box
                  component="span"
                  sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                >
                  <Avatar
                    src={avatarUrl || undefined}
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: theme.palette.primary.light,
                    }}
                  >
                    {!avatarUrl &&
                      (user?.firstName
                        ? user.firstName.charAt(0)
                        : user?.email?.charAt(0)?.toUpperCase())}
                  </Avatar>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ lineHeight: 1.2, fontWeight: 600 }}
                    >
                      {user?.firstName || "Profile"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      View profile
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem
                onClick={() => {
                  setAvatarMenuAnchor(null);
                  handleLogout();
                }}
              >
                <Box
                  component="span"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    color: theme.palette.error.main,
                  }}
                >
                  <Logout fontSize="small" />
                  Logout
                </Box>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      {!isAtLeastLg ? (
        <SwipeableDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onOpen={() => setMobileOpen(true)}
          sx={{
            [`& .MuiDrawer-paper`]: {
              width: 300, // fixed width for mobile drawer
            },
          }}
        >
          <Toolbar />
          <Divider />
          <List>
            {navLinks
              .filter((link) => {
                const isAdmin =
                  user?.roles?.includes("ROLE_ADMIN") ||
                  user?.roles?.includes("ROLE_SUPER_ADMIN");
                const isUser = user?.roles?.includes("ROLE_USER");
                if (link.label === "Home") return true;
                if (
                  [
                    "Schools",
                    "Classes",
                    "Books",
                    "Yearly Lists",
                    "List-Books Link",
                    "Customer Orders",
                    "Draft Approvals",
                  ].includes(link.label)
                ) {
                  return isAdmin;
                }
                if (link.label === "My Orders") {
                  return isUser;
                }
                if (link.label === "Place Order") {
                  return isUser;
                }
                return true;
              })
              .map((link) => (
                <ListItem key={link.label} disablePadding>
                  <ListItemButton
                    component={Link}
                    to={link.to}
                    selected={location.pathname === link.to}
                    onClick={() => setMobileOpen(false)}
                  >
                    <ListItemIcon
                      sx={{ color: "inherit", mr: { xs: 2, sm: 2.5 } }}
                    >
                      {link.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={link.label}
                      slotProps={{ primary: { sx: { color: "inherit" } } }}
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
            width: {
              lg: mobileOpen ? drawerWidth.lg : miniDrawerWidth,
              xl: mobileOpen ? drawerWidth.xl : miniDrawerWidth,
            },
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: {
                lg: mobileOpen ? drawerWidth.lg : miniDrawerWidth,
                xl: mobileOpen ? drawerWidth.xl : miniDrawerWidth,
              },
              boxSizing: "border-box",
              background: theme.palette.background.paper,
              color: theme.palette.text.primary,
              overflowX: "hidden",
            },
          }}
        >
          <Toolbar />
          <Divider />
          <List>
            {navLinks
              .filter((link) => {
                const isAdmin =
                  user?.roles?.includes("ROLE_ADMIN") ||
                  user?.roles?.includes("ROLE_SUPER_ADMIN");
                const isUser = user?.roles?.includes("ROLE_USER");
                if (link.label === "Home") return true;
                if (
                  [
                    "Schools",
                    "Classes",
                    "Books",
                    "Yearly Lists",
                    "List-Books Link",
                    "Customer Orders",
                    "Draft Approvals",
                  ].includes(link.label)
                ) {
                  return isAdmin;
                }
                if (link.label === "My Orders") {
                  return isUser;
                }
                if (link.label === "Place Order") {
                  return isUser;
                }
                return true;
              })
              .map((link) => (
                <ListItem key={link.label} disablePadding>
                  <Tooltip
                    title={!mobileOpen ? link.label : ""}
                    placement="right"
                  >
                    <ListItemButton
                      component={Link}
                      to={link.to}
                      selected={location.pathname === link.to}
                      sx={{
                        justifyContent: mobileOpen ? "initial" : "center",
                        px: mobileOpen
                          ? { lg: "1.25rem", xl: "1.5625rem" }
                          : "0.9375rem",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: "inherit",
                          minWidth: 0,
                          mr: mobileOpen ? { lg: 2, xl: 2.5 } : 0,
                          justifyContent: "center",
                          "& .MuiSvgIcon-root": {
                            fontSize: { lg: "1.5rem", xl: "1.6rem" },
                          },
                        }}
                      >
                        {link.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={link.label}
                        slotProps={{ primary: { sx: { color: "inherit" } } }}
                        sx={{ display: mobileOpen ? "block" : "none" }}
                      />
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              ))}
          </List>
        </Drawer>
      )}
      <BackgroundFX>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: "0.5rem", sm: "1rem" }, // Using rem for padding
            // Responsive margins and widths
            // Remove left margin completely for desktop view
            ml: 0,
            // Adjust padding instead of margin for desktop view
            pl: {
              xs: 0,
              lg: mobileOpen ? "calc(1rem + 1vw)" : "calc(0.5rem + 0.5vw)",
              xl: mobileOpen ? "calc(1rem + 1vw)" : "calc(0.5rem + 0.5vw)",
            },
            width: "100%", // Let the padding handle the spacing
            mt: "4.375rem", // 3.5rem in rem
            maxWidth: "100%",
            boxSizing: "border-box",
            transition: (theme) =>
              theme.transitions.create(["margin", "width"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
          }}
        >
          {children ? children : <Outlet />}
        </Box>
      </BackgroundFX>
      <Backdrop
        sx={{
          color: (theme) => theme.palette.text.primary,
          zIndex: (theme) => theme.zIndex.drawer + 999,
        }}
        open={loading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}
