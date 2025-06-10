import { Box, Typography, Button } from "@mui/material";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
const Aricle = () => {
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
          BOOST YOUR AUDIO EXPERIENCE
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: "bold", my: 2 }}>
          Next Level Sound for Your Everyday Life.
        </Typography>
        <Typography variant="body1" sx={{ color: "#666", mb: 3 }}>
          Elevate your music, calls, and entertainment with our premium smart audio devices. Engineered with advanced acoustic technology and sleek modern design, each speaker
          delivers crystal-clear sound and powerful bass. Whether at home or on the go, experience immersive audio like never before.
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
            }}>
            SHOP NOW
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

export default Aricle;
