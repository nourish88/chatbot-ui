import { Box, Typography, Button } from "@mui/material";

const YesNoPrompt = ({ prompt, onAnswer }) => {
  const handleYes = () => {
    onAnswer("evet");
  };
  const handleNo = () => {
    onAnswer("hayır");
  };
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, my: 2 }}>
      <Typography>{prompt}</Typography>
      <Button variant="contained" color="primary" onClick={handleYes}>
        Evet
      </Button>
      <Button variant="outlined" color="secondary" onClick={handleNo}>
        Hayır
      </Button>
    </Box>
  );
};

export default YesNoPrompt;
