import { Box, TextField, Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";

const ChatInput = ({
  value,
  onChange,
  onSubmit,
  onKeyDown,
  loading,
  disabled,
  placeholder,
}) => (
  <Box component="form" onSubmit={onSubmit} sx={{ display: "flex", gap: 2 }}>
    <TextField
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder || "Mesajınızı yazın..."}
      fullWidth
      size="small"
      variant="outlined"
      disabled={disabled || loading}
      multiline
      maxRows={3}
    />
    <Button
      type="submit"
      variant="contained"
      color="primary"
      endIcon={<SendIcon />}
      disabled={!value.trim() || disabled || loading}
      sx={{ minWidth: 120 }}
    >
      Gönder
    </Button>
  </Box>
);

export default ChatInput;
