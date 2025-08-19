import React, { useContext, useEffect, useState } from 'react';
import { Box, CardHeader, CardContent, Typography, Button, TextField, MenuItem, Snackbar, Alert, DialogActions, Stack, Checkbox, IconButton, Autocomplete, CircularProgress, Tooltip } from '@mui/material';
import GlassCard from '../../../shared/components/ui/GlassCard';
import GradientButton from '../../../shared/components/ui/GradientButton';
import BackgroundFX from '../../../shared/components/ui/BackgroundFX';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import RemoveShoppingCartRounded from '@mui/icons-material/RemoveShoppingCartRounded';
import ShoppingCartCheckoutRounded from '@mui/icons-material/ShoppingCartCheckoutRounded';
import { DataGrid } from '@mui/x-data-grid';
import { motion } from 'framer-motion';
import schoolService from '../../../api/schools.api';
import classService from '../../../api/classes.api';
import listService from '../../../api/lists.api';
import tempOrderService from '../../../api/tempOrders.api';
import customerBookOrderService from '../../../api/orders.api';
import { AuthContext } from '../../../shared/contexts/AuthContext';

const CustomerOrderFlow = () => {
  const { user } = useContext(AuthContext);
  const isUser = user?.roles?.includes('ROLE_USER');

  // All hooks must be called unconditionally at the top level!
  const [schools, setSchools] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [year, setYear] = useState('');
  // Autocomplete state for scalable search
  const [schoolQuery, setSchoolQuery] = useState('');
  const [schoolOptions, setSchoolOptions] = useState([]);
  const [schoolLoading, setSchoolLoading] = useState(false);
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [initialSchoolsLoaded, setInitialSchoolsLoaded] = useState(false);
  const currentYear = new Date().getFullYear();
  const [officialList, setOfficialList] = useState([]);
  // Items for the currently loaded school/class/year selection
  const [currentItems, setCurrentItems] = useState([]);
  // Accumulated items across multiple selections (possibly multiple schools)
  const [accumulatedItems, setAccumulatedItems] = useState([]);
  // Selection state for current list (by bookId)
  const [selectedIds, setSelectedIds] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  // No pagination for now; hide footer to avoid GridFooter crash in v8
  // Stable key resolver for rows regardless of backend shape
  const getRowKey = (row) => String(row?.bookId ?? row?.id ?? row?.book?.id ?? row?.listBookId ?? '');
  // Optional target draft (when navigated from My Orders with Add Items)
  const urlParams = new URLSearchParams(window.location.search);
  const targetDraftId = urlParams.get('draftId');

  const currency = (n) => {
    const val = Number(n || 0);
    return `$${val.toFixed(2)}`;
  };

  const getBasePrice = (row) => Number(row.price ?? row.bookPrice ?? row.unitPrice ?? 0);
  const getUnitPrice = (row) => (row.conditionType === 'USED' ? getBasePrice(row) * 0.5 : getBasePrice(row));
  const getSubtotal = (row) => getUnitPrice(row) * Number(row.quantity || 0);

  // Helper to normalize any API payload to an array
  const toArray = (val) => {
    if (Array.isArray(val)) return val;
    if (val && Array.isArray(val.content)) return val.content;
    return [];
  };

  // Initial fetch (optional) and search-as-you-type for schools
  useEffect(() => {
    // Load a small initial set for first open
    schoolService.getSchools().then(res => {
      const arr = toArray(res?.data);
      setSchools(arr);
      setSchoolOptions(arr);
    }).catch(() => {
      setSchools([]);
      setSchoolOptions([]);
    }).finally(() => {
      setInitialSchoolsLoaded(true);
    });
  }, []);

  useEffect(() => {
    let active = true;
    // Debounce search
    const handle = setTimeout(async () => {
      try {
        setSchoolLoading(true);
        const q = schoolQuery?.trim();
        let data = [];
        if (q) {
          const res = await schoolService.searchSchools(q);
          data = toArray(res?.data);
        } else {
          // Fallback to cached list to avoid large fetches
          data = toArray(schools);
        }
        if (active) setSchoolOptions(data);
      } catch (_) {
        if (active) setSchoolOptions([]);
      } finally {
        if (active) setSchoolLoading(false);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [schoolQuery, schools]);

  useEffect(() => {
    if (selectedSchool) {
      classService.getClassesBySchool(selectedSchool)
        .then(res => setClasses(toArray(res?.data)))
        .catch(() => setClasses([]));
    } else {
      setClasses([]);
    }
    setSelectedClass('');
    setYear('');
    setOfficialList([]);
    setCurrentItems([]);
    setSelectedIds([]);
  }, [selectedSchool]);

  const fetchList = async () => {
    try {
      // Do NOT pass schoolId to avoid over-filtering if backend doesn't support it
      const res = await customerBookOrderService.getOfficialList(selectedClass, year);
      let listBooks = [];
      const cid = Number(selectedClass);
      const yr = Number(year);

      if (Array.isArray(res.data)) {
        // Some backends return an array; filter by class/year
        const match = res.data.find(l => Number(l.classId) === cid && Number(l.year) === yr);
        if (match?.id) {
          const booksRes = await listService.getListBooks(match.id);
          listBooks = booksRes.data || [];
        }
      } else if (res.data && typeof res.data === 'object') {
        // Support pageable shape { content: [...] }
        if (Array.isArray(res.data.content)) {
          const match = res.data.content.find(l => Number(l.classId) === cid && Number(l.year) === yr);
          if (match?.id) {
            const booksRes = await listService.getListBooks(match.id);
            listBooks = booksRes.data || [];
          }
        }
        if (Array.isArray(res.data.listBooks)) {
          listBooks = res.data.listBooks;
        } else if (res.data.id) {
          // List without embedded books, fetch them
          const booksRes = await listService.getListBooks(res.data.id);
          listBooks = booksRes.data || [];
        }
      }

      // If nothing found yet, try fallback via all lists
      if (!listBooks.length) {
        try {
          const all = await listService.getLists();
          const match = (all.data || []).find(l => Number(l.classId) === cid && Number(l.year) === yr);
          if (match) {
            const booksRes = await listService.getListBooks(match.id);
            listBooks = booksRes.data || [];
          }
        } catch (_) {
          // ignore, handled by final error
        }
      }

      if (!listBooks.length) {
        throw new Error('NO_LIST_MATCH');
      }

      setOfficialList(listBooks);
      const schoolsArr = toArray(schools);
      const classesArr = toArray(classes);
      const scName = (schoolsArr.find(s => String(s.id) === String(selectedSchool))?.name) || String(selectedSchool);
      const clName = (classesArr.find(c => String(c.id) === String(selectedClass))?.name) || String(selectedClass);
      setCurrentItems(listBooks.map(book => ({
        id: book.bookId ?? book.id,
        ...book,
        quantity: 1,
        conditionType: 'NEW',
        schoolId: selectedSchool,
        classId: selectedClass,
        schoolName: scName,
        className: clName,
        year: Number(year),
      })));
      // By default nothing selected; user can select all or specific
      setSelectedIds([]);
    } catch (error) {
      setOfficialList([]);
      setCurrentItems([]);
      const status = error?.response?.status;
      const serverMsg = typeof error?.response?.data === 'string' ? error.response.data : '';
      let message = `No official list found for this class/year (classId=${selectedClass}, year=${year}).`;
      if (status === 403) message = 'You do not have permission to view lists. Please sign in as a customer.';
      else if (status === 404) message = 'No official list found for this class/year.';
      else if (status === 400) message = 'Invalid selection. Please reselect school/class/year.';
      if (serverMsg) message = serverMsg;
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  const handleOrderChange = (idx, field, value) => {
    setCurrentItems(items =>
      items.map((item, i) => i === idx ? { ...item, [field]: value } : item)
    );
  };

  const handleAddCurrentSelection = () => {
    if (!currentItems.length) {
      setSnackbar({ open: true, message: 'Load a list first before adding.', severity: 'warning' });
      return;
    }
    if (!selectedIds.length) {
      setSnackbar({ open: true, message: 'Select at least one book using the checkboxes.', severity: 'warning' });
      return;
    }
    const chosen = currentItems.filter(it => selectedIds.includes(getRowKey(it)));
    if (!chosen.length) {
      setSnackbar({ open: true, message: 'No books selected.', severity: 'warning' });
      return;
    }
    const normalized = chosen.map(it => ({
      ...it,
      unitPrice: getUnitPrice(it),
      subtotal: getUnitPrice(it) * Number(it.quantity || 0),
    }));
    setAccumulatedItems(prev => [...prev, ...normalized]);
    setSnackbar({ open: true, message: 'Selected books added to order.', severity: 'success' });
    setOfficialList([]);
    setCurrentItems([]);
    setSelectedIds([]);
  };

  const handleAddAllCurrentSelection = () => {
    if (!currentItems.length) {
      setSnackbar({ open: true, message: 'Load a list first before adding.', severity: 'warning' });
      return;
    }
    const normalized = currentItems.map(it => ({
      ...it,
      unitPrice: getUnitPrice(it),
      subtotal: getUnitPrice(it) * Number(it.quantity || 0),
    }));
    setAccumulatedItems(prev => [...prev, ...normalized]);
    setSnackbar({ open: true, message: 'Entire list added to order.', severity: 'success' });
    setOfficialList([]);
    setCurrentItems([]);
    setSelectedIds([]);
  };

  // Cart (accumulated) editing helpers
  const handleAccumulatedChange = (idx, field, value) => {
    setAccumulatedItems(items => items.map((it, i) => {
      if (i !== idx) return it;
      const updated = { ...it, [field]: value };
      const unit = getUnitPrice(updated);
      const sub = getSubtotal(updated);
      return { ...updated, unitPrice: unit, subtotal: sub };
    }));
  };

  const handleRemoveAccumulated = (idx) => {
    setAccumulatedItems(items => items.filter((_, i) => i !== idx));
  };

  const handleClearCart = () => {
    setAccumulatedItems([]);
  };

  const handleSubmitOrder = async () => {
    try {
      const itemsToSubmit = (accumulatedItems.length ? accumulatedItems : currentItems);
      if (!itemsToSubmit.length) {
        setSnackbar({ open: true, message: 'Your order is empty. Add at least one selection.', severity: 'warning' });
        return;
      }
      const itemsPayload = itemsToSubmit.map(item => ({
        bookId: item.bookId,
        quantity: Number(item.quantity || 1),
        conditionType: item.conditionType,
        officialListId: item.listId,
        schoolId: item.schoolId,
        classId: item.classId,
        year: Number(item.year)
      }));
      if (targetDraftId) {
        // Add to the specific draft (could be SUBMITTED); do not submit here
        await tempOrderService.addItemsTo(targetDraftId, itemsPayload);
        setSnackbar({ open: true, message: 'Items added to your draft.', severity: 'success' });
      } else {
        // Create or get my draft, add items, then submit
        const draftRes = await tempOrderService.getMyDraft();
        const draftId = draftRes?.data?.id;
        await tempOrderService.addItems(itemsPayload);
        await tempOrderService.submit(draftId);
        setSnackbar({ open: true, message: 'Draft submitted for approval!', severity: 'success' });
      }
      // Clear after success
      setAccumulatedItems([]);
      setOfficialList([]);
      setCurrentItems([]);
    } catch (error) {
      const status = error?.response?.status;
      const serverMsg = typeof error?.response?.data === 'string' ? error.response.data : (error?.message || '');
      let message = 'Error submitting draft order.';
      if (status === 400) message = 'Invalid order data. Please review your selections.';
      else if (status === 404) message = 'Official list or one of the books was not found.';
      else if (status === 409) message = 'Book already exists in this draft. You can modify the quantity instead.';
      else if (serverMsg) message = serverMsg;
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  if (!isUser) return null;

  // If there are no schools available AFTER the initial fetch has completed, show a friendly message
  const noSchools = initialSchoolsLoaded && toArray(schools).length === 0;

  return (
    <BackgroundFX>
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {noSchools && (
        <GlassCard elevation={6} sx={{ borderRadius: 3, mb: 3 }}>
          <CardHeader title={<Typography variant="h6">Ordering Unavailable</Typography>} />
          <CardContent>
            <Typography variant="body1">
              The ordering workflow is currently unavailable because no schools are set up. Please check back later or contact support.
            </Typography>
          </CardContent>
        </GlassCard>
      )}
      <GlassCard elevation={6} sx={{ borderRadius: 3, mb: 3 }}>
        <CardHeader title={<Typography variant="h5">Place Order</Typography>} />
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Autocomplete
              open={schoolOpen}
              onOpen={() => setSchoolOpen(true)}
              onClose={() => setSchoolOpen(false)}
              loading={schoolLoading}
              options={toArray(schoolOptions)}
              getOptionLabel={(opt) => {
                const name = opt?.name || '';
                const addr = opt?.address ? ` — ${opt.address}` : '';
                return `${name}${addr}`;
              }}
              isOptionEqualToValue={(opt, val) => String(opt?.id) === String(val?.id)}
              value={toArray(schools).find(s => String(s.id) === String(selectedSchool)) || null}
              onChange={(_, val) => setSelectedSchool(val?.id ? String(val.id) : '')}
              onInputChange={(_, val) => setSchoolQuery(val)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="School"
                  placeholder="Search school..."
                  sx={{ minWidth: 240 }}
                  slotProps={{
                    input: {
                      ...(params?.InputProps || {}),
                      endAdornment: (
                        <>
                          {schoolLoading ? <CircularProgress color="inherit" size={16} /> : null}
                          {params?.InputProps?.endAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
            />
            <Autocomplete
              options={toArray(classes)}
              getOptionLabel={(opt) => opt?.name || ''}
              isOptionEqualToValue={(opt, val) => String(opt?.id) === String(val?.id)}
              value={toArray(classes).find(c => String(c.id) === String(selectedClass)) || null}
              onChange={(_, val) => setSelectedClass(val?.id ? String(val.id) : '')}
              renderInput={(params) => (
                <TextField {...params} label="Class" placeholder={!selectedSchool ? 'Select a school first' : 'Search class...'} sx={{ minWidth: 200 }} disabled={!selectedSchool} />
              )}
            />
            <TextField
              select
              label="Year"
              value={year}
              disabled={!selectedClass}
              onChange={e => setYear(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              {Array.from({ length: 11 }, (_, i) => {
                const y = currentYear - i;
                return <MenuItem key={y} value={y}>{y}</MenuItem>;
              })}
            </TextField>
            <Tooltip title="Load the official list for the selected class and year">
              <span>
                <GradientButton onClick={fetchList} aria-label="Load official list" disabled={!selectedClass || !year}>Load List</GradientButton>
              </span>
            </Tooltip>
            <Tooltip title="Add all books from the current list to your order">
              <span>
                <Button variant="outlined" onClick={handleAddAllCurrentSelection} aria-label="Add entire list" disabled={!currentItems.length}>Add Entire List</Button>
              </span>
            </Tooltip>
          </Box>
        </CardContent>
      </GlassCard>
      {officialList.length > 0 && (
        <GlassCard elevation={6} sx={{ borderRadius: 3, mb: 3 }}>
          <CardHeader title={<Typography variant="h6">Official Book List</Typography>} />
          <CardContent>
            <Box sx={{ height: 480, width: '100%' }}>
              <DataGrid
                rows={currentItems}
                columns={[
                  {
                    field: '__select__',
                    headerName: '',
                    width: 50,
                    sortable: false,
                    filterable: false,
                    disableColumnMenu: true,
                    renderCell: (params) => {
                      const key = getRowKey(params?.row || {});
                      const checked = selectedIds.includes(key);
                      return (
                        <Checkbox
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...new Set([...selectedIds, key])]
                              : selectedIds.filter((id) => id !== key);
                            setSelectedIds(next);
                          }}
                          size="small"
                        />
                      );
                    },
                  },
                  {
                    field: 'bookTitle',
                    headerName: 'Title',
                    flex: 1.4,
                  },
                  {
                    field: 'bookAuthor',
                    headerName: 'Author',
                    flex: 1,
                  },
                  {
                    field: 'quantity',
                    headerName: 'Qty',
                    flex: 0.6,
                    renderCell: ({ row }) => (
                      <TextField
                        type="number"
                        value={row.quantity}
                        onChange={e => handleOrderChange(currentItems.findIndex(i => i.bookId === row.bookId), 'quantity', Math.max(1, Number(e.target.value)))}
                        inputProps={{ min: 1, style: { width: 60 } }}
                        size="small"
                      />
                    ),
                  },
                  {
                    field: 'conditionType',
                    headerName: 'Condition',
                    flex: 0.8,
                    renderCell: ({ row }) => (
                      <TextField
                        select
                        value={row.conditionType}
                        onChange={e => handleOrderChange(currentItems.findIndex(i => i.bookId === row.bookId), 'conditionType', e.target.value)}
                        size="small"
                      >
                        <MenuItem value="NEW">New</MenuItem>
                        <MenuItem value="USED">Used</MenuItem>
                      </TextField>
                    ),
                  },
                  {
                    field: 'unitPrice',
                    headerName: 'Unit Price',
                    flex: 0.8,
                    renderCell: (params) => currency(getUnitPrice(params?.row || {})),
                  },
                  {
                    field: 'subtotal',
                    headerName: 'Subtotal',
                    flex: 0.8,
                    renderCell: (params) => currency(getSubtotal(params?.row || {})),
                  },
                ]}
                hideFooter
                getRowId={row => getRowKey(row)}
                sx={(theme) => ({ borderRadius: 2, backgroundColor: theme.palette.background.paper, boxShadow: theme.shadows[1], mt: 2 })}
                autoHeight
                loading={false}
                localeText={{ noRowsLabel: 'No books found.' }}
              />
            </Box>
            <DialogActions sx={{ justifyContent: 'flex-end', gap: 1, p: 2 }}>
              <Tooltip title="Close this list without adding items">
                <Button onClick={() => {}} aria-label="Cancel" size="small">Cancel</Button>
              </Tooltip>
              <Tooltip title="Add all checked books to your order">
                <span>
                  <Button onClick={handleAddCurrentSelection} aria-label="Add selected books" variant="outlined" size="small">Add Selected</Button>
                </span>
              </Tooltip>
              <Tooltip title="Create or update your draft with the current items">
                <span>
                  <GradientButton onClick={handleSubmitOrder} aria-label="Place order" size="small">Place Order</GradientButton>
                </span>
              </Tooltip>
            </DialogActions>
          </CardContent>
        </GlassCard>
      )}
      {currentItems.length > 0 && (
        <GlassCard elevation={4} sx={{ mb: 2 }}>
          <CardContent sx={{ pt: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={1}>
                <Tooltip title="Select all books in the list">
                  <Button size="small" aria-label="Select all" onClick={() => setSelectedIds(currentItems.map(i => getRowKey(i)))}>Select All</Button>
                </Tooltip>
                <Tooltip title="Clear all current selections">
                  <Button size="small" aria-label="Clear selection" onClick={() => setSelectedIds([])}>Clear Selection</Button>
                </Tooltip>
              </Stack>
              <Typography variant="body2">
                Selected: <b>{selectedIds.length}</b>
              </Typography>
            </Stack>
          </CardContent>
        </GlassCard>
      )}
      {accumulatedItems.length > 0 && (
        <GlassCard elevation={6} sx={{ borderRadius: 3, mb: 3 }}>
          <CardHeader title={<Typography variant="h6">Items in Your Order ({accumulatedItems.length})</Typography>} />
          <CardContent>
            <Box sx={{ overflowX: 'auto' }}>
              <Box
                component="table"
                sx={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  bgcolor: (t) => t.palette.background.paper,
                  color: (t) => t.palette.text.primary,
                  borderRadius: 1,
                  boxShadow: (t) => t.shadows[1],
                  '& thead': {
                    bgcolor: 'rgba(15,23,42,0.035)'
                  },
                  '& th, & td': { p: 1 },
                  '& tr': { borderBottom: '1px solid', borderColor: (t) => t.palette.divider },
                  '& tbody tr:hover': { bgcolor: 'rgba(15,23,42,0.03)' }
                }}
              >
                <Box component="thead">
                  <Box component="tr">
                    <Box component="th" sx={{ textAlign: 'left' }}>Title</Box>
                    <Box component="th" sx={{ textAlign: 'left' }}>Author</Box>
                    <Box component="th">Qty</Box>
                    <Box component="th">Condition</Box>
                    <Box component="th">Unit Price</Box>
                    <Box component="th">Subtotal</Box>
                    <Box component="th">School</Box>
                    <Box component="th">Class</Box>
                    <Box component="th">Year</Box>
                    <Box component="th">Actions</Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  {accumulatedItems.map((item, idx) => (
                    <motion.tr
                      key={`${item.bookId}-${idx}`}
                      style={{}}
                      whileHover={{}}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                    >
                      <Box component="td" sx={(theme) => ({ p: 1, borderColor: theme.palette.divider, borderBottom: '1px solid', '&:last-child': { borderRight: '1px solid' } })}><b>{item.bookTitle}</b></Box>
                      <Box component="td" sx={(theme) => ({ p: 1, borderColor: theme.palette.divider, borderBottom: '1px solid', '&:last-child': { borderRight: '1px solid' } })}>{item.bookAuthor}</Box>
                      <Box component="td" sx={(theme) => ({ p: 1, borderColor: theme.palette.divider, borderBottom: '1px solid', '&:last-child': { borderRight: '1px solid' }, textAlign: 'center' })}>
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={e => handleAccumulatedChange(idx, 'quantity', Math.max(1, Number(e.target.value)))}
                          inputProps={{ min: 1, style: { width: 60 } }}
                          size="small"
                        />
                      </Box>
                      <Box component="td" sx={(theme) => ({ p: 1, borderColor: theme.palette.divider, borderBottom: '1px solid', '&:last-child': { borderRight: '1px solid' }, textAlign: 'center' })}>
                        <TextField
                          select
                          value={item.conditionType}
                          onChange={e => handleAccumulatedChange(idx, 'conditionType', e.target.value)}
                          size="small"
                        >
                          <MenuItem value="NEW">New</MenuItem>
                          <MenuItem value="USED">Used</MenuItem>
                        </TextField>
                      </Box>
                      <Box component="td" sx={(theme) => ({ p: 1, borderColor: theme.palette.divider, borderBottom: '1px solid', '&:last-child': { borderRight: '1px solid' }, textAlign: 'center' })}>{currency(getUnitPrice(item))}</Box>
                      <Box component="td" sx={(theme) => ({ p: 1, borderColor: theme.palette.divider, borderBottom: '1px solid', '&:last-child': { borderRight: '1px solid' }, textAlign: 'center' })}>{currency(getSubtotal(item))}</Box>
                      <Box component="td" sx={(theme) => ({ p: 1, borderColor: theme.palette.divider, borderBottom: '1px solid', '&:last-child': { borderRight: '1px solid' }, textAlign: 'center' })}>{item.schoolName || item.schoolId}</Box>
                      <Box component="td" sx={(theme) => ({ p: 1, borderColor: theme.palette.divider, borderBottom: '1px solid', '&:last-child': { borderRight: '1px solid' }, textAlign: 'center' })}>{item.className || item.classId}</Box>
                      <Box component="td" sx={(theme) => ({ p: 1, borderColor: theme.palette.divider, borderBottom: '1px solid', '&:last-child': { borderRight: '1px solid' }, textAlign: 'center' })}>{item.year}</Box>
                      <Box component="td" sx={(theme) => ({ p: 1, borderColor: theme.palette.divider, borderBottom: '1px solid', '&:last-child': { borderRight: '1px solid' }, textAlign: 'center' })}>
                        <Tooltip title="Remove item">
                          <IconButton color="error" size="small" aria-label="Remove item" onClick={() => handleRemoveAccumulated(idx)}>
                            <DeleteOutlineRounded />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </motion.tr>
                  ))}
                </Box>
              </Box>
            </Box>
            <Box sx={(theme) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, gap: 2, flexWrap: 'wrap', backgroundColor: theme.palette.background.paper, borderRadius: 1, boxShadow: theme.shadows[1], p: 1.5 })}>
              <Tooltip title="Remove all items from your order">
                <span>
                  <Button startIcon={<RemoveShoppingCartRounded />} color="inherit" aria-label="Clear cart" onClick={handleClearCart}>
                    Clear Cart
                  </Button>
                </span>
              </Tooltip>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="subtitle1">
                  Total: <b>{currency(accumulatedItems.reduce((sum, it) => sum + getSubtotal(it), 0))}</b>
                </Typography>
                <Tooltip title="Create or update your draft with the current items">
                  <span>
                    <GradientButton onClick={handleSubmitOrder} aria-label="Place order" startIcon={<ShoppingCartCheckoutRounded />}>Place Order</GradientButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
          </CardContent>
        </GlassCard>
      )}
      {accumulatedItems.length === 0 && (
        <GlassCard elevation={4} sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>Your cart is empty</Typography>
            <Typography variant="body2" color="text.secondary">
              Browse the official list, select books, and click "Add Selected" to build your order.
            </Typography>
          </CardContent>
        </GlassCard>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
    </BackgroundFX>
  );
};

export default CustomerOrderFlow;