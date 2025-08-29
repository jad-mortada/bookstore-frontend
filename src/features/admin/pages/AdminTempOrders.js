import React, { useEffect, useState, useContext } from 'react';
import { 
  Box, Card, CardHeader, CardContent, Button, Typography, Alert, Dialog, DialogTitle, 
  DialogContent, DialogActions, Chip, Divider, CircularProgress, Tooltip, TextField, 
  IconButton, useTheme, useMediaQuery
} from '@mui/material';
import { CheckCircleRounded } from '@mui/icons-material';
import GradientButton from '../../../shared/components/ui/GradientButton';
import { DataGrid } from '@mui/x-data-grid';
import tempOrderService from '../../../api/tempOrders.api';
import bookService from '../../../api/books.api';
import { AuthContext } from '../../../shared/contexts/AuthContext';
import { resolveImageUrl } from '../../../shared/utils/image';
import ImagePreviewDialog from '../../../shared/components/ImagePreviewDialog';

export default function AdminTempOrders() {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_SUPER_ADMIN');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState('');
  const [previewDimensions, setPreviewDimensions] = useState({ 
    width: 'auto', 
    height: 'auto',
    maxWidth: '90vw',
    maxHeight: '80vh'
  });
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Update preview dimensions based on screen size
  useEffect(() => {
    const updatePreviewSize = () => {
      const width = Math.min(window.innerWidth * 0.9, 800);
      const height = Math.min(window.innerHeight * 0.8, 600);
      setPreviewDimensions({
        width: 'auto',
        height: 'auto',
        maxWidth: `${width}px`,
        maxHeight: `${height}px`,
      });
    };

    window.addEventListener('resize', updatePreviewSize);
    updatePreviewSize();
    
    return () => window.removeEventListener('resize', updatePreviewSize);
  }, []);

  const fmtDate = React.useCallback((iso) => {
    if (!iso) return '-';
    try {
      const datePart = String(iso).split('T')[0];
      const [y, m, d] = datePart.split('-');
      if (y && m && d) return `${d}/${m}/${y}`;
    } catch (_) { }
    return '-';
  }, []);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await tempOrderService.listSubmitted();
      let data = (res.data || []).map(o => ({
        id: o.id,
        customerName: [o.customerFirstName, o.customerLastName].filter(Boolean).join(' ') || String(o.customerId ?? ''),
        status: o.status,
        createdAt: fmtDate(o.createdAt),
        updatedAt: o.updatedAt,
        itemsCount: Array.isArray(o.items) ? o.items.length : 0,
      }));
      // If names are missing (API doesn't include them), enrich from details endpoint
      const needsEnrichment = data.filter(r => !r.customerName || /^\d+$/.test(r.customerName));
      if (needsEnrichment.length > 0) {
        try {
          const enriched = await Promise.all(needsEnrichment.map(async r => {
            try {
              const dres = await tempOrderService.getById(r.id);
              const d = dres.data || {};
              const name = [d.customerFirstName, d.customerLastName].filter(Boolean).join(' ');
              return name ? { id: r.id, customerName: name } : null;
            } catch {
              return null;
            }
          }));
          const nameById = new Map(enriched.filter(Boolean).map(e => [e.id, e.customerName]));
          data = data.map(r => (nameById.has(r.id) ? { ...r, customerName: nameById.get(r.id) } : r));
        } catch { }
      }
      setRows(data);
    } catch (e) {
      setErrorMessage('Failed to load submitted drafts.');
    } finally {
      setLoading(false);
    }
  }, [fmtDate]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleApprove = async (id) => {
    try {
      await tempOrderService.approve(id);
      setErrorMessage('');
      await load();
    } catch (e) {
      const msg = typeof e?.response?.data === 'string' ? e.response.data : 'Approval failed.';
      setErrorMessage(msg);
    }
  };


  const handleDetails = async (id) => {
    try {
      setDetailLoading(true);
      const res = await tempOrderService.getById(id);
      setDetail(res.data);
      setDetailOpen(true);
    } catch (e) {
      const msg = typeof e?.response?.data === 'string' ? e.response.data : 'Failed to load draft details.';
      setErrorMessage(msg);
    } finally {
      setDetailLoading(false);
    }
  };

  // Enrich missing cover images for items inside the details dialog
  useEffect(() => {
    const enrich = async () => {
      try {
        if (!detail || !Array.isArray(detail.items) || detail.items.length === 0) return;
        const needs = detail.items.some(it => !it?.imageUrl && !it?.book?.imageUrl);
        if (!needs) return;
        const res = await bookService.getBooks();
        const catalog = Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.content) ? res.data.content : []);
        const byId = new Map((catalog || []).map(b => [String(b?.id), b]));
        const byTitle = new Map((catalog || []).map(b => [String((b?.title || '').toLowerCase().trim()), b]));
        const pickImg = (b) => (b?.imageUrl || b?.bookImageUrl || b?.coverUrl || b?.imagePath || (b?.book && (b.book.imageUrl || b.book.coverUrl)) || '');
        const items = (detail.items || []).map(it => {
          if (it?.imageUrl) return it;
          const keyTitle = String((it?.bookTitle || it?.title || '')).toLowerCase().trim();
          const match = byId.get(String(it?.bookId)) || byTitle.get(keyTitle);
          const img = pickImg(match);
          return img ? { ...it, imageUrl: img } : it;
        });
        setDetail(prev => prev ? { ...prev, items } : prev);
      } catch (_) { }
    };
    enrich();
  }, [detail]);

  if (!isAdmin) return null;

  const filteredRows = (Array.isArray(rows) ? rows : []).filter(r => {
    const q = String(debouncedSearch || '').trim().toLowerCase();
    if (!q) return true;
    const hay = [r.id, r.customerName, r.status, r.createdAt, r.itemsCount]
      .filter(v => v !== undefined && v !== null)
      .map(v => String(v).toLowerCase())
      .join(' ');
    return hay.includes(q);
  });

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: '100%', mx: 0, minHeight: 'calc(100vh - 64px)' }}>
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, flexWrap: 'wrap' }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mr: { sm: 'auto' },
                  fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  textAlign: { xs: 'center', sm: 'left' }
                }}
              >
                Submitted Draft Orders
              </Typography>
              <TextField
                size="small"
                label="Search drafts"
                placeholder="Search by id, customer, status"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ 
                  minWidth: { xs: '100%', sm: 220 },
                  maxWidth: 360,
                  '& .MuiInputBase-root': {
                    height: '40px'
                  }
                }}
                InputProps={{
                  endAdornment: search ? (
                    <IconButton 
                      size="small" 
                      onClick={() => setSearch('')} 
                      aria-label="Clear search"
                      sx={{ mr: -1 }}
                    >
                      ✕
                    </IconButton>
                  ) : null,
                }}
              />
            </Box>
          }
        />
        {errorMessage && (
          <Box sx={{ px: 2 }}>
            <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>
          </Box>
        )}
        <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
          <Box sx={{ 
            width: '100%',
            minHeight: 400,
            maxHeight: 'calc(100vh - 300px)',
            overflow: 'auto',
            '& .MuiDataGrid-root': {
              minWidth: 'fit-content',
              width: '100%',
            },
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            },
            '& .MuiDataGrid-cell': {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          }}>
            <DataGrid
              rows={filteredRows}
              loading={loading}
              disableRowSelectionOnClick
              columns={[
                { 
                  field: 'id', 
                  headerName: 'Draft ID', 
                  flex: 1,
                  minWidth: 100,
                  maxWidth: 150,
                },
                { 
                  field: 'customerName', 
                  headerName: 'Customer', 
                  flex: 1.5,
                  minWidth: 150,
                },
                { 
                  field: 'itemsCount', 
                  headerName: 'Items', 
                  flex: 0.8,
                  minWidth: 80,
                  maxWidth: 100,
                  align: 'center',
                  headerAlign: 'center',
                },
                { 
                  field: 'createdAt', 
                  headerName: 'Created', 
                  flex: 1.2,
                  minWidth: 120,
                },
                { 
                  field: 'status', 
                  headerName: 'Status', 
                  flex: 1,
                  minWidth: 120,
                  renderCell: (params) => (
                    <Chip 
                      label={params.value} 
                      size="small" 
                      color={
                        params.value === 'APPROVED' ? 'success' : 
                        params.value === 'SUBMITTED' ? 'info' : 'default'
                      }
                      sx={{ 
                        width: '100%',
                        maxWidth: '120px',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                      }}
                    />
                  ),
                },
                {
                  field: 'actions',
                  headerName: 'Actions',
                  flex: 1,
                  minWidth: 150,
                  sortable: false,
                  headerAlign: 'left',
                  renderCell: ({ row }) => (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Approve draft">
                        <span>
                          <GradientButton
                            size="small"
                            startIcon={<CheckCircleRounded />}
                            onClick={(e) => { e.stopPropagation(); handleApprove(row.id); }}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            Approve
                          </GradientButton>
                        </span>
                      </Tooltip>
                    </Box>
                  ),
                },
              ]}
              pageSize={10}
              rowsPerPageOptions={[10, 20]}
              onRowClick={(params) => handleDetails(params.id)}
              getRowId={(row) => row?.id ?? row?._id ?? `${row?.customerName || 'draft'}-${row?.createdAt || ''}`}
              localeText={{ noRowsLabel: 'No submitted drafts found.' }}
              sx={{ 
                '& .MuiDataGrid-row': { 
                  cursor: 'pointer',
                  '&:nth-of-type(odd)': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                  },
                },
                '& .MuiDataGrid-columnHeaders': {
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  backgroundColor: theme.palette.background.paper,
                },
                '& .MuiDataGrid-virtualScroller': {
                  overflowX: 'auto',
                  '&::-webkit-scrollbar': {
                    height: '6px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                    borderRadius: '3px',
                  },
                },
              }}
              autoPageSize
              disableColumnMenu
              disableSelectionOnClick
            />
          </Box>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <ImagePreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        src={previewSrc}
        style={previewDimensions}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(4px)',
          },
        }}
        PaperProps={{
          sx: {
            maxWidth: 'none',
            width: 'auto',
            maxHeight: 'none',
            backgroundColor: 'transparent',
            boxShadow: 'none',
            overflow: 'visible',
          },
        }}
      />
      <Dialog 
        open={detailOpen} 
        onClose={() => setDetailOpen(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={fullScreen}
        sx={{
          '& .MuiDialog-paper': {
            m: 0,
            width: '100%',
            maxWidth: '100%',
            [theme.breakpoints.up('md')]: {
              m: 2,
              width: 'calc(100% - 32px)',
              maxWidth: '900px',
              height: 'calc(100% - 64px)',
              maxHeight: '90vh',
            },
          },
        }}
      >
        <DialogTitle>Order Details </DialogTitle>
        <DialogContent 
          dividers 
          sx={{ 
            p: { xs: 1, sm: 2 },
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
              height: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
              borderRadius: '3px',
            },
          }}
        >
          {detailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : !detail ? (
            <Typography color="text.secondary" sx={{ p: 2 }}>No order data available.</Typography>
          ) : (
            <Box>
              {/* Order Header */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
                  <Chip
                    size="small"
                    color={
                      detail.status === 'APPROVED' ? 'success' :
                        detail.status === 'SUBMITTED' ? 'info' : 'default'
                    }
                    label={`Status: ${detail.status || 'PENDING'}`}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Order Date: ${detail.createdAt ? new Date(detail.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}`}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Customer: ${[detail.customerFirstName, detail.customerLastName].filter(Boolean).join(' ') || detail.customerId || 'N/A'}`}
                  />
                  {detail.schoolName && (
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`School: ${detail.schoolName}`}
                    />
                  )}
                  {detail.className && (
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`Class: ${detail.className}`}
                    />
                  )}
                </Box>
                <Divider sx={{ my: 2 }} />
              </Box>

              {/* Order Items */}
              {Array.isArray(detail.items) && detail.items.length > 0 ? (
                <Box sx={{ 
                  overflowX: 'auto',
                  width: '100%',
                  maxWidth: '100%',
                  '&::-webkit-scrollbar': {
                    height: '6px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
                    borderRadius: '3px',
                  },
                }}>
                  <Box
                    component="table"
                    sx={{
                      minWidth: '800px',
                      width: '100%',
                      borderCollapse: 'collapse',
                      bgcolor: theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      borderRadius: 1,
                      boxShadow: theme.shadows[1],
                      '& thead': {
                        bgcolor: theme.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.05)' 
                          : 'rgba(15,23,42,0.035)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                      },
                      '& th, & td': { 
                        p: { xs: 1, sm: 1.25, md: 1.5 },
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                      },
                      '& th': {
                        whiteSpace: 'nowrap',
                        fontWeight: 600,
                      },
                      '& tr': { 
                        borderBottom: '1px solid', 
                        borderColor: theme.palette.divider,
                        '&:nth-of-type(even)': {
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.03)' 
                            : 'rgba(0, 0, 0, 0.02)',
                        },
                      },
                      '& tbody tr:hover': { 
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.06)' 
                          : 'rgba(0, 0, 0, 0.04)' 
                      },
                      '& tfoot': {
                        position: 'sticky',
                        bottom: 0,
                        backgroundColor: theme.palette.background.paper,
                        boxShadow: '0 -2px 4px rgba(0,0,0,0.05)',
                        zIndex: 1,
                      },
                    }}
                  >
                    <Box component="thead">
                      <Box component="tr">
                        <Box component="th" sx={{ textAlign: 'left', width: 48 }} />
                        <Box component="th" sx={{ textAlign: 'left' }}>Title</Box>
                        <Box component="th" sx={{ textAlign: 'left' }}>Author</Box>
                        <Box component="th" sx={{ textAlign: 'center' }}>Condition</Box>
                        <Box component="th" sx={{ textAlign: 'right' }}>Unit Price</Box>
                        <Box component="th" sx={{ textAlign: 'center' }}>Qty</Box>
                        <Box component="th" sx={{ textAlign: 'right' }}>Subtotal</Box>
                      </Box>
                    </Box>
                    <Box component="tbody">
                      {detail.items.map((item, index) => {
                        const basePrice = Number(item.price ?? item.bookPrice ?? 0);
                        const cond = String(item.conditionType ?? item.condition ?? item.bookCondition ?? '').toUpperCase();
                        const isUsed = cond === 'USED';
                        const quantity = Math.max(1, Number(item.quantity || 0));
                        // Prefer server-committed values
                        const committedUnit = item.unitPrice != null ? Number(item.unitPrice) : null;
                        const unitPrice = (committedUnit != null && !Number.isNaN(committedUnit))
                          ? committedUnit
                          : (isUsed ? basePrice * 0.5 : basePrice);
                        const committedSubtotal = item.subtotal != null ? Number(item.subtotal) : null;
                        const subtotal = (committedSubtotal != null && !Number.isNaN(committedSubtotal))
                          ? committedSubtotal
                          : unitPrice * quantity;
                        const displayBase = isUsed ? (unitPrice * 2) : basePrice;

                        return (
                          <Box component="tr" key={item.id || `${item.bookId}-${index}`}>
                            <Box component="td" sx={{ p: 1.5 }}>
                              {(() => {
                                const img = item.imageUrl;
                                return img ? (
                                  <img
                                    src={resolveImageUrl(img)}
                                    alt={item.bookTitle || item.title || 'cover'}
                                    style={{ width: 28, height: 40, objectFit: 'cover', borderRadius: 4, cursor: 'zoom-in' }}
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    onClick={() => { setPreviewSrc(resolveImageUrl(img)); setPreviewOpen(true); }}
                                  />
                                ) : (
                                  <Box sx={{ width: 28, height: 40, borderRadius: 1, bgcolor: 'action.hover' }} />
                                );
                              })()}
                            </Box>
                            <Box component="td" sx={{ p: 1.5 }}><b>{item.bookTitle || item.title || 'N/A'}</b></Box>
                            <Box component="td" sx={{ p: 1.5 }}>{item.bookAuthor || item.author || 'N/A'}</Box>
                            <Box component="td" sx={{ p: 1.5, textAlign: 'center' }}>
                              <Chip
                                label={item.conditionType || 'NEW'}
                                size="small"
                                color={isUsed ? 'default' : 'primary'}
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
                              {isUsed && <Box sx={{ fontSize: '0.75em', color: 'success.main' }}>(50% off)</Box>}
                            </Box>
                            <Box component="td" sx={{ p: 1.5, textAlign: 'center' }}>{quantity}</Box>
                            <Box component="td" sx={{ p: 1.5, textAlign: 'right', fontWeight: 500 }}>${subtotal.toFixed(2)}</Box>
                          </Box>
                        );
                      })}
                    </Box>
                    <Box component="tfoot">
                      <Box component="tr">
                        <Box component="td" colSpan={5} sx={{ p: 2, textAlign: 'right', fontWeight: 600, borderTop: '1px solid', borderColor: (t) => t.palette.divider }}>
                          Total:
                        </Box>
                        <Box component="td" sx={{ p: 2, textAlign: 'right', fontWeight: 700, fontSize: '1.1em', borderTop: '1px solid', borderColor: (t) => t.palette.divider }}>
                          ${detail.items.reduce((total, item) => {
                            const basePrice = Number(item.price ?? item.bookPrice ?? 0);
                            const isUsed = (item.conditionType || '').toUpperCase() === 'USED';
                            const qty = Math.max(1, Number(item.quantity || 0));
                            const committedUnit = item.unitPrice != null ? Number(item.unitPrice) : null;
                            const unit = (committedUnit != null && !Number.isNaN(committedUnit))
                              ? committedUnit
                              : (isUsed ? basePrice * 0.5 : basePrice);
                            const committedSubtotal = item.subtotal != null ? Number(item.subtotal) : null;
                            const sub = (committedSubtotal != null && !Number.isNaN(committedSubtotal))
                              ? committedSubtotal
                              : unit * qty;
                            return total + sub;
                          }, 0).toFixed(2)}
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography color="text.secondary">No items in this order.</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <ImagePreviewDialog open={previewOpen} src={previewSrc} onClose={() => setPreviewOpen(false)} />

    </Box>
  );
}
