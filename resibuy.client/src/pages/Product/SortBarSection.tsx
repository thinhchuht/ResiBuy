import { Box, Typography, TextField, MenuItem } from "@mui/material";
import type { Category } from "../../types/models";
import { useEffect, useState } from "react";
import categoryApi from "../../api/category.api";

interface SortBarProps {
  selectedCategory: string | null;
  sortBy: string;
  setSortBy: (value: string) => void;
}

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
  { value: "popular", label: "Phổ biến nhất" },
];

const SortBarSection = ({ selectedCategory, sortBy, setSortBy }: SortBarProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAll();
        setCategories(res.data || []);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mb: 3,
        gap: 2,
      }}>
      <Typography variant="h5" sx={{ fontWeight: 600, color: "#2c3e50" }}>
        {selectedCategory === "all" || selectedCategory === null
          ? "Tất cả sản phẩm"
          : categories.find((cat) => cat.id === selectedCategory)?.name}
      </Typography>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          size="small"
          sx={{
            minWidth: 150,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}>
          {sortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>
    </Box>
  );
};

export default SortBarSection;
