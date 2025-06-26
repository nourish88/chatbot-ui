import React from "react";
import { ListItem, Stack, Avatar, Paper, Typography, Box } from "@mui/material";
import ArrayResultTable from "./ArrayResultTable";

const MessageBubble = React.memo(({ message, index }) => {
  const isUser = message.sender === "user";

  // Table detection for agent messages
  if (
    message.sender === "agent" &&
    (Array.isArray(message.result) ||
      (typeof message.text === "string" &&
        message.text.startsWith("İşlem tamamlandı! Sonuç: [")))
  ) {
    let arr = message.result;
    if (!arr && typeof message.text === "string") {
      try {
        const match = message.text.match(/İşlem tamamlandı! Sonuç: (\[.*\])$/);
        if (match) arr = JSON.parse(match[1]);
      } catch {
        /* hata yutuluyor */
      }
    }
    if (Array.isArray(arr) && arr.length > 0) {
      return (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-start",
            mb: 1,
          }}
        >
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "flex-start",
            }}
          >
            <Avatar
              sx={{
                bgcolor: "secondary.main",
                width: 32,
                height: 32,
                mt: 0.5,
                mr: 2,
                flexShrink: 0,
              }}
            >
              A
            </Avatar>
            <ArrayResultTable data={arr} />
          </Box>
        </Box>
      );
    }
  }

  // Fix: If message.text is an array, join as string; if object, stringify
  let displayText = message.text;
  if (Array.isArray(displayText)) {
    displayText = displayText
      .map((item) =>
        typeof item === "object" ? JSON.stringify(item) : String(item)
      )
      .join(", ");
  } else if (typeof displayText === "object" && displayText !== null) {
    displayText = JSON.stringify(displayText, null, 2);
  }

  return (
    <ListItem
      key={index}
      alignItems={isUser ? "flex-end" : "flex-start"}
      disableGutters
      sx={{ mb: 1 }}
    >
      <Stack
        direction={isUser ? "row-reverse" : "row"}
        alignItems="flex-start"
        spacing={2}
        sx={{ width: "100%" }}
      >
        <Avatar
          sx={{
            bgcolor: isUser ? "primary.main" : "secondary.main",
            width: 32,
            height: 32,
            flexShrink: 0,
          }}
        >
          {isUser ? "S" : "A"}
        </Avatar>
        <Paper
          elevation={1}
          sx={{
            p: 1.5,
            maxWidth: "75%",
            bgcolor: isUser ? "primary.light" : "grey.100",
            color: isUser ? "white" : "text.primary",
            borderRadius: 2,
          }}
        >
          <Typography variant="body2">{displayText}</Typography>
        </Paper>
      </Stack>
    </ListItem>
  );
});

export default MessageBubble;
