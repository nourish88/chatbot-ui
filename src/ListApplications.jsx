import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const columns = [
  { field: "name", headerName: "Name", flex: 1, minWidth: 150 },
  { field: "description", headerName: "Description", flex: 2, minWidth: 200 },
];

const ListApplications = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [appName, setAppName] = useState("");
  const [appDescription, setAppDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchApps = () => {
    setLoading(true);
    setError("");
    fetch("http://localhost:8000/apps/")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch applications");
        return res.json();
      })
      .then((data) => {
        setApps(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load applications.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleOpenModal = () => {
    setAppName("");
    setAppDescription("");
    setFormError("");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormError("");
  };

  const handleCreateApp = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    try {
      const res = await fetch("http://localhost:8000/apps/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: appName, description: appDescription }),
      });
      if (!res.ok) throw new Error("Failed to create application");
      setModalOpen(false);
      setAppName("");
      setAppDescription("");
      fetchApps();
    } catch {
      setFormError("Failed to create application.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 64px)",
        background: "#f4f6f8",
      }}
    >
      <Paper
        sx={{
          width: 600,
          mx: "auto",
          p: 5,
          background: "#fff",
          boxShadow: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        elevation={3}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
            width: "100%",
          }}
        >
          <Typography variant="h5">Applications</Typography>
          <Button variant="contained" color="primary" onClick={handleOpenModal}>
            Create New
          </Button>
        </Box>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {!loading && !error && (
          <Box sx={{ width: "100%", height: 500 }}>
            <DataGrid
              rows={apps.map((app) => ({ ...app, id: app.id }))}
              columns={columns}
              pageSize={8}
              rowsPerPageOptions={[8, 16, 32]}
              autoHeight={false}
              disableSelectionOnClick
              sx={{
                background: "#fff",
                borderRadius: 2,
                boxShadow: 0,
                border: "1px solid #e0e0e0",
                "& .MuiDataGrid-columnHeaders": { background: "#f1f5fa" },
              }}
            />
          </Box>
        )}
        <Dialog
          open={modalOpen}
          onClose={handleCloseModal}
          fullScreen={fullScreen}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ textAlign: "center" }}>
            Create New Application
          </DialogTitle>
          <form onSubmit={handleCreateApp}>
            <DialogContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {formError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {formError}
                </Alert>
              )}
              <TextField
                label="Name"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                required
                fullWidth
                sx={{ mb: 2, maxWidth: 350 }}
                autoFocus
              />
              <TextField
                label="Description"
                value={appDescription}
                onChange={(e) => setAppDescription(e.target.value)}
                fullWidth
                multiline
                minRows={2}
                sx={{ mb: 2, maxWidth: 350 }}
              />
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center" }}>
              <Button onClick={handleCloseModal} disabled={formLoading}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={formLoading}
              >
                {formLoading ? "Saving..." : "Save"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default ListApplications;
