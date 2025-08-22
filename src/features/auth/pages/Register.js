import React, { useState } from 'react';
import { Avatar, TextField, Box, Typography, CardHeader, CardContent, Alert, Grid, Chip, Stack, IconButton, InputAdornment, LinearProgress } from '@mui/material';
import GlassCard from '../../../shared/components/ui/GlassCard';
import GradientButton from '../../../shared/components/ui/GradientButton';
import BackgroundFX from '../../../shared/components/ui/BackgroundFX';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import axiosInstance from '../../../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../../../shared/contexts/LoadingContext';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { evaluatePassword } from '../../../shared/utils/passwordStrength';


const Register = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phoneNumber: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { setLoading } = useLoading();


  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // Client-side password policy
    if (!form.password || form.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    const s = evaluatePassword(form.password);
    if ((s?.score ?? 0) < 3) {
      setError('Password is too weak. Please use a stronger password with a mix of letters, numbers, and special characters.');
      return;
    }
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
          p: { xs: 3, md: 6 },
          color: (theme) => theme.palette.text.primary
        }}>
          <Box sx={{ 
            maxWidth: { xs: '90%', sm: '80%', md: '65ch' }, 
            px: { xs: 2, md: 0 },
            textAlign: { xs: 'center', md: 'left' }
          }}>
            <Typography variant="h3" sx={{ 
              fontWeight: 800, 
              mb: { xs: 1.5, md: 2 }, 
              lineHeight: 1.1, 
              color: 'text.primary',
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.875rem' }
            }}>Join Bookstore</Typography>
            <Typography variant="h6" sx={{ 
              opacity: 0.95, 
              mb: { xs: 2, md: 3 }, 
              color: 'text.secondary',
              fontSize: { xs: '1rem', sm: '1.125rem', md: '1.5rem' },
              lineHeight: 1.4
            }}>
              Create your account to save drafts, place orders, and track approvals across school years.
            </Typography>
            <Stack direction="row" spacing={1} sx={{ 
              flexWrap: 'wrap', 
              gap: 1, 
              justifyContent: { xs: 'center', md: 'flex-start' },
              '& .MuiChip-root': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }
            }}>
              <Chip label="Fast Signup" sx={(theme) => ({ bgcolor: theme.palette.action.hover, color: theme.palette.text.primary })} />
              <Chip label="Secure" sx={(theme) => ({ bgcolor: theme.palette.action.hover, color: theme.palette.text.primary })} />
              <Chip label="Student Friendly" sx={(theme) => ({ bgcolor: theme.palette.action.hover, color: theme.palette.text.primary })} />
            </Stack>
          </Box>
        </Grid>

        {/* Form panel */}
        <Grid item xs={12} md={6} sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          p: { xs: 2, sm: 3, md: 6 },
          minHeight: { xs: 'auto', md: '100vh' }
        }}>
          <GlassCard elevation={8} sx={{ 
            borderRadius: { xs: 2, md: 4 }, 
            width: '100%', 
            maxWidth: { xs: '100%', sm: 480, md: 520 }, 
            p: { xs: 3, sm: 4, md: 4 },
            m: { xs: 0, sm: 2, md: 0 }
          }}>
            <CardHeader
              avatar={<Avatar sx={{ bgcolor: 'primary.main', width: { xs: 48, md: 56 }, height: { xs: 48, md: 56 } }}><PersonAddIcon /></Avatar>}
              title={
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    textAlign: 'center',
                    letterSpacing: 0.2,
                    color: 'text.primary',
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                  }}
                >
                  Create your account
                </Typography>
              }
              subheader={
                <Typography variant="body2" sx={{ 
                  textAlign: 'center', 
                  color: 'text.secondary',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}>
                  Fill in your details to get started.
                </Typography>
              }
              sx={{ pb: 0 }}
            />
            <CardContent>
              <Box component="form" onSubmit={handleSubmit} sx={{ 
                mt: 2, 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                gap: { xs: 2, sm: 2, md: 3 },
                '& .MuiTextField-root': {
                  minHeight: '80px' // Better touch targets for mobile
                }
              }}>
                <TextField
                  required
                  label="First Name"
                  name="firstName"
                  variant="filled"
                  value={form.firstName}
                  onChange={handleChange}
                  sx={{
                    '& .MuiFilledInput-root': (theme) => ({ 
                      backgroundColor: 'rgba(15, 23, 42, 0.035)', 
                      borderRadius: 2, 
                      backdropFilter: 'blur(6px)',
                      minHeight: { xs: '56px', sm: 'auto' } // Better touch targets
                    }),
                    '& .MuiFilledInput-root:before, & .MuiFilledInput-root:after': { borderBottom: 'none' },
                    '& .MuiInputLabel-root': (theme) => ({ 
                      color: theme.palette.text.secondary,
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }),
                    '& .MuiInputBase-input': (theme) => ({ 
                      color: theme.palette.text.primary,
                      fontSize: { xs: '1rem', sm: '1rem' },
                      padding: { xs: '16px 12px', sm: '16px 12px' }
                    }),
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
                    '& .MuiFilledInput-root': (theme) => ({ 
                      backgroundColor: 'rgba(15, 23, 42, 0.035)', 
                      borderRadius: 2, 
                      backdropFilter: 'blur(6px)',
                      minHeight: { xs: '56px', sm: 'auto' } // Better touch targets
                    }),
                    '& .MuiFilledInput-root:before, & .MuiFilledInput-root:after': { borderBottom: 'none' },
                    '& .MuiInputLabel-root': (theme) => ({ 
                      color: theme.palette.text.secondary,
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }),
                    '& .MuiInputBase-input': (theme) => ({ 
                      color: theme.palette.text.primary,
                      fontSize: { xs: '1rem', sm: '1rem' },
                      padding: { xs: '16px 12px', sm: '16px 12px' }
                    }),
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
                    '& .MuiFilledInput-root': (theme) => ({ 
                      backgroundColor: 'rgba(15, 23, 42, 0.035)', 
                      borderRadius: 2, 
                      backdropFilter: 'blur(6px)',
                      minHeight: { xs: '56px', sm: 'auto' } // Better touch targets
                    }),
                    '& .MuiFilledInput-root:before, & .MuiFilledInput-root:after': { borderBottom: 'none' },
                    '& .MuiInputLabel-root': (theme) => ({ 
                      color: theme.palette.text.secondary,
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }),
                    '& .MuiInputBase-input': (theme) => ({ 
                      color: theme.palette.text.primary,
                      fontSize: { xs: '1rem', sm: '1rem' },
                      padding: { xs: '16px 12px', sm: '16px 12px' }
                    }),
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
                    '& .MuiFilledInput-root': (theme) => ({ 
                      backgroundColor: 'rgba(15, 23, 42, 0.035)', 
                      borderRadius: 2, 
                      backdropFilter: 'blur(6px)',
                      minHeight: { xs: '56px', sm: 'auto' } // Better touch targets
                    }),
                    '& .MuiFilledInput-root:before, & .MuiFilledInput-root:after': { borderBottom: 'none' },
                    '& .MuiInputLabel-root': (theme) => ({ 
                      color: theme.palette.text.secondary,
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }),
                    '& .MuiInputBase-input': (theme) => ({ 
                      color: theme.palette.text.primary,
                      fontSize: { xs: '1rem', sm: '1rem' },
                      padding: { xs: '16px 12px', sm: '16px 12px' }
                    }),
                  }}
                />
                <TextField
                  required
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  variant="filled"
                  value={form.password}
                  onChange={handleChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          aria-label="toggle password visibility" 
                          onClick={() => setShowPassword(v => !v)} 
                          edge="end"
                          sx={{ 
                            padding: { xs: '8px', sm: '8px' }, // Better touch target
                            marginRight: { xs: '-4px', sm: '0' } // Adjust for mobile
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiFilledInput-root': (theme) => ({ 
                      backgroundColor: 'rgba(15, 23, 42, 0.035)', 
                      borderRadius: 2, 
                      backdropFilter: 'blur(6px)',
                      minHeight: { xs: '56px', sm: 'auto' } // Better touch targets
                    }),
                    '& .MuiFilledInput-root:before, & .MuiFilledInput-root:after': { borderBottom: 'none' },
                    '& .MuiInputLabel-root': (theme) => ({ 
                      color: theme.palette.text.secondary,
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }),
                    '& .MuiInputBase-input': (theme) => ({ 
                      color: theme.palette.text.primary,
                      fontSize: { xs: '1rem', sm: '1rem' },
                      padding: { xs: '16px 12px 16px 12px', sm: '16px 12px' } // Extra padding for icon
                    }),
                  }}
                />
                {!!form.password && (() => {
                  const s = evaluatePassword(form.password); return (
                    <Box sx={{ gridColumn: '1 / -1' }}>
                      <Stack spacing={0.5} sx={{ mt: -1 }}>
                        <LinearProgress variant="determinate" value={s.percent} color={s.color} sx={{ height: 6, borderRadius: 1 }} />
                        <Typography variant="caption" color="text.secondary">Strength: {s.label}</Typography>
                      </Stack>
                    </Box>
                  );
                })()}
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