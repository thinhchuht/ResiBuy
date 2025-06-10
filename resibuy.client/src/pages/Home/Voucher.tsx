import { Box, Typography, Button } from "@mui/material";
import { useState } from "react";
import { fakeVouchers } from "../../fakeData/fakeVoucherData";
import logo from "../../assets/Images/Logo.png";

const Voucher = () => {
  const [vouchers] = useState(fakeVouchers.slice(0, 3));

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        justifyContent: "center",
        padding: 5,
        margin: 2,
        backgroundColor: "white",
        width: "80%",
        mx: "auto",
        borderRadius: "24px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
      }}
    >
      {vouchers.map((voucher, index) => (
        <Box
          key={index}
          sx={{
            width: "450px",
            height: "150px",
            borderRadius: "24px",
            border: "1px solid red",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 6px 24px rgba(0, 0, 0, 0.08)",
            },
            overflow: "hidden",
          }}
        >
          <Box sx={{ display: "flex", height: "100%" }}>
            <Box
              sx={{
                width: "25%",
                backgroundColor: "#ff4d2d",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: 2,
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="ResiBuy Logo"
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  backgroundColor: "white",
                  p: 1,
                }}
              />
            </Box>

            <Box
              sx={{
                width: "55%",
                display: "flex",
                flexDirection: "column",
                padding: "10px 16px",
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    backgroundColor: "#ff4d2d",
                    color: "white",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    display: "inline-block",
                  }}
                >
                  ⚡ Số lượng có hạn
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ color: "black", fontWeight: "bold", mb: 0.5 }}
                >
                  Giảm {voucher.discountAmount}
                  {voucher.type === "Discount" ? "đ" : "%"} tối đa{" "}
                  {voucher.maxDiscountPrice}đ 
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: "text.secondary" }}
                >
                  Đơn tối thiểu {voucher.minOrderPrice}đ
                </Typography>
              </Box>
            </Box>

            {/* Button Section */}
            <Box
              sx={{
                width: "20%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 8px",
              }}
            >
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#ff4d2d",
                  "&:hover": {
                    backgroundColor: "#e04225",
                  },
                  color: "white",
                  fontWeight: "bold",
                  width: "70px",
                  height: "30px",
                }}
              >
                Lưu
              </Button>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default Voucher;
