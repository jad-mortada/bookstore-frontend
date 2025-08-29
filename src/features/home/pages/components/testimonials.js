import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Avatar,
  Container,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";
import SectionHeader from "../../../../shared/components/ui/SectionHeader";

// Icons
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";

const StyledTestimonialCard = styled(motion.div)(({ theme }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(10px)",
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4, 3),
  height: "100%",
  display: "flex",
  flexDirection: "column",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
    borderColor: theme.palette.primary.main,
  },
}));

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "School Administrator",
    content:
      "This platform has revolutionized how we manage our school's book distribution. The interface is intuitive and the support team is exceptional!",
    icon: <SchoolIcon />,
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "University Student",
    content:
      "Finding and ordering my textbooks has never been easier. The delivery was fast and the books arrived in perfect condition. Highly recommended!",
    icon: <PersonIcon />,
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    role: "Professor",
    content:
      "As an educator, I appreciate how this system simplifies the process of getting course materials to my students. It saves us countless hours every semester.",
    icon: <LocalLibraryIcon />,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const Testimonials = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      component="section"
      sx={{ py: { xs: 8, md: 12 }, position: "relative" }}
    >
      <Container maxWidth="lg">
        <SectionHeader
          title="What Our Users Say"
          subtitle="Hear from educators, students, and administrators who use our platform"
          align="center"
          titleSx={{
            fontSize: { xs: "1.75rem", sm: "2.5rem" },
            mb: 2,
            background: "linear-gradient(90deg, #1e40af 0%, #3b82f6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          subtitleSx={{
            maxWidth: "700px",
            mx: "auto",
            color: "text.secondary",
            mb: 6,
          }}
        />

        <Box
          component={motion.div}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          sx={{
            display: "grid",
            gap: 4,
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            mt: 4,
          }}
        >
          {testimonials.map((testimonial) => (
            <StyledTestimonialCard key={testimonial.id} variants={itemVariants}>
              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  position: "relative",
                  zIndex: 1,
                  fontStyle: "italic",
                }}
              >
                {testimonial.content}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mt: "auto" }}>
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    width: 50,
                    height: 50,
                    mr: 2,
                  }}
                >
                  {testimonial.icon}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {testimonial.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {testimonial.role}
                  </Typography>
                </Box>
              </Box>
            </StyledTestimonialCard>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default Testimonials;
