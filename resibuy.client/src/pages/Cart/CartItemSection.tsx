import { Box, Typography, IconButton, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField } from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type { CartItem as CartItemType } from "../../types/models";
import { formatPrice } from "../../utils/priceUtils";
import { useEffect, useRef, useState } from "react";
import debounce from "lodash.debounce";

interface CartItemSectionProps {
  items: CartItemType[];
  selectedItems: string[];
  onSelect: (itemId: string) => void;
  onQuantityChange: (productDetailId: number, newQuantity: number) => void;
  onRemove: (itemId: string) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  totalItems: number;
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
  allSelected: boolean;
}

const CartItemSection = ({
  items,
  selectedItems,
  onSelect,
  onQuantityChange,
  onRemove,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  totalItems,
  onSelectAll,
  allSelected,
}: CartItemSectionProps) => {
  const navigate = useNavigate();

  const [localQuantities, setLocalQuantities] = useState<{ [productDetailId: number]: number }>({});

  useEffect(() => {
    const initialQuantities: { [productDetailId: number]: number } = {};
    items.forEach((item) => {
      initialQuantities[item.productDetailId] = item.quantity;
    });
    setLocalQuantities(initialQuantities);
  }, [items]);

  // Bỏ phần ref timer, thay bằng ref lưu debounce function
  const debounceRefs = useRef<{ [productDetailId: number]: ((id: number, value: number) => void) & { cancel?: () => void } }>({});

  const getDebouncedChange = (productDetailId: number) => {
    if (!debounceRefs.current[productDetailId]) {
      debounceRefs.current[productDetailId] = debounce((id: number, value: number) => {
        onQuantityChange(id, value);
      }, 400);
    }
    return debounceRefs.current[productDetailId];
  };

  // Handler cho input số lượng
  const handleQuantityInputChange = (productDetailId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(event.target.value);
    if (isNaN(value) || value < 1) {
      value = 1;
    }
    if (value > 10) {
      value = 10;
    }
    setLocalQuantities((prev) => ({ ...prev, [productDetailId]: value }));
    getDebouncedChange(productDetailId)(productDetailId, value);
  };

  // Handler cho nút +/-, tương tự
  const handleQuantityButton = (productDetailId: number, newQuantity: number) => {
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 10) newQuantity = 10;
    setLocalQuantities((prev) => ({ ...prev, [productDetailId]: newQuantity }));
    getDebouncedChange(productDetailId)(productDetailId, newQuantity);
  };

  // Cleanup debounce khi unmount
  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      Object.values(debounceRefs.current).forEach((fn) => fn.cancel && fn.cancel());
    };
  }, []);

  const tableCellStyle = {
    wordBreak: "break-word" as const,
    whiteSpace: "normal" as const,
    maxWidth: "200px",
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox" width={40}>
              <Checkbox checked={allSelected} onChange={onSelectAll} />
            </TableCell>
            <TableCell align="center" width={40}>
              <Typography variant="subtitle1" fontWeight="bold">
                STT
              </Typography>
            </TableCell>
            <TableCell sx={{ ...tableCellStyle, minWidth: "300px" }}>
              <Typography variant="subtitle1" fontWeight="bold">
                SẢN PHẨM
              </Typography>
            </TableCell>
            <TableCell align="right" sx={{ ...tableCellStyle, minWidth: "150px" }}>
              <Typography variant="subtitle1" fontWeight="bold">
                SỐ LƯỢNG
              </Typography>
            </TableCell>
            <TableCell align="right" sx={{ ...tableCellStyle, minWidth: "100px" }}>
              <Typography variant="subtitle1" fontWeight="bold">
                CÂN NẶNG
              </Typography>
            </TableCell>
            <TableCell align="right" sx={{ ...tableCellStyle, minWidth: "180px" }}>
              <Typography variant="subtitle1" fontWeight="bold">
                TỔNG CỘNG
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => {
            const productDetail = item.productDetail;
            const product = productDetail.product;
            return (
              <TableRow key={item.id}>
                <TableCell padding="checkbox">
                  <Checkbox checked={selectedItems.includes(item.id)} onChange={() => onSelect(item.id)} />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{index + 1}</Typography>
                </TableCell>
                <TableCell sx={{ ...tableCellStyle, minWidth: "300px" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <img
                      src={productDetail.image?.thumbUrl || productDetail.image?.url}
                      alt={product.name}
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "contain",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                      onClick={() => navigate(`/products?id=${product.id}`)}
                    />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{
                          cursor: "pointer",
                          "&:hover": { color: "red" },
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                        onClick={() => navigate(`/products?id=${product.id}`)}>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Giá :
                        {product.discount > 0 ? (
                          <>
                            <span style={{ textDecoration: "line-through", color: "#888", marginRight: 6, marginLeft: 4 }}>{formatPrice(productDetail.price)}</span>
                            <span style={{ color: "red", fontWeight: 600 }}>{formatPrice(productDetail.price * (1 - product.discount / 100))}</span>
                          </>
                        ) : (
                          <span>{formatPrice(productDetail.price)}</span>
                        )}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {Array.isArray(productDetail.additionalData) ? productDetail.additionalData.map((ad) => ad.value).join(", ") : ""}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ ...tableCellStyle, minWidth: "150px" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "flex-end" }}>
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityButton(item.productDetailId, (localQuantities[item.productDetailId] || 1) - 1)}
                      disabled={(localQuantities[item.productDetailId] || 1) <= 1}>
                      <Remove fontSize="small" />
                    </IconButton>
                    <TextField
                      value={localQuantities[item.productDetailId] ?? item.quantity}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleQuantityInputChange(item.productDetailId, e)}
                      variant="standard"
                      size="small"
                      sx={{
                        width: 30,
                        "& .MuiInput-root": {
                          fontWeight: 500,
                          "&:before": { borderBottom: "none" },
                          "&:after": { borderBottom: "none" },
                          "&:hover:not(.Mui-disabled):before": { borderBottom: "none" },
                        },
                        "& .MuiInput-input": {
                          textAlign: "center",
                          padding: "8px 4px",
                        },
                      }}
                      inputProps={{
                        min: 1,
                        max: 10,
                        style: { textAlign: "center" },
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleQuantityButton(item.productDetailId, (localQuantities[item.productDetailId] || 1) + 1)}
                      disabled={(localQuantities[item.productDetailId] || 1) >= 10}>
                      <Add fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => onRemove(item.id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ ...tableCellStyle, minWidth: "10px" }}>
                  <Typography variant="body1">{(product.weight * item.quantity).toFixed(2)} kg</Typography>
                </TableCell>
                <TableCell align="right" sx={{ ...tableCellStyle, minWidth: "150px" }}>
                  <Typography variant="h6" color="red">
                    {formatPrice(productDetail.price * (1 - (product.discount || 0) / 100) * item.quantity)}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalItems}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </TableContainer>
  );
};

export default CartItemSection;
