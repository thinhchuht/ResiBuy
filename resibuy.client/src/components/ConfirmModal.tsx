import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 2,
          boxShadow: 24,
          p: 2,
        },
      }}
    >
      <DialogTitle sx={{ color: "grey.900" }}>{title}</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: "grey.700" }}>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          sx={{
            color: "grey.500",
            "&:hover": { bgcolor: "grey.100" },
          }}
        >
          Hủy
        </Button>
        <Button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          sx={{
            bgcolor: "primary.main",
            color: "white",
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
}