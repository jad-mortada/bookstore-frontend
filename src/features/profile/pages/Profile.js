import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Avatar, Divider, Alert, CircularProgress } from '@mui/material';
import Grid from '@mui/material/Grid';
import profileService from '../../../api/profile.api'; // Adjust the import path as needed

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await profileService.getMe();
        if (mounted) setProfile(data);
      } catch (e) {
        if (mounted) setError(e?.response?.data?.message || 'Failed to load profile');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!profile) return null;

  const initials = `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase();

  return (
    <Box p={2}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar sx={{ width: 64, height: 64 }}>{initials}</Avatar>
            <Box>
              <Typography variant="h5">{profile.firstName} {profile.lastName}</Typography>
              <Typography color="text.secondary">{profile.userType}</Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">Email</Typography>
              <Typography>{profile.email}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
              <Typography>{profile.phoneNumber || '-'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">Roles</Typography>
              <Typography>{profile.roles}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography variant="subtitle2" color="text.secondary">ID</Typography>
              <Typography>{profile.id}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;
