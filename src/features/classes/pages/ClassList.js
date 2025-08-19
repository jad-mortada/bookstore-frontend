// ClassList.js (REBUILT FROM SCRATCH)
import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert, IconButton, Tooltip, MenuItem, Typography } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { DataGrid } from '@mui/x-data-grid';
import { AddRounded, EditRounded, DeleteOutlineRounded } from '@mui/icons-material';
import { AuthContext } from '../../../shared/contexts/AuthContext';
import { useLoading } from '../../../shared/contexts/LoadingContext';
import classService from '../../../api/classes.api';
import schoolService from '../../../api/schools.api';
import BackgroundFX from '../../../shared/components/ui/BackgroundFX';
import GlassCard from '../../../shared/components/ui/GlassCard';
import GradientButton from '../../../shared/components/ui/GradientButton';
import SectionHeader from '../../../shared/components/ui/SectionHeader';

const initialForm = { name: '', schoolId: '', year: '' };

const ClassList = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_SUPER_ADMIN');

  const [classes, setClasses] = useState([]);
  const [schools, setSchools] = useState([]);
  const [schoolInput, setSchoolInput] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});
  const { setLoading } = useLoading();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchClasses = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await classService.getClasses();
      const raw = Array.isArray(res?.data) ? res.data : [];
      const safe = raw
        .filter((row) => row && typeof row === 'object')
        .map((row, idx) => ({
          ...row,
          id: row.id ?? row.classId ?? row._id ?? `tmp-class-${idx}`,
        }));
      setClasses(safe);
    } catch {
      setErrorMessage('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const fetchSchools = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await schoolService.getSchools();
      const raw = Array.isArray(res?.data) ? res.data : [];
      const safe = raw
        .filter((row) => row && typeof row === 'object')
        .map((row, idx) => ({
          ...row,
          id: row.id ?? row.schoolId ?? row._id ?? `tmp-school-${idx}`,
        }));
      setSchools(safe);
    } catch {
      // Optionally show error
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  // Debounced search for schools when typing
  useEffect(() => {
    let active = true;
    const handler = setTimeout(async () => {
      try {
        if (schoolInput && schoolInput.trim().length > 0) {
          const res = await schoolService.searchSchools(schoolInput.trim());
          const raw = Array.isArray(res?.data) ? res.data : [];
          const safe = raw
            .filter((row) => row && typeof row === 'object')
            .map((row, idx) => ({
              ...row,
              id: row.id ?? row.schoolId ?? row._id ?? `tmp-school-${idx}`,
            }));
          if (active) setSchools(safe);
        } else {
          const res = await schoolService.getSchools();
          const raw = Array.isArray(res?.data) ? res.data : [];
          const safe = raw
            .filter((row) => row && typeof row === 'object')
            .map((row, idx) => ({
              ...row,
              id: row.id ?? row.schoolId ?? row._id ?? `tmp-school-${idx}`,
            }));
          if (active) setSchools(safe);
        }
      } catch {
        // ignore search errors silently
      }
    }, 300);
    return () => {
      active = false;
      clearTimeout(handler);
    };
  }, [schoolInput]);

  useEffect(() => {
    fetchClasses();
    fetchSchools();
  }, [fetchClasses, fetchSchools]);

  const handleOpen = (cls = initialForm) => {
    setForm(cls);
    setEditId(cls.id || null);
    setOpen(true);
    setErrors({});
    setErrorMessage('');
  };
  const handleClose = () => { setOpen(false); setForm(initialForm); setEditId(null); setErrors({}); };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    // Client validation
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Please fill out this field';
    if (!form.schoolId) newErrors.schoolId = 'Please select a school';
    if (!form.year) newErrors.year = 'Please choose a year';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setLoading(true);
    try {
      if (editId) {
        await classService.updateClass(editId, form);
        setErrorMessage('');
      } else {
        await classService.createClass(form);
        setErrorMessage('');
      }
      handleClose();
      try {
        await fetchClasses();
      } catch {
        // Silently ignore fetch errors after successful CRUD
      }
    } catch (error) {
      const status = error?.response?.status;
      const serverMsg = typeof error?.response?.data === 'string' ? error.response.data : '';
      let message = 'Error saving class';
      if (status === 409) {
        message = serverMsg || 'Class already exists with the same name, school, and year.';
        setErrors(prev => ({
          ...prev,
          name: prev.name || message,
          schoolId: prev.schoolId || message,
          year: prev.year || message,
        }));
        setErrorMessage('');
        return;
      } else if (status === 400) {
        message = serverMsg || 'Invalid data. Please check the fields.';
        const low = (serverMsg || '').toLowerCase();
        const fieldErrors = {};
        if (low.includes('name')) fieldErrors.name = message;
        if (low.includes('school')) fieldErrors.schoolId = message;
        if (low.includes('year')) fieldErrors.year = message;
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

  const handleDelete = async (id) => {
    if (window.confirm('Delete this class?')) {
      setLoading(true);
      try {
        await classService.deleteClass(id);
        setErrorMessage('');
        try {
          await fetchClasses();
        } catch {
          // Silently ignore fetch errors after successful CRUD
        }
      } catch {
        setErrorMessage('Error deleting class');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <BackgroundFX>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '100%', mx: 0 }}>
        <GlassCard sx={{ p: { xs: 2, md: 3 }, border: '1px solid rgba(15,23,42,0.08)' }}>
          <SectionHeader title="Classes" subtitle="Manage classes per school and year." />
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              label="Search classes"
              placeholder="Search by name, school, year"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: 1, minWidth: 220, maxWidth: 360 }}
              slotProps={{
                input: {
                  endAdornment: search ? (
                    <IconButton size="small" onClick={() => setSearch('')} aria-label="Clear search">✕</IconButton>
                  ) : null,
                },
              }}
            />
            {isAdmin && (
              <Tooltip title="Add a new class">
                <span>
                  <GradientButton startIcon={<AddRounded />} onClick={() => handleOpen()} aria-label="Add class">
                    Add Class
                  </GradientButton>
                </span>
              </Tooltip>
            )}
          </Box>
          <Box sx={{ mb: 2 }}></Box>
          <Box sx={{ height: 480, width: '100%' }}>
            {classes.length === 0 ? (
              <Typography variant="body1" sx={{ mt: 2, mb: 2 }} color="text.secondary">
                No classes found. Please check your data or try again later.
              </Typography>
            ) : (
              <DataGrid
                rows={(Array.isArray(classes) ? classes : []).filter((c) => {
                  const q = String(debouncedSearch || '').trim().toLowerCase();
                  if (!q) return true;
                  const hay = [c.name, c.schoolName, c.schoolAddress, c.year]
                    .filter((v) => v !== undefined && v !== null)
                    .map((v) => String(v).toLowerCase())
                    .join(' ');
                  return hay.includes(q);
                })}
                columns={[
                  { field: 'name', headerName: 'Name', flex: 1 },
                  { field: 'schoolName', headerName: 'School', flex: 1 },
                  { field: 'schoolAddress', headerName: 'School Address', flex: 1 },
                  { field: 'year', headerName: 'Year', flex: 1 },
                  {
                    field: 'actions',
                    headerName: 'Actions',
                    flex: 0.5,
                    sortable: false,
                    renderCell: ({ row }) => isAdmin && (
                      <Box>
                        <Tooltip title="Edit class"><IconButton onClick={() => handleOpen(row)} aria-label={`Edit class ${row.name || ''}`}><EditRounded /></IconButton></Tooltip>
                        <Tooltip title="Delete class"><IconButton color="error" onClick={() => handleDelete(row.id)} aria-label={`Delete class ${row.name || ''}`}><DeleteOutlineRounded /></IconButton></Tooltip>
                      </Box>
                    ),
                    align: 'right',
                    headerAlign: 'right',
                  },
                ]}
                pageSize={7}
                rowsPerPageOptions={[7, 14, 21]}
                disableSelectionOnClick
                getRowId={(row) => row?.id ?? row?.classId ?? row?._id ?? `${row?.name || 'row'}-${row?.year || ''}`}
                sx={{ borderRadius: 2, backgroundColor: 'background.paper', boxShadow: 1 }}
                autoHeight={false}
                localeText={{ noRowsLabel: 'No classes found.' }}
              />
            )}
          </Box>
        </GlassCard>
      </Box>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'Edit Class' : 'Add Class'}</DialogTitle>
        <DialogContent>
          <TextField margin="normal" fullWidth label="Name" name="name" value={form.name} onChange={handleChange} required error={!!errors.name} helperText={errors.name} />
          <Autocomplete
            options={Array.isArray(schools) ? schools : []}
            value={(Array.isArray(schools) ? schools : []).find((s) => s.id === form.schoolId) || null}
            onChange={(e, newValue) => setForm({ ...form, schoolId: newValue ? newValue.id : '' })}
            inputValue={schoolInput}
            onInputChange={(e, newInput) => setSchoolInput(newInput)}
            getOptionLabel={(option) => {
              if (!option) return '';
              const list = Array.isArray(schools) ? schools : [];
              const sameNameSchools = list.filter((s) => s.name === option.name);
              return sameNameSchools.length > 1 ? `${option.name} (${option.address})` : option.name;
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField {...params} margin="normal" fullWidth label="School" required error={!!errors.schoolId} helperText={errors.schoolId} />
            )}
          />
          <TextField
            margin="normal"
            fullWidth
            select
            label="Year"
            name="year"
            value={form.year}
            onChange={handleChange}
            required
            error={!!errors.year}
            helperText={errors.year}
          >
            {(() => {
              const currentYear = new Date().getFullYear();
              return Array.from({ length: 11 }, (_, i) => (
                <MenuItem key={currentYear - i} value={currentYear - i}>{currentYear - i}</MenuItem>
              ));
            })()}
          </TextField>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end', gap: 1, p: 2 }}>
  <Button onClick={handleClose} size="small">Cancel</Button>
  <GradientButton onClick={handleSubmit} size="small">{editId ? 'Update' : 'Create'}</GradientButton>
</DialogActions>
      </Dialog>
      
    </BackgroundFX>
  );
};

export default ClassList;