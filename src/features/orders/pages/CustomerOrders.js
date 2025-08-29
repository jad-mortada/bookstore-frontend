import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Snackbar,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Divider,
  Tooltip,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { motion } from "framer-motion";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import customerBookOrderService from "../../../api/orders.api";
import bookService from "../../../api/books.api";
import BackgroundFX from "../../../shared/components/ui/BackgroundFX";
import GlassCard from "../../../shared/components/ui/GlassCard";
import { resolveImageUrl } from "../../../shared/utils/image";
import ImagePreviewDialog from "../../../shared/components/ImagePreviewDialog";
import { GlobalStyles } from "@mui/material";

const CustomerOrders = () => {
  const fmtDate = React.useCallback((iso) => {
    if (!iso) return "";
    try {
      const datePart = String(iso).split("T")[0];
      const [y, m, d] = datePart.split("-");
      if (y && m && d) return `${d}/${m}/${y}`;
    } catch (_) {}
    return "";
  }, []);
  const [orders, setOrders] = useState([]);
  const [detailOrder, setDetailOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [deleteOrderId, setDeleteOrderId] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");

  const fetchOrders = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerBookOrderService.getAllOrders();
      // Map backend DTOs to expected DataGrid row structure
      const raw = Array.isArray(res?.data) ? res.data : [];
      const mapped = raw.map((order) => {
        const firstItem = order.orderItems && order.orderItems[0];
        return {
          ...order,
          customer: [order.customerFirstName, order.customerLastName]
            .filter(Boolean)
            .join(" "),
          school: firstItem && firstItem.schoolName ? firstItem.schoolName : "",
          class: firstItem && firstItem.className ? firstItem.className : "",
          year: firstItem && firstItem.year ? String(firstItem.year) : "",
          createdAt: fmtDate(order.orderDate || order.createdAt || ""),
          createdAtRaw: order.orderDate || order.createdAt || "",
          books: (order.orderItems || []).map((b) => b.bookTitle).join(", "),
          authors: (order.orderItems || []).map((b) => b.bookAuthor).join(", "),
        };
      });
      setOrders(mapped);
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to fetch orders.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [fmtDate]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Enrich missing cover images in the detail dialog by joining with books catalog
  useEffect(() => {
    const enrich = async () => {
      try {
        if (
          !detailOrder ||
          !Array.isArray(detailOrder.orderItems) ||
          detailOrder.orderItems.length === 0
        )
          return;
        const needs = detailOrder.orderItems.some(
          (it) => !it?.imageUrl && !it?.book?.imageUrl
        );
        if (!needs) return;
        const res = await bookService.getBooks();
        const catalog = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.content)
          ? res.data.content
          : [];
        const byId = new Map((catalog || []).map((b) => [String(b?.id), b]));
        const byTitle = new Map(
          (catalog || []).map((b) => [
            String((b?.title || "").toLowerCase().trim()),
            b,
          ])
        );
        const pickImg = (b) =>
          b?.imageUrl ||
          b?.bookImageUrl ||
          b?.coverUrl ||
          b?.imagePath ||
          (b?.book && (b.book.imageUrl || b.book.coverUrl)) ||
          "";
        const items = (detailOrder.orderItems || []).map((it) => {
          if (it?.imageUrl) return it;
          const keyTitle = String(it?.bookTitle || it?.title || "")
            .toLowerCase()
            .trim();
          const match = byId.get(String(it?.bookId)) || byTitle.get(keyTitle);
          const img = pickImg(match);
          return img ? { ...it, imageUrl: img } : it;
        });
        setDetailOrder((prev) =>
          prev ? { ...prev, orderItems: items } : prev
        );
      } catch (_) {}
    };
    enrich();
  }, [detailOrder]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async () => {
    try {
      await customerBookOrderService.deleteOrder(deleteOrderId);
      setSnackbar({
        open: true,
        message: "Order deleted.",
        severity: "success",
      });
      setDeleteOrderId(null);
      fetchOrders();
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to delete order.",
        severity: "error",
      });
    }
  };

  const columns = [
    {
      field: "id",
      headerName: "Order ID",
      width: 100,
      headerClassName: "header-cell",
    },
    {
      field: "customer",
      headerName: "Customer",
      width: 160,
      headerClassName: "header-cell",
    },
    {
      field: "school",
      headerName: "School",
      width: 140,
      headerClassName: "header-cell",
    },
    {
      field: "class",
      headerName: "Class",
      width: 140,
      headerClassName: "header-cell",
    },
    {
      field: "year",
      headerName: "Year",
      width: 80,
      headerClassName: "header-cell",
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 160,
      headerClassName: "header-cell",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      headerClassName: "header-cell last-column",
      renderCell: (params) => (
        <Tooltip title={`Delete order #${params?.row?.id ?? ""}`}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              setDeleteOrderId(params.row.id);
            }}
            size="small"
            color="error"
            aria-label={`Delete order ${params?.row?.id ?? ""}`}
          >
            <DeleteOutlineRounded />
          </IconButton>
        </Tooltip>
      ),
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      disableColumnMenu: true,
      resizable: false,
      flex: 0,
    },
  ];

  const filteredOrders = (Array.isArray(orders) ? orders : []).filter((o) => {
    const q = String(debouncedSearch || "")
      .trim()
      .toLowerCase();
    if (!q) return true;
    const hay = [
      o.id,
      o.customer,
      o.school,
      o.class,
      o.year,
      o.createdAt,
      o.books,
      o.authors,
    ]
      .filter((v) => v !== undefined && v !== null)
      .map((v) => String(v).toLowerCase())
      .join(" ");
    return hay.includes(q);
  });

  return (
    <>
      <GlobalStyles
        styles={{
          ".MuiDataGrid-columnHeader:last-child .MuiDataGrid-columnSeparator": {
            display: "none !important",
          },
        }}
      />
      <BackgroundFX>
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: "100%", mx: 0 }}>
          <GlassCard
            elevation={6}
            sx={{ borderRadius: 3, mb: 2, p: { xs: 2, md: 3 } }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                mb: 2,
                flexWrap: "wrap",
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800, mr: "auto" }}>
                Customer Orders
              </Typography>
              <TextField
                size="small"
                label="Search orders"
                placeholder="Search by id, customer, school, class, year"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ minWidth: 220, maxWidth: 360 }}
                slotProps={{
                  input: {
                    endAdornment: search ? (
                      <IconButton
                        size="small"
                        onClick={() => setSearch("")}
                        aria-label="Clear search"
                      >
                        ✕
                      </IconButton>
                    ) : null,
                  },
                }}
              />
            </Box>
            {!loading &&
            (Array.isArray(orders) ? orders.length === 0 : true) ? (
              <GlassCard elevation={0} sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  No orders yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your orders will appear here once you place one.
                </Typography>
              </GlassCard>
            ) : (
              <GlassCard elevation={0} sx={{ p: 0, width: "100%" }}>
                <Box
                  sx={{
                    width: "100%",
                    overflow: "hidden",
                    position: "relative",
                    "& .scrollable-container": {
                      width: "100%",
                      overflowX: "auto",
                      WebkitOverflowScrolling: "touch",
                      "&::-webkit-scrollbar": {
                        height: "8px",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "rgba(0, 0, 0, 0.2)",
                        borderRadius: "4px",
                      },
                      "&::-webkit-scrollbar-track": {
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                      },
                      "& .MuiDataGrid-root": {
                        minWidth: "fit-content",
                        width: "auto",
                      },
                    },
                  }}
                >
                  <div className="scrollable-container">
                    <DataGrid
                      rows={filteredOrders}
                      columns={columns}
                      pageSize={10}
                      rowsPerPageOptions={[10, 20, 30]}
                      loading={loading}
                      getRowId={(row) =>
                        row?.id ??
                        row?._id ??
                        `${row?.customer || "order"}-${row?.createdAtRaw || ""}`
                      }
                      disableSelectionOnClick
                      onRowClick={(params) => setDetailOrder(params.row)}
                      localeText={{ noRowsLabel: "No orders yet." }}
                      columnVisibilityModel={{ actions: true }}
                      columnBuffer={columns.length}
                      columnThreshold={columns.length}
                      disableColumnSelector
                      disableColumnMenu
                      sx={(theme) => ({
                        "& .MuiDataGrid-root": {
                          border: "none",
                          width: "100%",
                          minWidth: "fit-content",
                        },
                        "& .MuiDataGrid-main": {
                          width: "100%",
                          minWidth: "fit-content",
                        },
                        "& .MuiDataGrid-virtualScroller": {
                          overflowX: "auto",
                          overflowY: "hidden",
                          minWidth: "fit-content !important",
                        },
                        "& .MuiDataGrid-columnHeaders": {
                          bgcolor: "rgba(15,23,42,0.04)",
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                          minWidth: "fit-content",
                        },
                        "& .MuiDataGrid-row": {
                          minWidth: "fit-content !important",
                        },
                        "& .MuiDataGrid-cell": {
                          borderColor: theme.palette.divider,
                          whiteSpace: "nowrap",
                          minWidth: "150px !important",
                        },
                        "& .MuiDataGrid-columnHeader": {
                          minWidth: "150px !important",
                        },
                        "& .MuiDataGrid-columnSeparator": {
                          display: "none",
                        },
                        "& .MuiDataGrid-columnHeaderTitle": {
                          fontWeight: "600",
                        },
                        "& .MuiDataGrid-row:nth-of-type(even)": {
                          backgroundColor: "rgba(0, 0, 0, 0.05)",
                          "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.07)" },
                        },
                        "& .MuiDataGrid-row:nth-of-type(odd)": {
                          backgroundColor: "white",
                          "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                        },
                      })}
                    />
                  </div>
                </Box>
              </GlassCard>
            )}
          </GlassCard>
          {/* Order Details Dialog */}
          <Dialog
            open={!!detailOrder}
            onClose={() => setDetailOrder(null)}
            fullWidth
            maxWidth="md"
          >
            <DialogTitle>Order Details</DialogTitle>
            <DialogContent dividers>
              {detailOrder && (
                <Box>
                  {/* Header Chips */}
                  <Box
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 2 }}
                  >
                    <Chip
                      size="small"
                      color={
                        (detailOrder.status || "APPROVED") === "APPROVED"
                          ? "success"
                          : "default"
                      }
                      label={`Status: ${detailOrder.status || "APPROVED"}`}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`Order Date: ${fmtDate(
                        detailOrder.createdAtRaw ||
                          detailOrder.orderDate ||
                          detailOrder.createdAt ||
                          ""
                      )}`}
                    />
                    {detailOrder.customer && (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`Customer: ${detailOrder.customer}`}
                      />
                    )}
                    {detailOrder.school && (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`School: ${detailOrder.school}`}
                      />
                    )}
                    {detailOrder.class && (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`Class: ${detailOrder.class}`}
                      />
                    )}
                    {(detailOrder.orderItems || [])[0]?.year && (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`Year: ${String(
                          (detailOrder.orderItems || [])[0].year
                        )}`}
                      />
                    )}
                  </Box>

                  <Divider />

                  {/* Items Table */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      Books in Order
                    </Typography>
                    <Box sx={{ overflowX: "auto" }}>
                      <Box
                        component="table"
                        sx={{
                          width: "100%",
                          borderCollapse: "collapse",
                          bgcolor: (t) => t.palette.background.paper,
                          color: (t) => t.palette.text.primary,
                          borderRadius: 1,
                          boxShadow: (t) => t.shadows[1],
                          "& thead": {
                            bgcolor: "rgba(15,23,42,0.035)",
                          },
                          "& th, & td": { p: 1.25 },
                          "& tr": {
                            borderBottom: "0.0625rem solid",
                            borderColor: (t) => t.palette.divider,
                          },
                          "& tbody tr:hover": {
                            bgcolor: "rgba(15,23,42,0.03)",
                          },
                        }}
                      >
                        <Box component="thead">
                          <Box component="tr">
                            <Box component="th" sx={{ width: 48 }}></Box>
                            <Box component="th" sx={{ textAlign: "left" }}>
                              Title
                            </Box>
                            <Box component="th" sx={{ textAlign: "left" }}>
                              Author
                            </Box>
                            <Box component="th" sx={{ textAlign: "center" }}>
                              Condition
                            </Box>
                            <Box component="th" sx={{ textAlign: "right" }}>
                              Unit Price
                            </Box>
                            <Box component="th" sx={{ textAlign: "center" }}>
                              Qty
                            </Box>
                            <Box component="th" sx={{ textAlign: "right" }}>
                              Subtotal
                            </Box>
                          </Box>
                        </Box>
                        <Box component="tbody">
                          {(detailOrder.orderItems || []).map((item, idx) => {
                            const basePrice = Number(
                              item.price ?? item.bookPrice ?? 0
                            );
                            const cond = String(
                              item.conditionType ??
                                item.condition ??
                                item.bookCondition ??
                                ""
                            ).toUpperCase();
                            const isUsed = cond === "USED";
                            const qty = Math.max(1, Number(item.quantity || 0));
                            const rawExplicit = Number(item.unitPrice);
                            const hasExplicitUnit =
                              !Number.isNaN(rawExplicit) &&
                              item.unitPrice !== null &&
                              item.unitPrice !== undefined;
                            const approxEq = (a, b) =>
                              Math.abs(Number(a) - Number(b)) <= 0.005;
                            const expectedUsed = basePrice * 0.5;
                            const normalizedExplicit = (() => {
                              if (!hasExplicitUnit) return null;
                              const perUnitCandidate = rawExplicit / qty;
                              if (isUsed) {
                                if (approxEq(rawExplicit, expectedUsed))
                                  return rawExplicit;
                                if (approxEq(perUnitCandidate, expectedUsed))
                                  return perUnitCandidate;
                                if (qty > 1) return perUnitCandidate;
                                return rawExplicit;
                              } else {
                                if (approxEq(rawExplicit, basePrice))
                                  return rawExplicit;
                                if (approxEq(perUnitCandidate, basePrice))
                                  return perUnitCandidate;
                                if (qty > 1) return perUnitCandidate;
                                return rawExplicit;
                              }
                            })();
                            const unitPrice =
                              normalizedExplicit != null
                                ? normalizedExplicit
                                : isUsed
                                ? expectedUsed
                                : basePrice;
                            const displayBase = isUsed
                              ? normalizedExplicit != null
                                ? normalizedExplicit / 0.5
                                : basePrice
                              : basePrice;
                            const quantity = Number(item.quantity || 0);
                            const subtotal = unitPrice * quantity;
                            return (
                              <motion.tr
                                key={
                                  item.id ||
                                  `${item.bookId || item.id || "row"}-${idx}`
                                }
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Box component="td" sx={{ p: 1.25 }}>
                                  {(() => {
                                    const img = item.imageUrl;
                                    return img ? (
                                      <img
                                        src={resolveImageUrl(img)}
                                        alt={
                                          item.bookTitle ||
                                          item.title ||
                                          "cover"
                                        }
                                        style={{
                                          width: 28,
                                          height: 40,
                                          objectFit: "cover",
                                          borderRadius: 4,
                                          cursor: "zoom-in",
                                        }}
                                        onError={(e) => {
                                          e.currentTarget.style.display =
                                            "none";
                                        }}
                                        onClick={() => {
                                          setPreviewSrc(resolveImageUrl(img));
                                          setPreviewOpen(true);
                                        }}
                                      />
                                    ) : (
                                      <Box
                                        sx={{
                                          width: 28,
                                          height: 40,
                                          borderRadius: 1,
                                          bgcolor: "action.hover",
                                        }}
                                      />
                                    );
                                  })()}
                                </Box>
                                <Box component="td" sx={{ p: 1.25 }}>
                                  <b>{item.bookTitle || item.title || "N/A"}</b>
                                </Box>
                                <Box component="td" sx={{ p: 1.25 }}>
                                  {item.bookAuthor || item.author || "N/A"}
                                </Box>
                                <Box
                                  component="td"
                                  sx={{ p: 1.25, textAlign: "center" }}
                                >
                                  <Chip
                                    label={
                                      item.conditionType ||
                                      item.condition ||
                                      item.bookCondition ||
                                      "NEW"
                                    }
                                    size="small"
                                    color={isUsed ? "default" : "primary"}
                                    variant="outlined"
                                  />
                                </Box>
                                <Box
                                  component="td"
                                  sx={{ p: 1.25, textAlign: "right" }}
                                >
                                  {isUsed && (
                                    <Box
                                      sx={{
                                        textDecoration: "line-through",
                                        color: "text.secondary",
                                        fontSize: "0.85em",
                                      }}
                                    >
                                      ${Number(displayBase || 0).toFixed(2)}
                                    </Box>
                                  )}
                                  <Box>${unitPrice.toFixed(2)}</Box>
                                  {isUsed && (
                                    <Box
                                      sx={{
                                        fontSize: "0.75em",
                                        color: (t) => t.palette.success.main,
                                      }}
                                    >
                                      (50% off)
                                    </Box>
                                  )}
                                </Box>
                                <Box
                                  component="td"
                                  sx={{ p: 1.25, textAlign: "center" }}
                                >
                                  {quantity}
                                </Box>
                                <Box
                                  component="td"
                                  sx={{
                                    p: 1.25,
                                    textAlign: "right",
                                    fontWeight: 500,
                                  }}
                                >
                                  ${subtotal.toFixed(2)}
                                </Box>
                              </motion.tr>
                            );
                          })}
                        </Box>
                        <Box component="tfoot">
                          <Box component="tr">
                            <Box
                              component="td"
                              colSpan={5}
                              sx={{
                                p: "1.75rem",
                                textAlign: "right",
                                fontWeight: 600,
                                borderTop: "0.0625rem solid",
                                borderColor: (t) => t.palette.divider,
                              }}
                            >
                              Total:
                            </Box>
                            <Box
                              component="td"
                              sx={{
                                p: "1.75rem",
                                textAlign: "right",
                                fontWeight: 700,
                                fontSize: "1.05em",
                                borderTop: "0.0625rem solid",
                                borderColor: (t) => t.palette.divider,
                              }}
                            >
                              $
                              {(detailOrder.orderItems || [])
                                .reduce((total, item) => {
                                  const basePrice = Number(
                                    item.price ?? item.bookPrice ?? 0
                                  );
                                  const cond = String(
                                    item.conditionType ??
                                      item.condition ??
                                      item.bookCondition ??
                                      ""
                                  ).toUpperCase();
                                  const isUsed = cond === "USED";
                                  const qty = Math.max(
                                    1,
                                    Number(item.quantity || 0)
                                  );
                                  const rawExplicit = Number(item.unitPrice);
                                  const hasExplicitUnit =
                                    !Number.isNaN(rawExplicit) &&
                                    item.unitPrice !== null &&
                                    item.unitPrice !== undefined;
                                  const approxEq = (a, b) =>
                                    Math.abs(Number(a) - Number(b)) <= 0.005;
                                  const expectedUsed = basePrice * 0.5;
                                  const normalizedExplicit = (() => {
                                    if (!hasExplicitUnit) return null;
                                    const perUnitCandidate = rawExplicit / qty;
                                    if (isUsed) {
                                      if (approxEq(rawExplicit, expectedUsed))
                                        return rawExplicit;
                                      if (
                                        approxEq(perUnitCandidate, expectedUsed)
                                      )
                                        return perUnitCandidate;
                                      if (qty > 1) return perUnitCandidate;
                                      return rawExplicit;
                                    } else {
                                      if (approxEq(rawExplicit, basePrice))
                                        return rawExplicit;
                                      if (approxEq(perUnitCandidate, basePrice))
                                        return perUnitCandidate;
                                      if (qty > 1) return perUnitCandidate;
                                      return rawExplicit;
                                    }
                                  })();
                                  const unitPrice =
                                    normalizedExplicit != null
                                      ? normalizedExplicit
                                      : isUsed
                                      ? expectedUsed
                                      : basePrice;
                                  return (
                                    total +
                                    unitPrice * Number(item.quantity || 0)
                                  );
                                }, 0)
                                .toFixed(2)}
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailOrder(null)}>Close</Button>
            </DialogActions>
          </Dialog>
          <ImagePreviewDialog
            open={previewOpen}
            src={previewSrc}
            onClose={() => setPreviewOpen(false)}
          />
          {/* Delete Confirmation Dialog */}
          <Dialog
            open={!!deleteOrderId}
            onClose={() => setDeleteOrderId(null)}
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle>Delete Order?</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete this order?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteOrderId(null)}>Cancel</Button>
              <Button onClick={handleDelete} color="error" variant="contained">
                Delete
              </Button>
            </DialogActions>
          </Dialog>
          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
          </Snackbar>
        </Box>
      </BackgroundFX>
    </>
  );
};

export default CustomerOrders;
