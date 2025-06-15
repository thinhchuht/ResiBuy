import { Box, Button, Divider, TextField, Typography } from "@mui/material";
import type { User } from "../../types/models";

interface PasswordChangeSectionProps {
  user: User | null;
  oldPassword: string;
  setOldPassword: (password: string) => void;
  newPassword: string;
  setNewPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  isAdmin: boolean;
  maskMiddle: (str: string | undefined) => string;
}

const PasswordChangeSection = ({
  user,
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  isAdmin,
  maskMiddle,
}: PasswordChangeSectionProps) => {
  return (
    <Box maxWidth={400} mx="auto">
      <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
        Tên đăng nhập
      </Typography>
      <Typography variant="body1" fontWeight={500} mb={2}>
        {user?.id || "-"}
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
        Số điện thoại
      </Typography>
      <Typography variant="body1" fontWeight={500} mb={2}>
        {maskMiddle(user?.phoneNumber) || "-"}
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
        Email
      </Typography>
      <Typography variant="body1" fontWeight={500} mb={2}>
        {maskMiddle(user?.email) || "-"}
      </Typography>
      <Divider sx={{ my: 2 }} />
      {!user?.email ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h6" color="error" gutterBottom>
            Vui lòng đăng ký email để đổi mật khẩu
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant="h6" mb={2} fontWeight={600} color="#e91e63">
            Đổi mật khẩu
          </Typography>
          <TextField
            label="Mật khẩu cũ"
            type="password"
            fullWidth
            disabled={isAdmin}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover fieldset": {
                  borderColor: "#e91e63",
                },
              },
            }}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <TextField
            label="Mật khẩu mới"
            type="password"
            fullWidth
            disabled={isAdmin}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover fieldset": {
                  borderColor: "#e91e63",
                },
              },
            }}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            label="Xác nhận mật khẩu mới"
            type="password"
            fullWidth
            disabled={isAdmin}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover fieldset": {
                  borderColor: "#e91e63",
                },
              },
            }}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            variant="contained"
            disabled={isAdmin}
            sx={{
              mt: 1,
              px: 5,
              py: 1.5,
              fontWeight: 600,
              borderRadius: 2,
              backgroundColor: "#FF6B6B",
              boxShadow: "0 3px 12px rgba(233, 30, 99, 0.3)",
              "&:hover": {
                backgroundColor: "#FF5C5C",
                boxShadow: "0 6px 20px rgba(233, 30, 99, 0.4)",
              },
            }}>
            Lưu
          </Button>
        </>
      )}
    </Box>
  );
};

export default PasswordChangeSection;
