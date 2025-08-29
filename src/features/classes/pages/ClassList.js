import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Tooltip,
  MenuItem,
  Typography,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { DataGrid } from "@mui/x-data-grid";
import {
  AddRounded,
  EditRounded,
  DeleteOutlineRounded,
} from "@mui/icons-material";
import { AuthContext } from "../../../shared/contexts/AuthContext";
import { useLoading } from "../../../shared/contexts/LoadingContext";
import classService from "../../../api/classes.api";
import schoolService from "../../../api/schools.api";
import BackgroundFX from "../../../shared/components/ui/BackgroundFX";
import GlassCard from "../../../shared/components/ui/GlassCard";
import GradientButton from "../../../shared/components/ui/GradientButton";
import { GlobalStyles } from "@mui/material";
import SectionHeader from "../../../shared/components/ui/SectionHeader";

const initialForm = { name: "", schoolId: "", year: "" };

const ClassList = () => {
  const { user } = useContext(AuthContext);
  const isAdmin =
    user?.roles?.includes("ROLE_ADMIN") ||
    user?.roles?.includes("ROLE_SUPER_ADMIN");

  const [classes, setClasses] = useState([]);
  const [schools, setSchools] = useState([]);
  const [schoolInput, setSchoolInput] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({});
  const { setLoading } = useLoading();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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
        .filter((row) => row && typeof row === "object")
        .map((row, idx) => ({
          ...row,
          id: row.id ?? row.classId ?? row._id ?? `tmp-class-${idx}`,
        }));
      setClasses(safe);
    } catch {
      setErrorMessage("Failed to fetch classes");
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
        .filter((row) => row && typeof row === "object")
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
            .filter((row) => row && typeof row === "object")
            .map((row, idx) => ({
              ...row,
              id: row.id ?? row.schoolId ?? row._id ?? `tmp-school-${idx}`,
            }));
          if (active) setSchools(safe);
        } else {
          const res = await schoolService.getSchools();
          const raw = Array.isArray(res?.data) ? res.data : [];
          const safe = raw
            .filter((row) => row && typeof row === "object")
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
    setErrorMessage("");
  };
  const handleClose = () => {
    setOpen(false);
    setForm(initialForm);
    setEditId(null);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    // Client validation
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Please fill out this field";
    if (!form.schoolId) newErrors.schoolId = "Please select a school";
    if (!form.year) newErrors.year = "Please choose a year";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setLoading(true);
    try {
      if (editId) {
        await classService.updateClass(editId, form);
        setErrorMessage("");
      } else {
        await classService.createClass(form);
        setErrorMessage("");
      }
      handleClose();
      try {
        await fetchClasses();
      } catch {
        // Silently ignore fetch errors after successful CRUD
      }
    } catch (error) {
      const status = error?.response?.status;
      const serverMsg =
        typeof error?.response?.data === "string" ? error.response.data : "";
      let message = "Error saving class";
      if (status === 409) {
        message =
          serverMsg ||
          "Class already exists with the same name, school, and year.";
        setErrors((prev) => ({
          ...prev,
          name: prev.name || message,
          schoolId: prev.schoolId || message,
          year: prev.year || message,
        }));
        setErrorMessage("");
        return;
      } else if (status === 400) {
        message = serverMsg || "Invalid data. Please check the fields.";
        const low = (serverMsg || "").toLowerCase();
        const fieldErrors = {};
        if (low.includes("name")) fieldErrors.name = message;
        if (low.includes("school")) fieldErrors.schoolId = message;
        if (low.includes("year")) fieldErrors.year = message;
        if (Object.keys(fieldErrors).length) {
          setErrors((prev) => ({ ...prev, ...fieldErrors }));
          setErrorMessage("");
          return;
        }
      } else if (status === 403) {
        message = "Only admins can perform this action.";
      } else if (serverMsg) {
        message = serverMsg;
      }
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this class?")) {
      setLoading(true);
      try {
        await classService.deleteClass(id);
        setErrorMessage("");
        try {
          await fetchClasses();
        } catch {
          // Silently ignore fetch errors after successful CRUD
        }
      } catch {
        setErrorMessage("Error deleting class");
      } finally {
        setLoading(false);
      }
    }
  };

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
            sx={{
              p: { xs: 2, md: 3 },
              border: "1px solid rgba(15,23,42,0.08)",
            }}
          >
            <SectionHeader
              title="Classes"
              subtitle="Manage classes per school and year."
            />
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}
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
              <TextField
                size="small"
                label="Search classes"
                placeholder="Search by name, school, year"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                  flex: { xs: "1 1 auto", sm: 1 },
                  minWidth: { xs: "100%", sm: 220 },
                  maxWidth: { xs: "100%", sm: 360 },
                }}
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
              {isAdmin && (
                <Tooltip title="Add a new class">
                  <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
                    <GradientButton
                      fullWidth
                      startIcon={<AddRounded />}
                      onClick={() => handleOpen()}
                      aria-label="Add class"
                      sx={{
                        whiteSpace: "nowrap",
                        minWidth: { xs: "100%", sm: "auto" },
                      }}
                    >
                      Add Class
                    </GradientButton>
                  </Box>
                </Tooltip>
              )}
            </Box>
            <Box sx={{ mb: 2 }}></Box>
            <Box
              sx={{
                height: 480,
                width: "100%",
                overflowX: "auto",
                position: "relative",
                "& .MuiDataGrid-root": {
                  minWidth: "fit-content",
                  width: "100%",
                },
                "& .MuiDataGrid-main": {
                  position: "relative",
                  minWidth: "fit-content",
                  width: "100%",
                },
                "& .MuiDataGrid-virtualScroller": {
                  overflowX: "auto",
                  overflowY: "auto",
                },
                "& .MuiDataGrid-columnHeaders": {
                  minWidth: "fit-content !important",
                  width: "100% !important",
                },
                "& .MuiDataGrid-row": {
                  minWidth: "fit-content !important",
                  width: "100% !important",
                },
                "& .MuiDataGrid-cell": {
                  minWidth: "150px !important",
                  maxWidth: "300px !important",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  },
                },
                "& .MuiDataGrid-columnHeader": {
                  minWidth: "150px !important",
                },
                '& .MuiDataGrid-columnHeader[data-field="actions"]': {
                  minWidth: "120px !important",
                },
              }}
            >
              {classes.length === 0 ? (
                <Typography
                  variant="body1"
                  sx={{ mt: 2, mb: 2 }}
                  color="text.secondary"
                >
                  No classes found. Please check your data or try again later.
                </Typography>
              ) : (
                <DataGrid
                  rows={(Array.isArray(classes) ? classes : []).filter((c) => {
                    const q = String(debouncedSearch || "")
                      .trim()
                      .toLowerCase();
                    if (!q) return true;
                    const hay = [c.name, c.schoolName, c.schoolAddress, c.year]
                      .filter((v) => v !== undefined && v !== null)
                      .map((v) => String(v).toLowerCase())
                      .join(" ");
                    return hay.includes(q);
                  })}
                  columns={[
                    {
                      field: "name",
                      headerName: "Name",
                      minWidth: 150,
                      flex: 1,
                    },
                    {
                      field: "schoolName",
                      headerName: "School",
                      minWidth: 150,
                      flex: 1,
                    },
                    {
                      field: "schoolAddress",
                      headerName: "School Address",
                      minWidth: 200,
                      flex: 1,
                    },
                    {
                      field: "year",
                      headerName: "Year",
                      minWidth: 100,
                      flex: 1,
                    },
                    {
                      field: "actions",
                      headerName: "Actions",
                      minWidth: 120,
                      flex: 0.5,
                      sortable: false,
                      renderCell: ({ row }) =>
                        isAdmin && (
                          <Box>
                            <Tooltip title="Edit class">
                              <IconButton
                                onClick={() => handleOpen(row)}
                                aria-label={`Edit class ${row.name || ""}`}
                              >
                                <EditRounded />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete class">
                              <IconButton
                                color="error"
                                onClick={() => handleDelete(row.id)}
                                aria-label={`Delete class ${row.name || ""}`}
                              >
                                <DeleteOutlineRounded />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ),
                      align: "left",
                      headerAlign: "left",
                    },
                  ]}
                  pageSize={7}
                  rowsPerPageOptions={[7, 14, 21]}
                  disableSelectionOnClick
                  getRowId={(row) =>
                    row?.id ??
                    row?.classId ??
                    row?._id ??
                    `${row?.name || "row"}-${row?.year || ""}`
                  }
                  sx={{
                    "& .MuiDataGrid-columnHeader": {
                      backgroundColor: "background.paper",
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    },
                    "& .MuiDataGrid-columnHeaderTitle": {
                      fontWeight: "bold",
                    },
                    "& .MuiDataGrid-cell:focus": {
                      outline: "none",
                    },
                    "& .MuiDataGrid-cell:focus-within": {
                      outline: "none",
                    },
                    "& .MuiDataGrid-columnHeader:focus": {
                      outline: "none",
                    },
                    "& .MuiDataGrid-columnHeader:focus-within": {
                      outline: "none",
                    },
                    "& .MuiDataGrid-row": {
                      "&:nth-of-type(even)": {
                        backgroundColor: "rgba(0, 0, 0, 0.05)",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.07)",
                          "@media (hover: none)": {
                            backgroundColor: "rgba(0, 0, 0, 0.05)",
                          },
                        },
                      },
                      "&:nth-of-type(odd)": {
                        backgroundColor: "white",
                        "&:hover": {
                          backgroundColor: "rgba(0, 0, 0, 0.04)",
                          "@media (hover: none)": {
                            backgroundColor: "white",
                          },
                        },
                      },
                    },
                    "& .MuiDataGrid-cell": {
                      borderBottom: "1px solid rgba(224, 224, 224, 0.5)",
                    },
                    "& .MuiDataGrid-columnHeaders": {
                      borderBottom: "1px solid rgba(224, 224, 224, 1)",
                    },
                    "& .MuiDataGrid-footerContainer": {
                      borderTop: "1px solid rgba(224, 224, 224, 1)",
                    },
                  }}
                  localeText={{ noRowsLabel: "No classes found." }}
                />
              )}
            </Box>
          </GlassCard>
        </Box>
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
          <DialogTitle>{editId ? "Edit Class" : "Add Class"}</DialogTitle>
          <DialogContent>
            <TextField
              margin="normal"
              fullWidth
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              error={!!errors.name}
              helperText={errors.name}
            />
            <Autocomplete
              options={Array.isArray(schools) ? schools : []}
              value={
                (Array.isArray(schools) ? schools : []).find(
                  (s) => s.id === form.schoolId
                ) || null
              }
              onChange={(e, newValue) =>
                setForm({ ...form, schoolId: newValue ? newValue.id : "" })
              }
              inputValue={schoolInput}
              onInputChange={(e, newInput) => setSchoolInput(newInput)}
              getOptionLabel={(option) => {
                if (!option) return "";
                const list = Array.isArray(schools) ? schools : [];
                const sameNameSchools = list.filter(
                  (s) => s.name === option.name
                );
                return sameNameSchools.length > 1
                  ? `${option.name} (${option.address})`
                  : option.name;
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  margin="normal"
                  fullWidth
                  label="School"
                  required
                  error={!!errors.schoolId}
                  helperText={errors.schoolId}
                />
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
                  <MenuItem key={currentYear - i} value={currentYear - i}>
                    {currentYear - i}
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
      </BackgroundFX>
    </>
  );
};

export default ClassList;
