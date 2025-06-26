import { Box, Paper } from "@mui/material";

const ArrayResultTable = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) return null;
  const columns = Object.keys(data[0]);
  return (
    <Box
      sx={{
        width: "100%",
        px: { xs: 1, sm: 2 },
        mb: 2,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Paper
        elevation={2}
        sx={{
          width: "100%",
          maxWidth: "100%",
          overflowX: "auto",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          border: "1px solid #e0e0e0",
        }}
      >
        <Box
          component="table"
          sx={{
            width: "100%",
            borderCollapse: "collapse",
            background: "#fff",
          }}
        >
          <Box component="thead" sx={{ background: "#f1f5fa" }}>
            <Box component="tr">
              {columns.map((col) => (
                <Box
                  component="th"
                  key={col}
                  sx={{
                    px: 2,
                    py: 1.5,
                    fontWeight: 700,
                    fontSize: "1rem",
                    color: "#001a4d",
                    borderBottom: "1.5px solid #e0e0e0",
                    textAlign: "left",
                  }}
                >
                  {col}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {data.map((row, i) => (
              <Box
                component="tr"
                key={i}
                sx={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}
              >
                {columns.map((col) => (
                  <Box
                    component="td"
                    key={col}
                    sx={{
                      px: 2,
                      py: 1.2,
                      borderBottom: "1px solid #f0f0f0",
                      fontSize: "0.98rem",
                      color: "#222",
                      maxWidth: 320,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {String(row[col])}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ArrayResultTable;
