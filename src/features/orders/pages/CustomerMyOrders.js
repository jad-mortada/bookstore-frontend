import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Box, CardHeader, CardContent, Typography, Alert, Chip, Collapse, IconButton, Divider, TextField, MenuItem, Stack, Tooltip } from '@mui/material';
import GlassCard from '../../../shared/components/ui/GlassCard';
import GradientButton from '../../../shared/components/ui/GradientButton';
import BackgroundFX from '../../../shared/components/ui/BackgroundFX';
import SectionHeader from '../../../shared/components/ui/SectionHeader';
import DeleteOutlineRounded from '@mui/icons-material/DeleteOutlineRounded';
import AddShoppingCartRounded from '@mui/icons-material/AddShoppingCartRounded';
import profileService from '../../../api/profile.api'; // Adjust the import path as needed
import customerBookOrderService from '../../../api/orders.api';
import tempOrderService from '../../../api/tempOrders.api';

const OrderCard = ({ order }) => {
  const [open, setOpen] = useState(false);
  
  // Calculate total price
  const calculateTotal = (items) => {
    return (items || []).reduce((total, item) => {
      const basePrice = Number(item.price ?? item.bookPrice ?? 0);
      const cond = String(item.conditionType ?? item.condition ?? item.bookCondition ?? '').toUpperCase();
      const isUsed = cond === 'USED';
      const qty = Math.max(1, Number(item.quantity || 0));
      const committedSubtotal = item.subtotal != null ? Number(item.subtotal) : null;
      if (committedSubtotal != null && !Number.isNaN(committedSubtotal)) {
        return total + committedSubtotal;
      }
      const committedUnit = item.unitPrice != null ? Number(item.unitPrice) : null;
      const unit = (committedUnit != null && !Number.isNaN(committedUnit))
        ? committedUnit
        : (isUsed ? basePrice * 0.5 : basePrice);
      return total + unit * qty;
    }, 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const totalPrice = calculateTotal(order.items);
  const orderDate = formatDate(order.orderDate || order.createdAt);
  const status = order.status || 'APPROVED';

  return (
    <GlassCard elevation={8} sx={{ borderRadius: 3, mb: 2, borderLeft: '4px solid', 
      borderColor: status === 'APPROVED' ? 'success.main' : 
                  status === 'SUBMITTED' ? 'info.main' : 
                  status === 'DRAFT' ? 'grey.500' : 'warning.main' }}>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Chip 
              label={status}
              color={
                status === 'APPROVED' ? 'success' : 
                status === 'SUBMITTED' ? 'info' : 
                status === 'DRAFT' ? 'default' : 'warning'
              }
              size="small"
              sx={{ ml: 'auto' }}
            />
          </Box>
        }
        subheader={
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 0.5 }}>
              <Chip size="small" label={`${order.items?.length || 0} items`} variant="outlined" />
              <Chip size="small" label={`Total: $${totalPrice.toFixed(2)}`} color="primary" />
              <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                Ordered on: {orderDate}
              </Typography>
            </Box>
          </Box>
        }
        onClick={() => setOpen(v => !v)}
        sx={{ cursor: 'pointer' }}
      />
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Divider />
        <CardContent>
          {(order.items || []).length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>No items in this order</Typography>
          ) : (
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
                  '& th, & td': { p: 1.5 },
                  '& tr': { borderBottom: '1px solid', borderColor: (t) => t.palette.divider },
                  '& tbody tr:hover': { bgcolor: 'rgba(15,23,42,0.03)' }
                }}
              >
                <Box component="thead">
                  <Box component="tr">
                    <Box component="th" sx={{ textAlign: 'left' }}>Title</Box>
                    <Box component="th" sx={{ textAlign: 'left' }}>Author</Box>
                    <Box component="th" sx={{ textAlign: 'center' }}>Condition</Box>
                    <Box component="th" sx={{ textAlign: 'right' }}>Price</Box>
                    <Box component="th" sx={{ textAlign: 'center' }}>Qty</Box>
                    <Box component="th" sx={{ textAlign: 'right' }}>Subtotal</Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  {(order.items || []).map(item => {
                    const basePrice = Number(item.price ?? item.bookPrice ?? 0);
                    const cond = String(item.conditionType ?? item.condition ?? item.bookCondition ?? '').toUpperCase();
                    const isUsed = cond === 'USED';
                    const qty = Math.max(1, Number(item.quantity || 0));
                    const committedUnit = item.unitPrice != null ? Number(item.unitPrice) : null;
                    const unitPrice = (committedUnit != null && !Number.isNaN(committedUnit))
                      ? committedUnit
                      : (isUsed ? basePrice * 0.5 : basePrice);
                    const committedSubtotal = item.subtotal != null ? Number(item.subtotal) : null;
                    const subtotal = (committedSubtotal != null && !Number.isNaN(committedSubtotal))
                      ? committedSubtotal
                      : unitPrice * qty;
                    const displayBase = isUsed ? (unitPrice * 2) : basePrice;
                    
                    return (
                      <motion.tr
                        key={item.id || `${item.orderId}-${item.bookId}`}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                      >
                        <Box component="td" sx={{ p: 1.5 }}><b>{item.bookTitle || item.title || '-'}</b></Box>
                        <Box component="td" sx={{ p: 1.5, color: 'text.secondary' }}>{item.bookAuthor || item.author || '-'}</Box>
                        <Box component="td" sx={{ p: 1.5, textAlign: 'center' }}>
                          <Chip 
                            label={item.conditionType || 'NEW'} 
                            size="small" 
                            color={item.conditionType === 'USED' ? 'default' : 'primary'}
                            variant="outlined"
                          />
                        </Box>
                        <Box component="td" sx={{ p: 1.5, textAlign: 'right' }}>
                          {isUsed && (
                            <Box sx={{ textDecoration: 'line-through', color: 'text.secondary', fontSize: '0.85em' }}>
                              ${Number(displayBase || 0).toFixed(2)}
                            </Box>
                          )}
                          <Box>${unitPrice.toFixed(2)}</Box>
                          {isUsed && (
                            <Box sx={{ fontSize: '0.75em', color: 'success.main' }}>(50% off)</Box>
                          )}
                        </Box>
                        <Box component="td" sx={{ p: 1.5, textAlign: 'center' }}>{item.quantity}</Box>
                        <Box component="td" sx={{ p: 1.5, textAlign: 'right', fontWeight: 500 }}>${subtotal.toFixed(2)}</Box>
                      </motion.tr>
                    );
                  })}
                </Box>
                <Box component="tfoot">
                  <Box component="tr">
                    <Box component="td" colSpan={5} sx={{ p: 1.5, textAlign: 'right', fontWeight: 600, borderTop: '1px solid', borderColor: (t) => t.palette.divider }}>Total:</Box>
                    <Box component="td" sx={{ p: 1.5, textAlign: 'right', fontWeight: 700, fontSize: '1.1em', borderTop: '1px solid', borderColor: (t) => t.palette.divider }}>
                      ${totalPrice.toFixed(2)}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </CardContent>
      </Collapse>
    </GlassCard>
  );
};

const CustomerMyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  // Persist expand/collapse across re-renders per draft id
  const [openDrafts, setOpenDrafts] = useState({});
  // Preserve stable item order per draft id (array of itemIds)
  const [itemOrders, setItemOrders] = useState({});
  // UI state for organization: search + sort
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState('date_desc'); // date_desc | date_asc | total_desc | total_asc

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await profileService.getMe();
        const res = await customerBookOrderService.getOrdersByCustomer(me.id);
        if (!mounted) return;
        // Normalize approved orders so OrderCard can render consistently
        const approved = (res.data || []).map(o => ({
          ...o,
          items: Array.isArray(o.orderItems) ? o.orderItems : (o.items || []),
          status: o.status || 'APPROVED',
        }));
        setOrders(approved);
        // Load temp drafts (DRAFT/SUBMITTED/APPROVED)
        const dres = await tempOrderService.listMyDrafts();
        if (!mounted) return;
        const list = Array.isArray(dres.data) ? dres.data : [];
        // initialize item order for drafts that already have items
        setItemOrders(prev => {
          const next = { ...prev };
          list.forEach(dr => {
            if (Array.isArray(dr.items) && dr.items.length > 0 && !next[dr.id]) {
              next[dr.id] = dr.items.map(it => it.id);
            }
          });
          return next;
        });
        setDrafts(list);
      } catch (e) {
        if (!mounted) return;
        const msg = typeof e?.response?.data === 'string' ? e.response.data : (e?.message || 'Failed to load your orders');
        setErrorMessage(msg);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const currency = (n) => `$${Number(n || 0).toFixed(2)}`;

  // Helpers for filtering/sorting
  const computeTotal = (o) => {
    const items = Array.isArray(o.items) ? o.items : (Array.isArray(o.orderItems) ? o.orderItems : []);
    return items.reduce((total, item) => {
      const basePrice = Number(item.price ?? item.bookPrice ?? 0);
      const cond = String(item.conditionType ?? item.condition ?? item.bookCondition ?? '').toUpperCase();
      const isUsed = cond === 'USED';
      const qty = Math.max(1, Number(item.quantity || 0));
      const committedSubtotal = item.subtotal != null ? Number(item.subtotal) : null;
      if (committedSubtotal != null && !Number.isNaN(committedSubtotal)) {
        return total + committedSubtotal;
      }
      const committedUnit = item.unitPrice != null ? Number(item.unitPrice) : null;
      const unit = (committedUnit != null && !Number.isNaN(committedUnit))
        ? committedUnit
        : (isUsed ? basePrice * 0.5 : basePrice);
      return total + unit * qty;
    }, 0);
  };

  const matchesQuery = (o, q) => {
    const id = String(o.id || '').toLowerCase();
    const status = String(o.status || '').toLowerCase();
    const when = String(o.orderDate || o.createdAt || '').toLowerCase();
    const items = (o.items || o.orderItems || [])
      .map(it => [it.title, it.bookTitle, it.author, it.bookAuthor].filter(Boolean).join(' '))
      .join(' ')
      .toLowerCase();
    const hay = [id, status, when, items].join(' ');
    return hay.includes(q);
  };

  const q = String(debouncedSearch || '').trim().toLowerCase();
  const filteredDrafts = q ? (drafts || []).filter(d => matchesQuery(d, q)) : drafts;
  const filteredOrders = q ? (orders || []).filter(o => matchesQuery(o, q)) : orders;

  const sortedOrders = [...(filteredOrders || [])].sort((a, b) => {
    if (sortBy === 'date_asc' || sortBy === 'date_desc') {
      const da = new Date(a.orderDate || a.createdAt || 0).getTime();
      const db = new Date(b.orderDate || b.createdAt || 0).getTime();
      return sortBy === 'date_asc' ? da - db : db - da;
    }
    const ta = computeTotal(a);
    const tb = computeTotal(b);
    return sortBy === 'total_asc' ? ta - tb : tb - ta;
  });

  const handleUpdateItem = async (itemId, patch, draftId) => {
    try {
      await tempOrderService.updateItem(itemId, patch);
      // refresh this draft
      // Use customer-accessible endpoint to refresh
      const listRes = await tempOrderService.listMyDrafts();
      const fres = { data: (listRes.data || []).find(d => d.id === draftId) || {} };
      const ordered = (() => {
        const draft = fres.data;
        const order = itemOrders[draftId] || [];
        const byId = new Map((draft.items || []).map(it => [it.id, it]));
        // keep items that match the stored order, then append any new ones
        const kept = order.map(id => byId.get(id)).filter(Boolean);
        const extras = (draft.items || []).filter(it => !order.includes(it.id));
        const items = [...kept, ...extras];
        return { ...draft, items };
      })();
      // update stored order to reflect any newly added items
      setItemOrders(prev => ({
        ...prev,
        [draftId]: ordered.items.map(it => it.id),
      }));
      setDrafts(prev => prev.map(dr => (dr.id === draftId ? ordered : dr)));
      setErrorMessage('');
    } catch (e) {
      const msg = typeof e?.response?.data === 'string' ? e.response.data : (e?.message || 'Update failed');
      setErrorMessage(msg);
    }
  };

  const handleRemoveItem = async (itemId, draftId) => {
    try {
      await tempOrderService.removeItem(itemId);
      // Use customer-accessible endpoint to refresh
      const listRes = await tempOrderService.listMyDrafts();
      const fres = { data: (listRes.data || []).find(d => d.id === draftId) || {} };
      const ordered = (() => {
        const draft = fres.data;
        const order = itemOrders[draftId] || [];
        const byId = new Map((draft.items || []).map(it => [it.id, it]));
        const kept = order.map(id => byId.get(id)).filter(Boolean);
        // removed item automatically drops from kept; append any new ones (should be none on remove)
        const extras = (draft.items || []).filter(it => !order.includes(it.id));
        const items = [...kept, ...extras];
        return { ...draft, items };
      })();
      setItemOrders(prev => ({
        ...prev,
        [draftId]: ordered.items.map(it => it.id),
      }));
      setDrafts(prev => prev.map(d => (d.id === draftId ? ordered : d)));
    } catch (e) {
      const msg = typeof e?.response?.data === 'string' ? e.response.data : (e?.message || 'Failed to remove item');
      setErrorMessage(msg);
    }
  };

  const handleCancelDraft = async (draftId) => {
    try {
      // Prevent cancelling non-DRAFT locally to avoid backend error
      const target = drafts.find(d => d.id === draftId);
      if (String(target.status).toUpperCase() === 'APPROVED') {
        setErrorMessage('Approved orders cannot be deleted by customer.');
        return;
      }
      try {
        await tempOrderService.cancel(draftId);
        // refresh list after deletion
        const listRes = await tempOrderService.listMyDrafts();
        setDrafts(Array.isArray(listRes.data) ? listRes.data : []);
        setErrorMessage('');
      } catch (e) {
        const msg = typeof e?.response?.data === 'string' ? e.response.data : (e?.message || 'Failed to delete draft');
        setErrorMessage(msg);
      }
    } catch (e) {
      const msg = typeof e?.response?.data === 'string' ? e.response.data : (e?.message || 'Failed to delete draft');
      setErrorMessage(msg);
    }
  };

  const DraftCard = ({ d, isOpen, onToggle }) => {
    const [loadingDetails, setLoadingDetails] = useState(false);
    const canEdit = d.status === 'DRAFT' || d.status === 'SUBMITTED';
    const canDelete = d.status === 'DRAFT' || d.status === 'SUBMITTED';

    const ensureDetails = async () => {
      if (Array.isArray(d.items) && d.items.length > 0) return;
      setLoadingDetails(true);
      try {
        // Use customer-accessible endpoint to fetch own draft details
        const listRes = await tempOrderService.listMyDrafts();
        const fres = { data: (listRes.data || []).find(x => x.id === d.id) || {} };
        // initialize item order when details first load
        setItemOrders(prev => ({
          ...prev,
          [d.id]: (fres.data.items || []).map(it => it.id),
        }));
        setDrafts(prev => prev.map(x => (x.id === d.id ? fres.data : x)));
      } finally {
        setLoadingDetails(false);
      }
    };

    return (
      <GlassCard key={d.id} elevation={6} sx={{ borderRadius: 3, mb: 1 }}>
        <CardHeader
          subheader={
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip size="small" label={`Items: ${Array.isArray(d.items) ? d.items.length : 0}`} />
              <Chip size="small" color={d.status === 'APPROVED' ? 'success' : d.status === 'SUBMITTED' ? 'info' : 'default'} label={d.status || 'DRAFT'} />
            </Box>
          }
          action={
          <Stack direction="row" spacing={1} sx={{ mr: 1, alignItems: 'center' }}>
            <Tooltip title="Add more items to this draft">
              <GradientButton size="small" aria-label="Add items" onClick={(e) => { e.stopPropagation(); window.location.href = `/order?draftId=${d.id}`; }} startIcon={<AddShoppingCartRounded />}>
                Add Items
              </GradientButton>
            </Tooltip>
            <Tooltip title={canDelete ? 'Delete Draft' : 'Only Draft or Submitted orders can be deleted'}>
              <span>
                <IconButton size="small" color="error" aria-label="Delete draft" disabled={!canDelete} onClick={(e) => { e.stopPropagation(); handleCancelDraft(d.id); }}>
                  <DeleteOutlineRounded />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
          }
          onClick={async () => { if (!isOpen) { await ensureDetails(); } onToggle(); }}
          sx={{ cursor: 'pointer' }}
        />
        <Collapse in={isOpen} timeout="auto">
          <Divider />
          <CardContent>
            {loadingDetails ? (
              <Typography color="text.secondary">Loading...</Typography>
            ) : (
              <Box>
                {(d.items || []).length === 0 ? (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>No items in this draft.</Typography>
                ) : (
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
                          <Box component="th" sx={{ textAlign: 'center' }}>Qty</Box>
                          <Box component="th" sx={{ textAlign: 'center' }}>Condition</Box>
                          <Box component="th" sx={{ textAlign: 'center' }}>Unit Price</Box>
                          <Box component="th" sx={{ textAlign: 'center' }}>Subtotal</Box>
                          <Box component="th" sx={{ textAlign: 'center' }}>Actions</Box>
                        </Box>
                      </Box>
                      <Box component="tbody">
                        {(d.items || []).map((item) => {
                          const basePrice = Number(item.price ?? item.bookPrice ?? 0);
                          const qty = Math.max(1, Number(item.quantity || 0));
                          const isUsed = String(item.conditionType ?? item.condition ?? item.bookCondition ?? '').toUpperCase() === 'USED';
                          const committedUnit = item.unitPrice != null ? Number(item.unitPrice) : null;
                          const unitPrice = (committedUnit != null && !Number.isNaN(committedUnit))
                            ? committedUnit
                            : (isUsed ? basePrice * 0.5 : basePrice);
                          const committedSubtotal = item.subtotal != null ? Number(item.subtotal) : null;
                          const subtotal = (committedSubtotal != null && !Number.isNaN(committedSubtotal))
                            ? committedSubtotal
                            : unitPrice * qty;
                          return (
                            <motion.tr
                              key={item.id}
                              transition={{ duration: 0.15, ease: 'easeOut' }}
                            >
                              <Box component="td" sx={{ p: 1 }}><b>{item.bookTitle || '-'}</b></Box>
                              <Box component="td" sx={{ p: 1 }}>{item.bookAuthor || '-'}</Box>
                              <Box component="td" sx={{ p: 1, textAlign: 'center' }}>
                                <TextField
                                  type="number"
                                  value={item.quantity}
                                  onChange={e => canEdit && handleUpdateItem(item.id, { quantity: Math.max(1, Number(e.target.value)) }, d.id)}
                                  inputProps={{ min: 1 }}
                                  size="small"
                                  disabled={!canEdit}
                                  sx={{ width: 80 }}
                                />
                              </Box>
                              <Box component="td" sx={{ p: 1, textAlign: 'center' }}>
                                <TextField
                                  select
                                  value={item.conditionType}
                                  onChange={e => canEdit && handleUpdateItem(item.id, { conditionType: e.target.value }, d.id)}
                                  size="small"
                                  disabled={!canEdit}
                                >
                                  <MenuItem value="NEW">New</MenuItem>
                                  <MenuItem value="USED">Used</MenuItem>
                                </TextField>
                              </Box>
                              <Box component="td" sx={{ p: 1, textAlign: 'center' }}>{currency(unitPrice)}</Box>
                              <Box component="td" sx={{ p: 1, textAlign: 'center' }}>{currency(subtotal)}</Box>
                              <Box component="td" sx={{ p: 1, textAlign: 'center' }}>
                                <Tooltip title={canEdit ? 'Remove item from draft' : 'Cannot modify approved draft'}>
                                  <span>
                                    <IconButton color="error" size="small" aria-label="Remove item" disabled={!canEdit} onClick={() => handleRemoveItem(item.id, d.id)}>
                                      <DeleteOutlineRounded />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </Box>
                            </motion.tr>
                          );
                        })}
                      </Box>
                      <Box component="tfoot">
                        <Box component="tr">
                          <Box component="td" colSpan={5} sx={{ p: 1.25, textAlign: 'right', fontWeight: 600, borderTop: '1px solid', borderColor: (t) => t.palette.divider }}>
                            Total:
                          </Box>
                          <Box component="td" sx={{ p: 1.25, textAlign: 'center', fontWeight: 700, borderTop: '1px solid', borderColor: (t) => t.palette.divider }}>
                            {currency((d.items || []).reduce((sum, item) => {
                              const basePrice = Number(item.bookPrice ?? item.price ?? 0);
                              const qty = Math.max(1, Number(item.quantity || 0));
                              const isUsed = String(item.conditionType ?? item.condition ?? item.bookCondition ?? '').toUpperCase() === 'USED';
                              const committedUnit = item.unitPrice != null ? Number(item.unitPrice) : null;
                              const unit = (committedUnit != null && !Number.isNaN(committedUnit))
                                ? committedUnit
                                : (isUsed ? basePrice * 0.5 : basePrice);
                              const committedSubtotal = item.subtotal != null ? Number(item.subtotal) : null;
                              const sub = (committedSubtotal != null && !Number.isNaN(committedSubtotal))
                                ? committedSubtotal
                                : unit * qty;
                              return sum + sub;
                            }, 0))}
                          </Box>
                          <Box component="td" />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Collapse>
      </GlassCard>
    );
  };

  return (
    <BackgroundFX>
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: 1100, mx: 'auto' }}>
      <SectionHeader
        title="My Orders"
        subtitle="Review approved orders and manage your drafts. Use search and sorting to quickly find items."
      />
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>
      )}
      {/* Draft Orders Section */}
      <GlassCard elevation={6} sx={{ borderRadius: 3, mb: 2 }}>
        <CardHeader 
          title={<Typography variant="h6" sx={{ fontWeight: 800 }}>My Draft Orders</Typography>} 
          subheader={<Typography variant="body2" color="text.secondary">Draft and Submitted orders. Edit items while Draft/Submitted. Delete only during Draft. Approved drafts will appear under My Orders.</Typography>}
        />
        <CardContent>
          {filteredDrafts.length === 0 ? (
            <Typography color="text.secondary">No draft orders.</Typography>
          ) : (
            filteredDrafts.map(d => (
              <DraftCard
                key={d.id}
                d={d}
                isOpen={!!openDrafts[d.id]}
                onToggle={() => setOpenDrafts(prev => ({ ...prev, [d.id]: !prev[d.id] }))}
              />
            ))
          )}
        </CardContent>
      </GlassCard>

      <GlassCard elevation={6} sx={{ borderRadius: 3, mb: 2 }}>
        <CardHeader 
          title={<Typography variant="h6" sx={{ fontWeight: 800 }}>Approved Orders</Typography>} 
          subheader={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                label="Search orders"
                placeholder="Search by id, status, title, author"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ minWidth: 240, maxWidth: 360 }}
                slotProps={{
                  input: {
                    endAdornment: search ? (
                      <IconButton size="small" onClick={() => setSearch('')} aria-label="Clear search">✕</IconButton>
                    ) : null,
                  },
                }}
              />
              <TextField
                size="small"
                select
                label="Sort by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="date_desc">Date (newest)</MenuItem>
                <MenuItem value="date_asc">Date (oldest)</MenuItem>
                <MenuItem value="total_desc">Total (high → low)</MenuItem>
                <MenuItem value="total_asc">Total (low → high)</MenuItem>
              </TextField>
            </Box>
          }
        />
        <CardContent>
          {sortedOrders.length === 0 ? (
            <Typography color="text.secondary">You have no orders yet.</Typography>
          ) : (
            sortedOrders.map(order => <OrderCard key={order.id} order={order} />)
          )}
        </CardContent>
      </GlassCard>

    </Box>
    </BackgroundFX>
  );
};

export default CustomerMyOrders;
