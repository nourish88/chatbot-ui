import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import FeedbackIcon from "@mui/icons-material/Feedback";
import DataTable from "../components/common/DataTable";
import FormDialog from "../components/common/FormDialog";
import LoadingIndicator from "../components/common/LoadingIndicator";

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

  const columns = [
    { field: "user", headerName: "Kullanıcı" },
    { field: "user_message", headerName: "Soru" },
    { field: "bot_response", headerName: "Cevap" },
    { field: "timestamp", headerName: "Zaman" },
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
          <DataTable
            columns={columns}
            rows={chats
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((chat) => ({
                ...chat,
                user: "TODO", // Replace with actual user if available
              }))}
            loading={loading}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            totalCount={chats.length}
            actions={(row) => (
              <IconButton
                color="primary"
                onClick={() => handleOpenFeedback(row.id)}
                size={isMobile ? "small" : "medium"}
                aria-label="feedback"
              >
                <FeedbackIcon />
              </IconButton>
            )}
          />
        )}
        <FormDialog
          open={feedbackOpen}
          onClose={handleCloseFeedback}
          title="Geri Bildirim Ekle"
          loading={loading}
          error={null}
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSubmitFeedback();
          }}
          actions={null}
        >
          <TextField
            label="Geri Bildirim"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            required
            fullWidth
            sx={{ mb: 2, maxWidth: 350 }}
          />
        </FormDialog>
        {loading && <LoadingIndicator message="Yükleniyor..." />}
      </Paper>
    </Box>
  );
};

export default SohbetlerPage;
