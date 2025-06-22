import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Typography,
  Container,
  Card,
  CardContent,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

// Custom PaperComponent for draggable dialog without findDOMNode
function DraggablePaperComponent(props) {
  const nodeRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });

  // Only allow drag from the header (DialogTitle), not from the whole modal
  const handleMouseDown = (e) => {
    // Only start drag if the target is the dialog title or its children
    if (!e.target.closest('#draggable-dialog-title')) return;
    const rect = nodeRef.current.getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setDragging(true);
    document.body.style.userSelect = "none";
  };

  // Move handleMouseMove and handleMouseUp inside useEffect to avoid missing dependency warning
  useEffect(() => {
    function handleMouseMove(e) {
      if (!dragging) return;
      setPos({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y,
      });
    }
    function handleMouseUp() {
      setDragging(false);
      document.body.style.userSelect = "";
    }
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  return (
    <Paper
      ref={nodeRef}
      {...props}
      style={{
        ...props.style,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        margin: 0,
      }}
      onMouseDown={handleMouseDown}
    />
  );
}

// Component to render data as table or regular text
function DataRenderer({ data, type = "result" }) {
  // Check if data is an array of objects
  const isTableData = Array.isArray(data) && data.length > 0 && typeof data[0] === 'object';

  if (!isTableData) {
    return (
      <Typography variant="body2" sx={{ mt: 1 }}>
        {type === "result" ? "İşlem tamamlandı! Sonuç: " : ""}{JSON.stringify(data)}
      </Typography>
    );
  }

  // Get all unique keys from the objects to create table headers
  const headers = [...new Set(data.flatMap(obj => Object.keys(obj)))];

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="body2" color="success.main" sx={{ mb: 1, fontWeight: 600 }}>
        {type === "result" ? "İşlem tamamlandı! Sonuç:" : "Veri:"}
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{
        maxHeight: 320,
        borderRadius: 0,
        boxShadow: 4,
        border: '2px solid #001a4d',
        background: '#fff',
        p: 0,
        m: 0,
      }}>
        <Table size="small" stickyHeader sx={{ borderCollapse: 'collapse', minWidth: 400 }}>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell
                  key={header}
                  sx={{
                    fontWeight: 700,
                    bgcolor: '#001a4d',
                    color: '#fff',
                    border: '2px solid #001a4d',
                    fontSize: 15,
                    letterSpacing: 1,
                    textAlign: 'center',
                    p: 1.2,
                  }}
                >
                  {header.toUpperCase()}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={index}
                hover
                sx={{
                  background: index % 2 === 0 ? '#f4f6fa' : '#fff',
                  '&:hover': { background: '#e3e8f0' },
                  border: 0,
                }}
              >
                {headers.map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      fontSize: 14,
                      border: '1.5px solid #e0e0e0',
                      textAlign: 'center',
                      p: 1.1,
                    }}
                  >
                    {typeof row[header] === 'object'
                      ? JSON.stringify(row[header])
                      : row[header] || '-'}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'right', fontWeight: 500 }}>
        Toplam {data.length} kayıt bulundu
      </Typography>
    </Box>
  );
}

// Enhanced message component
function MessageBubble({ message, index }) {
  const isUser = message.sender === "user";
  const isResult = message.type === "result";
  
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
        sx={{ width: "100%", maxWidth: "100%" }}
      >
        <Avatar
          sx={{
            bgcolor: isUser ? "primary.main" : "secondary.main",
            width: 32,
            height: 32,
            mt: 0.5,
            flexShrink: 0
          }}
        >
          {isUser ? "S" : "A"}
        </Avatar>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            maxWidth: isResult ? "90%" : "75%",
            bgcolor: isUser ? "primary.light" : "grey.100",
            color: isUser ? "white" : "text.primary",
            borderRadius: 2,
            borderTopLeftRadius: isUser ? 2 : 0.5,
            borderTopRightRadius: isUser ? 0.5 : 2,
            width: isResult ? "100%" : "auto",
          }}
        >
          {isResult ? (
            <DataRenderer data={message.data} type="result" />
          ) : (
            <Typography variant="body2">
              {message.text}
            </Typography>
          )}
          <Typography variant="caption" sx={{ 
            display: 'block', 
            mt: 1, 
            opacity: 0.7,
            fontSize: '0.7rem'
          }}>
            {new Date().toLocaleTimeString('tr-TR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Typography>
        </Paper>
      </Stack>
    </ListItem>
  );
}

const API_URL = "http://localhost:8000/agent_chat/";
const APPS_URL = "http://localhost:8000/agent_apps/";

export default function Chat({ open = true, onClose, onMinimize }) {
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState("");
  const [messages, setMessages] = useState([
    { sender: "agent", text: "Merhaba! Size nasıl yardımcı olabilirim?" },
  ]);
  const [input, setInput] = useState("");
  const [userContext] = useState({
    name: "John Doe",
    id_number: "123456789",
  });
  const [parameters, setParameters] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetch(APPS_URL)
      .then((res) => res.json())
      .then((data) => setApps(data))
      .catch((error) => console.error("Error fetching apps:", error));
  }, []);

  const sendMessage = async (userMessage) => {
    setMessages((msgs) => [...msgs, { sender: "user", text: userMessage }]);
    
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_name: selectedApp,
          user_message: userMessage,
          user_context: userContext,
          parameters,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

      if (data.status === "need_parameters" && data.missing_parameters.length > 0) {
        setMessages((msgs) => [...msgs, { sender: "agent", text: data.prompt }]);
        setInput("");
      } else if (data.status === "success") {
        // Check if result is an array for table display
        const isArrayResult = Array.isArray(data.result);
        setMessages((msgs) => [
          ...msgs,
          {
            sender: "agent",
            type: isArrayResult ? "result" : "text",
            text: isArrayResult ? "" : `İşlem tamamlandı! Sonuç: ${JSON.stringify(data.result)}`,
            data: isArrayResult ? data.result : null,
          },
        ]);
        setParameters({});
      } else if (data.status === "no_match") {
        setMessages((msgs) => [
          ...msgs,
          {
            sender: "agent",
            text: data.message || "Uygun bir işlem bulunamadı.",
          },
        ]);
      } else if (data.status === "error") {
        setMessages((msgs) => [
          ...msgs,
          { sender: "agent", text: data.message || "Bir hata oluştu." },
        ]);
      } else {
        setMessages((msgs) => [
          ...msgs,
          { sender: "agent", text: "Bir hata oluştu." },
        ]);
      }
    } catch (error) {
      console.error('Connection error:', error);
      setMessages((msgs) => [
        ...msgs,
        { 
          sender: "agent", 
          text: "Bağlantı hatası: Backend sunucusuna ulaşılamıyor. Lütfen sunucunun çalıştığından emin olun." 
        },
      ]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const lastAgentMsg = messages[messages.length - 1];
    if (
      lastAgentMsg.sender === "agent" &&
      lastAgentMsg.text.startsWith("Please provide the following parameters:")
    ) {
      const paramName = lastAgentMsg.text.split(":")[1].trim().split(",")[0];
      setParameters((prev) => {
        const updated = { ...prev, [paramName]: input };
        sendMessage(messages.find((m) => m.sender === "user").text);
        return updated;
      });
    } else {
      sendMessage(input);
    }
    setInput("");
  };

  // Sohbeti temizle fonksiyonu
  const handleClearChat = (e) => {
    e?.stopPropagation(); // Prevent drag or modal move on click
    setMessages([
      { sender: "agent", text: "Merhaba! Size nasıl yardımcı olabilirim?" },
    ]);
    setParameters({});
  };

  // Uygulama değiştirme fonksiyonu
  const handleAppChange = (e) => {
    setSelectedApp(e.target.value);
    setMessages([
      { sender: "agent", text: `${e.target.value} uygulaması seçildi. Size nasıl yardımcı olabilirim?` },
    ]);
    setParameters({});
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperComponent={DraggablePaperComponent}
      aria-labelledby="draggable-dialog-title"
      maxWidth={false}
      hideBackdrop={false}
    >
      <ResizableBox
        width={600}
        height={700}
        minConstraints={[400, 500]}
        maxConstraints={[window.innerWidth - 40, window.innerHeight - 40]}
        resizeHandles={["se"]}
        style={{ overflow: "hidden", background: "#fff", borderRadius: 0, boxShadow: 'none', display: 'flex', flexDirection: 'column' }}
      >
        <DialogTitle
          style={{
            cursor: "move",
            background: "#001a4d",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            paddingRight: 80,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBottom: '1px solid #e0e0e0',
            minHeight: 56,
            height: 56,
            boxSizing: 'border-box',
          }}
          id="draggable-dialog-title"
        >
          <img
            src="/jandarma-logo.png"
            alt="Jandarma Logo"
            style={{ height: 36, marginRight: 12 }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <span
            style={{ fontWeight: 700, fontSize: 18, letterSpacing: 1, flex: 1 }}
          >
            Sohbet Penceresi
          </span>
          {selectedApp && (
            <Chip 
              label={selectedApp} 
              size="small" 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mr: 2 }}
            />
          )}
          <IconButton
            aria-label="clear"
            onClick={handleClearChat}
            sx={{ color: "#f5002f", mr: 1 }}
            title="Sohbeti Temizle"
          >
            <DeleteIcon />
          </IconButton>
          <IconButton
            aria-label="minimize"
            onClick={onMinimize}
            sx={{ color: "#fff", mr: 1 }}
            title="Simge Durumuna Küçült"
          >
            <span style={{ fontSize: 20, fontWeight: 700 }}>_</span>
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
            p: 0,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: "#fff",
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            minHeight: 0,
            height: 'calc(100% - 56px)',
            boxSizing: 'border-box',
          }}
        >
          <Box
            sx={{
              p: 2,
              flex: 1,
              minHeight: 0,
              background: "rgba(255,255,255,0.95)",
              borderRadius: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: 'stretch',
            }}
          >
            {!selectedApp ? (
              <Card elevation={3}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    Uygulama Seçimi
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Hangi uygulama için işlem yapmak istiyorsunuz?
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel id="app-select-label">
                      Uygulama Seçin
                    </InputLabel>
                    <Select
                      labelId="app-select-label"
                      value={selectedApp}
                      label="Uygulama Seçin"
                      onChange={handleAppChange}
                    >
                      <MenuItem value="">
                        <em>Uygulama seçin</em>
                      </MenuItem>
                      {apps.map((app) => (
                        <MenuItem key={app.name} value={app.name}>
                          {app.name} - {app.description}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </CardContent>
              </Card>
            ) : (
              <Card elevation={3} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Typography variant="h5" sx={{ flex: 1 }}>
                      Sohbet
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setSelectedApp("")}
                    >
                      Uygulama Değiştir
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  {/* Make the message list area resizable */}
                  <ResizableBox
                    axis="y"
                    minConstraints={[100, 120]}
                    maxConstraints={[Infinity, 500]}
                    height={320}
                    width={Infinity}
                    handle={<span style={{display:'block',height:6,background:'#e0e0e0',cursor:'row-resize',borderRadius:3}} />} 
                    style={{ width: '100%', marginBottom: 16, background: 'transparent' }}
                  >
                    <Paper
                      variant="outlined"
                      sx={{
                        flex: 1,
                        overflowY: "auto",
                        p: 1,
                        background: "#f8fafc",
                        height: '100%',
                        minHeight: 100,
                        maxHeight: 500,
                        boxSizing: 'border-box',
                      }}
                    >
                      <List sx={{ py: 0, maxHeight: '100%', overflowY: 'auto' }}>
                        {messages.map((msg, idx) => (
                          <MessageBubble key={idx} message={msg} index={idx} />
                        ))}
                        <div ref={messagesEndRef} />
                      </List>
                    </Paper>
                  </ResizableBox>
                  <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{ display: "flex", gap: 2 }}
                  >
                    <TextField
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Mesajınızı yazın..."
                      fullWidth
                      size="small"
                      variant="outlined"
                      autoFocus
                      multiline
                      maxRows={3}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      endIcon={<SendIcon />}
                      disabled={!input.trim()}
                      sx={{ minWidth: 120 }}
                    >
                      Gönder
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        </DialogContent>
      </ResizableBox>
    </Dialog>
  );
}