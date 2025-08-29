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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  AddRounded,
  EditRounded,
  DeleteOutlineRounded,
} from "@mui/icons-material";
import { AuthContext } from "../../../shared/contexts/AuthContext";
import schoolService from "../../../api/schools.api";
import BackgroundFX from "../../../shared/components/ui/BackgroundFX";
import GlassCard from "../../../shared/components/ui/GlassCard";
import GradientButton from "../../../shared/components/ui/GradientButton";
import SectionHeader from "../../../shared/components/ui/SectionHeader";
import { GlobalStyles } from "@mui/material";

const initialForm = { name: "", address: "", phoneNumber: "" };

const SchoolList = () => {
  const { user } = useContext(AuthContext);
  const isAdmin =
    user?.roles?.includes("ROLE_ADMIN") ||
    user?.roles?.includes("ROLE_SUPER_ADMIN");

  const [schools, setSchools] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Responsive spacing values
  const spacing = (multiplier = 1) => `${8 * multiplier}px`;
  const responsiveSpacing = (xs = 1, sm = 1.5, md = 2) => ({
    xs: spacing(xs),
    sm: spacing(sm),
    md: spacing(md),
  });

  const fetchSchools = async () => {
    setLoading(true);
    try {
      const res = search
        ? await schoolService.searchSchools(search)
        : await schoolService.getSchools();
      const raw = Array.isArray(res?.data) ? res.data : [];
      const safe = raw
        .filter((row) => row && typeof row === "object")
        .map((row, idx) => ({
          ...row,
          id: row.id ?? row.schoolId ?? row._id ?? `tmp-${idx}`,
        }));
      setSchools(safe);
    } catch (error) {
      setErrorMessage("Failed to load schools.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, [search]);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this school?")) {
      setLoading(true);
      try {
        await schoolService.deleteSchool(id);
        setErrorMessage("");
        await fetchSchools();
      } catch (error) {
        setErrorMessage("Error deleting school");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpen = (school = initialForm) => {
    setForm(school);
    setEditId(school.id || null);
    setOpen(true);
    setErrors({});
    setErrorMessage("");
  };

  const handleClose = () => {
    setOpen(false);
    setForm(initialForm);
    setEditId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Please fill out this field";
    if (!form.address.trim()) newErrors.address = "Please fill out this field";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setLoading(true);
    try {
      if (editId) {
        await schoolService.updateSchool(editId, form);
        setErrorMessage("");
      } else {
        await schoolService.createSchool(form);
        setErrorMessage("");
      }
      handleClose();
      await fetchSchools();
    } catch (error) {
      const status = error?.response?.status;
      const serverMsg =
        typeof error?.response?.data === "string" ? error.response.data : "";
      let message = "Error saving school";
      if (status === 409) {
        message =
          serverMsg || "School already exists with the same name and address.";
        setErrors((prev) => ({
          ...prev,
          name: prev.name || message,
          address: prev.address || message,
        }));
        setErrorMessage("");
        return;
      } else if (status === 400) {
        message = serverMsg || "Invalid data. Please check the fields.";
        const low = (serverMsg || "").toLowerCase();
        const fieldErrors = {};
        if (low.includes("name")) fieldErrors.name = message;
        if (low.includes("address")) fieldErrors.address = message;
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
            p: responsiveSpacing(1, 2, 3),
            maxWidth: "100%",
            mx: 0,
            width: "100vw",
            boxSizing: "border-box",
          }}
        >
          <GlassCard
            sx={{
              p: { xs: 2, md: 3 },
              border: "1px solid rgba(15,23,42,0.08)",
            }}
          >
            <SectionHeader
              title="Schools"
              subtitle="Manage schools and their details."
            />
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                mb: 2,
                flexWrap: "wrap",
                width: "100%",
              }}
            >
              <TextField
                label="Search by name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: 240 },
                  maxWidth: { xs: "100%", sm: 400 },
                  flex: { xs: "1 1 100%", sm: "1 1 280px" },
                }}
              />
              {isAdmin && (
                <GradientButton
                  fullWidth
                  startIcon={<AddRounded />}
                  onClick={() => handleOpen()}
                  aria-label="Add school"
                  sx={{
                    whiteSpace: "nowrap",
                    minWidth: { xs: "100%", sm: 120 },
                    maxWidth: { xs: "100%", sm: 200 },
                  }}
                  title="Add a new school"
                >
                  Add School
                </GradientButton>
              )}
            </Box>

            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <Box sx={{ minWidth: 600, height: 480 }}>
                <DataGrid
                  rows={Array.isArray(schools) ? schools : []}
                  columns={[
                    {
                      field: "name",
                      headerName: "Name",
                      minWidth: 200,
                      flex: 1,
                    },
                    {
                      field: "address",
                      headerName: "Address",
                      minWidth: 250,
                      flex: 1,
                    },
                    {
                      field: "phoneNumber",
                      headerName: "Phone",
                      minWidth: 150,
                    },
                    {
                      field: "actions",
                      headerName: "Actions",
                      minWidth: 150,
                      sortable: false,
                      renderCell: ({ row }) =>
                        isAdmin && (
                          <Box>
                            <Tooltip title="Edit school">
                              <IconButton
                                onClick={() => handleOpen(row)}
                                aria-label={`Edit school ${row.name || ""}`}
                              >
                                <EditRounded />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete school">
                              <IconButton
                                color="error"
                                onClick={() => handleDelete(row.id)}
                                aria-label={`Delete school ${row.name || ""}`}
                              >
                                <DeleteOutlineRounded />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        ),
                    },
                  ]}
                  sx={{
                    "& .MuiDataGrid-row:nth-of-type(even)": {
                      backgroundColor: "rgba(0, 0, 0, 0.05)",
                      "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.07)" },
                    },
                    "& .MuiDataGrid-row:nth-of-type(odd)": {
                      backgroundColor: "white",
                      "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                    },
                    "& .MuiDataGrid-cell": {
                      padding: "8px 16px",
                    },
                  }}
                  loading={loading}
                  localeText={{ noRowsLabel: "No schools found." }}
                />
              </Box>
            </Box>
          </GlassCard>

          <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>{editId ? "Edit School" : "Add School"}</DialogTitle>
            <DialogContent>
              <TextField
                margin="normal"
                fullWidth
                label="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
              <TextField
                margin="normal"
                fullWidth
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                error={!!errors.address}
                helperText={errors.address}
                required
              />
              <TextField
                margin="normal"
                fullWidth
                label="Phone Number"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
              />
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
        </Box>
      </BackgroundFX>
    </>
  );
};

export default SchoolList;
