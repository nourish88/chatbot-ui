import React, { useState, useRef } from "react";
import "./Sidebar.css";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import DescriptionIcon from "@mui/icons-material/Description";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SettingsSuggestIcon from "@mui/icons-material/SettingsSuggest";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import SidebarSection from "./SidebarSection";
import SidebarItem from "./SidebarItem";
import SidebarResizeHandle from "./SidebarResizeHandle";

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
      <SidebarSection
        title="Sohbet Motoru İşlemleri"
        icon={<SettingsSuggestIcon sx={{ fontSize: 22, color: "#1a237e" }} />}
      >
        <ul className="sidebar-list">
          <SidebarItem
            to="/apps"
            icon={
              <MenuBookIcon
                sx={{ fontSize: 18, mr: 1, verticalAlign: "middle" }}
              />
            }
            end
          >
            Uygulamalar
          </SidebarItem>
          <SidebarItem
            to="/documents"
            icon={
              <DescriptionIcon
                sx={{ fontSize: 18, mr: 1, verticalAlign: "middle" }}
              />
            }
            end
          >
            Belgeler
          </SidebarItem>
          <SidebarItem
            to="/feedbacks"
            icon={
              <AssignmentTurnedInIcon
                sx={{ fontSize: 18, mr: 1, verticalAlign: "middle" }}
              />
            }
            end
          >
            Geri Bildirimler
          </SidebarItem>
          <SidebarItem
            to="/chat"
            icon={
              <ChatBubbleOutlineIcon
                sx={{ fontSize: 18, mr: 1, verticalAlign: "middle" }}
              />
            }
            end
          >
            Sohbetler
          </SidebarItem>
        </ul>
      </SidebarSection>
      <SidebarSection
        title="Yapay Zeka Asistanı İşlemleri"
        icon={<SettingsSuggestIcon sx={{ fontSize: 22, color: "#1a237e" }} />}
      >
        <ul className="sidebar-list">
          <SidebarItem
            to="/ai-apps"
            icon={
              <MenuBookIcon
                sx={{ fontSize: 18, mr: 1, verticalAlign: "middle" }}
              />
            }
            end
          >
            Uygulamalar
          </SidebarItem>
        </ul>
      </SidebarSection>
      <SidebarResizeHandle onMouseDown={handleMouseDown} />
    </div>
  );
};

export default Sidebar;
