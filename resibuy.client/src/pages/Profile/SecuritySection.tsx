import { Box, Typography } from "@mui/material";

const SecuritySection = () => {
  return (
    <Box sx={{ p: 6, textAlign: "center", color: "text.secondary" }}>
      <Typography variant="h6" fontWeight={600} mb={2} color="#e91e63">
        Tính năng đang phát triển
      </Typography>
      <Typography variant="body2">Vui lòng chọn "Thông tin cá nhân" để xem và chỉnh sửa hồ sơ.</Typography>
    </Box>
  );
};

export default SecuritySection;
