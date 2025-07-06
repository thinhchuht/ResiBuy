import { Box, Typography, TextField, Button } from "@mui/material";
import MessageIcon from "@mui/icons-material/Message";
import { useState } from "react";

interface NoteSectionProps {
  orderId: string;
  onNoteSubmit: (orderId: string, note: string) => void;
}

const MAX_LENGTH = 100;

const NoteSection = ({ orderId, onNoteSubmit }: NoteSectionProps) => {
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    onNoteSubmit(orderId, note);
    setNote("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_LENGTH) {
      setNote(value);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <MessageIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#555" }}>
          Lời nhắn:
        </Typography>
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            multiline
            rows={3}
            value={note}
            onChange={handleChange}
            variant="outlined"
            placeholder="Lưu ý cho Người bán..."
            size="small"
            inputProps={{ maxLength: MAX_LENGTH }}
            fullWidth
          />
          <Typography variant="caption" color="text.secondary" textAlign="right" display="block" mt={0.5}>
            {note.length}/{MAX_LENGTH}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          sx={{
            alignSelf: "flex-end",
            mb: 0.5,
            backgroundColor: "#1976d2",
            "&:hover": {
              backgroundColor: "#1565c0",
            },
          }}>
          Gửi
        </Button>
      </Box>
    </Box>
  );
};

export default NoteSection;
