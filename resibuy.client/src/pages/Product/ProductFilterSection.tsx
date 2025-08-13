import { Box, Typography, Button, Slider, Stack, Paper } from "@mui/material";
import type { Category } from "../../types/models";
import { useEffect, useState, useMemo } from "react";
import categoryApi from "../../api/category.api";
import { debounce } from "lodash";

interface ProductFilterProps {
  selectedCategory: Category | null;
  setSelectedCategory: (category: Category | null) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  storeId?: string;
}

const ProductFilterSection = ({ selectedCategory, setSelectedCategory, priceRange, setPriceRange, storeId }: ProductFilterProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [sliderValue, setSliderValue] = useState(priceRange);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAll(true);
        setCategories(res.data || []);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setSliderValue(priceRange);
  }, [priceRange]);

  const debouncedSetPriceRange = useMemo(
    () => debounce((val: number[]) => setPriceRange(val), 400),
    [setPriceRange]
  );

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    setSliderValue(newValue as number[]);
    debouncedSetPriceRange(newValue as number[]);
  };

  useEffect(() => {
    return () => {
      debouncedSetPriceRange.cancel();
    };
  }, [debouncedSetPriceRange]);

  return (
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
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory?.id === category.id ? "contained" : "text"}
              onClick={() => setSelectedCategory(category)}
              sx={{
                justifyContent: "flex-start",
                color: selectedCategory?.id === category.id ? "#fff" : "#666",
                bgcolor: selectedCategory?.id === category.id ? "#FF6B6B" : "transparent",
                "&:hover": {
                  bgcolor: selectedCategory?.id === category.id ? "#FF6B6B" : "#f5f5f5",
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
          value={sliderValue}
          onChange={handleSliderChange}
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
};

export default ProductFilterSection;
