import { useState } from "react";
import { Box, Typography, Container, Paper } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { fakeCartItems } from "../../fakeData/fakeCartData";
import type { CartItem } from "../../types/models";
import CartItemSection from "./CartItemSection";
import CartSummarySection from "./CartSummarySection";

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(fakeCartItems);
  const [selectedItems, setSelectedCartItems] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const navigate = useNavigate();

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.id !== itemId)
    );
    setSelectedCartItems((prev) => prev.filter((id) => id !== itemId));
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedCartItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAllItems = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allItemIds = cartItems.map((item) => item.id);
      setSelectedCartItems(allItemIds);
    } else {
      setSelectedCartItems([]);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout', { state: { selectedItems: selectedCartItems } });
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const selectedCartItems = cartItems.filter((item) =>
    selectedItems.includes(item.id)
  );

  const allSelected = selectedItems.length === cartItems.length && cartItems.length > 0;

  const paginatedCartItems = cartItems.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: 24 }}>
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          Trang chủ
        </Link>{" "}
        / Giỏ hàng của bạn
      </Typography>

      <Box sx={{ display: "flex", gap: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              border: "1px solid #eee",
            }}
          >
            <CartItemSection
              items={paginatedCartItems}
              selectedItems={selectedItems}
              onSelect={handleSelectItem}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemoveItem}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              totalItems={cartItems.length}
              onSelectAll={handleSelectAllItems}
              allSelected={allSelected}
            />
          </Paper>
        </Box>

        <CartSummarySection
          selectedItems={selectedCartItems}
          onCheckout={handleCheckout}
        />
      </Box>
    </Container>
  );
};

export default Cart;
