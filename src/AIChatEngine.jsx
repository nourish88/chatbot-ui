import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  List,
  ListItem,
  Avatar,
  Stack,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

export function AIChatEngine({ open, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [temperature, setTemperature] = useState(1);
  const [apiKey, setApiKey] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setMessages([]);
      setInputValue("");
      setIsLoading(false);
      setModel("gpt-3.5-turbo");
      setTemperature(1);
      setApiKey("");
    }
  }, [open]);

  useEffect(() => {
    const handleNewMessage = (event) => {
      const { data } = event;
      if (data && data !== "[object Object]") {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: data, type: "received" },
        ]);
      }
    };

    window.addEventListener("message", handleNewMessage);

    return () => {
      window.removeEventListener("message", handleNewMessage);
    };
  }, []);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = { text: inputValue, type: "sent" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue("");
    setIsLoading(true);

    window.electron.ipcRenderer.sendMessage("chatGPTMessage", {
      model,
      messages: [...messages, userMessage],
      temperature,
      apiKey,
    });
  };

  const handleDelete = (index) => {
    setMessages((prevMessages) => prevMessages.filter((_, i) => i !== index));
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleModelChange = (event) => {
    setModel(event.target.value);
  };

  const handleTemperatureChange = (event) => {
    setTemperature(event.target.value);
  };

  const handleApiKeyChange = (event) => {
    setApiKey(event.target.value);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        AI Chat Engine
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleClose}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "500px",
            width: "100%",
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <List sx={{ width: "100%", bgcolor: "background.paper" }}>
              {messages.map((message, index) => (
                <ListItem key={index} disableGutters>
                  <Stack
                    direction={
                      message.type === "sent" ? "row-reverse" : "row"
                    }
                    spacing={1}
                    sx={{ width: "100%" }}
                  >
                    <Avatar>{message.type === "sent" ? "You" : "AI"}</Avatar>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2,
                        borderRadius: "16px",
                        bgcolor:
                          message.type === "sent"
                            ? "primary.main"
                            : "grey.200",
                        color:
                          message.type === "sent" ? "white" : "text.primary",
                        maxWidth: "80%",
                        wordWrap: "break-word",
                      }}
                    >
                      <Typography variant="body1">{message.text}</Typography>
                    </Paper>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </ListItem>
              ))}
              <div ref={messagesEndRef} />
            </List>
            {isLoading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              borderTop: "1px solid",
              borderColor: "divider",
              pt: 2,
              pb: 1,
            }}
          >
            <TextField
              variant="outlined"
              placeholder="Type your message here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              sx={{ flex: 1, mr: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={isLoading}
              endIcon={<SendIcon />}
            >
              Send
            </Button>
          </Box>
        </Box>
        <Box sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="model-select-label">Model</InputLabel>
            <Select
              labelId="model-select-label"
              value={model}
              onChange={handleModelChange}
              variant="outlined"
            >
              <MenuItem value="gpt-3.5-turbo">GPT-3.5 Turbo</MenuItem>
              <MenuItem value="gpt-4">GPT-4</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ mt: 2 }}>
          <TextField
            label="Temperature"
            type="number"
            variant="outlined"
            value={temperature}
            onChange={handleTemperatureChange}
            fullWidth
            InputProps={{
              inputProps: { min: 0, max: 2, step: 0.1 },
            }}
          />
        </Box>
        <Box sx={{ mt: 2 }}>
          <TextField
            label="API Key"
            variant="outlined"
            value={apiKey}
            onChange={handleApiKeyChange}
            fullWidth
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
