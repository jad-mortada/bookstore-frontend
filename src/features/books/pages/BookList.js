// BookList.js (REBUILT FROM SCRATCH)
import React, { useState, useEffect, useContext } from 'react';
import { Box, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert, IconButton, Tooltip, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { AddRounded, EditRounded, DeleteOutlineRounded } from '@mui/icons-material';
import { AuthContext } from '../../../shared/contexts/AuthContext';
import { useLoading } from '../../../shared/contexts/LoadingContext';
import bookService from '../../../api/books.api';
import BackgroundFX from '../../../shared/components/ui/BackgroundFX';
import GlassCard from '../../../shared/components/ui/GlassCard';
import GradientButton from '../../../shared/components/ui/GradientButton';
import SectionHeader from '../../../shared/components/ui/SectionHeader';
import { resolveImageUrl } from '../../../shared/utils/image';

const initialForm = { title: '', author: '', isbn: '', publisher: '', price: '' };

const BookList = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_SUPER_ADMIN');

  const [books, setBooks] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { setLoading } = useLoading();
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState('');

  const fetchBooks = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = search
        ? await bookService.searchBooks(search)
        : await bookService.getBooks();
      const raw = Array.isArray(res?.data) ? res.data : [];
      const safe = raw
        .filter((row) => row && typeof row === 'object')
        .map((row, idx) => ({
          ...row,
          id: row.id ?? row.bookId ?? row._id ?? `tmp-book-${idx}`,
        }));
      setBooks(safe);
    } catch (error) {
      setErrorMessage('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  }, [search, setLoading]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks, search]);

  const handleOpen = (book = initialForm) => {
    setForm(book);
    setEditId(book.id || null);
    setOpen(true);
    setErrors({});
    setErrorMessage('');
    setImageFile(null);
    setImagePreview(book?.imageUrl || '');
  };

  const handleClose = () => {
    setOpen(false);
    setForm(initialForm);
    setEditId(null);
    setErrors({});
    setImageFile(null);
    setImagePreview('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear field-specific error as user edits
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Please fill out this field';
    if (!form.isbn.trim()) newErrors.isbn = 'Please fill out this field';
    if (!form.price || isNaN(Number(form.price))) newErrors.price = 'Please fill out this field';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    try {
      let savedId = editId;
      if (editId) {
        const res = await bookService.updateBook(editId, form);
        savedId = res?.data?.id ?? editId;
        setErrorMessage('');
      } else {
        const res = await bookService.createBook(form);
        savedId = res?.data?.id;
        setErrorMessage('');
      }
      // If an image is selected, upload it
      if (imageFile && savedId) {
        await bookService.uploadBookImage(savedId, imageFile);
      }
      handleClose();
      fetchBooks();
    } catch (error) {
      const status = error?.response?.status;
      const serverMsg = typeof error?.response?.data === 'string' ? error.response.data : '';
      let message = 'Error saving book';
      if (status === 409) {
        message = serverMsg || 'Book already exists with the same ISBN.';
        // Show directly under ISBN field
        setErrors(prev => ({ ...prev, isbn: message }));
        setErrorMessage('');
        return;
      } else if (status === 400) {
        message = serverMsg || 'Invalid data. Please check the fields.';
        // Heuristic mapping for common field validation
        if ((serverMsg || '').toLowerCase().includes('isbn')) {
          setErrors(prev => ({ ...prev, isbn: message }));
          setErrorMessage('');
          return;
        }
      } else if (status === 403) {
        message = 'Only admins can perform this action.';
      } else if (serverMsg) {
        message = serverMsg;
      }
      setErrorMessage(message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this book?')) {
      try {
        await bookService.deleteBook(id);
        setErrorMessage('');
        fetchBooks();
      } catch (error) {
        setErrorMessage('Error deleting book');
      }
    }
  };

  return (
    <BackgroundFX>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '100%', mx: 0 }}>
        {isAdmin ? (
          <GlassCard sx={{ p: { xs: 2, md: 3 }, border: '1px solid rgba(15,23,42,0.08)' }}>
            <SectionHeader title="Books" subtitle="Manage your bookstore catalog." />
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                sx={{ minWidth: 240, maxWidth: 400, flex: '1 1 280px' }}
              />
              <Tooltip title="Add a new book">
                <span>
                  <GradientButton startIcon={<AddRounded />} onClick={() => handleOpen()} aria-label="Add book">
                    Add Book
                  </GradientButton>
                </span>
              </Tooltip>
            </Box>
            {(!Array.isArray(books) || books.length === 0) ? (
              <Box sx={{ height: 480, display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>No books found</Typography>
                  <Typography variant="body2" color="text.secondary">Try adjusting your search or add a new book.</Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ height: 480, width: '100%' }}>
                <DataGrid
                  rows={Array.isArray(books) ? books : []}
                  columns={[
                    {
                      field: 'imageUrl',
                      headerName: 'Cover',
                      width: 60,
                      sortable: false,
                      renderCell: ({ row }) => (
                        row?.imageUrl ? (
                          <img
                            src={resolveImageUrl(row.imageUrl)}
                            alt={row.title || 'cover'}
                            style={{ width: 32, height: 44, objectFit: 'cover', borderRadius: 4, cursor: 'zoom-in' }}
                            onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                            onClick={() => { setPreviewSrc(resolveImageUrl(row.imageUrl)); setPreviewOpen(true); }}
                          />
                        ) : (
                          <Box sx={{ width: 32, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isAdmin && (
                              <Tooltip title="Add cover">
                                <IconButton size="small" onClick={() => handleOpen(row)} aria-label={`Add cover for ${row.title || 'book'}`}>
                                  <AddRounded fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        )
                      ),
                    },
                    { field: 'title', headerName: 'Title', flex: 1 },
                    { field: 'author', headerName: 'Author', flex: 1 },
                    { field: 'isbn', headerName: 'ISBN', flex: 1 },
                    { field: 'publisher', headerName: 'Publisher', flex: 1 },
                    { field: 'price', headerName: 'Price', flex: 1 },
                    {
                      field: 'actions',
                      headerName: 'Actions',
                      flex: 0.5,
                      sortable: false,
                      renderCell: ({ row }) => (
                        <Box>
                          <Tooltip title="Edit book">
                            <IconButton onClick={() => handleOpen(row)} aria-label={`Edit book ${row.title || ''}`}>
                              <EditRounded />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete book">
                            <IconButton color="error" onClick={() => handleDelete(row.id)} aria-label={`Delete book ${row.title || ''}`}>
                              <DeleteOutlineRounded />
                            </IconButton>
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
                  getRowId={(row) => row?.id ?? row?.bookId ?? row?._id ?? `${row?.isbn || row?.title || 'row'}-${row?.author || ''}`}
                  sx={{ borderRadius: 2, backgroundColor: 'background.paper', boxShadow: 1 }}
                  autoHeight={false}
                  localeText={{ noRowsLabel: 'No books found.' }}
                />
              </Box>
            )}
          </GlassCard>
        ) : (
          <Box sx={{ height: 480, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="h6">You are not authorized to access this page.</Typography>
          </Box>
        )}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? 'Edit Book' : 'Add Book'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            error={!!errors.title}
            helperText={errors.title}
            required
          />
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Cover image</Typography>
            {imagePreview ? (
              <img src={imagePreview} alt="preview" style={{ width: 96, height: 128, objectFit: 'cover', borderRadius: 6, border: '1px solid rgba(0,0,0,0.1)' }} />
            ) : (
              <Box sx={{ width: 96, height: 128, borderRadius: 1, bgcolor: 'action.hover', border: '1px dashed', borderColor: 'divider' }} />
            )}
            <Box sx={{ mt: 1 }}>
              <Button variant="outlined" component="label" size="small">
                {imageFile ? 'Change image' : 'Upload image'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      const reader = new FileReader();
                      reader.onload = (ev) => setImagePreview(ev.target?.result || '');
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </Button>
            </Box>
          </Box>
          <TextField
            margin="normal"
            fullWidth
            label="Author"
            name="author"
            value={form.author}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="ISBN"
            name="isbn"
            value={form.isbn}
            onChange={handleChange}
            error={!!errors.isbn}
            helperText={errors.isbn}
            required
          />
          <TextField
            margin="normal"
            fullWidth
            label="Publisher"
            name="publisher"
            value={form.publisher}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Price"
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            error={!!errors.price}
            helperText={errors.price}
            required
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end', gap: 1, p: 2 }}>
          <Button onClick={handleClose} size="small">
            Cancel
          </Button>
          <GradientButton onClick={handleSubmit} size="small">
            {editId ? 'Update' : 'Create'}
          </GradientButton>
        </DialogActions>
      </Dialog>
      {/* Image Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md">
        <DialogTitle>Cover Preview</DialogTitle>
        <DialogContent dividers>
          {previewSrc && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <img src={previewSrc} alt="cover" style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain' }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
    </BackgroundFX>
  );
};

export default BookList;