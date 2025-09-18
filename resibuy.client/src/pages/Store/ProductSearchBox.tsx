import React, { useState, useRef } from "react";
import {
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Box,
  CircularProgress,
  Paper,
  Typography,
  ClickAwayListener,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import productApi from "../../api/product.api";
import type { ProductDto } from "../../types/product";

type ProductSearchBoxProps = {
  onSelectProduct: (product: ProductDto) => void;
};

const ProductSearchBox: React.FC<ProductSearchBoxProps> = ({
  onSelectProduct,
}) => {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ProductDto[]>([]);
  const [showList, setShowList] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);
    if (value.trim().length === 0) {
      setResults([]);
      setShowList(false);
      return;
    }
    setLoading(true);
    setShowList(true);
    try {
      const res = await productApi.getAll({
        pageNumber: 1,
        pageSize: 10,
        search: value, // <-- Đúng với backend
      });
      setResults(res.items || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (product: ProductDto) => {
    onSelectProduct(product);
    setKeyword("");
    setResults([]);
    setShowList(false);
    inputRef.current?.blur();
  };

  return (
    <ClickAwayListener onClickAway={() => setShowList(false)}>
      <Box sx={{ position: "relative", width: 300, mr: 2 }}>
        <TextField
          placeholder="Tìm tên sản phẩm"
          size="small"
          value={keyword}
          inputRef={inputRef}
          onChange={handleChange}
          onFocus={() => keyword && setShowList(true)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            autoComplete: "off",
          }}
          sx={{ width: "100%" }}
        />
        {showList && (
          <Paper
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              zIndex: 10,
              maxHeight: 320,
              overflowY: "auto",
              mt: 0.5,
              boxShadow: 3,
            }}
          >
            {loading ? (
              <Box display="flex" justifyContent="center" my={2}>
                <CircularProgress size={24} />
              </Box>
            ) : results.length === 0 && keyword ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                Không tìm thấy sản phẩm phù hợp.
              </Typography>
            ) : (
              <List>
                {results.map((product) => (
                  <ListItem
                    button
                    key={product.id}
                    onClick={() => handleSelect(product)}
                  >
                    <Box
                      component="img"
                      src={
                        product.productDetails?.[0]?.image?.url ||
                        "/no-image.png"
                      }
                      alt={product.name}
                      sx={{
                        width: 40,
                        height: 40,
                        objectFit: "cover",
                        mr: 2,
                        borderRadius: 1,
                      }}
                    />
                    <ListItemText
                      primary={product.name}
                      secondary={product.describe}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
};

export default ProductSearchBox;
