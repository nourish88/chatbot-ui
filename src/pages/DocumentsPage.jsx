import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DataTable from "../components/common/DataTable";
import FormDialog from "../components/common/FormDialog";
import LoadingIndicator from "../components/common/LoadingIndicator";
import ErrorAlert from "../components/common/ErrorAlert";

const columns = [
  { field: "name", headerName: "Belge Adı" },
  { field: "uploaded_at", headerName: "Yüklenme Tarihi" },
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
        marginTop: "70px",
        marginLeft: "25px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        minHeight: "calc(100vh - 64px)",
        background: "#f4f6f8",
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 1200,
          mx: "auto",
          p: 5,
          background: "#fff",
          boxShadow: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
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
        <FormControl fullWidth sx={{ mb: 3, ml: { xs: 0, sm: 2 }, mt: 2 }}>
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
        {loading && <LoadingIndicator message="Yükleniyor..." />}
        {error && <ErrorAlert message={error} />}
        {!loading && !error && selectedApp && (
          <DataTable
            columns={columns}
            rows={documents.slice(0, 50).map((doc) => ({
              ...doc,
              uploaded_at: doc.uploaded_at
                ? new Date(doc.uploaded_at).toLocaleString("tr-TR")
                : "",
            }))}
            loading={loading}
            page={0}
            rowsPerPage={50}
            onPageChange={() => {}}
            onRowsPerPageChange={() => {}}
            totalCount={documents.length}
          />
        )}
        <FormDialog
          open={modalOpen}
          onClose={handleCloseModal}
          title="Belge Yükle"
          loading={formLoading}
          error={formError}
          onSubmit={handleUpload}
          actions={null}
        >
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
        </FormDialog>
      </Paper>
    </Box>
  );
};

export default DocumentsPage;
