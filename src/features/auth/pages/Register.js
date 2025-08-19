import React, { useState } from 'react';
import { Avatar, TextField, Box, Typography, CardHeader, CardContent, Alert, Grid, Chip, Stack } from '@mui/material';
import GlassCard from '../../../shared/components/ui/GlassCard';
import GradientButton from '../../../shared/components/ui/GradientButton';
import BackgroundFX from '../../../shared/components/ui/BackgroundFX';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import axiosInstance from '../../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../../../shared/contexts/LoadingContext';
 

const Register = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phoneNumber: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { setLoading } = useLoading();
 

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        email: (form.email || '').trim().toLowerCase(),
      };
      await axiosInstance.post('/api/auth/register', payload);
      setSuccess('Registration successful! You can now log in.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      const status = err?.response?.status;
      const serverMsg = (typeof err?.response?.data === 'string')
        ? err.response.data
        : (err?.response?.data?.message || err?.response?.data?.error);
      if (status === 409 || (serverMsg || '').toLowerCase().includes('already in use') || (serverMsg || '').toLowerCase().includes('already exists')) {
        setError('Email is already in use');
      } else {
        setError(serverMsg || 'Registration failed. Please check your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundFX>
      <Grid container sx={{ minHeight: '100vh' }}>
        {/* Artwork / Brand text (harmonized with global bg) */}
        <Grid item xs={12} md={6} sx={{
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          p: 6,
          color: (theme) => theme.palette.text.primary
        }}>
          <Box sx={{ maxWidth: 520 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, lineHeight: 1.1, color: 'text.primary' }}>Join Bookstore</Typography>
            <Typography variant="h6" sx={{ opacity: 0.95, mb: 3, color: 'text.secondary' }}>
              Create your account to save drafts, place orders, and track approvals across school years.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Chip label="Fast Signup" sx={(theme) => ({ bgcolor: theme.palette.action.hover, color: theme.palette.text.primary })} />
              <Chip label="Secure" sx={(theme) => ({ bgcolor: theme.palette.action.hover, color: theme.palette.text.primary })} />
              <Chip label="Student Friendly" sx={(theme) => ({ bgcolor: theme.palette.action.hover, color: theme.palette.text.primary })} />
            </Stack>
          </Box>
        </Grid>

        {/* Form panel */}
        <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, md: 6 } }}>
          <GlassCard elevation={8} sx={{ borderRadius: 4, width: '100%', maxWidth: 520, p: { xs: 2, md: 4 } }}>
            <CardHeader
              avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><PersonAddIcon /></Avatar>}
              title={
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    textAlign: 'center',
                    letterSpacing: 0.2,
                    color: 'text.primary'
                  }}
                >
                  Create your account
                </Typography>
              }
              subheader={
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                  Fill in your details to get started.
                </Typography>
              }
              sx={{ pb: 0 }}
            />
            <CardContent>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  required
                  label="First Name"
                  name="firstName"
                  variant="filled"
                  value={form.firstName}
                  onChange={handleChange}
                  sx={{
                    '& .MuiFilledInput-root': (theme) => ({ backgroundColor: 'rgba(15, 23, 42, 0.035)', borderRadius: 2, backdropFilter: 'blur(6px)' }),
                    '& .MuiFilledInput-root:before, & .MuiFilledInput-root:after': { borderBottom: 'none' },
                    '& .MuiInputLabel-root': (theme) => ({ color: theme.palette.text.secondary }),
                    '& .MuiInputBase-input': (theme) => ({ color: theme.palette.text.primary }),
                  }}
                />
                <TextField
                  required
                  label="Last Name"
                  name="lastName"
                  variant="filled"
                  value={form.lastName}
                  onChange={handleChange}
                  sx={{
                    '& .MuiFilledInput-root': (theme) => ({ backgroundColor: 'rgba(15, 23, 42, 0.035)', borderRadius: 2, backdropFilter: 'blur(6px)' }),
                    '& .MuiFilledInput-root:before, & .MuiFilledInput-root:after': { borderBottom: 'none' },
                    '& .MuiInputLabel-root': (theme) => ({ color: theme.palette.text.secondary }),
                    '& .MuiInputBase-input': (theme) => ({ color: theme.palette.text.primary }),
                  }}
                />
                <TextField
                  required
                  label="Email"
                  name="email"
                  type="email"
                  variant="filled"
                  value={form.email}
                  onChange={handleChange}
                  fullWidth
                  sx={{
                    gridColumn: { xs: '1 / -1', sm: '1 / -1' },
                    '& .MuiFilledInput-root': (theme) => ({ backgroundColor: 'rgba(15, 23, 42, 0.035)', borderRadius: 2, backdropFilter: 'blur(6px)' }),
                    '& .MuiFilledInput-root:before, & .MuiFilledInput-root:after': { borderBottom: 'none' },
                    '& .MuiInputLabel-root': (theme) => ({ color: theme.palette.text.secondary }),
                    '& .MuiInputBase-input': (theme) => ({ color: theme.palette.text.primary }),
                  }}
                />
                <TextField
                  required
                  label="Phone Number"
                  name="phoneNumber"
                  variant="filled"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  sx={{
                    '& .MuiFilledInput-root': (theme) => ({ backgroundColor: 'rgba(15, 23, 42, 0.035)', borderRadius: 2, backdropFilter: 'blur(6px)' }),
                    '& .MuiFilledInput-root:before, & .MuiFilledInput-root:after': { borderBottom: 'none' },
                    '& .MuiInputLabel-root': (theme) => ({ color: theme.palette.text.secondary }),
                    '& .MuiInputBase-input': (theme) => ({ color: theme.palette.text.primary }),
                  }}
                />
                <TextField
                  required
                  label="Password"
                  name="password"
                  type="password"
                  variant="filled"
                  value={form.password}
                  onChange={handleChange}
                  sx={{
                    '& .MuiFilledInput-root': (theme) => ({ backgroundColor: 'rgba(15, 23, 42, 0.035)', borderRadius: 2, backdropFilter: 'blur(6px)' }),
                    '& .MuiFilledInput-root:before, & .MuiFilledInput-root:after': { borderBottom: 'none' },
                    '& .MuiInputLabel-root': (theme) => ({ color: theme.palette.text.secondary }),
                    '& .MuiInputBase-input': (theme) => ({ color: theme.palette.text.primary }),
                  }}
                />
                <Box sx={{ gridColumn: '1 / -1' }}>
                  {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
                  {success && <Alert severity="success" sx={{ mt: 1 }}>{success}</Alert>}
                </Box>
                <GradientButton
                  type="submit"
                  size="large"
                  sx={{ gridColumn: '1 / -1' }}
                >
                  Sign Up
                </GradientButton>
              </Box>
              <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                By creating an account, you agree to our Terms and Privacy Policy.
              </Typography>
            </CardContent>
            <Box sx={{ mt: 1, textAlign: 'center', pb: 1 }}>
              <GradientButton size="small" variant="text" onClick={() => navigate('/login')}>
                Already have an account? Login
              </GradientButton>
            </Box>
          </GlassCard>
        </Grid>
      </Grid>
    </BackgroundFX>
  );
}
;

export default Register;