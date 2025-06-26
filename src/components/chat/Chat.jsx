import { AIAgentChat } from "./AIAgentChat";
import { AIChatEngine } from "./AIChatEngine";

// Default export - Yapay Zeka Ajanı (eski Chat component'i ile uyumluluk için)
export default function Chat({ open = true, onClose }) {
  return <AIAgentChat open={open} onClose={onClose} />;
}

// GraphChatModal'ı da export et (geriye uyumluluk için)
export const GraphChatModal = AIChatEngine;
