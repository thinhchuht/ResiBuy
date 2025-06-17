import { Box, Typography, IconButton, Checkbox, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TextField } from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type { CartItem as CartItemType } from "../../types/models";
import { formatPrice, getMinPrice } from "../../utils/priceUtils";

interface CartItemSectionProps {
  items: CartItemType[];
  selectedItems: string[];
  onSelect: (itemId: string) => void;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
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

  const getCartItemPrice = (item: CartItemType) => getMinPrice(item.product);

  const calculateItemTotal = (item: CartItemType): string => {
    return formatPrice(getCartItemPrice(item) * item.quantity);
  };

  const tableCellStyle = {
    wordBreak: "break-word" as const,
    whiteSpace: "normal" as const,
    maxWidth: "200px",
  };

  const handleQuantityInputChange = (itemId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(event.target.value);
    if (isNaN(value) || value < 1) {
      value = 1; // Mặc định về 1 nếu không hợp lệ
    }
    if (value > 10) {
      value = 10; // Giới hạn tối đa là 10
    }
    onQuantityChange(itemId, value);
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
            const product = item.product;
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
                      src={product.productImages[0]?.thumbUrl}
                      alt={product.productImages[0].name}
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
                          "&:hover": {
                            color: "red",
                          },
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
                        Giá: {formatPrice(getCartItemPrice(item))}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="right" sx={{ ...tableCellStyle, minWidth: "150px" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifyContent: "flex-end" }}>
                    <IconButton size="small" onClick={() => onQuantityChange(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                      <Remove fontSize="small" />
                    </IconButton>
                    <TextField
                      value={item.quantity}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleQuantityInputChange(item.id, e)}
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
                        style: { textAlign: "center" }
                      }}
                    />
                    <IconButton size="small" onClick={() => onQuantityChange(item.id, item.quantity + 1)} disabled={item.quantity >= 10}>
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
                    {calculateItemTotal(item)}
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
