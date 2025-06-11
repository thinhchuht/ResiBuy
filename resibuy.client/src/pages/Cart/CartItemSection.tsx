import {
  Box,
  Typography,
  IconButton,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import type { CartItem as CartItemType } from "../../types/models";

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

  const calculateItemTotal = (item: CartItemType): string => {
    return (item.product.price * item.quantity).toFixed(2);
  };

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
              <Checkbox
                checked={allSelected}
                onChange={onSelectAll}
              />
            </TableCell>
            <TableCell align="center" width={40}>
              <Typography variant="subtitle1" fontWeight="bold">
                STT
              </Typography>
            </TableCell>
            <TableCell sx={tableCellStyle}>
              <Typography variant="subtitle1" fontWeight="bold">
                SẢN PHẨM
              </Typography>
            </TableCell>
            <TableCell sx={tableCellStyle}>
              <Typography variant="subtitle1" fontWeight="bold">
                SỐ LƯỢNG
              </Typography>
            </TableCell>
            <TableCell sx={tableCellStyle}>
              <Typography variant="subtitle1" fontWeight="bold">
                CÂN NẶNG
              </Typography>
            </TableCell>
            <TableCell align="right" sx={tableCellStyle}>
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
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onChange={() => onSelect(item.id)}
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">{index + 1}</Typography>
                </TableCell>
                <TableCell sx={tableCellStyle}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <img
                      src={product.imageUrl}
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
                          "&:hover": {
                            color: "primary.main",
                          },
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                        onClick={() => navigate(`/products?id=${product.id}`)}
                      >
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Giá: ${product.price.toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell sx={tableCellStyle}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Remove fontSize="small" />
                    </IconButton>
                    <Typography variant="body1">{item.quantity}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onRemove(item.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={tableCellStyle}>
                  <Typography variant="body1">
                    {(product.weight * item.quantity).toFixed(2)} kg
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={tableCellStyle}>
                  <Typography variant="h6" color="primary.main">
                    ${calculateItemTotal(item)}
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