import { Box, CircularProgress, Typography } from "@mui/material";

const LoadingIndicator = ({ size = 32, message }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      py: 2,
    }}
  >
    <CircularProgress size={size} />
    {message && (
      <Typography variant="body2" sx={{ mt: 1 }}>
        {message}
      </Typography>
    )}
  </Box>
);

export default LoadingIndicator;
