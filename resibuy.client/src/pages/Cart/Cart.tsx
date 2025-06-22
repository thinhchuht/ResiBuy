import { useState, useEffect } from "react";
import { Box, Typography, Container, Paper } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import type { CartItem } from "../../types/models";
import CartItemSection from "./CartItemSection";
import CartSummarySection from "./CartSummarySection";
import cartApi from "../../api/cart.api";
import cartItemApi from "../../api/cartItem.api";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedItems, setSelectedCartItems] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchCartItems = async () => {
    try {
      if (!user?.cartId) return;
      const response = await cartApi.getCartById(user.cartId, page + 1, rowsPerPage);
      const { items, totalCount } = response.data.data;
      setCartItems(items);
      setTotalItems(totalCount);
    } catch (error) {
      toast.error("Không thể tải giỏ hàng!");
      console.error("Error fetching cart items:", error);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [page, rowsPerPage, user?.cartId]);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    try {
      await cartItemApi.updateQuantity(itemId, newQuantity);
      setCartItems((prevItems) => prevItems.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item)));
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await cartApi.removeFromCart(user?.cartId || "", [itemId]);
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
      setSelectedCartItems((prev) => prev.filter((id) => id !== itemId));
      toast.success("Xóa sản phẩm khỏi giỏ hàng thành công!");
    } catch (error) {
      toast.error("Không thể xóa sản phẩm khỏi giỏ hàng!");
      console.error("Error removing item:", error);
    }
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedCartItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]));
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
    navigate("/checkout", { state: { selectedItems: selectedCartItems } });
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const selectedCartItems = cartItems.filter((item) => selectedItems.includes(item.id));
  const allSelected = selectedItems.length === cartItems.length && cartItems.length > 0;

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
            }}>
            <CartItemSection
              items={cartItems}
              selectedItems={selectedItems}
              onSelect={handleSelectItem}
              onQuantityChange={handleQuantityChange}
              onRemove={handleRemoveItem}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              totalItems={totalItems}
              onSelectAll={handleSelectAllItems}
              allSelected={allSelected}
            />
          </Paper>
        </Box>

        <CartSummarySection selectedItems={selectedCartItems} onCheckout={handleCheckout} />
      </Box>
    </Container>
  );
};

export default Cart;
