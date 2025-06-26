import React from "react";
import { Box, Typography } from "@mui/material";

const SidebarSection = ({ title, icon, children }) => (
  <Box className="sidebar-section">
    <Box
      className="sidebar-title"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        fontSize: 16,
        color: "#1a237e",
        fontWeight: 700,
        mb: 1,
      }}
    >
      {icon}
      <Typography
        component="span"
        sx={{ fontSize: 16, fontWeight: 700, color: "#1a237e" }}
      >
        {title}
      </Typography>
    </Box>
    {children}
  </Box>
);

export default SidebarSection;
