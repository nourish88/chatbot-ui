import React, { useState, useRef } from "react";
import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import DescriptionIcon from "@mui/icons-material/Description";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';

const MIN_WIDTH = 180;
const MAX_WIDTH = 340;
const DEFAULT_WIDTH = 220;

const Sidebar = () => {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const dragging = useRef(false);

  const handleMouseDown = () => {
    dragging.current = true;
    document.body.style.cursor = "ew-resize";
  };

  const handleMouseMove = (e) => {
    if (!dragging.current) return;
    const newWidth = Math.min(Math.max(e.clientX, MIN_WIDTH), MAX_WIDTH);
    setWidth(newWidth);
  };

  const handleMouseUp = () => {
    dragging.current = false;
    document.body.style.cursor = "";
  };

  React.useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  });

  return (
    <div
      className="sidebar stylish-sidebar"
      style={{ width, minWidth: MIN_WIDTH, maxWidth: MAX_WIDTH }}
    >
      <div
        className="sidebar-logo"
        style={{ padding: 24, textAlign: "center" }}
      >
        <img
          src="/jandarma-logo.png"
          alt="Logo"
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            boxShadow: "0 2px 8px #001a4d33",
          }}
        />
      </div>
      {/* Sohbet Motoru İşlemleri ana başlık - ÜSTTE */}
      <div className="sidebar-section">
        <div
          className="sidebar-title"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 16,
            color: "#1a237e",
            fontWeight: 700,
          }}
        >
          <SettingsSuggestIcon sx={{ fontSize: 22, color: "#1a237e" }} />
          Sohbet Motoru İşlemleri
        </div>
        <ul className="sidebar-list">
          <li>
            <NavLink
              to="/apps"
              className={({ isActive }) =>
                "sidebar-item" + (isActive ? " active" : "")
              }
              end
            >
              <MenuBookIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
              Uygulamalar
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/documents"
              className={({ isActive }) =>
                "sidebar-item" + (isActive ? " active" : "")
              }
              end
            >
              <DescriptionIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
              Belgeler
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/feedbacks"
              className={({ isActive }) =>
                "sidebar-item" + (isActive ? " active" : "")
              }
              end
            >
              <AssignmentTurnedInIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
              Geri Bildirimler
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/chat"
              className={({ isActive }) =>
                "sidebar-item" + (isActive ? " active" : "")
              }
              end
            >
              <ChatBubbleOutlineIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
              Sohbetler
            </NavLink>
          </li>
        </ul>
      </div>
      {/* Yapay Zeka Asistanı İşlemleri ana başlık - ALTA */}
      <div className="sidebar-section">
        <div
          className="sidebar-title"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 16,
            color: "#1a237e",
            fontWeight: 700,
          }}
        >
          <SettingsSuggestIcon sx={{ fontSize: 22, color: "#1a237e" }} />
          Yapay Zeka Asistanı İşlemleri
        </div>
        <ul className="sidebar-list">
          <li>
            <NavLink
              to="/ai-apps"
              className={({ isActive }) =>
                "sidebar-item" + (isActive ? " active" : "")
              }
              end
            >
              <MenuBookIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
              Uygulamalar
            </NavLink>
          </li>
        </ul>
      </div>
      <div
        className="sidebar-resize-handle"
        style={{
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
        onMouseDown={handleMouseDown}
      >
        <DragIndicatorIcon sx={{ color: "#b0b6c3", fontSize: 22 }} />
      </div>
    </div>
  );
};

export default Sidebar;
