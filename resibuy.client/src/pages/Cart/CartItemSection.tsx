import { Box, Typography, IconButton, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField } from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type { CartItem as CartItemType } from "../../types/models";
import { formatPrice } from "../../utils/priceUtils";
import { useEffect, useRef, useState } from "react";
import debounce from "lodash.debounce";

interface CartItemSectionProps {
  items: CartItemType[];
  selectedItems: CartItemType[];
  onSelect: (item: CartItemType) => void;
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
    // Không setLocalQuantities ở đây nữa
    getDebouncedChange(productDetailId)(productDetailId, value);
  };

  // Handler cho nút +/-, tương tự
  const handleQuantityButton = (productDetailId: number, newQuantity: number) => {
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 10) newQuantity = 10;
    // Không setLocalQuantities ở đây nữa
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

  if (items.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Chưa có sản phẩm nào trong giỏ hàng
        </Typography>
        <a href="/" style={{ textDecoration: 'none' }}>
          <Box
            sx={{
              display: 'inline-block',
              px: 4,
              py: 1.5,
              bgcolor: '#EB5C60',
              color: '#fff',
              borderRadius: 2,
              fontWeight: 600,
              fontSize: 16,
              boxShadow: '0 2px 8px rgba(235, 92, 96, 0.15)',
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: '#d94a52',
                boxShadow: '0 4px 16px rgba(235, 92, 96, 0.25)',
              },
            }}
          >
            Mua sắm
          </Box>
        </a>
      </Box>
    );
  }

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
                  <Checkbox checked={selectedItems.some((sel) => sel.id === item.id)} onChange={() => onSelect(item)} />
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
                      {Array.isArray(productDetail.additionalData) && productDetail.additionalData.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                          {productDetail.additionalData.map((data) => (
                            <Box
                              key={data.id}
                              sx={{
                                fontSize: '0.7rem',
                                height: 22,
                                px: 1,
                                display: 'inline-flex',
                                alignItems: 'center',
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                color: 'primary.main',
                                border: '1px solid rgba(25, 118, 210, 0.2)',
                                borderRadius: 1,
                              }}
                            >
                              {data.value}
                            </Box>
                          ))}
                        </Box>
                      )}
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
                  <Typography variant="body1">{(item.productDetail.weight * item.quantity).toFixed(2)} kg</Typography>
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
