import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Avatar, Divider, Alert, CircularProgress, Button, TextField, Stack, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, Accordion, AccordionSummary, AccordionDetails, IconButton, InputAdornment } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from '@mui/material/Grid';
import profileService from '../../../api/profile.api'; // Adjust the import path as needed
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { evaluatePassword } from '../../../shared/utils/passwordStrength';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPw, setChangingPw] = useState(false);
  const [showPwForm, setShowPwForm] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [currentPwError, setCurrentPwError] = useState('');
  const [newPwError, setNewPwError] = useState('');
  const [confirmPwError, setConfirmPwError] = useState('');

  // Avatar edit dialog state
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState('');


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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // reset field errors
    setCurrentPwError('');
    setNewPwError('');
    setConfirmPwError('');

    // Client-side validation
    let hasErr = false;
    if (!currentPassword) {
      setCurrentPwError('Current password is required');
      hasErr = true;
    }
    if (!newPassword) {
      setNewPwError('New password is required');
      hasErr = true;
    } else if (newPassword.length < 8) {
      setNewPwError('Use at least 8 characters');
      hasErr = true;
    } else if (newPassword === currentPassword) {
      setNewPwError('New password must be different from current');
      hasErr = true;
    }
    if (!confirmPassword) {
      setConfirmPwError('Please confirm the new password');
      hasErr = true;
    } else if (newPassword !== confirmPassword) {
      setConfirmPwError('Passwords do not match');
      hasErr = true;
    }
    // Strength policy: require at least Good
    if (!hasErr) {
      const s = evaluatePassword(newPassword);
      if ((s?.score ?? 0) < 3) {
        setNewPwError('Password is too weak. Aim for Good or Strong.');
        hasErr = true;
      }
    }
    if (hasErr) return;
    try {
      setChangingPw(true);
      await profileService.changePassword({ currentPassword, newPassword });
      setSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      const serverMsg = typeof e?.response?.data === 'string' ? e.response.data : (e?.response?.data?.message || e?.response?.data?.error);
      if ((serverMsg || '').toLowerCase().includes('current password is incorrect')) {
        setCurrentPwError('Current password is incorrect');
      } else {
        setError(serverMsg || 'Failed to change password');
      }
    } finally {
      setChangingPw(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      setUploadingAvatar(true);
      setUploadError('');
      await profileService.deleteAvatar();
      setProfile((p) => ({ ...p, avatarUrl: undefined }));
      window.dispatchEvent(new CustomEvent('avatar:updated', { detail: { avatarUrl: null } }));
      setSelectedAvatarFile(null);
      setAvatarDialogOpen(false);
    } catch (e) {
      setUploadError(e?.response?.data || 'Failed to remove avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Avatar upload from Profile page (opens when clicking avatar)
  const openAvatarDialog = () => {
    setUploadError('');
    setSelectedAvatarFile(null);
    setAvatarDialogOpen(true);
  };

  const handleAvatarFileChange = (e) => {
    setUploadError('');
    const file = e.target.files?.[0] || null;
    setSelectedAvatarFile(file);
  };

  const handleUploadAvatar = async () => {
    if (!selectedAvatarFile) {
      setUploadError('Please choose an image file.');
      return;
    }
    try {
      setUploadingAvatar(true);
      setUploadError('');
      const data = await profileService.uploadAvatar(selectedAvatarFile);
      if (data?.avatarUrl) {
        setProfile((p) => ({ ...p, avatarUrl: data.avatarUrl }));
        window.dispatchEvent(new CustomEvent('avatar:updated', { detail: { avatarUrl: data.avatarUrl } }));
      }
      setAvatarDialogOpen(false);
    } catch (e) {
      setUploadError(e?.response?.data || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <Box p={2}>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar
              sx={{ width: 64, height: 64, cursor: 'pointer' }}
              src={profile.avatarUrl || undefined}
              onClick={openAvatarDialog}
              title="Edit profile photo"
            >
              {!profile.avatarUrl && initials}
            </Avatar>
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

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom>Security</Typography>
              <Accordion elevation={1} expanded={showPwForm} onChange={(_, expanded) => setShowPwForm(expanded)}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box>
                    <Typography variant="subtitle1">Change Password</Typography>
                    <Typography variant="body2" color="text.secondary">Update your password to keep your account secure</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box component="form" onSubmit={handleChangePassword} noValidate>
                    <Stack spacing={2}>
                      <TextField
                        label="Current Password"
                        type={showCurrentPw ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        fullWidth
                        autoFocus
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton aria-label="toggle password visibility" onClick={() => setShowCurrentPw(v => !v)} edge="end">
                                {showCurrentPw ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        error={!!currentPwError}
                        helperText={currentPwError || ''}
                      />
                      <TextField
                        label="New Password"
                        type={showNewPw ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        fullWidth
                        helperText={newPwError || 'Use at least 8 characters with a mix of letters and numbers'}
                        error={!!newPwError}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton aria-label="toggle password visibility" onClick={() => setShowNewPw(v => !v)} edge="end">
                                {showNewPw ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                      {!!newPassword && (() => { const s = evaluatePassword(newPassword); return (
                        <Stack spacing={0.5} sx={{ mt: -1 }}>
                          <LinearProgress variant="determinate" value={s.percent} color={s.color} sx={{ height: 6, borderRadius: 1 }} />
                          <Typography variant="caption" color="text.secondary">Strength: {s.label}</Typography>
                        </Stack>
                      ); })()}
                      <TextField
                        label="Confirm New Password"
                        type={showConfirmPw ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        fullWidth
                        helperText={confirmPwError || 'Must match the new password'}
                        error={!!confirmPwError}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton aria-label="toggle password visibility" onClick={() => setShowConfirmPw(v => !v)} edge="end">
                                {showConfirmPw ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                      />
                      <Stack direction="row" spacing={1}>
                        <Button type="submit" variant="contained" disabled={changingPw}>
                          {changingPw ? 'Updating...' : 'Update Password'}
                        </Button>
                        <Button
                          variant="text"
                          onClick={() => {
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');
                            setShowPwForm(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>

          <Dialog open={avatarDialogOpen} onClose={() => setAvatarDialogOpen(false)} fullWidth maxWidth="xs">
            <DialogTitle>Edit profile photo</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                {uploadError && <Alert severity="error" onClose={() => setUploadError('')}>{uploadError}</Alert>}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button variant="outlined" component="label" disabled={uploadingAvatar}>
                    Choose Image
                    <input type="file" accept="image/*" hidden onChange={handleAvatarFileChange} />
                  </Button>
                  <Typography variant="body2" color="text.secondary">
                    {selectedAvatarFile ? selectedAvatarFile.name : 'No file selected'}
                  </Typography>
                </Stack>
                {uploadingAvatar && <LinearProgress />}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setAvatarDialogOpen(false)} disabled={uploadingAvatar}>Cancel</Button>
              <Button onClick={handleRemoveAvatar} color="error" disabled={uploadingAvatar}>Remove photo</Button>
              <Button onClick={handleUploadAvatar} variant="contained" disabled={uploadingAvatar || !selectedAvatarFile}>Upload</Button>
            </DialogActions>
          </Dialog>

          {(success || error) && (
            <Box mt={2}>
              {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}
              {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;

