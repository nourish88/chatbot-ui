import { List } from "@mui/material";
import MessageBubble from "./MessageBubble";

const ChatMessageList = ({ messages, messagesEndRef }) => (
  <List sx={{ flex: 1, overflowY: "auto" }}>
    {messages.map((msg, idx) => (
      <MessageBubble key={idx} message={msg} index={idx} />
    ))}
    <div ref={messagesEndRef} />
  </List>
);

export default ChatMessageList;
