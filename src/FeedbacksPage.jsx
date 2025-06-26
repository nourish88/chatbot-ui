import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  useMediaQuery,
  useTheme,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

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
          width: '100%',
          maxWidth: 1200,
          minWidth: isMobile ? '100%' : 360,
          mx: "auto",
          p: isMobile ? 2 : 5,
          background: "#fff",
          boxShadow: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxHeight: 'calc(100vh - 120px)',
          overflow: 'hidden',
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
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          {selectedApp && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenModal}>
              Yeni Ekle
            </Button>
          )}
        </Box>
        {selectedApp && (
          <TableContainer sx={{ width: "100%", maxHeight: '55vh', overflowY: 'auto', overflowX: 'auto' }}>
            <Table size={isMobile ? "small" : "medium"} stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Kullanıcı Mesajı</TableCell>
                  <TableCell>Doğru Cevap</TableCell>
                  <TableCell>Tarih</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(feedbacks) && feedbacks.length > 0 ? (
                  feedbacks
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((fb) => (
                      <TableRow key={fb.id}>
                        <TableCell>{fb.user_prompt}</TableCell>
                        <TableCell>{fb.correct_answer}</TableCell>
                        <TableCell>{new Date(fb.created_at).toLocaleString('tr-TR')}</TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      {loading
                        ? "Yükleniyor..."
                        : "Hiç geri bildirim bulunamadı veya bir hata oluştu."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        {selectedApp && (
          <TablePagination
            component="div"
            count={Array.isArray(feedbacks) ? feedbacks.length : 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{ width: "100%" }}
          />
        )}
      </Paper>
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="xs" fullWidth>
        <DialogTitle>Yeni Geri Bildirim</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {formError && (
              <Typography color="error" sx={{ mb: 2 }}>{formError}</Typography>
            )}
            <TextField
              label="Kullanıcı Mesajı"
              value={formUserPrompt}
              onChange={(e) => setFormUserPrompt(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
            <TextField
              label="Doğru Cevap"
              value={formCorrectAnswer}
              onChange={(e) => setFormCorrectAnswer(e.target.value)}
              fullWidth
              required
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>İptal</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              Kaydet
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default FeedbacksPage;
