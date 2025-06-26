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
import FeedbackIcon from "@mui/icons-material/Feedback";

const SohbetlerPage = () => {
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState("");
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackChatId, setFeedbackChatId] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
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
    fetch(`http://localhost:8000/chat/?app_id=${selectedApp}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setChats(data);
        setLoading(false);
      })
      .catch(() => {
        setChats([]);
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

  const handleOpenFeedback = (chatId) => {
    setFeedbackChatId(chatId);
    setFeedbackText("");
    setFeedbackOpen(true);
  };

  const handleCloseFeedback = () => {
    setFeedbackOpen(false);
    setFeedbackChatId(null);
    setFeedbackText("");
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackChatId) return;
    const chat = chats.find((c) => c.id === feedbackChatId);
    if (!chat) return;
    setLoading(true);
    try {
      await fetch("http://localhost:8000/feedback/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: 0,
          app_id: chat.app_id || selectedApp,
          user_prompt: chat.user_message,
          correct_answer: feedbackText,
          created_at: new Date().toISOString(),
        }),
      });
    } catch {
      // Hata sessizce yutuluyor, istenirse burada kullanıcıya bildirim eklenebilir.
    }
    setLoading(false);
    setFeedbackOpen(false);
    setFeedbackChatId(null);
    setFeedbackText("");
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
        pt: { xs: 18, sm: 20 }, // Even more top padding for AppBar overlap
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
          Sohbetler
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
        {selectedApp && (
          <TableContainer
            sx={{
              width: "100%",
              maxHeight: "55vh",
              overflowY: "auto",
              overflowX: "auto",
            }}
          >
            <Table size={isMobile ? "small" : "medium"} stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Kullanıcı</TableCell>
                  <TableCell>Soru</TableCell>
                  <TableCell>Cevap</TableCell>
                  <TableCell>Zaman</TableCell>
                  <TableCell align="right">İşlem</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(chats) && chats.length > 0 ? (
                  chats
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((chat) => (
                      <TableRow key={chat.id}>
                        <TableCell>TODO</TableCell>
                        <TableCell>{chat.user_message}</TableCell>
                        <TableCell>{chat.bot_response}</TableCell>
                        <TableCell>{chat.timestamp}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenFeedback(chat.id)}
                            size={isMobile ? "small" : "medium"}
                            aria-label="feedback"
                          >
                            <FeedbackIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      {loading
                        ? "Yükleniyor..."
                        : "Hiç sohbet bulunamadı veya bir hata oluştu."}
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
            count={Array.isArray(chats) ? chats.length : 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{ width: "100%" }}
          />
        )}
      </Paper>
      <Dialog
        open={feedbackOpen}
        onClose={handleCloseFeedback}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Geri Bildirim</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Soru:
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, color: "#1a237e" }}>
            {feedbackChatId &&
              chats.find((c) => c.id === feedbackChatId)?.user_message}
          </Typography>
          <TextField
            label="Doğru Cevap"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            fullWidth
            multiline
            minRows={3}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseFeedback}>İptal</Button>
          <Button
            onClick={handleSubmitFeedback}
            variant="contained"
            disabled={!feedbackText.trim()}
          >
            Gönder
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SohbetlerPage;
