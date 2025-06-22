import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Typography,
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
  Avatar,
  Stack,
  Chip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";

// Custom PaperComponent for draggable dialog
function DraggablePaperComponent(props) {
  const nodeRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (!e.target.closest("#draggable-dialog-title")) return;
    const rect = nodeRef.current.getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setDragging(true);
    document.body.style.userSelect = "none";
  };

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

// Message bubble
function MessageBubble({ message, index }) {
  const isUser = message.sender === "user";
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
            flexShrink: 0,
          }}
        >
          {isUser ? "S" : "A"}
        </Avatar>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            maxWidth: "75%",
            bgcolor: isUser ? "primary.light" : "grey.100",
            color: isUser ? "white" : "text.primary",
            borderRadius: 2,
            borderTopLeftRadius: isUser ? 2 : 0.5,
            borderTopRightRadius: isUser ? 0.5 : 2,
            width: "auto",
          }}
        >
          <Typography variant="body2">{message.text}</Typography>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 1,
              opacity: 0.7,
              fontSize: "0.7rem",
            }}
          >
            {new Date().toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
        </Paper>
      </Stack>
    </ListItem>
  );
}

// Table rendering for array results
function ArrayResultTable({ data }) {
  if (!Array.isArray(data) || data.length === 0) return null;
  // Get all unique keys from all objects (for wide tables)
  const columns = Array.from(
    data.reduce((set, row) => {
      Object.keys(row).forEach((k) => set.add(k));
      return set;
    }, new Set())
  );
  return (
    <Box
      sx={{
        width: "100%",
        px: { xs: 1, sm: 2 }, // small horizontal padding
        mb: 2,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          flex: 1,
          maxWidth: "100%",
          background: "#fff",
          borderRadius: 2,
          boxShadow: 2,
          overflowX: "auto",
          border: "1px solid #e0e0e0",
          p: 2,
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  style={{
                    textAlign: "left",
                    padding: "8px 12px",
                    background: "#f0f4fa",
                    fontWeight: 600,
                    borderBottom: "2px solid #e0e0e0",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{ background: i % 2 ? "#f9fbfd" : "#fff" }}>
                {columns.map((col) => (
                  <td
                    key={col}
                    style={{
                      padding: "8px 12px",
                      borderBottom: "1px solid #f0f0f0",
                      fontSize: 15,
                    }}
                  >
                    {row[col] !== undefined && row[col] !== null
                      ? String(row[col])
                      : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
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
  const [slotFilling, setSlotFilling] = useState(null); // slot-filling state
  const [collectedParams, setCollectedParams] = useState({}); // tüm toplanan parametreler
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

  // Slot-filling aware sendMessage
  const sendMessage = async (
    userMessage,
    slotFillingState = null,
    paramsToSend = {}
  ) => {
    setMessages((msgs) => [...msgs, { sender: "user", text: userMessage }]);

    let body;
    if (slotFillingState) {
      body = {
        app_name: selectedApp,
        user_message: slotFillingState.originalUserMessage,
        user_context: userContext,
        parameters: paramsToSend,
        slot_filling: {
          endpoint: slotFillingState.endpoint,
          missing_parameters: slotFillingState.missingParameters,
        },
      };
    } else {
      body = {
        app_name: selectedApp,
        user_message: userMessage,
        user_context: userContext,
        parameters: paramsToSend,
      };
    }
    console.log("[DEBUG] Payload to backend:", JSON.stringify(body, null, 2));

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (
        data.status === "need_parameters" &&
        data.missing_parameters.length > 0
      ) {
        // Slot-filling başlat veya devam ettir
        setSlotFilling({
          endpoint: data.endpoint,
          missingParameters: data.missing_parameters.slice(1),
          currentParameter: data.missing_parameters[0],
          originalUserMessage:
            slotFillingState?.originalUserMessage || userMessage,
          optionalParameters: data.endpoint.parameters
            ? JSON.parse(data.endpoint.parameters)
                .filter((p) => !p.required)
                .map((p) => p.name)
            : [],
          optionalIndex: 0,
          askingOptional: false,
        });
        setMessages((msgs) => [
          ...msgs,
          { sender: "agent", text: data.prompt },
        ]);
        setInput("");
      } else if (data.status === "success") {
        setMessages((msgs) => [
          ...msgs,
          {
            sender: "agent",
            text: Array.isArray(data.result)
              ? "İşlem tamamlandı! Sonuç: " + JSON.stringify(data.result)
              : `İşlem tamamlandı! Sonuç: ${JSON.stringify(data.result)}`,
          },
        ]);
        setSlotFilling(null);
        setCollectedParams({});
      } else if (data.status === "no_match") {
        setMessages((msgs) => [
          ...msgs,
          {
            sender: "agent",
            text: data.message || "Uygun bir işlem bulunamadı.",
          },
        ]);
        setSlotFilling(null);
        setCollectedParams({});
      } else if (data.status === "error") {
        setMessages((msgs) => [
          ...msgs,
          { sender: "agent", text: data.message || "Bir hata oluştu." },
        ]);
        setSlotFilling(null);
        setCollectedParams({});
      } else {
        setMessages((msgs) => [
          ...msgs,
          { sender: "agent", text: "Bir hata oluştu." },
        ]);
        setSlotFilling(null);
        setCollectedParams({});
      }
    } catch (error) {
      setMessages((msgs) => [
        ...msgs,
        {
          sender: "agent",
          text: "Bağlantı hatası: Backend sunucusuna ulaşılamıyor. Lütfen sunucunun çalıştığından emin olun.",
        },
      ]);
      setSlotFilling(null);
      setCollectedParams({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (slotFilling) {
      // Opsiyonel parametre soruluyor mu?
      if (slotFilling.askingOptional) {
        if (slotFilling.askingOptional === "value") {
          // Opsiyonel parametre değeri girildi
          const paramName =
            slotFilling.optionalParameters[slotFilling.optionalIndex];
          let updatedParams = { ...collectedParams };
          if (input.trim() !== "") {
            updatedParams[paramName] = input;
          }
          // setCollectedParams(updatedParams); // Kaldırıldı, çünkü state asenkron
          // Sıradaki opsiyonel parametreye geç
          const nextIndex = slotFilling.optionalIndex + 1;
          if (
            slotFilling.optionalParameters &&
            nextIndex < slotFilling.optionalParameters.length
          ) {
            setSlotFilling({
              ...slotFilling,
              optionalIndex: nextIndex,
              askingOptional: true,
            });
            setMessages((msgs) => [
              ...msgs,
              {
                sender: "agent",
                text: `${slotFilling.optionalParameters[nextIndex]} parametresini girmek ister misiniz? (evet/hayır)`,
              },
            ]);
          } else {
            // Tüm opsiyoneller bitti, API çağrısı yap
            await sendMessage("", slotFilling, updatedParams); // input yerine "" gönder!
            setSlotFilling(null);
            setCollectedParams({}); // Temizle
          }
          setInput(""); // input'u sıfırla
        } else {
          // Kullanıcı evet/hayır dedi
          if (input.trim().toLowerCase() === "evet") {
            // Şimdi değerini iste
            setSlotFilling({
              ...slotFilling,
              askingOptional: "value",
            });
            setMessages((msgs) => [
              ...msgs,
              {
                sender: "agent",
                text: `${
                  slotFilling.optionalParameters[slotFilling.optionalIndex]
                } değerini girin:`,
              },
            ]);
          } else {
            // Hayır dediyse sıradaki opsiyonel parametreye geç
            const nextIndex = slotFilling.optionalIndex + 1;
            if (nextIndex < slotFilling.optionalParameters.length) {
              setSlotFilling({
                ...slotFilling,
                optionalIndex: nextIndex,
                askingOptional: true,
              });
              setMessages((msgs) => [
                ...msgs,
                {
                  sender: "agent",
                  text: `${slotFilling.optionalParameters[nextIndex]} parametresini girmek ister misiniz? (evet/hayır)`,
                },
              ]);
            } else {
              // Tüm opsiyoneller bitti, API çağrısı yap
              await sendMessage(input, slotFilling, collectedParams);
              setSlotFilling(null);
            }
          }
        }
      } else {
        // Zorunlu parametre slot-filling
        const paramName = slotFilling.currentParameter;
        const updatedParams = { ...collectedParams, [paramName]: input };
        setCollectedParams(updatedParams);
        // Eğer missingParameters bitti ise opsiyonellere geç
        if (slotFilling.missingParameters.length === 0) {
          if (
            slotFilling.optionalParameters &&
            slotFilling.optionalParameters.length > 0
          ) {
            setSlotFilling({
              ...slotFilling,
              askingOptional: true,
            });
            setMessages((msgs) => [
              ...msgs,
              {
                sender: "agent",
                text: `${slotFilling.optionalParameters[0]} parametresini girmek ister misiniz? (evet/hayır)`,
              },
            ]);
          } else {
            // Hiç opsiyonel yok, API çağrısı yap
            await sendMessage(input, slotFilling, updatedParams);
            setSlotFilling(null);
          }
        } else {
          // Zorunlu parametre slot-filling devam
          setSlotFilling({
            ...slotFilling,
            currentParameter: slotFilling.missingParameters[0],
            missingParameters: slotFilling.missingParameters.slice(1),
          });
          setMessages((msgs) => [
            ...msgs,
            {
              sender: "agent",
              text: `Please provide the following parameter: ${slotFilling.missingParameters[0]}`,
            },
          ]);
        }
      }
    } else {
      // İlk intent mesajı
      setCollectedParams({});
      await sendMessage(input, null, {});
    }
    setInput("");
  };

  // Sohbeti temizle fonksiyonu
  const handleClearChat = (e) => {
    e?.stopPropagation();
    setMessages([
      { sender: "agent", text: "Merhaba! Size nasıl yardımcı olabilirim?" },
    ]);
    setSlotFilling(null);
    setCollectedParams({});
  };

  // Uygulama değiştirme fonksiyonu
  const handleAppChange = (e) => {
    setSelectedApp(e.target.value);
    setMessages([
      {
        sender: "agent",
        text: `${e.target.value} uygulaması seçildi. Size nasıl yardımcı olabilirim?`,
      },
    ]);
    setSlotFilling(null);
    setCollectedParams({});
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
        style={{
          overflow: "hidden",
          background: "#fff",
          borderRadius: 0,
          boxShadow: "none",
          display: "flex",
          flexDirection: "column",
        }}
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
            borderBottom: "1px solid #e0e0e0",
            minHeight: 56,
            height: 56,
            boxSizing: "border-box",
          }}
          id="draggable-dialog-title"
        >
          <span
            style={{ fontWeight: 700, fontSize: 18, letterSpacing: 1, flex: 1 }}
          >
            Sohbet Penceresi
          </span>
          {selectedApp && (
            <Chip
              label={selectedApp}
              size="small"
              sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", mr: 2 }}
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
            display: "flex",
            flexDirection: "column",
            background: "#fff",
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            minHeight: 0,
            height: "calc(100% - 56px)",
            boxSizing: "border-box",
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
              justifyContent: "stretch",
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
              <Card
                elevation={3}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent
                  sx={{ flex: 1, display: "flex", flexDirection: "column" }}
                >
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
                  {/* Chat area with table rendering */}
                  <Paper
                    variant="outlined"
                    sx={{
                      flex: 1,
                      overflowY: "auto",
                      p: 1,
                      background: "#f8fafc",
                      height: 320,
                      minHeight: 100,
                      maxHeight: 500,
                      boxSizing: "border-box",
                      mb: 2,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Render chat messages and tables in order */}
                    <List sx={{ py: 0, maxHeight: "100%", overflowY: "auto" }}>
                      {messages.map((msg, idx) => {
                        // Detect if this is an agent message with array result
                        if (
                          msg.sender === "agent" &&
                          typeof msg.text === "string" &&
                          msg.text.startsWith("İşlem tamamlandı! Sonuç: ")
                        ) {
                          let arr;
                          try {
                            const jsonStr = msg.text.replace(
                              /^İşlem tamamlandı! Sonuç: /,
                              ""
                            );
                            arr = JSON.parse(jsonStr);
                          } catch {
                            arr = null;
                          }
                          if (Array.isArray(arr)) {
                            return <ArrayResultTable key={idx} data={arr} />;
                          }
                        }
                        // Default: render as message bubble
                        return <MessageBubble key={idx} message={msg} index={idx} />;
                      })}
                      <div ref={messagesEndRef} />
                    </List>
                  </Paper>
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
