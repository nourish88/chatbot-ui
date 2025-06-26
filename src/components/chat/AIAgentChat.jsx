import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import YesNoPrompt from "./YesNoPrompt";
import useAgentChat from "../../hooks/useAgentChat";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";

export function AIAgentChat({ open, onClose }) {
  const {
    apps,
    selectedApp,
    handleAppChange,
    messages,
    input,
    setInput,
    slotFilling,
    loading,
    messagesEndRef,
    handleOptionalYesNo,
    handleOptionalValue,
    handleSubmit,
    handleClearChat,
  } = useAgentChat(open);

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
          background: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          height: "60vh",
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
          <ChatMessageList
            messages={messages}
            messagesEndRef={messagesEndRef}
          />
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
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onSubmit={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            loading={loading}
            disabled={!selectedApp}
            placeholder={
              slotFilling && slotFilling.state === "required_param"
                ? `Lütfen ${slotFilling.currentParameter} değerini girin...`
                : "Mesajınızı yazın..."
            }
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
