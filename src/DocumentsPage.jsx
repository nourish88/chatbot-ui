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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

const docColumns = [
  { field: "name", headerName: "Belge Adı", flex: 1, minWidth: 150 },
  {
    field: "uploaded_at",
    headerName: "Yüklenme Tarihi",
    flex: 1,
    minWidth: 180,
  },
];

const DocumentsPage = () => {
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [docName, setDocName] = useState("");
  const [docFile, setDocFile] = useState(null);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // Fetch applications
  useEffect(() => {
    fetch("http://localhost:8000/apps/")
      .then((res) => res.json())
      .then((data) => setApps(data))
      .catch(() => setApps([]));
  }, []);

  // Fetch documents for selected app
  const fetchDocuments = () => {
    if (!selectedApp) return;
    setLoading(true);
    setError("");
    fetch(`http://localhost:8000/documents/?app_id=${selectedApp}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch documents");
        return res.json();
      })
      .then((data) => {
        setDocuments(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load documents.");
        setLoading(false);
      });
  };

  useEffect(() => {
    if (selectedApp) fetchDocuments();
  }, [selectedApp]);

  const handleOpenModal = () => {
    setDocName("");
    setDocFile(null);
    setFormError("");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormError("");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    const formData = new FormData();
    formData.append("app_id", selectedApp);
    formData.append("name", docName);
    formData.append("file", docFile);
    try {
      const res = await fetch("http://localhost:8000/documents/upload/", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        let msg = "Failed to upload document.";
        try {
          const data = await res.json();
          if (data && data.detail) msg = data.detail;
        } catch (err) {
          msg = res.statusText || msg;
        }
        setFormError(msg);
        setFormLoading(false);
        return;
      }
      setModalOpen(false);
      setFormLoading(false);
      setDocName("");
      setDocFile(null);
      fetchDocuments();
    } catch (err) {
      setFormError("Failed to upload document. " + (err?.message || ""));
      setFormLoading(false);
      setModalOpen(false);
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
          <Typography variant="h5">Belge İşlemleri</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenModal}
            disabled={!selectedApp}
          >
            Yeni Ekle
          </Button>
        </Box>
        <FormControl fullWidth sx={{ mb: 3, maxWidth: 350, mx: "auto" }}>
          <InputLabel id="app-select-label">Uygulama Seçin</InputLabel>
          <Select
            labelId="app-select-label"
            value={selectedApp}
            label="Uygulama Seçin"
            onChange={(e) => setSelectedApp(e.target.value)}
          >
            {apps.map((app) => (
              <MenuItem key={app.id} value={app.id}>
                {app.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
        {!loading && !error && selectedApp && (
          <Box sx={{ width: "100%", height: 500 }}>
            <DataGrid
              rows={documents.map((doc) => ({ ...doc, id: doc.id }))}
              columns={docColumns}
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
          <DialogTitle sx={{ textAlign: "center" }}>Belge Yükle</DialogTitle>
          <form onSubmit={handleUpload} encType="multipart/form-data">
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
                label="Belge Adı"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                required
                fullWidth
                sx={{ mb: 2, maxWidth: 350 }}
                autoFocus
              />
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ mb: 2, maxWidth: 350 }}
              >
                Dosya Seç (PDF, DOCX, TXT)
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  hidden
                  onChange={(e) => setDocFile(e.target.files[0])}
                  required
                />
              </Button>
              {docFile && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {docFile.name}
                </Typography>
              )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center" }}>
              <Button onClick={handleCloseModal} disabled={formLoading}>
                İptal
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={formLoading || !docFile}
              >
                {formLoading ? "Yükleniyor..." : "Yükle"}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default DocumentsPage;
