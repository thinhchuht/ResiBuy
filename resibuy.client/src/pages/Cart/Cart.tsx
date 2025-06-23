import { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Typography, Container, Paper } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import type { CartItem } from "../../types/models";
import CartItemSection from "./CartItemSection";
import CartSummarySection from "./CartSummarySection";
import cartApi from "../../api/cart.api";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { HubEventType, useEventHub } from "../../hooks/useEventHub";

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCartItems, setSelectedCartItems] = useState<CartItem[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchCartItems = useCallback(async () => {
    try {
      if (!user?.cartId) return;
      const response = await cartApi.getCartById(
        user.cartId,
        page + 1,
        rowsPerPage
      );
      const { items, totalCount } = response.data.data;
      console.log('fetch', response.data.data)

      setCartItems(items);
      setTotalItems(totalCount);
    } catch (error) {
      toast.error("Không thể tải giỏ hàng!");
      console.error("Error fetching cart items:", error);
    }
  }, [page, rowsPerPage, user?.cartId]);

  useEffect(() => {
    fetchCartItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, user?.cartId]);

  const handleCartItemAdded = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data: any) => {
      fetchCartItems();
      console.log(selectedCartItems);
      if (data?.Id) {
        setSelectedCartItems((prevSelected) =>
          prevSelected.map((item) =>
            item.id === data.Id ? { ...item, quantity: data.Quantity } : item
          )
        );
      }
    },
    [fetchCartItems, selectedCartItems]
  );

  const handleCartItemDeleted = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data: any) => {
      if (data?.cartItemIds) {
        fetchCartItems()
        setSelectedCartItems((prevSelected) => {
          return prevSelected.filter(
            (item) => !data.cartItemIds.includes(item.id)
          );
        });
      }
    },
    [fetchCartItems]
  );

  const eventHandlers = useMemo(
    () => ({
      [HubEventType.CartItemAdded]: handleCartItemAdded,
      [HubEventType.CartItemDeleted]: handleCartItemDeleted,
    }),
    [handleCartItemAdded, handleCartItemDeleted]
  );

  useEventHub(eventHandlers);

  const handleQuantityChange = async (
    productDetailId: number,
    newQuantity: number
  ) => {
    try {
      if (user) {
        await cartApi.addToCart(
          user?.cartId,
          productDetailId,
          newQuantity,
          false
        );
        setCartItems((prevItems) =>
          prevItems.map((item) =>
            item.productDetailId === productDetailId
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
        setSelectedCartItems((prevSelected) =>
          prevSelected.map((item) =>
            item.productDetailId === productDetailId
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await cartApi.removeFromCart([itemId], user?.id);
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemId)
      );
      setSelectedCartItems((prev) => prev.filter((item) => item.id !== itemId));
      toast.success("Xóa sản phẩm khỏi giỏ hàng thành công!");
    } catch (error) {
      toast.error("Không thể xóa sản phẩm khỏi giỏ hàng!");
      console.error("Error removing item:", error);
    }
  };

  const handleSelectItem = (item: CartItem) => {
    setSelectedCartItems((prev) => {
      const isSelected = prev.some((i) => i.id === item.id);
      if (isSelected) {
        return prev.filter((i) => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleSelectAllItems = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedCartItems((prev) => {
        const newItems = cartItems.filter(
          (cartItem) =>
            !prev.some((selectedItem) => selectedItem.id === cartItem.id)
        );
        return [...prev, ...newItems];
      });
    } else {
      const currentItemIds = cartItems.map((item) => item.id);
      setSelectedCartItems((prev) =>
        prev.filter((item) => !currentItemIds.includes(item.id))
      );
    }
  };

  const handleCheckout = () => {
    const selectedCartItemsWithDiscount = selectedCartItems.map((item) => {
      const discount = item.productDetail.product.discount || 0;
      const discountedPrice = item.productDetail.price * (1 - discount / 100);
      return {
        ...item,
        productDetail: {
          ...item.productDetail,
          price: discountedPrice,
        },
      };
    });
    console.log(selectedCartItemsWithDiscount)
    navigate("/checkout", {
      state: { selectedItems: selectedCartItemsWithDiscount },
    });
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const allSelected =
    cartItems.length > 0 &&
    cartItems.every((item) =>
      selectedCartItems.some((sel) => sel.id === item.id)
    );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3, fontSize: 24 }}
      >
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
              selectedItems={selectedCartItems}
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

        <CartSummarySection
          selectedItems={selectedCartItems}
          onCheckout={handleCheckout}
        />
      </Box>
    </Container>
  );
};

export default Cart;
