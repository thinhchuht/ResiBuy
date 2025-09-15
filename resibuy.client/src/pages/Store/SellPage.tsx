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
      const newTab: CartTab = {
        id: res.data.id,
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

  const handleCloseTab = async (index: number) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa đơn hàng này?");
    if (!confirmed) return;
    const cartId = tabs[index]?.id;
    if (!cartId) return;
    try {
      await cartApi.deleteCart(cartId);
      const newTabs = [...tabs];
      newTabs.splice(index, 1);
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
    <Box display="flex" height="100vh">
      {/* Main area */}
      <Box flex={3} display="flex" flexDirection="column">
        {/* Header */}
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Bán tại quầy
            </Typography>
            <ProductSearchBox
              onSelectProduct={(product) => setSelectedProduct(product)}
            />
            <Button
              variant="outlined"
              onClick={handleAddTab}
              startIcon={<Add />}
            >
              Tạo đơn hàng mới
            </Button>
          </Toolbar>
        </AppBar>

        {/* Tabs */}
        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          {tabs.map((tab, i) => (
            <Tab
              key={tab.id}
              label={
                <Box display="flex" alignItems="center">
                  {tab.name}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCloseTab(i);
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Box>
              }
            />
          ))}
        </Tabs>

        {/* Order table */}
        <Box flex={1} overflow="auto" p={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ảnh</TableCell>
                <TableCell>Tên sản phẩm</TableCell>
                <TableCell>Chi tiết</TableCell>
                <TableCell>Số lượng</TableCell>
                <TableCell>Đơn giá (VND)</TableCell>
                <TableCell>Giảm giá</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => {
                const promotion =
                  item.productDetail?.product?.promotion &&
                  item.productDetail.product.promotion.isActive
                    ? item.productDetail.product.promotion
                    : undefined;
                const discount = promotion ? promotion.discount : item.discount;
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
                  <TableRow key={item.id}>
                    <TableCell>
                      <Box
                        component="img"
                        src={item.product.image || "/no-image.png"}
                        alt={item.product.name}
                        sx={{ width: 50, height: 50, objectFit: "cover" }}
                      />
                    </TableCell>
                    <TableCell>
                      {item.product.name}
                      <br />
                      <Typography variant="caption">
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
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <IconButton
                          size="small"
                          onClick={() => handleChangeQuantity(item, false)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </IconButton>
                        <Typography mx={1}>{item.quantity}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleChangeQuantity(item, true)}
                        >
                          +
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>{item.price.toLocaleString()}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>{totalRow.toLocaleString()}</TableCell>
                    <TableCell>
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
              })}
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
        <Box p={2} borderTop="1px solid #ddd">
          <Typography variant="subtitle1" gutterBottom>
            Chọn nhanh sản phẩm
          </Typography>
          {loading ? (
            <CircularProgress />
          ) : (
            <Grid container spacing={2}>
              {products.map((p) => {
                const detail = p.productDetails?.[0];
                if (!detail) return null;
                return (
                  <Grid item xs={2} key={detail.id}>
                    <Card
                      onClick={() => setSelectedProduct(p)}
                      sx={{ cursor: "pointer", textAlign: "center" }}
                    >
                      <CardContent>
                        <Box
                          component="img"
                          src={detail.image?.url || "/no-image.png"}
                          alt={p.name}
                          sx={{
                            width: "100%",
                            height: 60,
                            objectFit: "cover",
                            mb: 1,
                          }}
                        />
                        <Typography variant="body2" fontWeight="bold">
                          {detail.price?.toLocaleString()} đ
                        </Typography>
                        <Typography variant="body2">{p.name}</Typography>
                        <Typography variant="caption">
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
      <Box display="flex" height="100vh">
        <CheckoutSidebar
          total={total}
          discount={totalDiscount}
          onCheckout={() => alert("Thanh toán thành công!")}
        />
      </Box>
    </Box>
  );
};

export default SellPage;
