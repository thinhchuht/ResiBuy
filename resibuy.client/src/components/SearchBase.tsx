import React from "react";
import { InputBase, Paper, IconButton, type SxProps, type Theme } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface SearchBaseProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: () => void;
  sx?: SxProps<Theme>;
  inputSx?: SxProps<Theme>;
}

const SearchBase: React.FC<SearchBaseProps> = ({ placeholder = "Tìm kiếm...", value, onChange, onSearch, sx, inputSx }) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onSearch) {
      onSearch();
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        maxWidth: 300,
        px: 2,
        py: 0.5,
        borderRadius: 3,
        transition: "0.3s",
        ...sx,
      }}>
      <InputBase
        sx={{ ml: 1, flex: 1, minWidth: 0, fontSize: { xs: 14, sm: 15, md: 16 }, ...inputSx }}
        placeholder={placeholder}
        inputProps={{ "aria-label": "search" }}
        value={value}
        onChange={onChange}
        onKeyPress={handleKeyPress}
      />
      <IconButton onClick={onSearch} disabled={!onSearch}>
        <SearchIcon />
      </IconButton>
    </Paper>
  );
};

export default SearchBase;
