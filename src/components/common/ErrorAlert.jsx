import { Alert } from "@mui/material";

const ErrorAlert = ({ message, severity = "error" }) => (
  <Alert severity={severity} sx={{ mb: 2 }}>
    {message}
  </Alert>
);

export default ErrorAlert;
