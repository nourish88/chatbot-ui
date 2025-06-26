import { Box } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

const SidebarResizeHandle = ({ onMouseDown }) => (
  <Box
    className="sidebar-resize-handle"
    sx={{
      position: "absolute",
      top: 0,
      right: 0,
      width: 10,
      height: "100%",
      cursor: "ew-resize",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1300,
    }}
    onMouseDown={onMouseDown}
  >
    <DragIndicatorIcon sx={{ color: "#b0b6c3", fontSize: 22 }} />
  </Box>
);

export default SidebarResizeHandle;
