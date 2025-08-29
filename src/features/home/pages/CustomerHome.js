import React from "react";
import {
  Box,
  Typography,
  Grid,
  CardActionArea,
  CardContent,
  Tooltip,
  useMediaQuery,
  useTheme,
  Container,
} from "@mui/material";
import ShoppingCartRounded from "@mui/icons-material/ShoppingCartRounded";
import ListAltRounded from "@mui/icons-material/ListAltRounded";
import { Link } from "react-router-dom";
import AppFooter from "../../../shared/components/layout/AppFooter";
import BackgroundFX from "../../../shared/components/ui/BackgroundFX";
import GlassCard from "../../../shared/components/ui/GlassCard";
import SectionHeader from "../../../shared/components/ui/SectionHeader";

const links = [
  {
    to: "/order",
    label: "Place an Order",
    icon: <ShoppingCartRounded sx={{ color: "secondary.main" }} />,
    description: "Start a new book order for your class",
  },
  {
    to: "/my-orders",
    label: "My Orders",
    icon: <ListAltRounded sx={{ color: "secondary.main" }} />,
    description: "View and track your existing orders",
  },
];

const CustomerHome = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  return (
    <BackgroundFX>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "transparent",
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            flex: "1 0 auto",
            py: { xs: 3, sm: 4 },
            px: { xs: 2, sm: 3 },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <GlassCard
            elevation={8}
            sx={{
              borderRadius: { xs: 3, sm: 4, md: 5 },
              maxWidth: { xs: "100%", md: "80rem" },
              width: "100%",
              mx: "auto",
              my: "auto",
              p: { xs: 2, sm: 3, md: 4 },
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
            }}
          >
            <SectionHeader
              title="Welcome to Your Bookstore"
              subtitle="Easily manage your book orders and track their status"
              align="center"
              sx={{ mb: { xs: 2, sm: 3 } }}
            />

            <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
              <Grid
                container
                spacing={{ xs: 2, sm: 3, md: 4 }}
                sx={{
                  justifyContent: "center",
                  "& > .MuiGrid-item": {
                    display: "flex",
                    justifyContent: "center",
                    maxWidth: { xs: "100%", sm: "50%", md: "33.333%" },
                    flexBasis: { xs: "100%", sm: "50%", md: "33.333%" },
                  },
                }}
              >
                {links.map((link) => (
                  <Grid item key={link.to} xs={12} sm={6} md={4}>
                    <Tooltip
                      title={link.description}
                      placement={isMobile ? "top" : "right"}
                      arrow
                      disableHoverListener={isMobile}
                    >
                      <Box sx={{ height: "100%", width: "100%" }}>
                        <GlassCard
                          elevation={3}
                          sx={{
                            height: "100%",
                            borderRadius: 3,
                            transition: "all 0.2s ease-in-out",
                            border: "1px solid",
                            borderColor: "divider",
                            "&:hover": {
                              transform: "translateY(-4px)",
                              boxShadow: 6,
                              borderColor: "primary.light",
                            },
                          }}
                        >
                          <CardActionArea
                            component={Link}
                            to={link.to}
                            aria-label={link.label}
                            sx={{
                              height: "100%",
                              p: { xs: 2, sm: 3 },
                              "&:hover": {
                                "& .MuiSvgIcon-root": {
                                  transform: "scale(1.1)",
                                },
                              },
                            }}
                          >
                            <CardContent
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                textAlign: "center",
                                p: "0 !important",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: 72,
                                  height: 72,
                                  mb: 2,
                                  borderRadius: "50%",
                                  bgcolor: "rgba(25, 118, 210, 0.08)",
                                  transition: "transform 0.3s ease-in-out",
                                  "& .MuiSvgIcon-root": {
                                    fontSize: "2.5rem",
                                    transition: "transform 0.3s ease-in-out",
                                  },
                                }}
                              >
                                {React.cloneElement(link.icon, {
                                  fontSize: isMobile ? "medium" : "large",
                                  sx: {
                                    color: "primary.main",
                                    transition: "transform 0.3s ease-in-out",
                                  },
                                })}
                              </Box>
                              <Typography
                                variant={isMobile ? "subtitle1" : "h6"}
                                component="h3"
                                sx={{
                                  fontWeight: 600,
                                  mb: 0.5,
                                  color: "text.primary",
                                }}
                              >
                                {link.label}
                              </Typography>
                              {!isMobile && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    mt: 0.5,
                                    fontSize: { xs: "0.8rem", sm: "0.875rem" },
                                    lineHeight: 1.4,
                                  }}
                                >
                                  {link.description}
                                </Typography>
                              )}
                            </CardContent>
                          </CardActionArea>
                        </GlassCard>
                      </Box>
                    </Tooltip>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </GlassCard>
        </Container>
        <AppFooter />
      </Box>
    </BackgroundFX>
  );
};

export default CustomerHome;
