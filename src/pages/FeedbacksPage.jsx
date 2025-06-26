import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DataTable from "../components/common/DataTable";
import FormDialog from "../components/common/FormDialog";
import LoadingIndicator from "../components/common/LoadingIndicator";
import ErrorAlert from "../components/common/ErrorAlert";

const FeedbacksPage = () => {
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [formUserPrompt, setFormUserPrompt] = useState("");
  const [formCorrectAnswer, setFormCorrectAnswer] = useState("");
  const [formError, setFormError] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const columns = [
    { field: "user_prompt", headerName: "Kullanıcı Mesajı" },
    { field: "correct_answer", headerName: "Doğru Cevap" },
    { field: "created_at", headerName: "Tarih" },
  ];

  useEffect(() => {
    fetch("http://localhost:8000/apps/")
      .then((res) => res.json())
      .then((data) => setApps(data))
      .catch(() => setApps([]));
  }, []);

  useEffect(() => {
    if (!selectedApp) return;
    setLoading(true);
    fetch(`http://localhost:8000/feedback/?app_id=${selectedApp}`)
      .then((res) => res.json())
      .then((data) => {
        setFeedbacks(data);
        setLoading(false);
      })
      .catch(() => {
        setFeedbacks([]);
        setLoading(false);
      });
  }, [selectedApp]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenModal = () => {
    setFormUserPrompt("");
    setFormCorrectAnswer("");
    setFormError("");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formUserPrompt || !formCorrectAnswer) {
      setFormError("Tüm alanlar zorunludur.");
      return;
    }
    setFormError("");
    setLoading(true);
    try {
      await fetch("http://localhost:8000/feedback/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: 0,
          app_id: selectedApp,
          user_prompt: formUserPrompt,
          correct_answer: formCorrectAnswer,
          created_at: new Date().toISOString(),
        }),
      });
      setModalOpen(false);
      setFormUserPrompt("");
      setFormCorrectAnswer("");
      // Refresh feedbacks
      fetch(`http://localhost:8000/feedback/?app_id=${selectedApp}`)
        .then((res) => res.json())
        .then((data) => setFeedbacks(data))
        .catch(() => setFeedbacks([]));
    } catch {
      setFormError("Kayıt başarısız oldu.");
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        minHeight: "100vh",
        background: "#f4f6f8",
        p: isMobile ? 1 : 3,
        pt: { xs: 18, sm: 20 },
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 1200,
          minWidth: isMobile ? "100%" : 360,
          mx: "auto",
          p: isMobile ? 2 : 5,
          background: "#fff",
          boxShadow: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxHeight: "calc(100vh - 120px)",
          overflow: "hidden",
        }}
        elevation={3}
      >
        <Typography variant="h5" sx={{ mb: 2 }}>
          Geri Bildirimler
        </Typography>
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
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            mb: 2,
          }}
        >
          {selectedApp && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenModal}
            >
              Yeni Ekle
            </Button>
          )}
        </Box>
        {selectedApp && (
          <DataTable
            columns={columns}
            rows={feedbacks
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((fb) => ({
                ...fb,
                created_at: new Date(fb.created_at).toLocaleString("tr-TR"),
              }))}
            loading={loading}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            totalCount={feedbacks.length}
          />
        )}
        <FormDialog
          open={modalOpen}
          onClose={handleCloseModal}
          title="Geri Bildirim Ekle"
          loading={loading}
          error={formError}
          onSubmit={handleSubmit}
          actions={null}
        >
          <TextField
            label="Kullanıcı Mesajı"
            value={formUserPrompt}
            onChange={(e) => setFormUserPrompt(e.target.value)}
            required
            fullWidth
            sx={{ mb: 2, maxWidth: 350 }}
          />
          <TextField
            label="Doğru Cevap"
            value={formCorrectAnswer}
            onChange={(e) => setFormCorrectAnswer(e.target.value)}
            required
            fullWidth
            sx={{ mb: 2, maxWidth: 350 }}
          />
        </FormDialog>
        {loading && <LoadingIndicator message="Yükleniyor..." />}
        {formError && <ErrorAlert message={formError} />}
      </Paper>
    </Box>
  );
};

export default FeedbacksPage;
