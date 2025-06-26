import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";

const FormDialog = ({
  open,
  onClose,
  title,
  loading,
  error,
  onSubmit,
  children,
  actions,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ textAlign: "center" }}>{title}</DialogTitle>
    <form onSubmit={onSubmit} encType="multipart/form-data">
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {children}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center" }}>
        {actions ? (
          actions
        ) : (
          <>
            <Button onClick={onClose} disabled={loading}>
              İptal
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : "Kaydet"}
            </Button>
          </>
        )}
      </DialogActions>
    </form>
  </Dialog>
);

export default FormDialog;
