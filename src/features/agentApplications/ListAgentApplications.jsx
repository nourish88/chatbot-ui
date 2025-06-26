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
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import CreateAgentApplication from "./CreateAgentApplication";

const columns = [
  { field: "name", headerName: "Ad", flex: 1, minWidth: 120 },
  { field: "description", headerName: "Açıklama", flex: 2, minWidth: 180 },
  { field: "base_url", headerName: "Base URL", flex: 1, minWidth: 160 },
  {
    field: "actions",
    headerName: "Sil",
    minWidth: 80,
    sortable: false,
    renderCell: (params) => (
      <IconButton color="error" size="small" onClick={() => {}}>
        <DeleteIcon />
      </IconButton>
    ),
  },
];

const ListAgentApplications = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const fetchApps = () => {
    setLoading(true);
    setError("");
    fetch("http://localhost:8000/agent_apps/")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch agent applications");
        return res.json();
      })
      .then((data) => {
        setApps(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Agent uygulamaları yüklenemedi.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

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
          width: 700,
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
          <Typography variant="h5">Agent Uygulamaları</Typography>
          <Button variant="contained" color="primary" onClick={handleOpenModal}>
            Yeni Ekle
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
            Yeni Agent Uygulaması
          </DialogTitle>
          <DialogContent>
            <CreateAgentApplication
              onSuccess={() => {
                handleCloseModal();
                fetchApps();
              }}
            />
          </DialogContent>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default ListAgentApplications;
