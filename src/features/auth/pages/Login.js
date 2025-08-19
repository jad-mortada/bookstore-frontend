import React, { useState, useContext } from 'react';
import { Avatar, TextField, Box, Typography, CardHeader, CardContent, Alert, FormControlLabel, Checkbox, Grid, Chip, Stack } from '@mui/material';
import GlassCard from '../../../shared/components/ui/GlassCard';
import GradientButton from '../../../shared/components/ui/GradientButton';
import BackgroundFX from '../../../shared/components/ui/BackgroundFX';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../shared/contexts/AuthContext';
import { useLoading } from '../../../shared/contexts/LoadingContext';
import axiosInstance from '../../../api/axiosInstance';
 

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setLoading } = useLoading();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const normalizedEmail = (email || '').trim().toLowerCase();
      const res = await axiosInstance.post('/api/auth/login', { email: normalizedEmail, password });
      login(res.data.accessToken, rememberMe);
      navigate('/');
    } catch (err) {
      const status = err?.response?.status;
      const serverMsg = typeof err?.response?.data === 'string' ? err.response.data : (err?.response?.data?.error || err?.response?.data?.message);
      // If backend indicates admin email used on customer endpoint, retry admin endpoint automatically
      if (status === 403 && (serverMsg || '').toLowerCase().includes('admin email detected')) {
        try {
          const normalizedEmail = (email || '').trim().toLowerCase();
          const adminRes = await axiosInstance.post('/api/auth/login/admin', { email: normalizedEmail, password });
          login(adminRes.data.accessToken, rememberMe);
          navigate('/');
          return;
        } catch (adminErr) {
          const adminMsg = typeof adminErr?.response?.data === 'string' ? adminErr.response.data : (adminErr?.response?.data?.error || adminErr?.response?.data?.message);
          const adminStatus = adminErr?.response?.status;
          if (adminStatus === 401 || (adminMsg || '').toLowerCase().includes('bad credentials')) {
            setError('Invalid email or password');
          } else {
            setError(adminMsg || 'Invalid email or password');
          }
          return;
        }
      }
      if (status === 401 || (serverMsg || '').toLowerCase().includes('bad credentials')) {
        setError('Invalid email or password');
      } else {
        setError(serverMsg || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundFX>
      <Grid container sx={{ minHeight: '100vh' }}>
        {/* Brand copy panel (no separate background to keep harmony) */}
        <Grid item xs={12} md={6} sx={{
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          p: 6,
          color: (theme) => theme.palette.text.primary
        }}>
          <Box sx={{ maxWidth: 520 }}>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, lineHeight: 1.1, color: 'text.primary' }}>Welcome to Bookstore</Typography>
            <Typography variant="h6" sx={{ opacity: 0.95, mb: 3, color: 'text.secondary' }}>
              Your one place for official class book lists. Sign in to manage drafts, track approvals, and view your order history.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Chip label="Official Lists" color="default" sx={(theme) => ({ bgcolor: theme.palette.action.hover, color: theme.palette.text.primary })} />
              <Chip label="Order Drafts" color="default" sx={(theme) => ({ bgcolor: theme.palette.action.hover, color: theme.palette.text.primary })} />
              <Chip label="Secure Checkout" color="default" sx={(theme) => ({ bgcolor: theme.palette.action.hover, color: theme.palette.text.primary })} />
            </Stack>
          </Box>
        </Grid>

        {/* Form panel */}
        <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, md: 6 } }}>
          <GlassCard elevation={8} sx={{ borderRadius: 4, width: '100%', maxWidth: 460, p: { xs: 2, md: 4 } }}>
            <CardHeader
              avatar={<Avatar sx={{ bgcolor: 'primary.main' }}><LockOutlinedIcon /></Avatar>}
              title={
                <Typography component="h1" variant="h4" sx={{ fontWeight: 800, letterSpacing: 0.2, color: 'text.primary' }}>
                  Sign in to your account
                </Typography>
              }
              sx={{ textAlign: 'center', pb: 0 }}
            />
            <CardContent>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {error && <Alert severity="error">{error}</Alert>}
                <TextField
                  label="Email address"
                  type="email"
                  variant="filled"
                  required
                  fullWidth
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  sx={{
                    borderRadius: 2,
                    '& .MuiFilledInput-root': (theme) => ({
                      backgroundColor: 'rgba(15, 23, 42, 0.035)',
                      borderRadius: 2,
                      backdropFilter: 'blur(6px)',
                    }),
                    '& .MuiFilledInput-root:before, & .MuiFilledInput-root:after': { borderBottom: 'none' },
                    '& .MuiInputLabel-root': (theme) => ({ color: theme.palette.text.secondary }),
                    '& .MuiInputBase-input': (theme) => ({ color: theme.palette.text.primary }),
                  }}
                />
                <TextField
                  label="Password"
                  type="password"
                  variant="filled"
                  required
                  fullWidth
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  sx={{
                    borderRadius: 2,
                    '& .MuiFilledInput-root': {
                      backgroundColor: 'rgba(15, 23, 42, 0.035)',
                      borderRadius: 2,
                      backdropFilter: 'blur(6px)',
                    },
                    '& .MuiFilledInput-root:before, & .MuiFilledInput-root:after': { borderBottom: 'none' },
                    '& .MuiInputLabel-root': (theme) => ({ color: theme.palette.text.secondary }),
                    '& .MuiInputBase-input': (theme) => ({ color: theme.palette.text.primary }),
                  }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      sx={{ color: 'text.secondary' }}
                    />
                  }
                  label="Remember me"
                  sx={{ alignSelf: 'start', color: 'text.secondary', letterSpacing: 0.2 }}
                />
                <GradientButton
                  type="submit"
                  fullWidth
                  size="large"
                >
                  Sign In
                </GradientButton>
              </Box>
              <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                By continuing you agree to our Terms and Privacy Policy.
              </Typography>
            </CardContent>
            <Box sx={{ mt: 1, textAlign: 'center', pb: 1 }}>
              <GradientButton size="small" variant="text" onClick={() => navigate('/register')}>
                Don't have an account? Sign up
              </GradientButton>
            </Box>
          </GlassCard>
        </Grid>
      </Grid>
    </BackgroundFX>
  );
}
;

export default Login;