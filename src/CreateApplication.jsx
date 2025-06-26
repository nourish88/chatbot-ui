import React, { useState } from "react";
import { TextField, Button, Paper, Typography, Alert } from "@mui/material";

const CreateApplication = ({ onSuccess }) => {
  const [appName, setAppName] = useState("");
  const [appDescription, setAppDescription] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreateApp = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const res = await fetch("http://localhost:8000/apps/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: appName, description: appDescription }),
      });
      if (!res.ok) throw new Error("Failed to create application");
      setSuccessMsg("Application created successfully!");
      setAppName("");
      setAppDescription("");
      if (onSuccess) onSuccess();
    } catch {
      setErrorMsg("Failed to create application.");
    }
  };

  return (
    <Paper sx={{ maxWidth: 480, mx: "auto", p: 4 }} elevation={3}>
      <Typography variant="h5" gutterBottom>
        Create Application
      </Typography>
      {successMsg && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMsg}
        </Alert>
      )}
      {errorMsg && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Alert>
      )}
      <form onSubmit={handleCreateApp}>
        <TextField
          label="Name"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          required
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Description"
          value={appDescription}
          onChange={(e) => setAppDescription(e.target.value)}
          fullWidth
          multiline
          minRows={2}
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Create
        </Button>
      </form>
    </Paper>
  );
};

export default CreateApplication;
