import { useState } from "react";
import { Box, Typography, Container, Paper } from "@mui/material";
import { Link } from "react-router-dom";
import { fakeCartItems } from "../../fakeData/fakeCartData";
import type { CartItem } from "../../types/models";
import CartItemSection from "./components/CartItemSection";
import CartSummarySection from "./components/CartSummarySection";

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(fakeCartItems);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

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
    setSelectedItems((prev) => prev.filter((id) => id !== itemId));
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleCheckout = () => {
    // Handle checkout logic here
    console.log("Checkout clicked");
  };

  const selectedCartItems = cartItems.filter((item) =>
    selectedItems.includes(item.id)
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
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
              items={cartItems}
              selectedItems={selectedItems}
              onSelect={handleSelectItem}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemoveItem}
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
