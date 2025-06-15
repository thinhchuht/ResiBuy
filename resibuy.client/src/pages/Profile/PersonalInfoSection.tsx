import { Avatar, Box, Button, TextField, Typography } from "@mui/material";
import { Person } from "@mui/icons-material";
import type { User } from "../../types/models";

interface PersonalInfoSectionProps {
  user: User | null;
  email: string;
  setEmail: (email: string) => void;
  dateOfBirth: string;
  setDateOfBirth: (date: string) => void;
  avatar: string | null;
  handleAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAdmin: boolean;
  formatDate: (dateStr: string | undefined) => string;
  maskMiddle: (str: string | undefined) => string;
}

const PersonalInfoSection = ({ user, email, setEmail, dateOfBirth, setDateOfBirth, avatar, handleAvatarChange, isAdmin, formatDate, maskMiddle }: PersonalInfoSectionProps) => {
  return (
    <Box sx={{ display: { xs: "block", md: "flex" }, gap: 4 }}>
      {/* Left: Form */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box component="form" noValidate autoComplete="off">
          <Box mb={3}>
            <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
              ID
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {user?.id || "-"}
            </Typography>
          </Box>
          <Box mb={3}>
            <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
              Họ và tên
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {user?.fullName || "-"}
            </Typography>
          </Box>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isAdmin}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover fieldset": {
                  borderColor: "#e91e63",
                },
              },
            }}
          />
          <Box mb={3}>
            <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
              Số điện thoại
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {maskMiddle(user?.phoneNumber) || "-"}
            </Typography>
          </Box>
          <Box mb={3}>
            <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
              CCCD/CMND
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {maskMiddle(user?.identityNumber) || "-"}
            </Typography>
          </Box>
          <TextField
            label="Ngày sinh"
            type="date"
            variant="outlined"
            fullWidth
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            disabled={isAdmin}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover fieldset": {
                  borderColor: "#e91e63",
                },
              },
            }}
            InputLabelProps={{ shrink: true }}
          />
          <Box mb={3}>
            <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
              Ngày tạo tài khoản
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formatDate(user?.createdAt)}
            </Typography>
          </Box>
          <Box mb={3}>
            <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
              Ngày cập nhật
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formatDate(user?.updatedAt)}
            </Typography>
          </Box>
          <Button
            variant="contained"
            disabled={isAdmin}
            sx={{
              mt: 2,
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
        </Box>
      </Box>
      {/* Right: Avatar upload */}
      <Box
        sx={{
          minWidth: 180,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          mt: { xs: 4, md: 0 },
        }}>
        <Avatar
          src={avatar || undefined}
          sx={{
            width: 140,
            height: 140,
            mb: 2,
            bgcolor: "#fce4ec",
            color: "#e91e63",
            fontSize: 64,
            border: "4px solid #fce4ec",
            boxShadow: "0 4px 12px rgba(233, 30, 99, 0.2)",
          }}>
          {!avatar && <Person fontSize="inherit" />}
        </Avatar>
        <Button
          variant="outlined"
          component="label"
          disabled={isAdmin}
          sx={{
            mb: 1,
            borderRadius: 2,
            borderColor: "#e91e63",
            color: "#e91e63",
            "&:hover": {
              borderColor: "#c2185b",
              backgroundColor: "rgba(233, 30, 99, 0.04)",
            },
          }}>
          Chọn Ảnh
          <input hidden accept="image/jpeg,image/png" type="file" onChange={handleAvatarChange} />
        </Button>
        <Typography variant="caption" color="text.secondary" align="center">
          Dung lượng file tối đa 1 MB
          <br />
          Định dạng: JPEG, .PNG
        </Typography>
      </Box>
    </Box>
  );
};

export default PersonalInfoSection;
