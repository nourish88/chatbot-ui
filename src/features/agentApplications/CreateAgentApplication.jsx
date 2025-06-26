import React, { useState } from "react";
import { TextField, Button, Box, Alert } from "@mui/material";

const CreateAgentApplication = ({ onSuccess }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [swaggerFile, setSwaggerFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("base_url", baseUrl);
    if (swaggerFile) formData.append("swagger_file", swaggerFile);
    try {
      const res = await fetch("http://localhost:8000/agent_apps/register/", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Kayıt başarısız oldu");
      setName("");
      setDescription("");
      setBaseUrl("");
      setSwaggerFile(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError("Kayıt başarısız oldu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1, minWidth: 280 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Ad"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Açıklama"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
        />
        <TextField
          label="Base URL"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          required
          fullWidth
        />
        <Button
          variant="outlined"
          component="label"
          fullWidth
        >
          Swagger Dosyası Seç (PDF)
          <input
            type="file"
            accept="application/pdf"
            hidden
            onChange={(e) => setSwaggerFile(e.target.files[0])}
          />
        </Button>
        {swaggerFile && <span style={{ fontSize: 13 }}>{swaggerFile.name}</span>}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </Box>
    </form>
  );
};

export default CreateAgentApplication;
