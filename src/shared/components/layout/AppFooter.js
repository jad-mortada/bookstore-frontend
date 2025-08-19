import React from 'react';
import { Box, Typography, Stack, Link as MuiLink, Divider } from '@mui/material';

const AppFooter = () => {
  const year = new Date().getFullYear();
  return (
    <Box component="footer" sx={{ mt: 8, mb: 3, zIndex: 1, width: '100%' }}>
      <Divider sx={{ mb: 2, opacity: 0.4 }} />
      <Stack spacing={0.5} alignItems="center" sx={{ textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          © {year} Bookstore Management System. All rights reserved.
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          Need help? Contact:{' '}
          <MuiLink href="mailto:support@bookstore.com" underline="hover" color="primary">
            support@bookstore.com
          </MuiLink>
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          Designed by Jad Mortada
        </Typography>
      </Stack>
    </Box>
  );
};

export default AppFooter;
