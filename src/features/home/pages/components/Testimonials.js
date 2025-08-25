import React from 'react';
import { Box, Typography, Avatar, useTheme, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { Star } from '@mui/icons-material';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'School Librarian',
    avatar: 'SJ',
    content: 'This platform has completely transformed how we manage our school library. The interface is intuitive and the features are exactly what we needed.',
    rating: 5
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'IT Administrator',
    avatar: 'MC',
    content: 'Implementation was seamless and the support team was incredibly helpful. Our teachers love the new system!',
    rating: 5
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'School Principal',
    avatar: 'ER',
    content: 'The analytics dashboard provides valuable insights into our book circulation. Highly recommended for any educational institution.',
    rating: 4
  }
];

const TestimonialCard = styled(motion.div)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(0.625rem)',
  borderRadius: '1rem',
  padding: theme.spacing(4),
  height: '100%',
  border: `${theme.spacing(0.25)} solid rgba(255, 255, 255, 0.1)`,
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: `translateY(-${theme.spacing(1.25)})`,
    boxShadow: `0 ${theme.spacing(2.5)} ${theme.spacing(7.5)} rgba(0, 0, 0, 0.1)`,
    borderColor: theme.palette.primary.main,
  },
}));

const Rating = ({ value }) => {
  return (
    <Box sx={{ display: 'flex', mb: 2 }}>
      {[...Array(5)].map((_, index) => (
        <Star 
          key={index} 
          sx={{ 
            color: index < value ? 'gold' : 'rgba(255, 255, 255, 0.2)',
            fontSize: '1.25rem',
          }} 
        />
      ))}
    </Box>
  );
};

const Testimonials = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    },
  };

  return (
    <Box sx={{ 
      py: { xs: 6, md: 10 },
      px: { xs: 2, sm: 4, md: 8 },
      backgroundColor: 'rgba(15, 23, 42, 0.3)',
      backdropFilter: 'blur(0.625rem)',
      borderTop: '0.0625rem solid rgba(255, 255, 255, 0.05)',
      borderBottom: '0.0625rem solid rgba(255, 255, 255, 0.05)',
    }}>
      <Box sx={{ maxWidth: '75rem', mx: 'auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <Typography 
            variant="h4" 
            component="h2" 
            sx={{ 
              textAlign: 'center', 
              mb: 2,
              fontWeight: 700,
              background: 'linear-gradient(90deg, #0f172a 0%, #1e40af 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textFillColor: 'transparent',
              fontSize: { xs: '1.75rem', sm: '2.25rem' },
            }}
          >
            What Our Users Say
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              textAlign: 'center', 
              color: 'text.secondary',
              maxWidth: '700px',
              mx: 'auto',
              mb: 6,
              fontSize: { xs: '1rem', sm: '1.125rem' },
              px: { xs: 2, sm: 0 }
            }}
          >
            Don't just take our word for it. Here's what our users have to say about their experience.
          </Typography>
        </motion.div>

        <Box 
          component={motion.div}
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          sx={{
            display: 'grid',
            gridTemplateColumns: { 
              xs: '1fr', 
              md: 'repeat(3, 1fr)' 
            },
            gap: 3,
            mt: 4
          }}
        >
          {testimonials.map((testimonial) => (
            <motion.div key={testimonial.id} variants={item}>
              <TestimonialCard>
                <Rating value={testimonial.rating} />
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'text.secondary',
                    mb: 3,
                    flexGrow: 1,
                    fontStyle: 'italic',
                    lineHeight: 1.7
                  }}
                >
                  "{testimonial.content}"
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      width: 48,
                      height: 48,
                      mr: 2,
                      fontSize: '1.1rem',
                      fontWeight: 600
                    }}
                  >
                    {testimonial.avatar}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {testimonial.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {testimonial.role}
                    </Typography>
                  </Box>
                </Box>
              </TestimonialCard>
            </motion.div>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default Testimonials;
