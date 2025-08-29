import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
  MenuItem,
  Tooltip,
  Typography,
  Card,
  CardHeader,
  CardContent,
  useMediaQuery,
  useTheme,
  Grid,
  CircularProgress,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { GlobalStyles } from "@mui/material";
import {
  AddRounded,
  EditRounded,
  DeleteOutlineRounded,
  MenuBookRounded,
} from "@mui/icons-material";
import { AuthContext } from "../../../shared/contexts/AuthContext";
import { useLoading } from "../../../shared/contexts/LoadingContext";
import classService from "../../../api/classes.api";
import listService from "../../../api/lists.api";
import bookService from "../../../api/books.api";
import schoolService from "../../../api/schools.api";
import BackgroundFX from "../../../shared/components/effects/BackgroundFX";
import GlassCard from "../../../shared/components/ui/GlassCard";
import GradientButton from "../../../shared/components/ui/GradientButton";
import SectionHeader from "../../../shared/components/ui/SectionHeader";
import { resolveImageUrl } from "../../../shared/utils/image";

const initialForm = { classId: "", year: "" };

const YearlyBookListManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const isAdmin =
    user?.roles?.includes("ROLE_ADMIN") ||
    user?.roles?.includes("ROLE_SUPER_ADMIN");
  const [lists, setLists] = useState([]);
  const [classes, setClasses] = useState([]);
  const [schools, setSchools] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const addButtonRef = useRef();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);
  const [loadingState, setLoadingState] = useState({
    loading: true,
    error: null,
  });
  // Book viewing dialog state
  const [viewBooksOpen, setViewBooksOpen] = useState(false);
  const [viewBooksListId, setViewBooksListId] = useState(null);
  const [viewBooks, setViewBooks] = useState([]);
  const [viewBooksLoading, setViewBooksLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState("");

  // No client-side cover enrichment; backend provides imageUrl

  // Load all data on mount
  useEffect(() => {
    setLoadingState({ loading: true, error: null });
    Promise.all([classService.getClasses(), schoolService.getSchools()])
      .then(([classRes, schoolRes]) => {
        setClasses(classRes.data || []);
        setSchools(schoolRes.data || []);
        setLoadingState({ loading: false, error: null });
      })
      .catch(() => {
        setLoadingState({
          loading: false,
          error: "Failed to load required data. Please try again later.",
        });
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
        const cls = classes.find((c) => String(c.id) === String(item.classId));
        const school =
          cls && schools.find((s) => String(s.id) === String(cls.schoolId));
        let schoolDisplay = "";
        if (cls && school) {
          const sameNameSchools = schools.filter((s) => s.name === school.name);
          schoolDisplay =
            sameNameSchools.length > 1
              ? `${school.name} (${school.address})`
              : school.name;
          return {
            ...item,
            id: item.id || item.listId || idx,
            schoolClassDisplay: `${schoolDisplay} - ${cls.name}`,
          };
        }
        return {
          ...item,
          id: item.id || item.listId || idx,
          schoolClassDisplay: "",
        };
      });
      setLists(newLists);
    } finally {
      setLoading(false);
    }
  };

  // Dialog open/close
  const handleOpen = (list = initialForm) => {
    setForm(list);
    setEditId(list.id || null);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setForm(initialForm);
    setEditId(null);
    setTimeout(() => {
      if (addButtonRef.current) addButtonRef.current.focus();
    }, 0);
  };
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Submit (add/edit)
  const handleSubmit = async () => {
    try {
      if (editId) {
        await listService.updateList(editId, form);
        setSnackbar({
          open: true,
          message: "List updated!",
          severity: "success",
        });
      } else {
        await listService.createList(form);
        setSnackbar({
          open: true,
          message: "List created!",
          severity: "success",
        });
      }
      handleClose();
      try {
        await fetchLists();
      } catch {}
    } catch (error) {
      const status = error?.response?.status;
      const serverMsg =
        typeof error?.response?.data === "string"
          ? error.response.data
          : error?.message || "";
      let message = "Error saving list";
      if (status === 409) {
        // Duplicate list (class + year) or other duplicates
        message =
          "A yearly list for the selected class and year already exists.";
      } else if (status === 400) {
        message = "Please check the form fields. Some inputs are invalid.";
      } else if (status === 404) {
        message = "The selected class was not found.";
      } else if (status === 403) {
        message = "You do not have permission to perform this action.";
      } else if (serverMsg) {
        message = serverMsg;
      }
      setSnackbar({ open: true, message, severity: "error" });
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (id === undefined || id === null) {
      setSnackbar({
        open: true,
        message: "Invalid list ID.",
        severity: "error",
      });
      return;
    }
    if (window.confirm("Delete this list?")) {
      setLoading(true);
      try {
        await listService.deleteList(id);
        setSnackbar({
          open: true,
          message: "List deleted!",
          severity: "success",
        });
        await fetchLists();
      } catch (error) {
        const status = error?.response?.status;
        const data = error?.response?.data;
        const serverMsg =
          typeof data === "string"
            ? data
            : data?.message || error?.message || "Unknown error";
        let message = `Error deleting list: ${serverMsg}`;
        if (status === 404) message = "List not found.";
        if (status === 403)
          message = "You do not have permission to perform this action.";
        setSnackbar({ open: true, message, severity: "error" });
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
      let items = Array.isArray(res.data) ? res.data : [];
      // If imageUrl is missing, enrich from catalog
      if (items.some((b) => !b.imageUrl)) {
        try {
          const booksRes = await bookService.getBooks();
          const byId = new Map(
            (Array.isArray(booksRes.data) ? booksRes.data : []).map((b) => [
              String(b.id),
              b,
            ])
          );
          items = items.map((lb) => {
            if (lb.imageUrl) return lb;
            const match = byId.get(String(lb.bookId));
            return match ? { ...lb, imageUrl: match.imageUrl } : lb;
          });
        } catch {}
      }
      setViewBooks(items);
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
      setSnackbar({
        open: true,
        message: "Book removed from list!",
        severity: "success",
      });
      // Refresh the book list
      const res = await listService.getListBooks(viewBooksListId);
      setViewBooks(res.data || []);
    } catch (error) {
      console.error("Error unlinking book:", error);
      setSnackbar({
        open: true,
        message: "Failed to remove book from list. Please try again.",
        severity: "error",
      });
    } finally {
      setViewBooksLoading(false);
    }
  };

  // Defensive: wait for all data
  if (!isAdmin) return null;
  if (loadingState.loading) {
    return (
      <Box
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <GlassCard sx={{ width: "100%", maxWidth: 800 }}>
          <CardHeader
            title={
              <Typography variant="h5" component="h1">
                Yearly Book Lists
              </Typography>
            }
          />
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 300,
              p: 4,
            }}
          >
            <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Loading Data
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Please wait while we load the yearly lists...
            </Typography>
          </CardContent>
        </GlassCard>
      </Box>
    );
  } else if (loadingState.error) {
    return (
      <Box
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <GlassCard sx={{ width: "100%", maxWidth: 800 }}>
          <CardHeader
            title={
              <Typography variant="h5" component="h1">
                Yearly Book Lists
              </Typography>
            }
          />
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Alert
              severity="error"
              sx={{
                "& .MuiAlert-message": { width: "100%" },
                "& .MuiAlert-icon": { alignItems: "center" },
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight={500} gutterBottom>
                  Failed to Load Data
                </Typography>
                <Typography variant="body2">{loadingState.error}</Typography>
                <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setLoadingState({ loading: true, error: null });
                      Promise.all([
                        classService.getClasses(),
                        schoolService.getSchools(),
                      ])
                        .then(([classRes, schoolRes]) => {
                          setClasses(classRes.data || []);
                          setSchools(schoolRes.data || []);
                          setLoadingState({ loading: false, error: null });
                        })
                        .catch(() => {
                          setLoadingState({
                            loading: false,
                            error:
                              "Failed to load required data. Please try again later.",
                          });
                        });
                    }}
                  >
                    Refresh Data
                  </Button>
                </Box>
              </Box>
            </Alert>
          </CardContent>
        </GlassCard>
      </Box>
    );
  }
  if (!classes.length || !schools.length) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, width: "100%" }}>
        <GlassCard>
          <CardHeader
            title={
              <Typography variant="h5" component="h1">
                Yearly Book Lists
              </Typography>
            }
          />
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                p: 3,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  bgcolor: "action.hover",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <MenuBookRounded
                  sx={{ fontSize: 40, color: "text.secondary" }}
                />
              </Box>
              <Typography variant="h6" gutterBottom>
                No Data Available
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {classes.length === 0 && schools.length === 0
                  ? "No classes or schools have been created yet."
                  : "No yearly book lists found for the current selection."}
              </Typography>
              {isAdmin && (
                <GradientButton
                  startIcon={<AddRounded />}
                  onClick={() => handleOpen()}
                  sx={{ mt: 2 }}
                >
                  Create Your First List
                </GradientButton>
              )}
            </Box>
          </CardContent>
        </GlassCard>
      </Box>
    );
  }

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
        <Box
          sx={{
            p: { xs: 1, sm: 2, md: 3 },
            maxWidth: "100vw",
            mx: 0,
            width: "100%",
            overflowX: "hidden",
          }}
        >
          <GlassCard
            sx={{
              p: { xs: 2, md: 3 },
              border: "0.0625rem solid rgba(15,23,42,0.08)",
            }}
          >
            <SectionHeader
              title="Yearly Book Lists"
              subtitle="Create and manage yearly lists by class."
            />
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" },
                justifyContent: "space-between",
                gap: 2,
                mb: 2,
                width: "100%",
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  minWidth: { xs: "100%", sm: 220 },
                  maxWidth: { xs: "100%", sm: 360 },
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  label="Search lists"
                  placeholder="Search by school, class, year"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    endAdornment: search ? (
                      <IconButton
                        size="small"
                        onClick={() => setSearch("")}
                        aria-label="Clear search"
                        sx={{ mr: -1 }}
                      >
                        ✕
                      </IconButton>
                    ) : null,
                  }}
                />
              </Box>
              {isAdmin && (
                <Box
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    mt: { xs: 1, sm: 0 },
                  }}
                >
                  <Tooltip title="Create a new yearly list">
                    <GradientButton
                      fullWidth={isMobile}
                      startIcon={<AddRounded />}
                      onClick={() => handleOpen()}
                      aria-label="Add yearly list"
                    >
                      Add List
                    </GradientButton>
                  </Tooltip>
                </Box>
              )}
            </Box>
            <Box
              sx={{
                height: 480,
                width: "100%",
                overflowX: "auto",
                "& .MuiDataGrid-root": {
                  minWidth: 600, // Ensure DataGrid has a minimum width
                },
                "& .MuiDataGrid-cell": {
                  whiteSpace: "normal !important",
                  wordWrap: "break-word",
                },
              }}
            >
              <DataGrid
                rows={(Array.isArray(lists) ? lists : []).filter((r) => {
                  const q = String(debouncedSearch || "")
                    .trim()
                    .toLowerCase();
                  if (!q) return true;
                  const hay = [r.schoolClassDisplay, r.year]
                    .filter((v) => v !== undefined && v !== null)
                    .map((v) => String(v).toLowerCase())
                    .join(" ");
                  return hay.includes(q);
                })}
                columns={[
                  {
                    field: "schoolClassDisplay",
                    headerName: "School - Class",
                    flex: 1.5,
                  },
                  {
                    field: "year",
                    headerName: "Year",
                    flex: 0.5,
                    minWidth: 80,
                    headerAlign: "left",
                    align: "left",
                  },
                  {
                    field: "actions",
                    headerName: "Actions",
                    flex: 1,
                    minWidth: isMobile ? 120 : 180,
                    sortable: false,
                    headerAlign: "center",
                    renderCell: ({ row }) => (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Tooltip title="View books in this list">
                          <IconButton
                            color="primary"
                            onClick={() => handleViewBooks(row.id)}
                            aria-label={`View books for list ${
                              row.className || ""
                            } ${row.year || ""}`}
                          >
                            <MenuBookRounded />
                          </IconButton>
                        </Tooltip>
                        {isAdmin && (
                          <Box>
                            <Tooltip title="Edit list">
                              <IconButton
                                onClick={() => handleOpen(row)}
                                aria-label={`Edit list ${row.className || ""} ${
                                  row.year || ""
                                }`}
                              >
                                <EditRounded />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete list">
                              <IconButton
                                color="error"
                                onClick={() => handleDelete(row.id)}
                                aria-label={`Delete list ${
                                  row.className || ""
                                } ${row.year || ""}`}
                              >
                                <DeleteOutlineRounded />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </Box>
                    ),
                    align: "left",
                    headerAlign: "left",
                  },
                ]}
                pageSize={7}
                rowsPerPageOptions={[7, 14, 21]}
                disableSelectionOnClick
                components={{
                  Toolbar: GridToolbar,
                }}
                componentsProps={{
                  toolbar: {
                    showQuickFilter: true,
                    quickFilterProps: { debounceMs: 500 },
                  },
                }}
                getRowId={(row) =>
                  row?.id ??
                  row?.listId ??
                  `${row?.schoolClassDisplay || "list"}-${row?.year || ""}`
                }
                sx={{
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "background.paper",
                  },
                  "& .MuiDataGrid-columnHeader:last-of-type, & .MuiDataGrid-cell:last-of-type":
                    {
                      paddingRight: "16px !important",
                    },
                  "& .MuiDataGrid-columnSeparator": {
                    color: theme.palette.divider,
                  },
                  borderRadius: 2,
                  backgroundColor: "background.paper",
                  boxShadow: 1,
                  "& .MuiDataGrid-row:nth-of-type(even)": {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                    "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.07)" },
                  },
                  "& .MuiDataGrid-row:nth-of-type(odd)": {
                    backgroundColor: "white",
                    "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                  },
                }}
                loading={loading}
                localeText={{ noRowsLabel: "No lists found." }}
              />
            </Box>
          </GlassCard>

          <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            fullScreen={isMobile}
          >
            <DialogTitle>{editId ? "Edit List" : "Add List"}</DialogTitle>
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
                {classes.map((cls) => {
                  const school = schools.find(
                    (s) => String(s.id) === String(cls.schoolId)
                  );
                  const sameNameSchools = schools.filter(
                    (s) => s.name === school?.name
                  );
                  const schoolDisplay = school
                    ? sameNameSchools.length > 1
                      ? `${school.name} (${school.address})`
                      : school.name
                    : "";
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
                  return Array.from(
                    { length: 15 },
                    (_, i) => currentYear - i
                  ).map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ));
                })()}
              </TextField>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "flex-end", gap: 1, p: 2 }}>
              <Button onClick={handleClose} size="small">
                Cancel
              </Button>
              <GradientButton onClick={handleSubmit} size="small">
                {editId ? "Update" : "Create"}
              </GradientButton>
            </DialogActions>
          </Dialog>
          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
          </Snackbar>

          {/* View Books Dialog */}
          <Dialog
            open={viewBooksOpen}
            onClose={() => setViewBooksOpen(false)}
            fullWidth
            maxWidth="md"
            fullScreen={isMobile}
            sx={{
              "& .MuiDialog-paper": {
                m: 0,
                width: "100%",
                maxHeight: "100%",
              },
            }}
          >
            <DialogTitle>Books in List</DialogTitle>
            <DialogContent>
              {viewBooksLoading ? (
                <Typography>Loading books...</Typography>
              ) : viewBooks.length === 0 ? (
                <Typography>No books in this list.</Typography>
              ) : (
                <Box>
                  {viewBooks.map((book) => (
                    <Box
                      key={book.listBookId || book.bookId || book.id}
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "flex-start", sm: "center" },
                        mb: 2,
                        p: 1.5,
                        gap: 1.5,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    >
                      {(() => {
                        const img =
                          book.imageUrl ||
                          book.bookImageUrl ||
                          book.imageURL ||
                          (book.book &&
                            (book.book.imageUrl || book.book.imageURL)) ||
                          book.coverUrl ||
                          book.imagePath;
                        return img ? (
                          <img
                            src={resolveImageUrl(img)}
                            alt={book.bookTitle || book.title || "cover"}
                            style={{
                              width: 32,
                              height: 44,
                              objectFit: "cover",
                              borderRadius: 4,
                              cursor: "zoom-in",
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                            onClick={() => {
                              setPreviewSrc(resolveImageUrl(img));
                              setPreviewOpen(true);
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 32,
                              height: 44,
                              borderRadius: 1,
                              bgcolor: "action.hover",
                            }}
                          />
                        );
                      })()}
                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          width: "100%",
                          mb: { xs: 1, sm: 0 },
                        }}
                      >
                        <Typography noWrap sx={{ fontWeight: 500 }}>
                          {book.bookTitle || book.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          {book.bookAuthor || book.author || ""}
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        color="error"
                        size={isMobile ? "small" : "medium"}
                        fullWidth={isMobile}
                        onClick={() => handleUnlinkBook(book.id)}
                        sx={{
                          alignSelf: { xs: "stretch", sm: "center" },
                          mt: { xs: 1, sm: 0 },
                          ml: { sm: 2 },
                        }}
                      >
                        Remove
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewBooksOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>
          {/* Image Preview Dialog */}
          <Dialog
            open={previewOpen}
            onClose={() => setPreviewOpen(false)}
            maxWidth="md"
            fullScreen={isMobile}
          >
            <DialogTitle>Cover Preview</DialogTitle>
            <DialogContent dividers>
              {previewSrc && (
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <img
                    src={previewSrc}
                    alt="cover"
                    style={{
                      maxWidth: "90vw",
                      maxHeight: "80vh",
                      objectFit: "contain",
                      width: "auto",
                      height: "auto",
                      display: "block",
                      margin: "0 auto",
                    }}
                  />
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPreviewOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </BackgroundFX>
    </>
  );
};

export default YearlyBookListManagement;
