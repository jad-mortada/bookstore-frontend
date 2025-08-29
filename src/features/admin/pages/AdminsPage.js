import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  useMediaQuery,
  useTheme,
  Paper,
} from "@mui/material";
import {
  AddRounded,
  EditRounded,
  DeleteOutlineRounded,
} from "@mui/icons-material";
import adminService from "../../../api/admin.api";
import { AuthContext } from "../../../shared/contexts/AuthContext";
import BackgroundFX from "../../../shared/components/ui/BackgroundFX";
import GlassCard from "../../../shared/components/ui/GlassCard";
import GradientButton from "../../../shared/components/ui/GradientButton";

const emptyAdmin = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
};

export default function AdminsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useContext(AuthContext);
  const [admins, setAdmins] = useState([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyAdmin);
  const [errorMessage, setErrorMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchAdmins = React.useCallback(async () => {
    try {
      const res = await adminService.getAdmins();
      setAdmins(res.data);
    } catch (err) {
      setErrorMessage("Failed to fetch admins");
    }
  }, []);

  useEffect(() => {
    if (user?.roles?.includes("ROLE_SUPER_ADMIN")) {
      fetchAdmins();
    }
  }, [fetchAdmins, user]);

  const handleOpen = (admin = emptyAdmin, id = null) => {
    setForm(admin);
    setEditId(id);
    setOpen(true);
    setErrors({});
    setErrorMessage("");
  };

  const handleClose = () => {
    setOpen(false);
    setForm(emptyAdmin);
    setEditId(null);
    setErrors({});
    setErrorMessage("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    const isEmpty = (v) => !v || String(v).trim() === "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (isEmpty(form.firstName)) newErrors.firstName = "First name is required";
    if (isEmpty(form.lastName)) newErrors.lastName = "Last name is required";
    if (isEmpty(form.email)) newErrors.email = "Email is required";
    else if (!emailRegex.test(form.email))
      newErrors.email = "Invalid email format";

    if (!editId) {
      if (isEmpty(form.password)) newErrors.password = "Password is required";
      else if (String(form.password).length < 6)
        newErrors.password = "Password must be at least 6 characters";
    } else if (!isEmpty(form.password) && String(form.password).length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    const emailLower = String(form.email || "").toLowerCase();
    const duplicate = admins.some(
      (a) =>
        String(a.email || "").toLowerCase() === emailLower &&
        String(a.id) !== String(editId || "")
    );
    if (emailLower && duplicate) newErrors.email = "Email already exists";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setErrorMessage("Please fix the highlighted errors.");
      return;
    }
    try {
      const payload = {
        ...form,
        email: (form.email || "").trim().toLowerCase(),
      };
      if (editId) {
        await adminService.updateAdmin(editId, payload);
        setErrorMessage("");
      } else {
        await adminService.createAdmin(payload);
        setErrorMessage("");
      }
      fetchAdmins();
      handleClose();
    } catch (err) {
      const status = err?.response?.status;
      const serverMsg =
        err?.response?.data?.message ||
        (typeof err?.response?.data === "string" ? err.response.data : null);
      const low = (serverMsg || "").toLowerCase();
      if (
        status === 409 ||
        low.includes("already in use") ||
        low.includes("already exists")
      ) {
        const message = serverMsg || "Email is already in use";
        setErrors((prev) => ({ ...prev, email: message }));
        setErrorMessage("");
        return;
      }
      if (
        status === 400 &&
        (low.includes("email") || low.includes("invalid"))
      ) {
        const message = serverMsg || "Invalid email";
        setErrors((prev) => ({ ...prev, email: message }));
        setErrorMessage("");
        return;
      }
      setErrorMessage(serverMsg || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      await adminService.deleteAdmin(id);
      setErrorMessage("");
      fetchAdmins();
    } catch (err) {
      setErrorMessage("Delete failed");
    }
  };

  const filteredAdmins = (Array.isArray(admins) ? admins : [])
    .filter((a) => a.roles !== "ROLE_SUPER_ADMIN")
    .filter((a) => {
      const q = String(debouncedSearch || "")
        .trim()
        .toLowerCase();
      if (!q) return true;
      const hay = [a.firstName, a.lastName, a.email, a.phoneNumber]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase())
        .join(" ");
      return hay.includes(q);
    });

  if (!user?.roles?.includes("ROLE_SUPER_ADMIN")) {
    return (
      <BackgroundFX>
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "100%", mx: 0 }}>
          <GlassCard sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h5" color="error" sx={{ fontWeight: 600 }}>
              You are not authorized to view this page.
            </Typography>
          </GlassCard>
        </Box>
      </BackgroundFX>
    );
  }

  return (
    <BackgroundFX>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: "100%", mx: 0 }}>
        <Typography variant="h4" mb={2} sx={{ fontWeight: 800 }}>
          Manage Admins
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            gap: 2,
            mb: 2,
          }}
        >
          <Tooltip title="Add a new admin">
            <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
              <GradientButton
                fullWidth={isMobile}
                startIcon={<AddRounded />}
                onClick={() => handleOpen()}
                aria-label="Add admin"
                sx={{ py: { xs: 1, sm: 0.5 } }}
              >
                Add Admin
              </GradientButton>
            </Box>
          </Tooltip>
          <Box sx={{ flex: 1, minWidth: { xs: "100%", sm: 220, md: 360 } }}>
            <TextField
              fullWidth
              size="small"
              label="Search admins"
              placeholder="Search by name, email, phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                endAdornment: search && (
                  <IconButton
                    size="small"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    sx={{ mr: -1 }}
                  >
                    ✕
                  </IconButton>
                ),
              }}
            />
          </Box>
        </Box>
        {errorMessage && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Alert>
        )}
        <GlassCard
          sx={{ mt: 2, p: { xs: 0, sm: 1, md: 2 }, overflow: "hidden" }}
        >
          {isMobile ? (
            <Box sx={{ p: 1 }}>
              {filteredAdmins.map((a) => (
                <Paper
                  key={a.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: "background.paper",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {a.firstName} {a.lastName}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        {a.email}
                      </Typography>
                      {a.phoneNumber && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {a.phoneNumber}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleOpen(a, a.id)}
                          sx={{
                            bgcolor: "action.hover",
                            "&:hover": { bgcolor: "action.selected" },
                          }}
                        >
                          <EditRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(a.id)}
                          sx={{ "&:hover": { bgcolor: "error.light" } }}
                        >
                          <DeleteOutlineRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Paper>
              ))}
              {filteredAdmins.length === 0 && (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography color="text.secondary">
                    No admins found
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>First Name</TableCell>
                    <TableCell>Last Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAdmins.map((a) => (
                    <TableRow key={a.id} hover>
                      <TableCell>{a.firstName}</TableCell>
                      <TableCell>{a.lastName}</TableCell>
                      <TableCell>{a.email}</TableCell>
                      <TableCell>{a.phoneNumber || "-"}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit admin">
                          <IconButton
                            size="small"
                            onClick={() => handleOpen(a, a.id)}
                            sx={{ "&:hover": { bgcolor: "action.selected" } }}
                          >
                            <EditRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete admin">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(a.id)}
                            sx={{ "&:hover": { bgcolor: "error.light" } }}
                          >
                            <DeleteOutlineRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredAdmins.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">
                          No admins found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </GlassCard>

        <Dialog
          open={open}
          onClose={handleClose}
          fullWidth
          maxWidth="sm"
          fullScreen={isMobile}
        >
          <DialogTitle
            sx={{
              bgcolor: "background.paper",
              borderBottom: "1px solid",
              borderColor: "divider",
              position: "sticky",
              top: 0,
              zIndex: 1,
              p: { xs: 2, sm: 3 },
              pb: { xs: 1.5, sm: 2 },
            }}
          >
            <Typography variant="h6" component="div">
              {editId ? "Edit Admin" : "Add Admin"}
            </Typography>
          </DialogTitle>
          <DialogContent
            sx={{ p: { xs: 2, sm: 3 }, "& .MuiTextField-root": { mb: 2 } }}
          >
            <TextField
              autoFocus
              margin="dense"
              label="First Name"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              fullWidth
              error={!!errors.firstName}
              helperText={errors.firstName}
              size={isMobile ? "medium" : "small"}
            />
            <TextField
              margin="dense"
              label="Last Name"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              fullWidth
              error={!!errors.lastName}
              helperText={errors.lastName}
              size={isMobile ? "medium" : "small"}
            />
            <TextField
              margin="dense"
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              error={!!errors.email}
              helperText={errors.email}
              size={isMobile ? "medium" : "small"}
              inputProps={{
                inputMode: "email",
                autoComplete: "email",
              }}
            />
            <TextField
              margin="dense"
              label="Phone Number"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              fullWidth
              size={isMobile ? "medium" : "small"}
              inputProps={{
                inputMode: "tel",
              }}
            />
            <TextField
              margin="dense"
              label={editId ? "Password (leave blank to keep)" : "Password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              type="password"
              error={!!errors.password}
              helperText={
                errors.password ||
                (editId ? "Leave blank to keep current password" : "")
              }
              size={isMobile ? "medium" : "small"}
              inputProps={{
                autoComplete: "new-password",
              }}
            />
          </DialogContent>
          <DialogActions
            sx={{
              p: { xs: 2, sm: 3 },
              pt: 0,
              position: isMobile ? "sticky" : "static",
              bottom: 0,
              bgcolor: "background.paper",
              borderTop: "1px solid",
              borderColor: "divider",
              gap: 1,
            }}
          >
            <Button
              onClick={handleClose}
              size={isMobile ? "large" : "medium"}
              fullWidth={isMobile}
              variant={isMobile ? "outlined" : "text"}
            >
              Cancel
            </Button>
            <GradientButton
              onClick={handleSubmit}
              fullWidth={isMobile}
              size={isMobile ? "large" : "medium"}
            >
              {editId ? "Update" : "Create"}
            </GradientButton>
          </DialogActions>
        </Dialog>
      </Box>
    </BackgroundFX>
  );
}
