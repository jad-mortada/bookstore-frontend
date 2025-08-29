import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Typography,
  MenuItem,
  TextField,
  Checkbox,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { AuthContext } from "../../../shared/contexts/AuthContext";
import { useLoading } from "../../../shared/contexts/LoadingContext";
import listService from "../../../api/lists.api";
import bookService from "../../../api/books.api";
import classService from "../../../api/classes.api";
import schoolService from "../../../api/schools.api";
import BackgroundFX from "../../../shared/components/ui/BackgroundFX";
import GlassCard from "../../../shared/components/ui/GlassCard";
import SectionHeader from "../../../shared/components/ui/SectionHeader";
import { resolveImageUrl } from "../../../shared/utils/image";

const ListBooksManagement = () => {
  const { setLoading } = useLoading();
  const { user } = useContext(AuthContext);
  const isAdmin =
    user?.roles?.includes("ROLE_ADMIN") ||
    user?.roles?.includes("ROLE_SUPER_ADMIN");
  const [lists, setLists] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedList, setSelectedList] = useState("");
  const [linkedBooks, setLinkedBooks] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [classes, setClasses] = useState([]);
  const [schools, setSchools] = useState([]);
  const [search, setSearch] = useState("");

  // Load all data on mount
  useEffect(() => {
    setLoading(true);
    listService
      .getLists()
      .then((res) => setLists(res.data || []))
      .finally(() => setLoading(false));
  }, [setLoading]);
  useEffect(() => {
    setLoading(true);
    bookService
      .getBooks()
      .then((res) => setBooks(res.data || []))
      .finally(() => setLoading(false));
  }, [setLoading]);
  useEffect(() => {
    setLoading(true);
    classService
      .getClasses()
      .then((res) => setClasses(res.data || []))
      .finally(() => setLoading(false));
  }, [setLoading]);
  useEffect(() => {
    setLoading(true);
    schoolService
      .getSchools()
      .then((res) => setSchools(res.data || []))
      .finally(() => setLoading(false));
  }, [setLoading]);
  useEffect(() => {
    if (selectedList && !isNaN(Number(selectedList))) {
      setLoading(true);
      listService
        .getListBooks(Number(selectedList))
        .then((res) => setLinkedBooks(res.data || []))
        .catch(() => setLinkedBooks([]))
        .finally(() => setLoading(false));
    } else {
      setLinkedBooks([]);
    }
  }, [selectedList, setLoading]);

  const handleToggle = async (bookId) => {
    setLoading(true);
    try {
      if (linkedBooks.some((b) => b.bookId === bookId)) {
        await listService.unlinkBookFromList(selectedList, bookId);
        setSnackbar({
          open: true,
          message: "Book unlinked!",
          severity: "success",
        });
      } else {
        await listService.linkBookToList(selectedList, bookId);
        setSnackbar({
          open: true,
          message: "Book linked!",
          severity: "success",
        });
      }
      // Refresh
      try {
        const res = await listService.getListBooks(selectedList);
        setLinkedBooks(res.data || []);
      } catch {}
    } catch (error) {
      const status = error?.response?.status;
      const serverMsg =
        typeof error?.response?.data === "string"
          ? error.response.data
          : error?.message || "";
      let message = "Error updating link";
      if (status === 409) {
        message = "This book is already linked to the selected list.";
      } else if (status === 404) {
        message = "List or book not found.";
      } else if (status === 403) {
        message = "You do not have permission to perform this action.";
      } else if (serverMsg) {
        message = serverMsg;
      }
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) return null;
  if (!lists.length || !books.length || !classes.length || !schools.length) {
    return (
      <BackgroundFX>
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: "100%", mx: 0 }}>
          <GlassCard
            sx={{
              p: { xs: 2, md: 3 },
              border: "0.0625rem solid rgba(15,23,42,0.08)",
            }}
          >
            <SectionHeader
              title="Link Books to Yearly List"
              subtitle="Associate books with a specific class/year list."
            />
            <Typography variant="body1" color="text.secondary">
              No lists, books, classes, or schools available yet. Please create
              the required data first.
            </Typography>
          </GlassCard>
        </Box>
      </BackgroundFX>
    );
  }

  // Helpers for display
  const getClassById = (classId) =>
    classes.find((c) => String(c.id) === String(classId));
  const getSchoolById = (schoolId) =>
    schools.find((s) => String(s.id) === String(schoolId));
  const getListDisplay = (list) => {
    const cls = getClassById(list.classId);
    const school = cls && getSchoolById(cls.schoolId);
    if (!cls || !school) return `${list.classId} | ${list.year}`;
    const sameNameSchools = schools.filter((s) => s.name === school.name);
    const schoolDisplay =
      sameNameSchools.length > 1
        ? `${school.name} (${school.address})`
        : school.name;
    return `${cls.name} — ${schoolDisplay} | ${list.year}`;
  };

  return (
    <BackgroundFX>
      <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: "100%", mx: 0 }}>
        <GlassCard
          sx={{ p: { xs: 2, md: 3 }, border: "1px solid rgba(15,23,42,0.08)" }}
        >
          <SectionHeader
            title="Link Books to Yearly List"
            subtitle="Associate books with a specific class/year list."
          />
          <TextField
            select
            label="Select List"
            value={selectedList}
            onChange={(e) => setSelectedList(e.target.value)}
            sx={{ mb: 2, minWidth: 300, width: "100%" }}
            size="small"
          >
            {lists.map((list) => (
              <MenuItem key={list.id} value={list.id}>
                {getListDisplay(list)}
              </MenuItem>
            ))}
          </TextField>
          {selectedList && (
            <>
              <TextField
                label="Search Books"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                sx={{ mb: 1, width: 300 }}
                placeholder="Search by title or author"
              />
              <Box
                sx={{
                  height: 500,
                  width: "100%",
                  overflowX: "auto",
                  "& .MuiDataGrid-root": {
                    minWidth: "fit-content",
                    width: "100%",
                  },
                  "& .MuiDataGrid-main": {
                    width: "100%",
                    minWidth: "fit-content",
                  },
                  "& .MuiDataGrid-virtualScroller": {
                    overflow: "auto",
                    minWidth: "fit-content !important",
                  },
                  "& .MuiDataGrid-row": {
                    minWidth: "fit-content",
                    width: "100%",
                  },
                  "& .MuiDataGrid-cell": {
                    whiteSpace: "normal",
                    wordWrap: "break-word",
                    padding: { xs: "8px 4px", sm: "8px" },
                    lineHeight: "1.2",
                    "&:focus": {
                      outline: "none",
                    },
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    minWidth: "fit-content",
                    width: "100%",
                  },
                  "& .MuiDataGrid-columnHeader": {
                    padding: { xs: "8px 4px", sm: "8px" },
                  },
                }}
              >
                <DataGrid
                  rows={books.filter(
                    (b) =>
                      !linkedBooks.some((lb) => lb.bookId === b.id) &&
                      ((b.title ? b.title.toLowerCase() : "").includes(
                        search.toLowerCase()
                      ) ||
                        (b.author ? b.author.toLowerCase() : "").includes(
                          search.toLowerCase()
                        ))
                  )}
                  columns={[
                    {
                      field: "cover",
                      headerName: "",
                      width: 56,
                      sortable: false,
                      filterable: false,
                      disableColumnMenu: true,
                      renderCell: ({ row }) => {
                        const img = row.imageUrl;
                        return img ? (
                          <img
                            src={resolveImageUrl(img)}
                            alt={row.title || "cover"}
                            style={{
                              width: 32,
                              height: 44,
                              objectFit: "cover",
                              borderRadius: 4,
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
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
                      },
                    },
                    {
                      field: "title",
                      headerName: "Book Title",
                      flex: 1.5,
                      minWidth: 200,
                    },
                    {
                      field: "author",
                      headerName: "Author",
                      flex: 1,
                      minWidth: 150,
                    },
                    {
                      field: "linked",
                      headerName: window.innerWidth < 600 ? "Link" : "Linked",
                      flex: 0.7,
                      minWidth: 80,
                      sortable: false,
                      renderCell: ({ row }) => (
                        <Tooltip
                          title={
                            linkedBooks.some((b) => b.bookId === row.id)
                              ? "Unlink book"
                              : "Link book"
                          }
                        >
                          <Checkbox
                            checked={linkedBooks.some(
                              (b) => b.bookId === row.id
                            )}
                            onChange={() => handleToggle(row.id)}
                          />
                        </Tooltip>
                      ),
                      align: "center",
                      headerAlign: "center",
                    },
                  ]}
                  pageSize={10}
                  rowsPerPageOptions={[10, 20, 30]}
                  disableSelectionOnClick
                  getRowId={(row) => row.id}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: "background.paper",
                    boxShadow: 1,
                    mt: 2,
                    minWidth: "fit-content",
                    "& .MuiDataGrid-columnHeader": {
                      backgroundColor: "background.paper",
                    },
                    "& .MuiDataGrid-cell": {
                      borderBottom: "1px solid rgba(224, 224, 224, 0.5)",
                    },
                  }}
                  localeText={{ noRowsLabel: "No books found." }}
                  components={{
                    Toolbar: () => null,
                  }}
                />
              </Box>
            </>
          )}
        </GlassCard>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </BackgroundFX>
  );
};

export default ListBooksManagement;
