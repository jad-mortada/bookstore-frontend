// YearlyBookListManagement.js (Restored pre-layout-change logic)
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Snackbar, Alert, MenuItem, Tooltip, Typography, Card, CardHeader, CardContent
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { AddRounded, EditRounded, DeleteOutlineRounded, MenuBookRounded } from '@mui/icons-material';
import { AuthContext } from '../../../shared/contexts/AuthContext';
import { useLoading } from '../../../shared/contexts/LoadingContext';
import classService from '../../../api/classes.api';
import listService from '../../../api/lists.api';
import schoolService from '../../../api/schools.api';
import BackgroundFX from '../../../shared/components/effects/BackgroundFX';
import GlassCard from '../../../shared/components/ui/GlassCard';
import GradientButton from '../../../shared/components/ui/GradientButton';
import SectionHeader from '../../../shared/components/ui/SectionHeader';

const initialForm = { classId: '', year: '' };

const YearlyBookListManagement = () => {
  const { setLoading } = useLoading();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_SUPER_ADMIN');
  const [lists, setLists] = useState([]);
  const [classes, setClasses] = useState([]);
  const [schools, setSchools] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const addButtonRef = useRef();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);
  const [loadingState, setLoadingState] = useState({ loading: true, error: null });
  // Book viewing dialog state
  const [viewBooksOpen, setViewBooksOpen] = useState(false);
  const [viewBooksListId, setViewBooksListId] = useState(null);
  const [viewBooks, setViewBooks] = useState([]);
  const [viewBooksLoading, setViewBooksLoading] = useState(false);

  // Load all data on mount
  useEffect(() => {
    setLoadingState({ loading: true, error: null });
    Promise.all([
      classService.getClasses(),
      schoolService.getSchools()
    ]).then(([classRes, schoolRes]) => {
      setClasses(classRes.data || []);
      setSchools(schoolRes.data || []);
      setLoadingState({ loading: false, error: null });
    }).catch(() => {
      setLoadingState({ loading: false, error: 'Failed to load required data. Please try again later.' });
    });
  }, []);

  // Only fetch lists after both classes and schools are loaded
  useEffect(() => {
    if (classes.length && schools.length) {
      fetchLists();
    }
    // eslint-disable-next-line
  }, [classes, schools]);

  // Compute school-class display when fetching lists
  const fetchLists = async () => {
    try {
      const res = await listService.getLists();
      const newLists = (res.data || []).map((item, idx) => {
        const cls = classes.find(c => String(c.id) === String(item.classId));
        const school = cls && schools.find(s => String(s.id) === String(cls.schoolId));
        let schoolDisplay = '';
        if (cls && school) {
          const sameNameSchools = schools.filter(s => s.name === school.name);
          schoolDisplay = sameNameSchools.length > 1
            ? `${school.name} (${school.address})`
            : school.name;
          return {
            ...item,
            id: item.id || item.listId || idx,
            schoolClassDisplay: `${schoolDisplay} - ${cls.name}`
          };
        }
        return {
          ...item,
          id: item.id || item.listId || idx,
          schoolClassDisplay: ''
        };
      });
      setLists(newLists);
    } finally {
      setLoading(false);
    }
  }

  // Dialog open/close
  const handleOpen = (list = initialForm) => { setForm(list); setEditId(list.id || null); setOpen(true); };
  const handleClose = () => { setOpen(false); setForm(initialForm); setEditId(null); setTimeout(() => { if (addButtonRef.current) addButtonRef.current.focus(); }, 0); };
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Submit (add/edit)
  const handleSubmit = async () => {
    try {
      if (editId) {
        await listService.updateList(editId, form);
        setSnackbar({ open: true, message: 'List updated!', severity: 'success' });
      } else {
        await listService.createList(form);
        setSnackbar({ open: true, message: 'List created!', severity: 'success' });
      }
      handleClose();
      try { await fetchLists(); } catch {}
    } catch (error) {
      const status = error?.response?.status;
      const serverMsg = typeof error?.response?.data === 'string' ? error.response.data : (error?.message || '');
      let message = 'Error saving list';
      if (status === 409) {
        // Duplicate list (class + year) or other duplicates
        message = 'A yearly list for the selected class and year already exists.';
      } else if (status === 400) {
        message = 'Please check the form fields. Some inputs are invalid.';
      } else if (status === 404) {
        message = 'The selected class was not found.';
      } else if (status === 403) {
        message = 'You do not have permission to perform this action.';
      } else if (serverMsg) {
        message = serverMsg;
      }
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (id === undefined || id === null) {
      setSnackbar({ open: true, message: 'Invalid list ID.', severity: 'error' });
      return;
    }
    if (window.confirm('Delete this list?')) {
      setLoading(true);
      try {
        await listService.deleteList(id);
        setSnackbar({ open: true, message: 'List deleted!', severity: 'success' });
        await fetchLists();
      } catch (error) {
        const status = error?.response?.status;
        const data = error?.response?.data;
        const serverMsg = typeof data === 'string' ? data : (data?.message || error?.message || 'Unknown error');
        let message = `Error deleting list: ${serverMsg}`;
        if (status === 404) message = 'List not found.';
        if (status === 403) message = 'You do not have permission to perform this action.';
        setSnackbar({ open: true, message, severity: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };



  // View books in a list
  const handleViewBooks = async (listId) => {
    setViewBooksOpen(true);
    setViewBooksListId(listId);
    setViewBooksLoading(true);
    try {
      const res = await listService.getListBooks(listId);
      setViewBooks(res.data || []);
    } catch {
      setViewBooks([]);
    } finally {
      setViewBooksLoading(false);
    }
  };

  // Remove (unlink) a book from a list
  const handleUnlinkBook = async (listBookId) => {
    setViewBooksLoading(true);
    try {
      await listService.unlinkBookFromList(listBookId);
      setSnackbar({ open: true, message: 'Book removed from list!', severity: 'success' });
      // Refresh
      const res = await listService.getListBooks(viewBooksListId);
      setViewBooks(res.data || []);
    } catch {
      setSnackbar({ open: true, message: 'Error removing book from list', severity: 'error' });
    } finally {
      setViewBooksLoading(false);
    }
  };

  // Defensive: wait for all data
  if (!isAdmin) return null;
  if (loadingState.loading) {
    return (
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '100%', mx: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Card elevation={3} sx={{ borderRadius: 3, width: '100%' }}>
          <CardHeader title={<Typography variant="h5">Yearly Book Lists</Typography>} />
          <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <span className="MuiCircularProgress-root MuiCircularProgress-indeterminate" style={{ width: 40, height: 40, marginBottom: 16 }}>
                <svg viewBox="22 22 44 44"><circle className="MuiCircularProgress-circle" cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" /></svg>
              </span>
              <Typography variant="body1">Loading data...</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }
  if (loadingState.error) {
    return (
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '100%', mx: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Card elevation={3} sx={{ borderRadius: 3, width: '100%' }}>
          <CardHeader title={<Typography variant="h5">Yearly Book Lists</Typography>} />
          <CardContent>
            <Alert severity="error">{loadingState.error}</Alert>
          </CardContent>
        </Card>
      </Box>
    );
  }
  if (!classes.length || !schools.length) {
    return (
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '100%', mx: 0 }}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardHeader title={<Typography variant="h5">Yearly Book Lists</Typography>} />
          <CardContent>
            <Typography variant="body1">No classes or schools available.</Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <BackgroundFX>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '100%', mx: 0 }}>
        <GlassCard sx={{ p: { xs: 2, md: 3 }, border: '1px solid rgba(15,23,42,0.08)' }}>
          <SectionHeader title="Yearly Book Lists" subtitle="Create and manage yearly lists by class." />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              label="Search lists"
              placeholder="Search by school, class, year"
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
              <Tooltip title="Create a new yearly list">
                <span>
                  <GradientButton startIcon={<AddRounded />} onClick={() => handleOpen()} aria-label="Add yearly list">
                    Add List
                  </GradientButton>
                </span>
              </Tooltip>
            )}
          </Box>
          <Box sx={{ height: 480, width: '100%' }}>
            <DataGrid
              rows={(Array.isArray(lists) ? lists : []).filter((r) => {
                const q = String(debouncedSearch || '').trim().toLowerCase();
                if (!q) return true;
                const hay = [r.schoolClassDisplay, r.year]
                  .filter(v => v !== undefined && v !== null)
                  .map(v => String(v).toLowerCase())
                  .join(' ');
                return hay.includes(q);
              })}
              columns={[
                { field: 'schoolClassDisplay', headerName: 'School — Class', flex: 1.5 },
                { field: 'year', headerName: 'Year', flex: 0.5 },
                {
                  field: 'actions',
                  headerName: 'Actions',
                  flex: 1,
                  sortable: false,
                  renderCell: ({ row }) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Tooltip title="View books in this list">
                        <IconButton color="primary" onClick={() => handleViewBooks(row.id)} aria-label={`View books for list ${row.className || ''} ${row.year || ''}`}>
                          <MenuBookRounded />
                        </IconButton>
                      </Tooltip>
                      {isAdmin && (
                        <Box>
                          <Tooltip title="Edit list">
                            <IconButton onClick={() => handleOpen(row)} aria-label={`Edit list ${row.className || ''} ${row.year || ''}`}>
                              <EditRounded />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete list">
                            <IconButton color="error" onClick={() => handleDelete(row.id)} aria-label={`Delete list ${row.className || ''} ${row.year || ''}`}>
                              <DeleteOutlineRounded />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </Box>
                  ),
                  align: 'left',
                  headerAlign: 'left',
                },
              ]}
              pageSize={7}
              rowsPerPageOptions={[7, 14, 21]}
              disableSelectionOnClick
              getRowId={(row) => row?.id ?? row?.listId ?? `${row?.schoolClassDisplay || 'list'}-${row?.year || ''}`}
              sx={{ borderRadius: 2, backgroundColor: 'background.paper', boxShadow: 1 }}
              autoHeight={false}
              localeText={{ noRowsLabel: 'No lists found.' }}
            />
          </Box>
        </GlassCard>

        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>{editId ? 'Edit List' : 'Add List'}</DialogTitle>
          <DialogContent>
            <TextField
              margin="normal"
              fullWidth
              select
              label="Class"
              name="classId"
              value={form.classId}
              onChange={handleChange}
            >
              {classes.map(cls => {
                const school = schools.find(s => String(s.id) === String(cls.schoolId));
                const sameNameSchools = schools.filter(s => s.name === school?.name);
                const schoolDisplay = school ? (sameNameSchools.length > 1 ? `${school.name} (${school.address})` : school.name) : '';
                return (
                  <MenuItem key={cls.id} value={cls.id}>
                    {schoolDisplay} - {cls.name}
                  </MenuItem>
                );
              })}
            </TextField>
            <TextField
              margin="normal"
              fullWidth
              select
              label="Year"
              name="year"
              value={form.year}
              onChange={handleChange}
            >
              {(() => {
                const currentYear = new Date().getFullYear();
                return Array.from({ length: 15 }, (_, i) => currentYear - i).map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ));
              })()}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'flex-end', gap: 1, p: 2 }}>
            <Button onClick={handleClose} size="small">Cancel</Button>
            <GradientButton onClick={handleSubmit} size="small">{editId ? 'Update' : 'Create'}</GradientButton>
          </DialogActions>
        </Dialog>
        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>

        {/* View Books Dialog */}
        <Dialog open={viewBooksOpen} onClose={() => setViewBooksOpen(false)} fullWidth maxWidth="md">
          <DialogTitle>Books in List</DialogTitle>
          <DialogContent>
            {viewBooksLoading ? (
              <Typography>Loading books...</Typography>
            ) : viewBooks.length === 0 ? (
              <Typography>No books in this list.</Typography>
            ) : (
              <Box>
                {viewBooks.map(book => (
                  <Box key={book.listBookId || book.bookId || book.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ flex: 2 }}>{book.bookTitle || book.title}</Typography>
                    <Typography sx={{ flex: 1 }}>{book.bookAuthor || book.author || ''}</Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      sx={{ ml: 2 }}
                      onClick={() => handleUnlinkBook(book.id)}
                    >Remove</Button>
                  </Box>
                ))}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewBooksOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </BackgroundFX>
  );
};

export default YearlyBookListManagement;