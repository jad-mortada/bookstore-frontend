import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, IconButton, Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { AddRounded, EditRounded, DeleteOutlineRounded } from '@mui/icons-material';
import { AuthContext } from '../../../shared/contexts/AuthContext';
import schoolService from '../../../api/schools.api';
import BackgroundFX from '../../../shared/components/ui/BackgroundFX';
import GlassCard from '../../../shared/components/ui/GlassCard';
import GradientButton from '../../../shared/components/ui/GradientButton';
import SectionHeader from '../../../shared/components/ui/SectionHeader';

const initialForm = { name: '', address: '', phoneNumber: '' };

const SchoolList = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_SUPER_ADMIN');

  const [schools, setSchools] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false); // Local loading state
  const [errors, setErrors] = useState({});

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = search
        ? await schoolService.searchSchools(search)
        : await schoolService.getSchools();
      const raw = Array.isArray(res?.data) ? res.data : [];
      const safe = raw
        .filter((row) => row && typeof row === 'object')
        .map((row, idx) => ({
          ...row,
          id: row.id ?? row.schoolId ?? row._id ?? `tmp-${idx}`,
        }));
      setSchools(safe);
    } catch (error) {
      setErrorMessage('Failed to load schools.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSchools = async () => {
      setLoading(true);
      try {
        const res = search
          ? await schoolService.searchSchools(search)
          : await schoolService.getSchools();
        const raw = Array.isArray(res?.data) ? res.data : [];
        const safe = raw
          .filter((row) => row && typeof row === 'object')
          .map((row, idx) => ({
            ...row,
            id: row.id ?? row.schoolId ?? row._id ?? `tmp-${idx}`,
          }));
        setSchools(safe);
      } catch (error) {
        setErrorMessage('Failed to load schools.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchools();
  }, [search]);

  // Redefine handleDelete so it's available for DataGrid actions
  const handleDelete = async (id) => {
    if (window.confirm('Delete this school?')) {
      setLoading(true);
      try {
        await schoolService.deleteSchool(id);
        setErrorMessage('');
        // Refetch schools after delete
        const res = search
          ? await schoolService.searchSchools(search)
          : await schoolService.getSchools();
        const raw = Array.isArray(res?.data) ? res.data : [];
        const safe = raw
          .filter((row) => row && typeof row === 'object')
          .map((row, idx) => ({
            ...row,
            id: row.id ?? row.schoolId ?? row._id ?? `tmp-${idx}`,
          }));
        setSchools(safe);
      } catch (error) {
        setErrorMessage('Error deleting school');
      } finally {
        setLoading(false);
      }
    }
  };


  const handleOpen = (school = initialForm) => {
    setForm(school);
    setEditId(school.id || null);
    setOpen(true);
    setErrors({});
    setErrorMessage('');
  };
  const handleClose = () => { setOpen(false); setForm(initialForm); setEditId(null); };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Please fill out this field';
    if (!form.address.trim()) newErrors.address = 'Please fill out this field';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setLoading(true);
    try {
      if (editId) {
        await schoolService.updateSchool(editId, form);
        setErrorMessage('');
      } else {
        await schoolService.createSchool(form);
        setErrorMessage('');
      }
      handleClose();
      await fetchSchools();
    } catch (error) {
      const status = error?.response?.status;
      const serverMsg = typeof error?.response?.data === 'string' ? error.response.data : '';
      let message = 'Error saving school';
      if (status === 409) {
        // Duplicate resource from backend
        message = serverMsg || 'School already exists with the same name and address.';
        // Show under the most relevant fields
        setErrors(prev => ({
          ...prev,
          name: prev.name || message,
          address: prev.address || message,
        }));
        setErrorMessage('');
        return;
      } else if (status === 400) {
        message = serverMsg || 'Invalid data. Please check the fields.';
        const low = (serverMsg || '').toLowerCase();
        const fieldErrors = {};
        if (low.includes('name')) fieldErrors.name = message;
        if (low.includes('address')) fieldErrors.address = message;
        if (Object.keys(fieldErrors).length) {
          setErrors(prev => ({ ...prev, ...fieldErrors }));
          setErrorMessage('');
          return;
        }
      } else if (status === 403) {
        message = 'Only admins can perform this action.';
      } else if (serverMsg) {
        message = serverMsg;
      }
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <BackgroundFX>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '100%', mx: 0 }}>
        <GlassCard sx={{ p: { xs: 2, md: 3 }, border: '1px solid rgba(15,23,42,0.08)' }}>
          <SectionHeader title="Schools" subtitle="Manage schools and their details." />
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Search by name"
              value={search}
              onChange={e => setSearch(e.target.value)}
              size="small"
              sx={{ minWidth: 240, maxWidth: 400, flex: '1 1 280px' }}
            />
            {isAdmin && (
              <Tooltip title="Add a new school">
                <span>
                  <GradientButton startIcon={<AddRounded />} onClick={() => handleOpen()} aria-label="Add school">
                    Add School
                  </GradientButton>
                </span>
              </Tooltip>
            )}
          </Box>
          <Box sx={{ height: 480, width: '100%' }}>
            <DataGrid
              rows={Array.isArray(schools) ? schools : []}
              columns={[
                { field: 'name', headerName: 'Name', flex: 1 },
                { field: 'address', headerName: 'Address', flex: 1 },
                { field: 'phoneNumber', headerName: 'Phone', flex: 1 },
                {
                  field: 'actions',
                  headerName: 'Actions',
                  flex: 0.5,
                  sortable: false,
                  renderCell: ({ row }) => isAdmin && (
                    <Box>
                      <Tooltip title="Edit school">
                        <IconButton onClick={() => handleOpen(row)} aria-label={`Edit school ${row.name || ''}`}><EditRounded /></IconButton>
                      </Tooltip>
                      <Tooltip title="Delete school">
                        <IconButton color="error" onClick={() => handleDelete(row.id)} aria-label={`Delete school ${row.name || ''}`}><DeleteOutlineRounded /></IconButton>
                      </Tooltip>
                    </Box>
                  ),
                  align: 'right',
                  headerAlign: 'right',
                },
              ]}
              pageSize={7}
              rowsPerPageOptions={[7, 14, 21]}
              disableSelectionOnClick
              getRowId={(row) => row?.id ?? row?.schoolId ?? row?._id ?? `${row?.name || 'row'}-${row?.address || ''}`}
              sx={{ borderRadius: 2, backgroundColor: 'background.paper', boxShadow: 1 }}
              autoHeight={false}
              loading={loading}
              localeText={{ noRowsLabel: 'No schools found.' }}
            />
          </Box>
        </GlassCard>
      
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'Edit School' : 'Add School'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            required
          />
          <TextField
            margin="normal"
            fullWidth
            label="Address"
            name="address"
            value={form.address}
            onChange={handleChange}
            error={!!errors.address}
            helperText={errors.address}
            required
          />
          <TextField margin="normal" fullWidth label="Phone Number" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end', gap: 1, p: 2 }}>
          <Button onClick={handleClose} size="small">Cancel</Button>
          <GradientButton onClick={handleSubmit} size="small">{editId ? 'Update' : 'Create'}</GradientButton>
        </DialogActions>
      </Dialog>
    </Box>
    </BackgroundFX>
  );
};

export default SchoolList;