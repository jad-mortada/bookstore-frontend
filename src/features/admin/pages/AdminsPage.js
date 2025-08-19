import React, { useEffect, useState, useContext } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert
} from '@mui/material';
import { AddRounded, EditRounded, DeleteOutlineRounded } from '@mui/icons-material';
import adminService from '../../../api/admin.api';
import { AuthContext } from '../../../shared/contexts/AuthContext';
import BackgroundFX from '../../../shared/components/ui/BackgroundFX';
import GlassCard from '../../../shared/components/ui/GlassCard';
import GradientButton from '../../../shared/components/ui/GradientButton';

const emptyAdmin = { firstName: '', lastName: '', email: '', phoneNumber: '', password: '' };

export default function AdminsPage() {
  const { user } = useContext(AuthContext);
  const [admins, setAdmins] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyAdmin);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchAdmins = React.useCallback(async () => {
    try {
      const res = await adminService.getAdmins();
      setAdmins(res.data);
    } catch (err) {
      setErrorMessage('Failed to fetch admins');
    }
  }, []);

  useEffect(() => {
    if (user?.roles?.includes('ROLE_SUPER_ADMIN')) {
      fetchAdmins();
    }
  }, [fetchAdmins, user]);

  const handleOpen = (admin = emptyAdmin, id = null) => {
    setForm(admin);
    setEditId(id);
    setOpen(true);
    setErrors({});
    setErrorMessage('');
  };

  const handleClose = () => {
    setOpen(false);
    setForm(emptyAdmin);
    setEditId(null);
    setErrors({});
    setErrorMessage('');
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    const isEmpty = (v) => !v || String(v).trim() === '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (isEmpty(form.firstName)) newErrors.firstName = 'First name is required';
    if (isEmpty(form.lastName)) newErrors.lastName = 'Last name is required';
    if (isEmpty(form.email)) newErrors.email = 'Email is required';
    else if (!emailRegex.test(form.email)) newErrors.email = 'Invalid email format';

    if (!editId) {
      if (isEmpty(form.password)) newErrors.password = 'Password is required';
      else if (String(form.password).length < 6) newErrors.password = 'Password must be at least 6 characters';
    } else if (!isEmpty(form.password) && String(form.password).length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

   
    const emailLower = String(form.email || '').toLowerCase();
    const duplicate = admins.some(a => String(a.email || '').toLowerCase() === emailLower && String(a.id) !== String(editId || ''));
    if (emailLower && duplicate) newErrors.email = 'Email already exists';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setErrorMessage('Please fix the highlighted errors.');
      return;
    }
    try {
      const payload = {
        ...form,
        email: (form.email || '').trim().toLowerCase(),
      };
      if (editId) {
        await adminService.updateAdmin(editId, payload);
        setErrorMessage('');
      } else {
        await adminService.createAdmin(payload);
        setErrorMessage('');
      }
      fetchAdmins();
      handleClose();
    } catch (err) {
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message || (typeof err?.response?.data === 'string' ? err.response.data : null);
      const low = (serverMsg || '').toLowerCase();
      if (status === 409 || low.includes('already in use') || low.includes('already exists')) {
        const message = serverMsg || 'Email is already in use';
        setErrors(prev => ({ ...prev, email: message }));
        setErrorMessage('');
        return;
      }
      if (status === 400 && (low.includes('email') || low.includes('invalid'))) {
        const message = serverMsg || 'Invalid email';
        setErrors(prev => ({ ...prev, email: message }));
        setErrorMessage('');
        return;
      }
      setErrorMessage(serverMsg || 'Operation failed');
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    try {
      await adminService.deleteAdmin(id);
      setErrorMessage('');
      fetchAdmins();
    } catch (err) {
      setErrorMessage('Delete failed');
    }
  };

  const filteredAdmins = (Array.isArray(admins) ? admins : [])
    .filter(a => a.roles !== 'ROLE_SUPER_ADMIN')
    .filter(a => {
      const q = String(debouncedSearch || '').trim().toLowerCase();
      if (!q) return true;
      const hay = [a.firstName, a.lastName, a.email, a.phoneNumber]
        .filter(Boolean)
        .map(v => String(v).toLowerCase())
        .join(' ');
      return hay.includes(q);
    });

  if (!user?.roles?.includes('ROLE_SUPER_ADMIN')) {
    return (
      <BackgroundFX>
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '100%', mx: 0 }}>
          <GlassCard sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h5" color="error" sx={{ fontWeight: 600 }}>
              You are not authorized to view this page.
            </Typography>
          </GlassCard>
        </Box>
      </BackgroundFX>
    );
  }

  return (
    <BackgroundFX>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: '100%', mx: 0 }}>
        <Typography variant="h4" mb={2} sx={{ fontWeight: 800 }}>
          Manage Admins
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Tooltip title="Add a new admin">
            <span>
              <GradientButton startIcon={<AddRounded />} onClick={() => handleOpen()} aria-label="Add admin">
                Add Admin
              </GradientButton>
            </span>
          </Tooltip>
          <TextField
            size="small"
            label="Search admins"
            placeholder="Search by name, email, phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 220, maxWidth: 360 }}
            slotProps={{
              input: {
                endAdornment: search ? (
                  <IconButton size="small" onClick={() => setSearch('')} aria-label="Clear search">
                    ✕
                  </IconButton>
                ) : null,
              },
            }}
          />
        </Box>
        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>
        )}
        <GlassCard sx={{ mt: 2, p: { xs: 1, md: 2 } }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAdmins.map(a => (
                  <TableRow key={a.id}>
                    <TableCell>{a.firstName}</TableCell>
                    <TableCell>{a.lastName}</TableCell>
                    <TableCell>{a.email}</TableCell>
                    <TableCell>{a.phoneNumber}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit admin">
                        <IconButton onClick={() => handleOpen(a, a.id)} aria-label={`Edit admin ${a.firstName} ${a.lastName}`}>
                          <EditRounded />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete admin">
                        <IconButton color="error" onClick={() => handleDelete(a.id)} aria-label={`Delete admin ${a.firstName} ${a.lastName}`}>
                          <DeleteOutlineRounded />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </GlassCard>

        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>{editId ? 'Edit Admin' : 'Add Admin'}</DialogTitle>
          <DialogContent>
            <TextField autoFocus margin="dense" label="First Name" name="firstName" value={form.firstName} onChange={handleChange} fullWidth error={!!errors.firstName} helperText={errors.firstName} />
            <TextField margin="dense" label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} fullWidth error={!!errors.lastName} helperText={errors.lastName} />
            <TextField margin="dense" label="Email" name="email" value={form.email} onChange={handleChange} fullWidth error={!!errors.email} helperText={errors.email} />
            <TextField margin="dense" label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} fullWidth />
            <TextField margin="dense" label={editId ? 'Password (leave blank to keep)' : 'Password'} name="password" value={form.password} onChange={handleChange} fullWidth type="password" error={!!errors.password} helperText={errors.password} />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleClose}>Cancel</Button>
            <GradientButton onClick={handleSubmit}>{editId ? 'Update' : 'Create'}</GradientButton>
          </DialogActions>
        </Dialog>
        
      </Box>
    </BackgroundFX>
  );
}
