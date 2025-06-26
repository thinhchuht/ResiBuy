import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography, Stack } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface ConfirmCodeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  code: string;
  setCode: (val: string) => void;
  codeLength?: number;
}

const ConfirmCodeModal: React.FC<ConfirmCodeModalProps> = ({
  open,
  onClose,
  onSubmit,
  isSubmitting = false,
  code,
  setCode,
  codeLength = 6,
}) => {
  const codeArray = Array.from({ length: codeLength }, (_, i) => code[i] || "");
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (open) {
      setTimer(60);
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [open]);

  const isExpired = timer === 0;

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{
      sx: {
        borderRadius: 4,
        p: 2,
        minWidth: 380,
        boxShadow: '0 8px 32px rgba(233,30,99,0.18)',
        background: 'linear-gradient(135deg, #fff 80%, #ffe3ec 100%)',
        textAlign: 'center',
      }
    }}>
      <DialogTitle sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        fontWeight: 700,
        color: '#e91e63',
        fontSize: 22,
        letterSpacing: 1
      }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 48, color: '#FF6B6B', mb: 1 }} />
        Xác nhận thay đổi
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2, color: '#888', fontWeight: 500, fontSize: 15 }}>
          Vui lòng nhập mã xác nhận đã gửi về email của bạn.
        </Typography>
        <Stack direction="row" spacing={1.5} justifyContent="center" mb={2}>
          {codeArray.map((char, idx) => (
            <TextField
              key={idx}
              value={char}
              onChange={e => {
                let val = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                val = String(val);
                if (val.length > 1) val = val.slice(-1);
                const newCode = code.split("");
                newCode[idx] = val;
                setCode(newCode.join("").slice(0, codeLength));
                // focus next
                if (val && idx < codeLength - 1) {
                  const next = document.getElementById(`code-input-${idx + 1}`);
                  if (next) (next as HTMLInputElement).focus();
                }
              }}
              onKeyDown={e => {
                if (e.key === 'Backspace' && !codeArray[idx] && idx > 0) {
                  const prev = document.getElementById(`code-input-${idx - 1}`);
                  if (prev) (prev as HTMLInputElement).focus();
                }
              }}
              inputProps={{
                maxLength: 1,
                style: {
                  width: 48,
                  height: 36,
                  textAlign: 'center',
                  fontSize: 24,
                  fontWeight: 700,
                  borderRadius: 8,
                  background: '#fff',
                  color: '#e91e63',
                  letterSpacing: 2,
                  fontFamily: 'Montserrat, Roboto, Arial',
                  boxShadow: '0 2px 8px rgba(233,30,99,0.08)'
                },
                id: `code-input-${idx}`
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  borderColor: '#e91e63',
                  '&.Mui-focused fieldset': {
                    borderColor: '#FF6B6B',
                  },
                },
                width: 60,
                mx: 0,
                p: 0
              }}
            />
          ))}
        </Stack>
        <Typography sx={{ color: isExpired ? 'red' : '#888', fontWeight: 600, fontSize: 15, mb: 1 }}>
          {isExpired ? 'Mã xác nhận đã hết hạn. Vui lòng gửi lại.' : `Còn lại: 00:${timer.toString().padStart(2, '0')}`}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
        <Button onClick={onClose} color="secondary" sx={{
          borderRadius: 2,
          fontWeight: 600,
          color: '#e91e63',
          border: '1px solid #e91e63',
          background: '#fff',
          px: 3,
          mr: 1,
          '&:hover': {
            background: '#ffe3ec',
            borderColor: '#FF6B6B',
            color: '#FF6B6B',
          }
        }}>Hủy</Button>
        <Button onClick={onSubmit} color="primary" variant="contained" disabled={isSubmitting || code.length !== codeLength || isExpired} sx={{
          borderRadius: 2,
          fontWeight: 700,
          background: 'linear-gradient(90deg, #FF6B6B 0%, #e91e63 100%)',
          px: 4,
          boxShadow: '0 4px 16px rgba(233,30,99,0.12)',
          letterSpacing: 1,
          textTransform: 'none',
          fontSize: 16,
          color: '#fff',
          '&:hover': {
            background: 'linear-gradient(90deg, #e91e63 0%, #FF6B6B 100%)',
            color: '#fff',
          }
        }}>
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmCodeModal; 