import React, { useContext, useEffect, useState } from 'react';
import { Box, CardHeader, CardContent, Typography, Button, TextField, MenuItem, Snackbar, Alert, Stack, Checkbox, IconButton, Autocomplete, CircularProgress, Tooltip } from '@mui/material';
import GlassCard from '../../../shared/components/ui/GlassCard';
import GradientButton from '../../../shared/components/ui/GradientButton';
import BackgroundFX from '../../../shared/components/ui/BackgroundFX';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import RemoveShoppingCartRounded from '@mui/icons-material/RemoveShoppingCartRounded';
import ShoppingCartCheckoutRounded from '@mui/icons-material/ShoppingCartCheckoutRounded';
import AddRounded from '@mui/icons-material/AddRounded';
import RemoveRounded from '@mui/icons-material/RemoveRounded';
import { DataGrid } from '@mui/x-data-grid';
import { motion } from 'framer-motion';
import schoolService from '../../../api/schools.api';
import classService from '../../../api/classes.api';
import listService from '../../../api/lists.api';
import tempOrderService from '../../../api/tempOrders.api';
import customerBookOrderService from '../../../api/orders.api';
import bookService from '../../../api/books.api';
import { AuthContext } from '../../../shared/contexts/AuthContext';
import { resolveImageUrl } from '../../../shared/utils/image';
import ImagePreviewDialog from '../../../shared/components/ImagePreviewDialog';

/**
 * CustomerOrderFlow Component
 * 
 * A comprehensive order management interface that allows customers to:
 * 1. Select a school, class, and academic year
 * 2. View the official book list for their selection
 * 3. Add books to their cart with quantity and condition preferences
 * 4. Review and submit their order
 * 5. Optionally save as a draft for later completion
 * 
 * The component handles the complete order workflow including:
 * - School/class/year selection with autocomplete
 * - Loading and displaying official book lists
 * - Managing shopping cart state
 * - Handling order submission and draft saving
 * - Providing feedback via snackbar notifications
 * 
 * @returns {JSX.Element} The rendered order flow interface
 */
const CustomerOrderFlow = () => {
  // Authentication context to check user role
  const { user } = useContext(AuthContext);
  const isUser = user?.roles?.includes('ROLE_USER');

  // School and class selection state
  const [schools, setSchools] = useState([]);              // All available schools
  const [classes, setClasses] = useState([]);              // Classes for selected school
  const [selectedSchool, setSelectedSchool] = useState(''); // Currently selected school ID
  const [selectedClass, setSelectedClass] = useState('');   // Currently selected class ID
  const [year, setYear] = useState('');                    // Selected academic year
  const currentYear = new Date().getFullYear();             // Current year for year selection

  // School search autocomplete state
  const [schoolQuery, setSchoolQuery] = useState('');       // Current search query for schools
  const [schoolOptions, setSchoolOptions] = useState([]);   // Filtered school options
  const [schoolLoading, setSchoolLoading] = useState(false); // Loading state for school search
  const [schoolOpen, setSchoolOpen] = useState(false);      // Autocomplete dropdown open state
  const [initialSchoolsLoaded, setInitialSchoolsLoaded] = useState(false); // Initial load complete flag

  // Book list and cart state
  const [officialList, setOfficialList] = useState([]);     // Currently loaded official book list
  const [currentItems, setCurrentItems] = useState([]);     // Items in the current list view
  const [accumulatedItems, setAccumulatedItems] = useState([]); // Items in the shopping cart
  const [selectedIds, setSelectedIds] = useState([]);       // Selected book IDs in current list

  // UI state
  const [snackbar, setSnackbar] = useState({               // Snackbar notification state
    open: false, 
    message: '', 
    severity: 'success' 
  });
  const [previewOpen, setPreviewOpen] = useState(false);    // Image preview dialog state
  const [previewSrc, setPreviewSrc] = useState('');         // Image source for preview dialog

  /**
   * Generates a stable row key for DataGrid rows
   * @param {Object} row - The row data object
   * @returns {string} A unique string identifier for the row
   */
  const getRowKey = (row) => String(row?.bookId ?? row?.id ?? row?.book?.id ?? row?.listBookId ?? '');
  
  // Check for draft ID in URL for "Add Items" flow
  const urlParams = new URLSearchParams(window.location.search);
  const targetDraftId = urlParams.get('draftId');

  /**
   * Formats a number as a currency string with 2 decimal places
   * @param {number|string} n - The number to format
   * @returns {string} Formatted currency string (e.g., "$12.34")
   */
  const currency = (n) => {
    const val = Number(n || 0);
    return `$${val.toFixed(2)}`;
  };

  /**
   * Extracts the base price from a book row, handling different property names
   * @param {Object} row - Book data object
   * @returns {number} The base price as a number
   */
  const getBasePrice = (row) => Number(row.price ?? row.bookPrice ?? row.unitPrice ?? 0);
  
  /**
   * Calculates the unit price based on book condition
   * Used books are 50% off the base price
   * @param {Object} row - Book data object with conditionType
   * @returns {number} The calculated unit price
   */
  const getUnitPrice = (row) => (row.conditionType === 'USED' ? getBasePrice(row) * 0.5 : getBasePrice(row));
  
  /**
   * Calculates the subtotal for a book (unit price × quantity)
   * @param {Object} row - Book data object with quantity
   * @returns {number} The calculated subtotal
   */
  const getSubtotal = (row) => getUnitPrice(row) * Number(row.quantity || 0);

  /**
   * Normalizes API responses to ensure we always work with an array
   * Handles different API response formats:
   * - Direct array: [item1, item2]
   * - Pageable object: { content: [item1, item2] }
   * - Any other case: returns empty array
   * @param {*} val - The value to normalize
   * @returns {Array} An array, possibly empty
   */
  const toArray = (val) => {
    if (Array.isArray(val)) return val;
    if (val && Array.isArray(val.content)) return val.content;
    return [];
  };

  /**
   * Effect: Load initial schools when component mounts
   * Fetches an initial set of schools to populate the dropdown
   * Sets loading states and handles errors gracefully
   */
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

  /**
   * Effect: Handle school search with debouncing
   * Triggers when schoolQuery or schools change
   * Implements debouncing to avoid excessive API calls
   */
  useEffect(() => {
    let active = true;
    // Debounce search to avoid excessive API calls
    const handle = setTimeout(async () => {
      try {
        setSchoolLoading(true);
        const q = schoolQuery?.trim();
        let data = [];
        if (q) {
          // Search for schools matching the query
          const res = await schoolService.searchSchools(q);
          data = toArray(res?.data);
        } else {
          // Fallback to cached list to avoid large fetches when search is empty
          data = toArray(schools);
        }
        // Only update if component is still mounted
        if (active) setSchoolOptions(data);
      } catch (_) {
        // On error, clear options
        if (active) setSchoolOptions([]);
      } finally {
        if (active) setSchoolLoading(false);
      }
    }, 250); // 250ms debounce delay
    
    // Cleanup function to cancel pending requests on unmount or dependency change
    return () => {
      active = false;
      clearTimeout(handle);
    };
  }, [schoolQuery, schools]);

  /**
   * Effect: Load classes when a school is selected
   * Resets dependent state when school changes
   * Fetches classes for the selected school
   */
  useEffect(() => {
    if (selectedSchool) {
      // Fetch classes for the selected school
      classService.getClassesBySchool(selectedSchool)
        .then(res => setClasses(toArray(res?.data)))
        .catch(() => setClasses([]));
    } else {
      // Reset classes if no school is selected
      setClasses([]);
    }
    // Reset dependent state when school changes
    setSelectedClass('');
    setYear('');
    setOfficialList([]);
    setCurrentItems([]);
    setSelectedIds([]);
  }, [selectedSchool]);

  /**
   * Fetches the official book list for the selected class and year
   * Handles different API response formats and enriches book data with cover images
   * @returns {Promise<void>}
   */
  const fetchList = async () => {
    try {
      // Fetch the official list for the selected class and year
      // Note: schoolId is not passed to avoid over-filtering if backend doesn't support it
      const res = await customerBookOrderService.getOfficialList(selectedClass, year);
      let listBooks = [];
      const cid = Number(selectedClass);
      const yr = Number(year);

      // Handle different API response formats
      if (Array.isArray(res.data)) {
        // Case 1: Backend returns a direct array of lists
        // Find the list matching our class and year
        const match = res.data.find(l => Number(l.classId) === cid && Number(l.year) === yr);
        if (match?.id) {
          // Fetch the books for the matched list
          const booksRes = await listService.getListBooks(match.id);
          listBooks = booksRes.data || [];
        }
      } else if (res.data && typeof res.data === 'object') {
        // Case 2: Backend returns a pageable object with content array
        if (Array.isArray(res.data.content)) {
          const match = res.data.content.find(l => Number(l.classId) === cid && Number(l.year) === yr);
          if (match?.id) {
            const booksRes = await listService.getListBooks(match.id);
            listBooks = booksRes.data || [];
          }
        }
        // Case 3: Backend returns a single list with embedded books
        if (Array.isArray(res.data.listBooks)) {
          listBooks = res.data.listBooks;
        } else if (res.data.id) {
          // Case 4: Backend returns a list without embedded books
          const booksRes = await listService.getListBooks(res.data.id);
          listBooks = booksRes.data || [];
        }
      }

      // Fallback: If no books found through direct methods, try fetching all lists
      if (!listBooks.length) {
        try {
          const all = await listService.getLists();
          const match = (all.data || []).find(l => Number(l.classId) === cid && Number(l.year) === yr);
          if (match) {
            const booksRes = await listService.getListBooks(match.id);
            listBooks = booksRes.data || [];
          }
        } catch (_) {
          // Ignore errors here, will be handled by the main error handler
        }
      }

      // If still no books found, throw a specific error
      if (!listBooks.length) {
        throw new Error('NO_LIST_MATCH');
      }

      // Enrich book data with cover images from the main catalog if missing
      try {
        // Check if any books are missing cover images
        const needsEnrichment = (listBooks || []).some(b => !b?.imageUrl && !(b?.book && b.book.imageUrl));
        
        if (needsEnrichment) {
          // Fetch all books from the catalog to get cover images
          const resBooks = await bookService.getBooks();
          
          // Handle different response formats from the books API
          const catalog = Array.isArray(resBooks?.data) 
            ? resBooks.data 
            : (Array.isArray(resBooks?.data?.content) ? resBooks.data.content : []);
          
          // Create lookup maps for efficient searching
          const byId = new Map((catalog || []).map(b => [String(b?.id), b]));
          const byTitle = new Map((catalog || []).map(b => [String((b?.title || '').toLowerCase().trim()), b]));
          
          // Helper to extract image URL from various possible properties
          const pickImg = (b) => (
            b?.imageUrl || 
            b?.bookImageUrl || 
            b?.coverUrl || 
            b?.imagePath || 
            (b?.book && (b.book.imageUrl || b.book.coverUrl)) || 
            ''
          );
          
          // Enrich each book with its cover image if missing
          listBooks = (listBooks || []).map(book => {
            if (book?.imageUrl) return book; // Skip if already has an image
            
            // Try to find a matching book in the catalog by ID or title
            const keyTitle = String((book?.bookTitle || book?.title || '')).toLowerCase().trim();
            const match = byId.get(String(book?.bookId ?? book?.id)) || byTitle.get(keyTitle);
            const img = pickImg(match);
            
            // Return enriched book if image found, otherwise return as is
            return img ? { ...book, imageUrl: img } : book;
          });
        }
      } catch (_) {
        // Silently fail image enrichment - not critical for order functionality
      }

      // Update state with the enriched book list
      setOfficialList(listBooks);
      
      // Prepare additional data for the order items
      const schoolsArr = toArray(schools);
      const classesArr = toArray(classes);
      
      // Look up school and class names for display
      const scName = (schoolsArr.find(s => String(s.id) === String(selectedSchool))?.name) || String(selectedSchool);
      const clName = (classesArr.find(c => String(c.id) === String(selectedClass))?.name) || String(selectedClass);
      
      // Transform book data into order items with default values
      setCurrentItems(listBooks.map(book => ({
        id: book.bookId ?? book.id,  // Use bookId if available, fall back to id
        ...book,                     // Spread all book properties
        quantity: 1,                 // Default quantity
        conditionType: 'NEW',        // Default condition
        schoolId: selectedSchool,    // Add school reference
        classId: selectedClass,      // Add class reference
        schoolName: scName,          // Add school name for display
        className: clName,           // Add class name for display
        year: Number(year),          // Add year as number
      })));
      
      // Reset selection state - no books selected by default
      setSelectedIds([]);
      
    } catch (error) {
      // Handle errors from the API or processing
      setOfficialList([]);
      setCurrentItems([]);
      
      // Extract error details
      const status = error?.response?.status;
      const serverMsg = typeof error?.response?.data === 'string' ? error.response.data : '';
      
      // Default error message
      let message = `No official list found for this class/year (classId=${selectedClass}, year=${year}).`;
      
      // Provide more specific messages based on error type
      if (status === 403) {
        message = 'You do not have permission to view lists. Please sign in as a customer.';
      } else if (status === 404) {
        message = 'No official list found for this class/year.';
      } else if (status === 400) {
        message = 'Invalid selection. Please reselect school/class/year.';
      } else if (error.message === 'NO_LIST_MATCH') {
        message = 'No book list found for the selected criteria.';
      }
      
      // Use server-provided message if available
      if (serverMsg) message = serverMsg;
      
      // Show error to user
      setSnackbar({ 
        open: true, 
        message, 
        severity: 'error' 
      });
    }
  };

  /**
   * Handles changes to order items (quantity, condition, etc.)
   * @param {number} idx - Index of the item being modified
   * @param {string} field - Field name to update
   * @param {any} value - New value for the field
   */
  const handleOrderChange = (idx, field, value) => {
    setCurrentItems(items =>
      items.map((item, i) => i === idx ? { ...item, [field]: value } : item)
    );
  };

  /**
   * Adds the currently selected books to the order
   * Validates that books are loaded and selected before adding
   */
  const handleAddCurrentSelection = () => {
    // Validate that we have items to add
    if (!currentItems.length) {
      setSnackbar({ open: true, message: 'Load a list first before adding.', severity: 'warning' });
      return;
    }
    
    // Validate that at least one item is selected
    if (!selectedIds.length) {
      setSnackbar({ open: true, message: 'Select at least one book using the checkboxes.', severity: 'warning' });
      return;
    }
    
    // Get selected items based on their IDs
    const chosen = currentItems.filter(it => selectedIds.includes(getRowKey(it)));
    
    // Double-check we have items to add (shouldn't happen due to previous check)
    if (!chosen.length) {
      setSnackbar({ open: true, message: 'No books selected.', severity: 'warning' });
      return;
    }
    
    // Calculate prices and prepare items for the order
    const normalized = chosen.map(it => ({
      ...it,
      unitPrice: getUnitPrice(it),
      subtotal: getUnitPrice(it) * Number(it.quantity || 0),
    }));
    
    // Add to accumulated items (shopping cart)
    setAccumulatedItems(prev => [...prev, ...normalized]);
    
    // Show success message
    setSnackbar({ open: true, message: 'Selected books added to order.', severity: 'success' });
    
    // Reset the current selection
    setOfficialList([]);
    setCurrentItems([]);
    setSelectedIds([]);
  };

  /**
   * Adds all books from the current list to the order
   * Similar to handleAddCurrentSelection but doesn't require selection
   */
  const handleAddAllCurrentSelection = () => {
    // Validate that we have items to add
    if (!currentItems.length) {
      setSnackbar({ open: true, message: 'Load a list first before adding.', severity: 'warning' });
      return;
    }
    
    // Calculate prices for all items
    const normalized = currentItems.map(it => ({
      ...it,
      unitPrice: getUnitPrice(it),
      subtotal: getUnitPrice(it) * Number(it.quantity || 0),
    }));
    
    // Add all items to the order
    setAccumulatedItems(prev => [...prev, ...normalized]);
    
    // Show success message
    setSnackbar({ open: true, message: 'Entire list added to order.', severity: 'success' });
    
    // Reset the current selection
    setOfficialList([]);
    setCurrentItems([]);
    setSelectedIds([]);
  };

  /**
   * Handles changes to items in the shopping cart
   * Updates the item and recalculates prices
   * @param {number} idx - Index of the item being modified
   * @param {string} field - Field name to update
   * @param {any} value - New value for the field
   */
  const handleAccumulatedChange = (idx, field, value) => {
    setAccumulatedItems(items => items.map((it, i) => {
      // Skip items that aren't being modified
      if (i !== idx) return it;
      
      // Update the specified field
      const updated = { ...it, [field]: value };
      
      // Recalculate prices based on the updated item
      const unit = getUnitPrice(updated);
      const sub = getSubtotal(updated);
      
      // Return the updated item with new prices
      return { ...updated, unitPrice: unit, subtotal: sub };
    }));
  };

  /**
   * Removes an item from the shopping cart
   * @param {number} idx - Index of the item to remove
   */
  const handleRemoveAccumulated = (idx) => {
    setAccumulatedItems(items => items.filter((_, i) => i !== idx));
  };

  /**
   * Clears all items from the shopping cart
   */
  const handleClearCart = () => {
    setAccumulatedItems([]);
  };

  /**
   * Handles the submission of the order
   * Creates or updates a draft order and optionally submits it
   * Handles both new orders and adding to existing drafts
   */
  const handleSubmitOrder = async () => {
    try {
      // Determine which items to submit (from cart or current selection)
      const itemsToSubmit = (accumulatedItems.length ? accumulatedItems : currentItems);
      
      // Validate we have items to submit
      if (!itemsToSubmit.length) {
        setSnackbar({ 
          open: true, 
          message: 'Your order is empty. Add at least one selection.', 
          severity: 'warning' 
        });
        return;
      }
      
      // Prepare the payload with only necessary fields for the API
      const itemsPayload = itemsToSubmit.map(item => ({
        bookId: item.bookId,            // Required: ID of the book
        quantity: Number(item.quantity || 1),  // Ensure quantity is a number
        conditionType: item.conditionType,     // NEW or USED
        officialListId: item.listId,    // Reference to the official book list
        schoolId: item.schoolId,        // School ID for the order
        classId: item.classId,          // Class ID for the order
        year: Number(item.year)         // Academic year as number
      }));
      
      // Handle different submission paths based on whether we're updating a draft
      if (targetDraftId) {
        // Path 1: Adding to an existing draft (from "Add Items" flow)
        await tempOrderService.addItemsTo(targetDraftId, itemsPayload);
        setSnackbar({ 
          open: true, 
          message: 'Items added to your draft.', 
          severity: 'success' 
        });
      } else {
        // Path 2: Creating a new order
        // Step 1: Get or create a draft
        const draftRes = await tempOrderService.getMyDraft();
        const draftId = draftRes?.data?.id;
        
        // Step 2: Add items to the draft
        await tempOrderService.addItems(itemsPayload);
        
        // Step 3: Submit the draft for approval
        await tempOrderService.submit(draftId);
        
        // Show success message
        setSnackbar({ 
          open: true, 
          message: 'Order submitted for approval!', 
          severity: 'success' 
        });
      }
      
      // Clear the form after successful submission
      setAccumulatedItems([]);
      setOfficialList([]);
      setCurrentItems([]);
      
    } catch (error) {
      // Extract error details
      const status = error?.response?.status;
      const serverMsg = typeof error?.response?.data === 'string' 
        ? error.response.data 
        : (error?.message || '');
      
      // Default error message
      let message = 'Error submitting order. Please try again.';
      
      // Provide more specific messages for common errors
      if (status === 400) {
        message = 'Invalid order data. Please review your selections.';
      } else if (status === 403) {
        message = 'You do not have permission to submit orders.';
      } else if (status === 404) {
        message = 'Official list or one of the books was not found.';
      } else if (status === 409) {
        message = 'Book already exists in this draft. You can modify the quantity instead.';
      } else if (serverMsg) {
        // Use server-provided message if available
        message = serverMsg;
      }
      
      // Show error to user
      setSnackbar({ 
        open: true, 
        message, 
        severity: 'error' 
      });
    }
  };

  if (!isUser) return null;

  // If there are no schools available AFTER the initial fetch has completed, show a friendly message
  const noSchools = initialSchoolsLoaded && toArray(schools).length === 0;

  return (
    <BackgroundFX>
    <Box sx={{ pl: { xs: '1.2vw', md: '0.8vw' }, pr: { xs: '2vw', md: '1.4vw' }, pt: { xs: '2vw', md: '1.5vw' }, pb: { xs: '2vw', md: '1.5vw' }, maxWidth: '100%', mx: 0 }}>
      {noSchools && (
        <GlassCard elevation={6} sx={{ borderRadius: '1vw', mb: '2vw' }}>
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
          <Box sx={{ display: 'flex', gap: '1.5vw', mb: '1.5vw', flexWrap: 'wrap' }}>
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
                  sx={{ minWidth: { xs: '70vw', sm: '45vw', md: '28vw' } }}
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
                <TextField {...params} label="Class" placeholder={!selectedSchool ? 'Select a school first' : 'Search class...'} sx={{ minWidth: { xs: '60vw', sm: '40vw', md: '24vw' } }} disabled={!selectedSchool} />
              )}
            />
            <TextField
              select
              label="Year"
              value={year}
              disabled={!selectedClass}
              onChange={e => setYear(e.target.value)}
              sx={{ minWidth: { xs: '40vw', sm: '28vw', md: '16vw' } }}
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
            <Box sx={{ width: '100%', maxHeight: { xs: '55vh', md: '65vh' }, overflow: 'auto' }}>
              <DataGrid
                rows={currentItems}
                columns={[
                  {
                    field: 'cover',
                    headerName: '',
                    flex: 0.4,
                    sortable: false,
                    filterable: false,
                    disableColumnMenu: true,
                    renderCell: ({ row }) => {
                      const img = row.imageUrl;
                      return img ? (
                        <img src={resolveImageUrl(img)} alt={row.bookTitle || row.title || 'cover'} style={{ width: '3vw', height: '4.2vw', objectFit: 'cover', borderRadius: '0.3vw', cursor: 'zoom-in' }} onError={(e) => { e.currentTarget.style.display = 'none'; }} onClick={() => { setPreviewSrc(resolveImageUrl(img)); setPreviewOpen(true); }} />
                      ) : (
                        <Box sx={{ width: '3vw', height: '4.2vw', borderRadius: '0.3vw', bgcolor: 'action.hover' }} />
                      );
                    },
                  },
                  {
                    field: '__select__',
                    headerName: '',
                    flex: 0.32,
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
                    flex: 0.9,
                    sortable: false,
                    filterable: false,
                    renderCell: ({ row }) => {
                      const idx = currentItems.findIndex(i => i.bookId === row.bookId);
                      const qty = Number(row.quantity || 1);
                      const setQty = (n) => handleOrderChange(idx, 'quantity', Math.max(1, Number(n)));
                      return (
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%', justifyContent: 'center' }}>
                          <IconButton size="small" color="inherit" aria-label="Decrease quantity" onClick={() => setQty(qty - 1)}>
                            <RemoveRounded fontSize="small" />
                          </IconButton>
                          <TextField
                            type="number"
                            value={qty}
                            onChange={e => setQty(e.target.value)}
                            inputProps={{ min: 1 }}
                            size="small"
                            sx={{
                              width: 72,
                              '& .MuiInputBase-input': {
                                textAlign: 'center',
                                paddingTop: 0.9,
                                paddingBottom: 0.9,
                                lineHeight: 1.5,
                              },
                              '& input[type=number]': {
                                MozAppearance: 'textfield',
                              },
                              '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                WebkitAppearance: 'none',
                                margin: 0,
                              },
                            }}
                          />
                          <IconButton size="small" color="primary" aria-label="Increase quantity" onClick={() => setQty(qty + 1)}>
                            <AddRounded fontSize="small" />
                          </IconButton>
                        </Stack>
                      );
                    },
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
                        sx={{
                          width: 110,
                          '& .MuiSelect-select': {
                            display: 'flex',
                            alignItems: 'center',
                            paddingTop: 0.9,
                            paddingBottom: 0.9,
                            lineHeight: 1.5,
                          },
                        }}
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
                sx={(theme) => ({
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  boxShadow: theme.shadows[1],
                  mt: 2,
                  border: '1px solid',
                  borderColor: theme.palette.divider,
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: 'rgba(15,23,42,0.035)',
                    fontWeight: 600,
                  },
                  '& .MuiDataGrid-columnHeader, & .MuiDataGrid-cell': {
                    paddingTop: theme.spacing(2),
                    paddingBottom: theme.spacing(2),
                  },
                  '& .MuiDataGrid-row:nth-of-type(even)': {
                    backgroundColor: theme.palette.action.hover,
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: 'rgba(15,23,42,0.03)',
                  },
                })}
                rowHeight={80}
                headerHeight={72}
              />
            </Box>
          </CardContent>
        </GlassCard>
      )}
      {currentItems.length > 0 && (
        <GlassCard elevation={4} sx={{ mb: '1.4vw' }}>
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
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2">
                  Selected: <b>{selectedIds.length}</b>
                </Typography>
                <Tooltip title="Add all checked books to your order">
                  <span>
                    <Button
                      size="small"
                      variant="contained"
                      disabled={!selectedIds.length}
                      onClick={handleAddCurrentSelection}
                    >
                      Add Selected
                    </Button>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>
          </CardContent>
        </GlassCard>
      )}
      {accumulatedItems.length > 0 && (
        <GlassCard elevation={6} sx={{ borderRadius: '1vw', mb: '2vw' }}>
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
                  '& th, & td': {
                    py: 1.5,
                    px: 1,
                    lineHeight: 1.6,
                  },
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
                      <Box component="td" sx={(theme) => ({ p: '0.8vw', borderColor: theme.palette.divider, borderBottom: '1px solid', '&:last-child': { borderRight: '1px solid' } })}><b>{item.bookTitle}</b></Box>
                      <Box component="td" sx={(theme) => ({ p: '0.8vw', borderColor: theme.palette.divider, borderBottom: '1px solid', '&:last-child': { borderRight: '1px solid' } })}>{item.bookAuthor}</Box>
                      <Box component="td" sx={(theme) => ({ p: '0.8vw', borderColor: theme.palette.divider, borderBottom: '1px solid', '&:last-child': { borderRight: '1px solid' }, textAlign: 'center' })}>
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={e => handleAccumulatedChange(idx, 'quantity', Math.max(1, Number(e.target.value)))}
                          inputProps={{ min: 1, style: { width: '8vw', minWidth: '70px' } }}
                          size="small"
                        />
                      </Box>
                      <Box component="td" sx={(theme) => ({ p: '0.8vw', borderColor: theme.palette.divider, borderBottom: '1px solid', '&:last-child': { borderRight: '1px solid' }, textAlign: 'center' })}>
                        <TextField
                          select
                          value={item.conditionType}
                          onChange={e => handleAccumulatedChange(idx, 'conditionType', e.target.value)}
                          size="small"
                          sx={{
                            width: 110,
                            '& .MuiSelect-select': {
                              display: 'flex',
                              alignItems: 'center',
                              paddingTop: 0.9,
                              paddingBottom: 0.9,
                              lineHeight: 1.5,
                            },
                          }}
                        >
                          <MenuItem value="NEW">New</MenuItem>
                          <MenuItem value="USED">Used</MenuItem>
                        </TextField>
                      </Box>
                      <Box component="td" sx={(theme) => ({ p: '0.8vw', borderColor: theme.palette.divider, borderBottom: '1px solid', '&:last-child': { borderRight: '1px solid' }, textAlign: 'center' })}>{currency(getUnitPrice(item))}</Box>
                      <Box component="td" sx={(theme) => ({ p: '0.8vw', borderColor: theme.palette.divider, borderBottom: '1px solid', '&:last-child': { borderRight: '1px solid' }, textAlign: 'center' })}>{currency(getSubtotal(item))}</Box>
                      <Box component="td" sx={(theme) => ({ p: '0.8vw', borderColor: theme.palette.divider, borderBottom: '1px solid', '&:last-child': { borderRight: '1px solid' }, textAlign: 'center' })}>{item.schoolName || item.schoolId}</Box>
                      <Box component="td" sx={(theme) => ({ p: '0.8vw', borderColor: theme.palette.divider, borderBottom: '1px solid', '&:last-child': { borderRight: '1px solid' }, textAlign: 'center' })}>{item.className || item.classId}</Box>
                      <Box component="td" sx={(theme) => ({ p: '0.8vw', borderColor: theme.palette.divider, borderBottom: '1px solid', '&:last-child': { borderRight: '1px solid' }, textAlign: 'center' })}>{item.year}</Box>
                      <Box component="td" sx={(theme) => ({ p: '0.8vw', borderColor: theme.palette.divider, borderBottom: '1px solid', '&:last-child': { borderRight: '1px solid' }, textAlign: 'center' })}>
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
            <Box sx={(theme) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: '1.2vw', gap: '1.2vw', flexWrap: 'wrap', backgroundColor: theme.palette.background.paper, borderRadius: '0.6vw', boxShadow: theme.shadows[1], p: '1.2vw' })}>
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
        <GlassCard elevation={4} sx={{ borderRadius: '1vw', mb: '2vw' }}>
          <CardContent sx={{ textAlign: 'center', py: '6vh' }}>
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
      <ImagePreviewDialog open={previewOpen} src={previewSrc} onClose={() => setPreviewOpen(false)} />
    </Box>
    </BackgroundFX>
  );
};

export default CustomerOrderFlow;