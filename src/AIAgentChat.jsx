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
import { v4 as uuidv4 } from "uuid";

// Yes/No Prompt for optional parameters
function YesNoPrompt({ prompt, onAnswer }) {
  const handleYes = () => {
    console.log("[DEBUG] Yes button clicked");
    onAnswer("evet");
  };

  const handleNo = () => {
    console.log("[DEBUG] No button clicked");
    onAnswer("hayır");
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, my: 2 }}>
      <Typography>{prompt}</Typography>
      <Button variant="contained" color="primary" onClick={handleYes}>
        Evet
      </Button>
      <Button variant="outlined" color="secondary" onClick={handleNo}>
        Hayır
      </Button>
    </Box>
  );
}

// Table for array results
function ArrayResultTable({ data }) {
  if (!Array.isArray(data) || data.length === 0) return null;
  const columns = Object.keys(data[0]);
  return (
    <Box
      sx={{
        width: "100%",
        px: { xs: 1, sm: 2 },
        mb: 2,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          maxWidth: "100%",
          overflowX: "auto",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          border: "1px solid #e0e0e0",
        }}
      >
        <Box
          component="table"
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
          }}
        >
          <Box component="thead" sx={{ background: "#f1f5fa" }}>
            <Box component="tr">
              {columns.map((col) => (
                <Box
                  component="th"
                  key={col}
                  sx={{
                    px: 2,
                    py: 1.5,
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "#001a4d",
                    borderBottom: "1.5px solid #e0e0e0",
                    textAlign: "left",
                  }}
                >
                  {col}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {data.map((row, i) => (
              <Box
                component="tr"
                key={i}
                sx={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}
              >
                {columns.map((col) => (
                  <Box
                    component="td"
                    key={col}
                    sx={{
                      px: 2,
                      py: 1.2,
                      borderBottom: "1px solid #f0f0f0",
                      fontSize: "0.98rem",
                      color: "#222",
                      maxWidth: 320,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {String(row[col])}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

// Message bubble component
function MessageBubble({ message, index }) {
  const isUser = message.sender === "user";

  // Table detection for agent messages
  if (
    message.sender === "agent" &&
    (Array.isArray(message.result) ||
      (typeof message.text === "string" &&
        message.text.startsWith("İşlem tamamlandı! Sonuç: [")))
  ) {
    let arr = message.result;
    if (!arr && typeof message.text === "string") {
      try {
        const match = message.text.match(/İşlem tamamlandı! Sonuç: (\[.*\])$/);
        if (match) arr = JSON.parse(match[1]);
      } catch {
        /* hata yutuluyor */
      }
    }
    if (Array.isArray(arr) && arr.length > 0) {
      return (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-start",
            mb: 1,
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <Avatar
              sx={{
                bgcolor: "secondary.main",
                width: 32,
                height: 32,
                mt: 0.5,
                mr: 2,
                flexShrink: 0,
              }}
            >
              A
            </Avatar>
            <ArrayResultTable data={arr} />
          </Box>
        </Box>
      );
    }
  }

  // Fix: If message.text is an array, join as string; if object, stringify
  let displayText = message.text;
  if (Array.isArray(displayText)) {
    displayText = displayText
      .map((item) => (typeof item === "object" ? JSON.stringify(item) : String(item)))
      .join(", ");
  } else if (typeof displayText === "object" && displayText !== null) {
    displayText = JSON.stringify(displayText, null, 2);
  }

  return (
    <ListItem
      key={index}
      alignItems={isUser ? "flex-end" : "flex-start"}
      disableGutters
      sx={{ mb: 1 }}
    >
      <Stack
        direction={isUser ? "row-reverse" : "row"}
        alignItems="flex-start"
        spacing={2}
        sx={{ width: "100%" }}
      >
        <Avatar
          sx={{
            bgcolor: isUser ? "primary.main" : "secondary.main",
            width: 32,
            height: 32,
            flexShrink: 0,
          }}
        >
          {isUser ? "S" : "A"}
        </Avatar>
        <Paper
          elevation={1}
          sx={{
            p: 1.5,
            maxWidth: "75%",
            bgcolor: isUser ? "primary.light" : "grey.100",
            color: isUser ? "white" : "text.primary",
            borderRadius: 2,
          }}
        >
          <Typography variant="body2">{displayText}</Typography>
        </Paper>
      </Stack>
    </ListItem>
  );
}

export function AIAgentChat({ open, onClose }) {
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [userContext] = useState({
    name: "John Doe",
    id_number: "123456789",
  });

  // Improved slot-filling state management
  const [slotFilling, setSlotFilling] = useState(null);
  const [allCollectedParams, setAllCollectedParams] = useState({});
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const sessionIdRef = useRef(uuidv4());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (open) {
      fetch("http://localhost:8000/agent_apps/")
        .then((res) => res.json())
        .then((data) => setApps(data))
        .catch(() => setApps([]));
    }
  }, [open]);

  const handleAppChange = (e) => {
    setSelectedApp(e.target.value);
    setMessages([]);
    setSlotFilling(null);
    setAllCollectedParams({});
    sessionIdRef.current = uuidv4(); // New session for new app
  };

  const handleOptionalYesNo = async (answer) => {
    console.log("[DEBUG] handleOptionalYesNo called with answer:", answer);
    console.log("[DEBUG] Current slotFilling state:", slotFilling);

    setMessages((msgs) => [...msgs, { sender: "user", text: answer }]);

    if (answer === "evet") {
      console.log("[DEBUG] User answered 'evet', asking for value");
      // Ask for the value of the optional parameter
      setSlotFilling((prev) => ({
        ...prev,
        state: "ask_optional_value",
        prompt: `Lütfen ${prev.currentOptional} için bir değer girin:`,
      }));

      // Add the prompt message to chat
      setMessages((msgs) => [
        ...msgs,
        {
          sender: "agent",
          text: `Lütfen ${slotFilling.currentOptional} için bir değer girin:`,
        },
      ]);
    } else {
      console.log(
        "[DEBUG] User answered 'hayır', making API call with params:",
        slotFilling.collected_parameters
      );

      // Skip this optional parameter - make API call immediately with collected parameters
      const payload = {
        app_name: selectedApp,
        user_message: slotFilling.originalUserMessage,
        user_context: userContext,
        parameters: slotFilling.collected_parameters,
        slot_filling: null,
        session_id: sessionIdRef.current,
      };

      console.log("[DEBUG] Sending payload for 'hayır' response:", payload);

      try {
        setLoading(true);
        const response = await fetch("http://localhost:8000/agent_chat/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("[DEBUG] Backend response for 'hayır':", data);

        if (data.status === "success") {
          setMessages((msgs) => [
            ...msgs,
            {
              sender: "agent",
              text: `İşlem tamamlandı! Sonuç: ${JSON.stringify(data.result)}`,
              result: data.result,
            },
          ]);
        } else if (data.status === "need_optional_parameters") {
          // Backend is still asking for optional parameters, force the API call
          console.log(
            "[DEBUG] Backend still asking for optional parameters, forcing API call"
          );

          // Make a direct API call to the endpoint
          const endpoint = data.endpoint;
          const baseUrl = endpoint.base_url || "http://localhost:8000";
          const path = endpoint.path || "/apps/";
          const apiUrl = baseUrl.replace(/\/$/, "") + path;
          const apiMethod = endpoint.method || "POST";

          console.log("[DEBUG] Making direct API call to:", apiUrl);
          console.log("[DEBUG] API method:", apiMethod);
          console.log(
            "[DEBUG] API parameters:",
            slotFilling.collected_parameters
          );

          const apiResponse = await fetch(apiUrl, {
            method: apiMethod,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(slotFilling.collected_parameters),
          });

          if (!apiResponse.ok) {
            throw new Error(`API error! status: ${apiResponse.status}`);
          }

          const apiData = await apiResponse.json();
          console.log("[DEBUG] Direct API response:", apiData);

          setMessages((msgs) => [
            ...msgs,
            {
              sender: "agent",
              text: `İşlem tamamlandı! Sonuç: ${JSON.stringify(apiData)}`,
              result: apiData,
            },
          ]);
        } else {
          setMessages((msgs) => [
            ...msgs,
            { sender: "agent", text: data.message || "Bir hata oluştu." },
          ]);
        }
      } catch (error) {
        console.error("[DEBUG] API Error for 'hayır' response:", error);
        setMessages((msgs) => [
          ...msgs,
          { sender: "agent", text: `Bağlantı hatası: ${error.message}` },
        ]);
      } finally {
        setLoading(false);
      }

      setSlotFilling(null);
    }
  };
  const handleOptionalValue = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((msgs) => [...msgs, { sender: "user", text: input }]);

    // Add the optional parameter value to collected_parameters
    const updatedParams = {
      ...slotFilling.collected_parameters,
      [slotFilling.currentOptional]: input,
    };

    console.log("[DEBUG] Making API call with all parameters:", updatedParams);

    // Make API call immediately with all collected parameters (required + optional)
    await sendMessage(slotFilling.originalUserMessage, null, updatedParams);
    setSlotFilling(null);
    setInput("");
  };

  const sendMessage = async (
    userMessage,
    backendSlotFillingState = null,
    paramsToSend = {}
  ) => {
    if (userMessage.trim() && !backendSlotFillingState) {
      setMessages((msgs) => [...msgs, { sender: "user", text: userMessage }]);
    }

    setLoading(true);

    const body = {
      app_name: selectedApp,
      user_message: slotFilling?.originalUserMessage || userMessage,
      user_context: userContext,
      parameters: paramsToSend,
      slot_filling: backendSlotFillingState,
      session_id: sessionIdRef.current,
    };

    console.log("[DEBUG] Sending to backend:", JSON.stringify(body, null, 2));

    try {
      const response = await fetch("http://localhost:8000/agent_chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAllCollectedParams(data.collected_parameters || allCollectedParams);

      // Display history if present
      if (data.history && Array.isArray(data.history)) {
        setMessages(
          data.history.map((h) => ({
            sender: h.sender,
            text: h.text,
            ...(h.result ? { result: h.result } : {}),
          }))
        );
      } else if (
        data.status === "need_parameters" &&
        data.missing_parameters.length > 0
      ) {
        const originalMessage = slotFilling?.originalUserMessage || userMessage;
        setSlotFilling({
          originalUserMessage: originalMessage,
          backendSlotFilling: {
            endpoint: data.endpoint,
            missing_parameters: data.missing_parameters,
          },
          currentParameter: data.missing_parameters[0],
          remainingParams: data.missing_parameters.slice(1),
          state: "required_param",
          collected_parameters: paramsToSend,
        });
        setMessages((msgs) => [
          ...msgs,
          { sender: "agent", text: data.prompt },
        ]);
      } else if (data.status === "need_optional_parameters") {
        // NEW: Handle optional parameters locally
        const originalMessage = slotFilling?.originalUserMessage || userMessage;
        setSlotFilling({
          originalUserMessage: originalMessage,
          optionalParameters: data.optional_parameters,
          currentOptionalIndex: 0,
          currentOptional: data.optional_parameters[0],
          state: "ask_optional_yesno",
          prompt: data.prompt,
          collected_parameters: data.collected_parameters,
        });
        setAllCollectedParams(data.collected_parameters);
        setMessages((msgs) => [
          ...msgs,
          { sender: "agent", text: data.prompt },
        ]);
      } else if (data.status === "success") {
        setMessages((msgs) => [
          ...msgs,
          {
            sender: "agent",
            text: Array.isArray(data.result)
              ? "İşlem tamamlandı! Sonuç: " + JSON.stringify(data.result)
              : `İşlem tamamlandı! Sonuç: ${JSON.stringify(data.result)}`,
            result: data.result,
          },
        ]);
        setSlotFilling(null);
        setAllCollectedParams({});
      } else {
        setMessages((msgs) => [
          ...msgs,
          { sender: "agent", text: data.message || "Bir hata oluştu." },
        ]);
        setSlotFilling(null);
        setAllCollectedParams({});
      }
    } catch (error) {
      console.error("API Error:", error);
      setMessages((msgs) => [
        ...msgs,
        {
          sender: "agent",
          text: "Bağlantı hatası: Backend sunucusuna ulaşılamıyor.",
        },
      ]);
      setSlotFilling(null);
      setAllCollectedParams({});
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedApp) return;

    if (slotFilling) {
      if (slotFilling.state === "ask_optional_value") {
        await handleOptionalValue(e);
      } else if (slotFilling.state === "required_param") {
        const updatedParams = {
          ...allCollectedParams,
          [slotFilling.currentParameter]: input,
        };
        setAllCollectedParams(updatedParams);
        setMessages((msgs) => [...msgs, { sender: "user", text: input }]);

        if (slotFilling.remainingParams.length === 0) {
          await sendMessage(
            slotFilling.originalUserMessage,
            slotFilling.backendSlotFilling,
            updatedParams
          );
        } else {
          setSlotFilling({
            ...slotFilling,
            currentParameter: slotFilling.remainingParams[0],
            remainingParams: slotFilling.remainingParams.slice(1),
            collected_parameters: updatedParams,
          });
          setMessages((msgs) => [
            ...msgs,
            {
              sender: "agent",
              text: `Please provide: ${slotFilling.remainingParams[0]}`,
            },
          ]);
        }
      }
    } else {
      setAllCollectedParams({});
      await sendMessage(input, null, {});
    }
    setInput("");
  };

  const handleClearChat = () => {
    setMessages([]);
    setSlotFilling(null);
    setAllCollectedParams({});
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth={false}
      PaperProps={{
        sx: {
          resize: 'both',
          overflow: 'auto',
          minWidth: 340,
          width: 420,
          minHeight: 340,
          maxHeight: '90vh',
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
          <span>Yapay Zeka Ajanı</span>
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
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          height: '60vh',
          minHeight: 320,
        }}
      >
        <FormControl fullWidth sx={{ mb: 2, mt: 3 }}>
          <InputLabel id="agent-app-select-label">Uygulama Seçin</InputLabel>
          <Select
            labelId="agent-app-select-label"
            value={selectedApp}
            label="Uygulama Seçin"
            onChange={handleAppChange}
          >
            {apps.map((app) => (
              <MenuItem key={app.id || app.name} value={app.name}>
                {app.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Paper
          variant="outlined"
          sx={{
            flex: '1 1 0',
            minHeight: 120,
            maxHeight: 'none',
            overflowY: 'auto',
            mb: 2,
            p: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <List sx={{ flex: 1, overflowY: 'auto' }}>
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} message={msg} index={idx} />
            ))}
            <div ref={messagesEndRef} />
          </List>
        </Paper>

        {/* Optional parameter yes/no prompt */}
        {slotFilling && slotFilling.state === "ask_optional_yesno" && (
          <YesNoPrompt
            prompt={slotFilling.prompt}
            onAnswer={handleOptionalYesNo}
          />
        )}

        {/* Optional parameter value input */}
        {slotFilling && slotFilling.state === "ask_optional_value" && (
          <Box
            component="form"
            onSubmit={handleOptionalValue}
            sx={{ display: "flex", gap: 2, my: 2 }}
          >
            <TextField
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Lütfen ${slotFilling.currentOptional} için bir değer girin...`}
              fullWidth
              size="small"
              variant="outlined"
              disabled={loading}
              multiline
              maxRows={3}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              disabled={!input.trim() || loading}
              sx={{ minWidth: 120 }}
            >
              Gönder
            </Button>
          </Box>
        )}

        {/* Regular input (for new messages and required parameters) */}
        {(!slotFilling ||
          !["ask_optional_yesno", "ask_optional_value"].includes(
            slotFilling.state
          )) && (
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", gap: 2 }}
          >
            <TextField
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                slotFilling && slotFilling.state === "required_param"
                  ? `Lütfen ${slotFilling.currentParameter} değerini girin...`
                  : "Mesajınızı yazın..."
              }
              fullWidth
              size="small"
              variant="outlined"
              disabled={!selectedApp || loading}
              multiline
              maxRows={3}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              disabled={!input.trim() || !selectedApp || loading}
              sx={{ minWidth: 120 }}
            >
              Gönder
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
