import {
  Box,
  Typography,
  Container,
  useTheme,
  useMediaQuery,
  Grid,
} from "@mui/material";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";
import SectionHeader from "../../../../shared/components/ui/SectionHeader";

// Icons
import SchoolIcon from "@mui/icons-material/School";
import BookIcon from "@mui/icons-material/MenuBook";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

const GlassCard = styled(motion.div)(({ theme }) => ({
  padding: theme.spacing(4, 3),
  height: '100%',
  borderRadius: theme.shape.borderRadius * 2,
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 'inherit',
    padding: '1px',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    pointerEvents: 'none',
  },
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.2)',
    '&::before': {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
    },
  },
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '20%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 24px',
  background: 'linear-gradient(135deg, rgba(58, 123, 213, 0.2) 0%, rgba(0, 210, 255, 0.2) 100%)',
  backdropFilter: 'blur(5px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: theme.palette.primary.main,
  fontSize: '2.5rem',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    padding: '1px',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.05))',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    pointerEvents: 'none',
  },
  '& svg': {
    width: '1.5em',
    height: '1.5em',
    filter: 'drop-shadow(0 4px 8px rgba(58, 123, 213, 0.3))',
    transition: 'transform 0.3s ease',
  },
  [GlassCard + ':hover &']: {
    '& svg': {
      transform: 'scale(1.15)',
    },
  },
}));

const features = [
  {
    icon: <SchoolIcon fontSize="large" />,
    title: "School Integration",
    description: "Seamlessly connect with your school and access required materials in one place.",
  },
  {
    icon: <BookIcon fontSize="large" />,
    title: "Extensive Catalog",
    description: "Find all your required textbooks and educational resources in our comprehensive catalog.",
  },
  {
    icon: <LocalShippingIcon fontSize="large" />,
    title: "Fast Delivery",
    description: "Get your books delivered quickly with our reliable shipping partners.",
  },
  {
    icon: <SupportAgentIcon fontSize="large" />,
    title: "24/7 Support",
    description: "Our dedicated support team is always here to help you with any questions.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const itemVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

const Features = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="lg">
        <SectionHeader
          title="Why Choose Us"
          subtitle="Experience the difference with our comprehensive book management solution"
          align="center"
          titleSx={{
            fontSize: { xs: "1.75rem", sm: "2.5rem" },
            mb: 2,
            background: "linear-gradient(90deg, #3a7bd5 0%, #00d2ff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
            letterSpacing: "-0.5px",
          }}
          subtitleSx={{
            maxWidth: "700px",
            mx: "auto",
            color: "text.secondary",
            mb: 6,
            fontSize: { xs: "1rem", sm: "1.1rem" },
            lineHeight: 1.7,
          }}
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <Grid container spacing={{ xs: 3, md: 4 }} justifyContent="center">
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div variants={itemVariants}>
                  <GlassCard>
                    <FeatureIcon>{feature.icon}</FeatureIcon>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography
                        variant="h6"
                        component="h3"
                        sx={{
                          fontWeight: 700,
                          mb: 2,
                          color: theme.palette.text.primary,
                          fontSize: '1.1rem',
                          lineHeight: 1.3,
                          minHeight: '3em',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: '0.95rem',
                          lineHeight: 1.7,
                          opacity: 0.9,
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </Box>
                  </GlassCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Features;


