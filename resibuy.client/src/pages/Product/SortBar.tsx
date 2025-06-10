import { Box, Typography, TextField, MenuItem } from "@mui/material";
import type { Category } from "../../types/models";

interface SortBarProps {
  selectedCategory: string;
  sortBy: string;
  setSortBy: (value: string) => void;
  fakeCategories: Category[];
}

const sortOptions = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
  { value: "popular", label: "Phổ biến nhất" },
];

const SortBar = ({ selectedCategory, sortBy, setSortBy, fakeCategories }: SortBarProps) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      mb: 3,
      gap: 2,
    }}>
    <Typography variant="h5" sx={{ fontWeight: 600, color: "#2c3e50" }}>
      {selectedCategory === "all" ? "Tất cả sản phẩm" : fakeCategories.find((cat) => cat.id === selectedCategory)?.name}
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

export default SortBar;
