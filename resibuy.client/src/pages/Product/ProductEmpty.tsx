import { Box, Typography } from "@mui/material";

const ProductEmpty = () => (
  <Box
    sx={{
      textAlign: "center",
      py: 8,
      color: "#666",
    }}>
    <Typography variant="h6">Không tìm thấy sản phẩm phù hợp</Typography>
    <Typography variant="body2" sx={{ mt: 1 }}>
      Vui lòng thử lại với bộ lọc khác
    </Typography>
  </Box>
);

export default ProductEmpty;
