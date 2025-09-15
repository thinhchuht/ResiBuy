import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
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
  Divider,
  Paper,
  CircularProgress,
} from "@mui/material";
import { Search, Close, Add } from "@mui/icons-material";
import productApi from "../../api/product.api";
import cartApi from "../../api/cart.api";
import type { ProductDto } from "../../types/product";
import ProductDetailDialog from "../Store/ProductDetailDialog";
import ProductSearchBox from "../Store/ProductSearchBox";

type CartTab = {
  id: string;
  name: string;
};

type OrderItem = {
  id: string; // id của cartItem (từ API)
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
};

const PosPage: React.FC = () => {
  const [tabs, setTabs] = useState<CartTab[]>([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<
    ProductDto | undefined
  >(undefined);

  // --- load danh sách cart khi mở trang ---
  useEffect(() => {
    const fetchCarts = async () => {
      try {
        const res = await cartApi.getAllCartInShop();
        console.log("API carts:", res.data);

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
  }, []);

  // --- load sản phẩm gợi ý ---
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

  // --- load cart theo id khi đổi tab ---
  useEffect(() => {
    if (tabs[currentTab]) {
      loadCart(tabs[currentTab].id);
    }
  }, [currentTab, tabs]);

  const loadCart = async (cartId: string) => {
    try {
      const res = await cartApi.getCartById(cartId, 1, 50);
      const loadedItems: OrderItem[] =
        res.data.data?.items?.map((it: any) => ({
          id: it.id, // cartItem id
          quantity: it.quantity,
          price: it.productDetail.price,
          discount: 0, // API chưa có discount thì gán mặc định
          productDetailId: it.productDetail.id,
          product: {
            id: it.productDetail.product.id,
            name: it.productDetail.product.name,
            stock: it.productDetail.quantity,
            image: it.productDetail.image?.url,
          },
        })) || [];
      setItems(loadedItems);
    } catch (err) {
      console.error("Lỗi load cart:", err);
    }
  };

  const handleChangeTab = (e: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    const selectedCart = tabs[newValue];
    if (selectedCart) {
      loadCart(selectedCart.id);
    }
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

  const handleRemoveItem = async (productDetailId: number) => {
    try {
      const cartId = tabs[currentTab]?.id;
      if (!cartId) return;
      await cartApi.addItemToCart(cartId, productDetailId, 1, false);
      loadCart(cartId);
    } catch (err) {
      console.error("Lỗi xoá sản phẩm:", err);
    }
  };

  const total = items.reduce(
    (sum, i) => sum + i.price * i.quantity * (1 - i.discount / 100),
    0
  );

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
                <TableCell>Số lượng</TableCell>
                <TableCell>Đơn giá (VND)</TableCell>
                <TableCell>Giảm giá</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
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
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.price.toLocaleString()}</TableCell>
                  <TableCell>{item.discount}%</TableCell>
                  <TableCell>
                    {(
                      item.price *
                      item.quantity *
                      (1 - item.discount / 100)
                    ).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleRemoveItem(item.productDetailId)}
                    >
                      <Close />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
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
      <Box flex={1} p={2} component={Paper} elevation={2}>
        <Typography variant="h6">Khách lẻ</Typography>
        <Divider sx={{ my: 1 }} />

        <Typography>Tiền hàng: {total.toLocaleString()} đ</Typography>
        <Typography>Giảm tiền đơn hàng: 0 đ</Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>
          Khách phải trả: {total.toLocaleString()} đ
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1">Chọn phương thức thanh toán</Typography>
        <Box display="flex" gap={1} my={1}>
          <Button variant="outlined">Chuyển khoản</Button>
          <Button variant="outlined">Tiền mặt</Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography>Tiền khách đưa: {total.toLocaleString()} đ</Typography>
        <Typography>Tiền thừa trả khách: 0 đ</Typography>

        <Button
          variant="contained"
          color="success"
          fullWidth
          sx={{ mt: 3 }}
          onClick={() => alert("Thanh toán thành công!")}
        >
          Xác nhận thanh toán (F9)
        </Button>
      </Box>
    </Box>
  );
};

export default PosPage;
