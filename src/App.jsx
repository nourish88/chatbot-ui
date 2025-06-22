import React from "react";
import Chat from "./Chat";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Box,
} from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1a237e" },
    secondary: { main: "#f50057" },
    background: { default: "#f4f6f8" },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 12,
  },
});

function App() {
  const [chatOpen, setChatOpen] = React.useState(true);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={2}
        sx={{
          background: "linear-gradient(90deg, #001a4d 0%, #f5002f 100%)",
          minHeight: 64,
          justifyContent: "center",
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
      <Box sx={{ mt: 8 }} />
      {chatOpen && (
        <Chat
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          onMinimize={() => setChatOpen(false)}
        />
      )}
      {!chatOpen && (
        <Box
          sx={{
            position: "fixed",
            bottom: 32,
            right: 32,
            zIndex: 1300,
          }}
        >
          <button
            style={{
              background: "#1a237e",
              color: "#fff",
              border: "none",
              borderRadius: 24,
              padding: "12px 24px",
              fontWeight: 600,
              fontSize: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              cursor: "pointer",
            }}
            onClick={() => setChatOpen(true)}
          >
            Sohbeti Aç
          </button>
        </Box>
      )}
    </ThemeProvider>
  );
}

export default App;