import { Box, Container, Typography, Link, IconButton, Divider } from "@mui/material";
import { Facebook, Twitter, Instagram, LinkedIn, Email, Phone, LocationOn } from "@mui/icons-material";
import Logo from "../../assets/Images/Logo.png"; 

const Footer = () => {

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#282c34", 
        color: "white",
        py: 2, 
        mt: "auto",
        position: "relative",
        bottom: 0,
        width: "100%", 
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 4 }}>
          <Box sx={{ flexBasis: { xs: "100%", md: "30%" } }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <img src={Logo} alt="ResiBuy Logo" style={{ height: "40px", marginRight: "10px" }} />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                ResiBuy
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 3, color: "#bbb" }}>
              Người cộng sự đắc lực của bạn trong việc mua sắm ngay tại chung cư của bạn.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton color="inherit" aria-label="Facebook" sx={{ mr: 1, "&:hover": { color: "#4267B2" } }}>
                <Facebook />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter" sx={{ mr: 1, "&:hover": { color: "#1DA1F2" } }}>
                <Twitter />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram" sx={{ mr: 1, "&:hover": { color: "#E1306C" } }}>
                <Instagram />
              </IconButton>
              <IconButton color="inherit" aria-label="LinkedIn" sx={{ "&:hover": { color: "#0A66C2" } }}>
                <LinkedIn />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ flexBasis: { xs: "100%", md: "20%" } }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
              Liên kết nhanh
            </Typography>
            <Link href="/about" color="inherit" display="block" sx={{ mb: 1, "&:hover": { color: "#007bff" } }}>
              Về chúng tôi
            </Link>
            <Link href="/services" color="inherit" display="block" sx={{ mb: 1, "&:hover": { color: "#007bff" } }}>
              Dịch vụ
            </Link>
            <Link href="/contact" color="inherit" display="block" sx={{ mb: 1, "&:hover": { color: "#007bff" } }}>
              Liên hệ
            </Link>
          </Box>

          <Box sx={{ flexBasis: { xs: "100%", md: "30%" } }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
              Thông tin liên hệ
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <LocationOn sx={{ mr: 1, color: "#007bff" }} />
              <Typography variant="body2">Số 01 Hoàng Hoa Thám, Ba Đình, Hà Nội </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Phone sx={{ mr: 1, color: "#007bff" }} />
              <Typography variant="body2">+1 234 567 890</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Email sx={{ mr: 1, color: "#007bff" }} />
              <Typography variant="body2">resibuydev@gmail.com</Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4, bgcolor: "rgba(255, 255, 255, 0.1)" }} />

        <Typography variant="body2" align="center" sx={{ color: "#bbb" }}>
          © {new Date().getFullYear()} ResiBuy. Tất cả quyền được bảo lưu.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 