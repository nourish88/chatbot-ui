import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  List,
  ListItem,
  Avatar,
  Stack,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

export function AIChatEngine({ open, onClose }) {
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const sessionIdRef = useRef(String(Math.floor(Math.random() * 1e16)));

  useEffect(() => {
    if (open) {
      fetch("http://localhost:8000/apps/")
        .then((res) => res.json())
        .then((data) => setApps(data))
        .catch(() => setApps([]));
    }
    if (!open) {
      setMessages([]);
      setInputValue("");
      setIsLoading(false);
      setSelectedApp("");
      sessionIdRef.current = String(Math.floor(Math.random() * 1e16));
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !selectedApp) return;
    const userMessage = { text: inputValue, type: "sent" };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    try {
      const body = {
        app_id: Number(selectedApp),
        question: inputValue,
        session_id: String(sessionIdRef.current),
      };
      const response = await fetch("http://localhost:8000/chat/graph_chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      // Only show the 'generation' field if present, otherwise fallback
      setMessages((prev) => [
        ...prev,
        { text: data.generation || data.response || JSON.stringify(data), type: "received" },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { text: "Sunucu hatası: " + e.message, type: "received" },
      ]);
    }
    setIsLoading(false);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth={false}
      PaperProps={{
        sx: {
          resize: "both",
          overflow: "auto",
          minWidth: 340,
          width: 420,
          minHeight: 340,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(90deg, #001a4d 0%, #f5002f 100%)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          py: 2,
          pl: 2.5,
          pr: 1,
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <img
            src="/jandarma-logo.png"
            alt="Logo"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              boxShadow: "0 2px 8px #001a4d33",
            }}
          />
          <span>Yapay Zeka Sohbet Motoru</span>
        </Box>
        <IconButton
          aria-label="clear"
          onClick={handleClearChat}
          sx={{ color: "#fff", ml: "auto", mr: 1 }}
          title="Sohbeti Temizle"
        >
          <DeleteIcon />
        </IconButton>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: "#fff" }}
          title="Kapat"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          p: 2,
          background: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          height: "60vh",
          minHeight: 320,
        }}
      >
        <FormControl fullWidth sx={{ mb: 2, mt: 3 }}>
          <InputLabel id="ai-app-select-label">Uygulama Seçin</InputLabel>
          <Select
            labelId="ai-app-select-label"
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
        <Paper
          variant="outlined"
          sx={{
            flex: "1 1 0",
            minHeight: 120,
            maxHeight: "none",
            overflowY: "auto",
            mb: 2,
            p: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <List sx={{ flex: 1, overflowY: "auto" }}>
            {messages.map((msg, idx) => (
              <ListItem
                key={idx}
                alignItems={msg.type === "sent" ? "flex-end" : "flex-start"}
                disableGutters
                sx={{ mb: 1 }}
              >
                <Stack
                  direction={msg.type === "sent" ? "row-reverse" : "row"}
                  alignItems="flex-start"
                  spacing={2}
                  sx={{ width: "100%" }}
                >
                  <Avatar
                    sx={{
                      bgcolor: msg.type === "sent" ? "primary.main" : "secondary.main",
                      width: 32,
                      height: 32,
                      flexShrink: 0,
                    }}
                  >
                    {msg.type === "sent" ? "S" : "A"}
                  </Avatar>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 1.5,
                      maxWidth: "75%",
                      bgcolor: msg.type === "sent" ? "primary.light" : "grey.100",
                      color: msg.type === "sent" ? "white" : "text.primary",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2">{msg.text}</Typography>
                  </Paper>
                </Stack>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
            {isLoading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </List>
        </Paper>
        <Box
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          sx={{ display: "flex", gap: 2 }}
        >
          <TextField
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Mesajınızı yazın..."
            fullWidth
            size="small"
            variant="outlined"
            disabled={isLoading || !selectedApp}
            multiline
            maxRows={3}
            onKeyDown={handleKeyDown}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            disabled={!inputValue.trim() || isLoading || !selectedApp}
            sx={{ minWidth: 120 }}
          >
            Gönder
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
