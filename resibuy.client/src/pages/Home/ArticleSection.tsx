import { Box, Typography, Button } from "@mui/material";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { useNavigate } from "react-router-dom";
const AricleSection = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 5,
        margin: 2,
        width: "80%",
        mx: "auto",
        borderRadius: "16px",
      }}>
      <Box sx={{ display: "flex", gap: 2, marginRight: 5 }}>
        <Box
          sx={{
            width: 250,
            height: 350,
            backgroundColor: "#e0e0e0",
            borderRadius: "12px",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundImage: `url('https://neonix-demo.myshopify.com/cdn/shop/files/close-up-food-complements-with-orange_zcopy_copy_26341c3a-2795-44a5-a5a6-872d7ee5e6c1.jpg?v=1745291448&width=1100')`, // Placeholder image
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}></Box>
        <Box
          sx={{
            width: 250,
            height: 350,
            backgroundColor: "#e0e0e0",
            borderRadius: "12px",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundImage: `url('https://neonix-demo.myshopify.com/cdn/shop/files/close-up-food-complements-with-orange_zcopy.jpg?v=1745291465&width=1100')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}></Box>
      </Box>

      <Box sx={{ maxWidth: "40%" }}>
        <Typography variant="overline" sx={{ color: "#007bff", fontWeight: "bold", letterSpacing: "1px" }}>
          NÂNG TẦM TRẢI NGHIỆM ÂM THANH
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: "bold", my: 2 }}>
          Âm thanh đỉnh cao cho cuộc sống hằng ngày.
        </Typography>
        <Typography variant="body1" sx={{ color: "#666", mb: 3 }}>
          Nâng tầm âm nhạc, cuộc gọi và giải trí của bạn với các thiết bị âm thanh thông minh cao cấp. Ứng dụng công nghệ âm học tiên tiến cùng thiết kế hiện đại, mỗi chiếc loa
          đều mang đến âm thanh trong trẻo và bass mạnh mẽ. Dù ở nhà hay di chuyển, hãy tận hưởng trải nghiệm âm thanh sống động chưa từng có.
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#007bff",
              "&:hover": { backgroundColor: "#0056b3" },
              borderRadius: "25px", // Pill-shaped button
              padding: "10px 25px",
              fontWeight: "bold",
            }}
            onClick={() => {
              const storeId = "44444444-4444-4444-4444-444444444444";
              navigate(`/products?storeId=${storeId}`);
            }}>
            MUA NGAY
          </Button>
          <Button
            sx={{
              borderRadius: "50%",
              minWidth: "unset",
              width: "50px",
              height: "50px",
              color: "#333",
              border: "1px solid #ccc",
              "&:hover": { backgroundColor: "#e0e0e0" },
            }}>
            <PlayCircleOutlineIcon sx={{ fontSize: 30 }} />
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default AricleSection;
