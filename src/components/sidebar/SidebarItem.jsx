import { NavLink } from "react-router-dom";
import { Box } from "@mui/material";

const SidebarItem = ({ to, icon, children, end }) => (
  <li>
    <NavLink
      to={to}
      className={({ isActive }) => "sidebar-item" + (isActive ? " active" : "")}
      end={end}
    >
      {icon}
      <Box component="span" sx={{ ml: 1, verticalAlign: "middle" }}>
        {children}
      </Box>
    </NavLink>
  </li>
);

export default SidebarItem;
