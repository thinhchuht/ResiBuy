import { Box, Typography, Button, Slider, Stack, Paper } from "@mui/material";
import type { Category } from "../../types/models";

interface ProductFilterProps {
  selectedCategory: string | null;
  setSelectedCategory: (id: string | null) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  fakeCategories: Category[];
  storeId?: string;
}

const ProductFilterSection = ({ selectedCategory, setSelectedCategory, priceRange, setPriceRange, fakeCategories, storeId }: ProductFilterProps) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 4,
      border: "1px solid #eee",
      position: "sticky",
      top: 150,
    }}>
    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: "#2c3e50" }}>
      Bộ lọc sản phẩm
    </Typography>
    {storeId && (
      <Typography variant="body2" sx={{ color: "red", fontWeight: 500, mb: 3 }}>
        Sản phẩm áp dụng được voucher
      </Typography>
    )}
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, color: "#666" }}>
        Danh mục
      </Typography>
      <Stack spacing={1}>
        <Button
          variant={selectedCategory === null ? "contained" : "text"}
          onClick={() => setSelectedCategory(null)}
          sx={{
            justifyContent: "flex-start",
            color: selectedCategory === null ? "#fff" : "#666",
            bgcolor: selectedCategory === null ? "#FF6B6B" : "transparent",
            "&:hover": {
              bgcolor: selectedCategory === null ? "#FF6B6B" : "#f5f5f5",
            },
          }}>
          Tất cả
        </Button>
        {fakeCategories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "contained" : "text"}
            onClick={() => setSelectedCategory(category.id)}
            sx={{
              justifyContent: "flex-start",
              color: selectedCategory === category.id ? "#fff" : "#666",
              bgcolor: selectedCategory === category.id ? "#FF6B6B" : "transparent",
              "&:hover": {
                bgcolor: selectedCategory === category.id ? "#FF6B6B" : "#f5f5f5",
              },
            }}>
            {category.name}
          </Button>
        ))}
      </Stack>
    </Box>
    <Box sx={{ mb: 4 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, color: "#666" }}>
        Khoảng giá
      </Typography>
      <Slider
        value={priceRange}
        onChange={(_, newValue) => setPriceRange(newValue as number[])}
        valueLabelDisplay="auto"
        min={0}
        max={50000000}
        valueLabelFormat={(value) => `${value.toLocaleString()}đ`}
        sx={{
          color: "#FF6B6B",
          "& .MuiSlider-thumb": {
            "&:hover, &.Mui-focusVisible": {
              boxShadow: "0 0 0 8px rgba(255, 107, 107, 0.16)",
            },
          },
        }}
      />
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {priceRange[0].toLocaleString()}đ
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {priceRange[1].toLocaleString()}đ
        </Typography>
      </Box>
    </Box>
  </Paper>
);

export default ProductFilterSection;
