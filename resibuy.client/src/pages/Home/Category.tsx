import { Box, Typography } from "@mui/material";
import { useState } from "react";
import { fakeCategories } from "../../fakeData/fakeCategoryData";
import CircularGallery from "../../animations/CircularGallery";
import CategoryIcon from "../../assets/icons/Category";

const Category = () => {
  const [categories] = useState(fakeCategories);

  return (
    <Box
      sx={{
        alignContent: "center",
        padding: 5,
        margin: 2,
        backgroundColor: "white",
        width: "80%",
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        borderRadius: "24px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 6px 24px rgba(0, 0, 0, 0.08)",
        },
      }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 600,
          marginBottom: "40px",
          color: "#2c3e50",
          letterSpacing: "0.5px",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}>
        <CategoryIcon width={24} height={24} />
        DANH MỤC
      </Typography>
      <CircularGallery bend={2} textColor="#ff6b6b" borderRadius={0.08} items={categories} />
    </Box>
  );
};

export default Category;
