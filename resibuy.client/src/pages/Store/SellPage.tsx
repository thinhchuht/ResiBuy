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
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { Add, Close, Delete, QrCodeScanner } from "@mui/icons-material";
import productApi from "../../api/product.api";
import cartApi from "../../api/cart.api";
import type { ProductDto } from "../../types/product";
import ProductDetailDialog from "../Store/ProductDetailDialog";
import ProductSearchBox from "../Store/ProductSearchBox";
import CheckoutSidebar from "../Store/CheckoutSidebar";
import BarcodeScanModal from "../Store/BarcodeScanModal";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useToastify } from "../../hooks/useToastify";

// Hàm để lưu scannedBarcodes vào localStorage
const saveScannedBarcodesToLocalStorage = (
  scannedBarcodes: Record<string, { itemId: string; barcode: string }[]>
) => {
  try {
    localStorage.setItem("scannedBarcodes", JSON.stringify(scannedBarcodes));
  } catch (err) {
    console.error("Lỗi khi lưu scannedBarcodes vào localStorage:", err);
  }
};

// Hàm để lấy scannedBarcodes từ localStorage
const loadScannedBarcodesFromLocalStorage = (): Record<
  string,
  { itemId: string; barcode: string }[]
> => {
  try {
    const stored = localStorage.getItem("scannedBarcodes");
    return stored ? JSON.parse(stored) : {};
  } catch (err) {
    console.error("Lỗi khi tải scannedBarcodes từ localStorage:", err);
    return {};
  }
};

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
  productDetail?: {
    barcodes?: { id: number; code: string; productDetailId: number }[];
  };
};

const SellPage: React.FC = () => {
  const toast = useToastify();
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
  const [openBarcodeModal, setOpenBarcodeModal] = useState(false);
  const [scannedBarcodes, setScannedBarcodes] = useState<
    Record<string, { itemId: string; barcode: string }[]>
  >(() => loadScannedBarcodesFromLocalStorage());

  // Đồng bộ scannedBarcodes với localStorage mỗi khi thay đổi
  useEffect(() => {
    console.log("Đồng bộ scannedBarcodes với localStorage:", scannedBarcodes);
    saveScannedBarcodesToLocalStorage(scannedBarcodes);
  }, [scannedBarcodes]);

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
        toast.error("Lỗi khi tải danh sách đơn hàng!");
      }
    };
    fetchCarts();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await productApi.getAll({ pageNumber: 1, pageSize: 20 });
        setProducts(res.items);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
        toast.error("Lỗi khi tải danh sách sản phẩm!");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (tabs[currentTab]) {
      console.log("Tải giỏ hàng cho tab:", tabs[currentTab]);
      loadCart(tabs[currentTab].id);
    }
  }, [currentTab, tabs]);

  const loadCart = async (cartId: string) => {
    try {
      const res = await cartApi.getCartById(cartId, 1, 50);
      const loadedItems: OrderItem[] =
        res.data.data?.items?.map((it: any) => ({
          id: it.id,
          quantity: it.quantity,
          price: it.productDetail?.price || 0,
          discount: 0,
          productDetailId: it.productDetail?.id || 0,
          product: {
            id: it.productDetail?.product?.id || 0,
            name: it.productDetail?.product?.name || "Không xác định",
            stock: it.productDetail?.quantity || 0,
            image: it.productDetail?.image?.url || "/no-image.png",
          },
          productDetail: it.productDetail
            ? {
                ...it.productDetail,
                barcodes: Array.isArray(it.productDetail.barcodes)
                  ? it.productDetail.barcodes
                  : [],
              }
            : undefined,
        })) || [];
      setItems(loadedItems);
      console.log(
        "Giữ nguyên scannedBarcodes từ localStorage:",
        scannedBarcodes
      );
    } catch (err) {
      console.error("Lỗi load giỏ hàng:", err);
      toast.error("Lỗi khi tải giỏ hàng!");
    }
  };

  const handleChangeTab = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleAddTab = async () => {
    try {
      const res = await cartApi.createCart();
      console.log("Tạo giỏ hàng mới:", res.data);
      const newTab: CartTab = {
        id: res.data.data.id,
        name: `Đơn hàng ${tabs.length + 1}`,
      };
      const newTabs = [...tabs, newTab];
      const renumbered = newTabs.map((t, i) => ({
        id: t.id,
        name: `Đơn hàng ${i + 1}`,
      }));
      setTabs(renumbered);
      setCurrentTab(renumbered.length - 1);
      toast.success("Tạo đơn hàng mới thành công!");
    } catch (err) {
      console.error("Lỗi tạo giỏ hàng mới:", err);
      toast.error("Lỗi khi tạo đơn hàng mới!");
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
      const renumbered = newTabs.map((t, i) => ({
        id: t.id,
        name: `Đơn hàng ${i + 1}`,
      }));
      setTabs(renumbered);
      setScannedBarcodes((prev) => {
        const newBarcodes = { ...prev };
        delete newBarcodes[cartId];
        console.log("Cập nhật scannedBarcodes sau khi xóa:", newBarcodes);
        saveScannedBarcodesToLocalStorage(newBarcodes);
        return newBarcodes;
      });
      if (renumbered.length > 0) {
        const nextIndex = Math.max(
          0,
          Math.min(tabToDelete, renumbered.length - 1)
        );
        setCurrentTab(nextIndex);
        await loadCart(renumbered[nextIndex].id);
      } else {
        setCurrentTab(0);
        setItems([]);
        localStorage.removeItem("scannedBarcodes");
        console.log("Đã xóa scannedBarcodes khỏi localStorage");
      }
      toast.success("Xóa đơn hàng thành công!");
    } catch (err) {
      console.error("Lỗi xóa đơn hàng:", err);
      toast.error("Xóa đơn hàng thất bại!");
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
      await loadCart(cartId);
      toast.success("Thêm sản phẩm thành công!");
    } catch (err) {
      console.error("Lỗi thêm sản phẩm:", err);
      toast.error("Lỗi khi thêm sản phẩm!");
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
            {/* <ProductSearchBox
              onSelectProduct={(product) => setSelectedProduct(product)}
            /> */}
            {tabs.length > 0 && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenBarcodeModal(true)}
                startIcon={<QrCodeScanner />}
                sx={{ ml: 2, fontWeight: 600, boxShadow: "none" }}
              >
                Quét Barcode
              </Button>
            )}
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
                        <Typography fontWeight={600}>
                          {item.quantity}
                        </Typography>
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
                            if (!cartId) {
                              toast.error("Không tìm thấy giỏ hàng!");
                              return;
                            }
                            try {
                              const response = await cartApi.deleteCartItems(
                                cartId,
                                [item.id]
                              );
                              const deletedItemId = response.data.data[0];
                              setScannedBarcodes((prev) => {
                                const newBarcodes = { ...prev };
                                newBarcodes[cartId] = (
                                  newBarcodes[cartId] || []
                                ).filter(
                                  (entry) => entry.itemId !== deletedItemId
                                );
                                if (newBarcodes[cartId]?.length === 0) {
                                  delete newBarcodes[cartId];
                                }
                                console.log(
                                  "Cập nhật scannedBarcodes sau khi xóa:",
                                  newBarcodes
                                );
                                saveScannedBarcodesToLocalStorage(newBarcodes);
                                return newBarcodes;
                              });
                              await loadCart(cartId);
                              toast.success(
                                "Xóa sản phẩm khỏi đơn hàng thành công!"
                              );
                            } catch (err: any) {
                              const msg =
                                err?.response?.data?.message ||
                                "Xóa sản phẩm khỏi đơn hàng thất bại!";
                              toast.error(msg);
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
      </Box>

      <Box
        display="flex"
        height="100vh"
        minWidth={340}
        bgcolor="#f8fafc"
        boxShadow={2}
      >
        <CheckoutSidebar
          cartId={tabs[currentTab]?.id}
          total={total}
          discount={totalDiscount}
          storeId={products?.[0]?.storeId}
          totalWeight={items.reduce(
            (s, it) => s + (it.productDetail?.weight || 0) * it.quantity,
            0
          )}
          cartItems={items}
          scannedBarcodes={scannedBarcodes}
          onOrderCreated={async (paidCartId: string) => {
            const idx = tabs.findIndex((t) => t.id === paidCartId);
            if (idx === -1) return;
            const newTabs = [...tabs];
            newTabs.splice(idx, 1);
            setTabs(newTabs);
            setScannedBarcodes((prev) => {
              const newBarcodes = { ...prev };
              delete newBarcodes[paidCartId];
              console.log(
                "Cập nhật scannedBarcodes sau khi thanh toán:",
                newBarcodes
              );
              saveScannedBarcodesToLocalStorage(newBarcodes);
              return newBarcodes;
            });
            if (newTabs.length > 0) {
              const nextIndex = Math.max(0, Math.min(idx, newTabs.length - 1));
              setCurrentTab(nextIndex);
              await loadCart(newTabs[nextIndex].id);
            } else {
              setCurrentTab(0);
              setItems([]);
              localStorage.removeItem("scannedBarcodes");
              console.log("Đã xóa scannedBarcodes khỏi localStorage");
            }
          }}
        />
      </Box>

      <ProductDetailDialog
        open={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(undefined)}
        onSelectDetail={async (detailId) => {
          await handleAddProduct(detailId);
          setSelectedProduct(undefined);
        }}
      />

      <BarcodeScanModal
        isOpen={openBarcodeModal}
        onClose={() => setOpenBarcodeModal(false)}
        cartId={tabs[currentTab]?.id || ""}
        cartItems={items}
        allScannedBarcodes={Object.values(scannedBarcodes).flatMap((entries) =>
          entries.map((entry) => entry.barcode)
        )}
        onAddItem={async () => {
          const cartId = tabs[currentTab]?.id;
          if (cartId) await loadCart(cartId);
        }}
        onBarcodeAdded={(barcode, itemId) => {
          setScannedBarcodes((prev) => {
            const currentCartId = tabs[currentTab]?.id || "";
            const updatedBarcodes = {
              ...prev,
              [currentCartId]: [
                ...(prev[currentCartId] || []),
                { itemId, barcode },
              ],
            };
            console.log("Cập nhật scannedBarcodes:", updatedBarcodes);
            return updatedBarcodes;
          });
        }}
      />

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
