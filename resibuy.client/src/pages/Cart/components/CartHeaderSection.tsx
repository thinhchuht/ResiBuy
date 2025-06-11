import { Box, Typography } from "@mui/material";

const CartHeader = () => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "auto 3fr 1fr 1fr 1fr",
        pb: 1,
        borderBottom: "1px solid #eee",
        mb: 2,
        fontWeight: "bold",
      }}
    >
      <Box sx={{ width: 40 }}></Box>
      <Typography variant="subtitle1" fontWeight="bold">
        SẢN PHẨM
      </Typography>
      <Typography variant="subtitle1" fontWeight="bold">
        SỐ LƯỢNG
      </Typography>
      <Typography variant="subtitle1" fontWeight="bold">
        CÂN NẶNG
      </Typography>
      <Typography variant="subtitle1" fontWeight="bold" textAlign="right">
        TỔNG CỘNG
      </Typography>
    </Box>
  );
};

export default CartHeader; 