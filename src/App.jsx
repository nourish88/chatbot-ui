import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import ListApplications from "./ListApplications";
import Chat, { GraphChatModal } from "./Chat";
import DocumentsPage from "./DocumentsPage";
import SohbetlerPage from "./SohbetlerPage";
import FeedbacksPage from "./FeedbacksPage";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import ListAgentApplications from "./ListAgentApplications";

function App() {
  const [chatOpen, setChatOpen] = React.useState(false); // default: false
  const [minimized, setMinimized] = React.useState(false);
  const [graphChatOpen, setGraphChatOpen] = React.useState(false);

  const handleMinimize = () => {
    setMinimized(true);
    setChatOpen(false);
  };

  return (
    <BrowserRouter>
      <div style={{ display: "flex", height: "100vh" }}>
        <Sidebar />
        <Box
          sx={{
            flex: 1,
            minHeight: "100vh",
            background: "#f4f6f8",
            marginLeft: "220px",
            width: "calc(100% - 220px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <AppBar
            position="fixed"
            elevation={2}
            sx={{
              background: "linear-gradient(90deg, #001a4d 0%, #f5002f 100%)",
              minHeight: 64,
              justifyContent: "center",
              left: 220,
              width: "calc(100% - 220px)",
            }}
          >
            <Toolbar
              sx={{
                minHeight: 64,
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 0,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  background: "#001a4d",
                  borderRadius: 2,
                  height: 48,
                  px: 1.5,
                  boxShadow: "0 2px 8px #001a4d33",
                }}
              >
                <img
                  src="/jandarma-logo.png"
                  alt="Jandarma Logo"
                  style={{
                    height: 40,
                    width: 40,
                    display: "block",
                    background: "#001a4d",
                    borderRadius: 8,
                    padding: 0,
                  }}
                />
              </Box>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: "#fff",
                  textShadow: "0 2px 8px #001a4d33",
                  ml: 2,
                }}
              >
                Jandarma Genel Komutanlığı Akıllı Yapay Zeka Ajanı{" "}
                <span style={{ color: "#f5002f", fontWeight: 900 }}>ALİM</span>
              </Typography>
            </Toolbar>
          </AppBar>
          <Box sx={{ mt: 8, p: 3 }}>
            <Routes>
              <Route path="/" element={<Navigate to="/apps" replace />} />
              <Route path="/apps" element={<ListApplications />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/chat" element={<SohbetlerPage />} />
              <Route path="/feedbacks" element={<FeedbacksPage />} />
              <Route path="/ai-apps" element={<ListAgentApplications />} />
            </Routes>
          </Box>
          {chatOpen && !minimized && (
            <Chat
              open={chatOpen}
              onClose={() => setChatOpen(false)}
              onMinimize={handleMinimize}
            />
          )}
          {graphChatOpen && (
            <GraphChatModal open={graphChatOpen} onClose={() => setGraphChatOpen(false)} />
          )}
          {/* Floating Action Buttons */}
          {(!chatOpen || minimized) && (
            <Box
              sx={{
                position: "fixed",
                bottom: 32,
                right: 32,
                zIndex: 1300,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
              }}
            >
              <Box
                sx={{
                  bgcolor: "#fff",
                  borderRadius: 4,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  display: "flex",
                  alignItems: "center",
                  px: 2,
                  py: 1,
                  cursor: "pointer",
                  minWidth: 160,
                  border: "1px solid #e0e0e0",
                }}
                onClick={() => {
                  setChatOpen(true);
                  setMinimized(false);
                }}
              >
                <ChatBubbleOutlineIcon sx={{ color: "#1a237e", mr: 1 }} />
                <Typography sx={{ color: "#1a237e", fontWeight: 600 }}>
                  Yapay Zeka Ajanını Harekete Geçir
                </Typography>
              </Box>
              <Box
                sx={{
                  bgcolor: "#fff",
                  borderRadius: 4,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  display: "flex",
                  alignItems: "center",
                  px: 2,
                  py: 1,
                  cursor: "pointer",
                  minWidth: 180,
                  border: "1px solid #e0e0e0",
                }}
                onClick={() => {
                  setGraphChatOpen(true);
                }}
              >
                <SettingsSuggestIcon sx={{ color: "#f5002f", mr: 1 }} />
                <Typography sx={{ color: "#f5002f", fontWeight: 600 }}>
                  Yapay Zeka Sohbet Motorunu Aç
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </div>
    </BrowserRouter>
  );
}

export default App;
