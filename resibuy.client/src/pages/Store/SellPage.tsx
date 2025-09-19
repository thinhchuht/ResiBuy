import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Tabs,
  Tab,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Grid,
  CircularProgress,
} from "@mui/material";
import { Close, Add, Delete } from "@mui/icons-material";
import productApi from "../../api/product.api";
import cartApi from "../../api/cart.api";
import type { ProductDto } from "../../types/product";
import ProductDetailDialog from "../Store/ProductDetailDialog";
import ProductSearchBox from "../Store/ProductSearchBox";
import CheckoutSidebar from "../Store/CheckoutSidebar";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

type CartTab = {
  id: string;
  name: string;
};

type OrderItem = {
  id: string;
  productDetailId: number;
  quantity: number;
  price: number;
  discount: number;
  product: {
    id: number;
    name: string;
    stock: number;
    image?: string;
  };
  productDetail?: any;
};

const SellPage: React.FC = () => {
  const [tabs, setTabs] = useState<CartTab[]>([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<
    ProductDto | undefined
  >(undefined);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [tabToDelete, setTabToDelete] = useState<number | null>(null);

  // Load danh sách cart khi mở trang
  useEffect(() => {
    const fetchCarts = async () => {
      try {
        const res = await cartApi.getAllCartInShop();
        const cartsFromApi: CartTab[] =
          res.data?.data?.map((cart: { id: string }, index: number) => ({
            id: cart.id,
            name: `Đơn hàng ${index + 1}`,
          })) || [];
        setTabs(cartsFromApi);
        if (cartsFromApi.length > 0) {
          setCurrentTab(0);
          loadCart(cartsFromApi[0].id);
        }
      } catch (err) {
        console.error("Lỗi load carts:", err);
      }
    };
    fetchCarts();
    // eslint-disable-next-line
  }, []);

  // Load sản phẩm gợi ý
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await productApi.getAll({ pageNumber: 1, pageSize: 20 });
        setProducts(res.items);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Load cart theo id khi đổi tab
  useEffect(() => {
    if (tabs[currentTab]) {
      console.log("Loading cart for tab:", tabs[currentTab]);
      loadCart(tabs[currentTab].id);
    }
    // eslint-disable-next-line
  }, [currentTab, tabs]);

  const loadCart = async (cartId: string) => {
    try {
      const res = await cartApi.getCartById(cartId, 1, 50);
      const loadedItems: OrderItem[] =
        res.data.data?.items?.map((it: any) => ({
          id: it.id,
          quantity: it.quantity,
          price: it.productDetail.price,
          discount: 0,
          productDetailId: it.productDetail.id,
          product: {
            id: it.productDetail.product.id,
            name: it.productDetail.product.name,
            stock: it.productDetail.quantity,
            image: it.productDetail.image?.url,
          },
          productDetail: it.productDetail,
        })) || [];
      setItems(loadedItems);
    } catch (err) {
      console.error("Lỗi load cart:", err);
    }
  };

  const handleChangeTab = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleAddTab = async () => {
    try {
      const res = await cartApi.createCart();
      console.log("Tạo cart mới:", res.data);
      const newTab: CartTab = {
        id: res.data.data.id,
        name: `Đơn hàng ${tabs.length + 1}`,
      };
      setTabs((prev) => [...prev, newTab]);
      setCurrentTab(tabs.length);
    } catch (err) {
      console.error("Lỗi tạo cart mới:", err);
    }
  };

  // Hàm xử lý tăng/giảm số lượng cho từng item

  const handleChangeQuantity = async (item: OrderItem, isAdd: boolean) => {
    try {
      const cartId = tabs[currentTab]?.id;
      if (!cartId) return;
      await cartApi.addItemToCart(cartId, item.productDetailId, 1, isAdd);
      await loadCart(cartId); // Đảm bảo cập nhật lại giỏ hàng sau khi thay đổi
      window.toast &&
        window.toast.success(
          isAdd ? "Tăng số lượng thành công!" : "Giảm số lượng thành công!"
        );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (isAdd ? "Tăng số lượng thất bại!" : "Giảm số lượng thất bại!");
      window.toast && window.toast.error(msg);
    }
  };

  const handleRequestCloseTab = (index: number) => {
    setTabToDelete(index);
    setOpenConfirm(true);
  };

  const handleConfirmDeleteTab = async () => {
    if (tabToDelete === null) return;
    const cartId = tabs[tabToDelete]?.id;
    if (!cartId) {
      setOpenConfirm(false);
      setTabToDelete(null);
      return;
    }
    try {
      await cartApi.deleteCart(cartId);
      const newTabs = [...tabs];
      newTabs.splice(tabToDelete, 1);
      setTabs(newTabs);
      if (newTabs.length > 0) {
        setCurrentTab(0);
        loadCart(newTabs[0].id);
      } else {
        setCurrentTab(0);
        setItems([]);
      }
    } catch (err) {
      console.error("Lỗi xoá đơn hàng:", err);
      alert("Xóa đơn hàng thất bại!");
    }
    setOpenConfirm(false);
    setTabToDelete(null);
  };

  const handleCancelDeleteTab = () => {
    setOpenConfirm(false);
    setTabToDelete(null);
  };

  const handleAddProduct = async (productDetailId: number) => {
    try {
      const cartId = tabs[currentTab]?.id;
      if (!cartId) return;
      await cartApi.addItemToCart(cartId, productDetailId, 1, true);
      loadCart(cartId);
    } catch (err) {
      console.error("Lỗi thêm sản phẩm:", err);
    }
  };

  const total = items.reduce(
    (sum, i) => sum + i.price * i.quantity * (1 - i.discount / 100),
    0
  );
  const totalDiscount = items.reduce((sum, item) => {
    const promotion =
      item.productDetail?.product?.promotion &&
      item.productDetail.product.promotion.isActive
        ? item.productDetail.product.promotion
        : undefined;
    const discount = promotion ? promotion.discount : item.discount;
    const discountAmount = item.price * item.quantity * (discount / 100);
    return sum + discountAmount;
  }, 0);

  return (
    <Box display="flex" height="100vh" bgcolor="#f5f6fa">
      {/* Main area */}
      <Box
        flex={3}
        display="flex"
        flexDirection="column"
        bgcolor="#fff"
        boxShadow={2}
        borderRadius={2}
        m={2}
        overflow="hidden"
      >
        {/* Header */}
        <AppBar
          position="static"
          color="default"
          elevation={2}
          sx={{ bgcolor: "#fff" }}
        >
          <Toolbar>
            <Typography
              variant="h5"
              sx={{ flexGrow: 1, fontWeight: 700, color: "#222" }}
            >
              Bán tại quầy
            </Typography>
            <ProductSearchBox
              onSelectProduct={(product) => setSelectedProduct(product)}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddTab}
              startIcon={<Add />}
              sx={{ ml: 2, fontWeight: 600, boxShadow: "none" }}
            >
              Tạo đơn hàng mới
            </Button>
          </Toolbar>
        </AppBar>

        {/* Tabs */}
        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "#fafbfc",
            px: 2,
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabs.map((tab, i) => (
            <Tab
              key={tab.id}
              label={
                <Box display="flex" alignItems="center">
                  <Typography fontWeight={600}>{tab.name}</Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRequestCloseTab(i);
                    }}
                    sx={{ ml: 1 }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              }
              sx={{
                minHeight: 48,
                fontWeight: 600,
                textTransform: "none",
                px: 2,
              }}
            />
          ))}
        </Tabs>

        {/* Order table */}
        <Box flex={1} overflow="auto" p={2}>
          <Table sx={{ bgcolor: "#fff", borderRadius: 2, boxShadow: 1 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f0f2f5" }}>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  Ảnh
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tên sản phẩm</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Chi tiết</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  Số lượng
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Đơn giá (VND)
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  Giảm giá
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>
                  Tổng tiền
                </TableCell>
                <TableCell align="center"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary" py={4}>
                      Chưa có sản phẩm trong đơn hàng
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => {
                  const promotion =
                    item.productDetail?.product?.promotion &&
                    item.productDetail.product.promotion.isActive
                      ? item.productDetail.product.promotion
                      : undefined;
                  const discount = promotion
                    ? promotion.discount
                    : item.discount;
                  const priceAfterDiscount = item.price * (1 - discount / 100);
                  const totalRow = priceAfterDiscount * item.quantity;
                  const detailInfo =
                    item.productDetail?.additionalData &&
                    item.productDetail.additionalData.length > 0
                      ? item.productDetail.additionalData
                          .map((ad: any) => `${ad.key}: ${ad.value}`)
                          .join(", ")
                      : "";

                  return (
                    <TableRow key={item.id} hover>
                      <TableCell align="center">
                        <Box
                          component="img"
                          src={item.product.image || "/no-image.png"}
                          alt={item.product.name}
                          sx={{
                            width: 56,
                            height: 56,
                            objectFit: "cover",
                            borderRadius: 1,
                            border: "1px solid #eee",
                            boxShadow: 1,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight={600}>
                          {item.product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          SL tồn: {item.product.stock}
                        </Typography>
                        {promotion && (
                          <Typography
                            variant="caption"
                            color="success.main"
                            ml={1}
                          >
                            (KM: -{promotion.discount}%)
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {detailInfo || <i>Không có</i>}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleChangeQuantity(item, false)}
                            disabled={item.quantity <= 1}
                            sx={{ bgcolor: "#f5f6fa", borderRadius: 1 }}
                          >
                            -
                          </IconButton>
                          <Typography mx={1} fontWeight={600}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleChangeQuantity(item, true)}
                            sx={{ bgcolor: "#f5f6fa", borderRadius: 1 }}
                          >
                            +
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={500}>
                          {item.price.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography fontWeight={500}>
                          {discount}%
                          {promotion && (
                            <Typography
                              variant="caption"
                              color="success.main"
                              ml={1}
                            >
                              (KM)
                            </Typography>
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography fontWeight={600} color="primary">
                          {totalRow.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={async () => {
                            const cartId = tabs[currentTab]?.id;
                            if (!cartId) return;
                            try {
                              await cartApi.deleteCartItems(cartId, [item.id]);
                              await loadCart(cartId);
                              window.toast &&
                                window.toast.success(
                                  "Xóa sản phẩm khỏi đơn hàng thành công!"
                                );
                            } catch (err: any) {
                              const msg =
                                err?.response?.data?.message ||
                                "Xóa sản phẩm khỏi đơn hàng thất bại!";
                              window.toast && window.toast.error(msg);
                            }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>

        {/* Product Detail Dialog */}
        <ProductDetailDialog
          open={!!selectedProduct}
          product={selectedProduct}
          onClose={() => setSelectedProduct(undefined)}
          onSelectDetail={async (detailId) => {
            await handleAddProduct(detailId);
            setSelectedProduct(undefined);
          }}
        />

        {/* Product grid */}
        <Box p={2} borderTop="1px solid #eee" bgcolor="#fafbfc">
          <Typography variant="subtitle1" gutterBottom fontWeight={700}>
            Chọn nhanh sản phẩm
          </Typography>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2}>
              {products.map((p) => {
                const detail = p.productDetails?.[0];
                if (!detail) return null;
                return (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    xl={2}
                    key={detail.id}
                    sx={{ display: "flex" }}
                  >
                    <Card
                      onClick={() => setSelectedProduct(p)}
                      sx={{
                        cursor: "pointer",
                        textAlign: "center",
                        transition: "box-shadow 0.2s",
                        "&:hover": {
                          boxShadow: 4,
                          borderColor: "primary.main",
                        },
                        border: "1px solid #eee",
                        borderRadius: 2,
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                      }}
                    >
                      <CardContent
                        sx={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          p: 2,
                        }}
                      >
                        <Box
                          component="img"
                          src={detail.image?.url || "/no-image.png"}
                          alt={p.name}
                          sx={{
                            width: 100,
                            height: 100,
                            objectFit: "cover",
                            background: "#fafbfc",
                            mb: 1,
                            borderRadius: 1,
                            border: "1px solid #f0f0f0",
                          }}
                        />
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color="primary"
                        >
                          {detail.price?.toLocaleString()} đ
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          gutterBottom
                        >
                          {p.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          SL: {detail.quantity ?? 0}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </Box>
      {/* Sidebar */}
      <Box
        display="flex"
        height="100vh"
        minWidth={340}
        bgcolor="#f8fafc"
        boxShadow={2}
      >
        <CheckoutSidebar
          cartId={tabs[currentTab]?.id} // ✅ Truyền cartId hiện tại
          total={total}
          discount={totalDiscount}
          onCheckout={() => alert("Thanh toán thành công!")}
        />
      </Box>
      {/* Dialog xác nhận xóa */}
      <Dialog open={openConfirm} onClose={handleCancelDeleteTab}>
        <DialogTitle>Xác nhận xóa đơn hàng</DialogTitle>
        <DialogContent>Bạn có chắc muốn xóa đơn hàng này?</DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDeleteTab}>Hủy</Button>
          <Button
            onClick={handleConfirmDeleteTab}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SellPage;
