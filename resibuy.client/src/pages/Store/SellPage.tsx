import React, { useState } from "react";
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
} from "@mui/material";
import { Search, Close, Add } from "@mui/icons-material";

type Product = {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
};

type OrderItem = {
  product: Product;
  quantity: number;
  discount: number;
};



const sampleProducts: Product[] = [
  {
    id: 1,
    name: "kem duong tay-m",
    sku: "kemdt-m_2",
    price: 95000,
    stock: 500,
  },
  {
    id: 2,
    name: "kem duong tay-s",
    sku: "kemdt-s_0",
    price: 96000,
    stock: 300,
  },
  { id: 3, name: "bun rieu Ngu-Vua", sku: "brnv", price: 25000, stock: 256 },
  { id: 4, name: "bun rieu Nho", sku: "brn", price: 25000, stock: 98 },
];

const PosPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState<OrderItem[]>([]);

  const handleAddProduct = (product: Product) => {
    const index = items.findIndex((i) => i.product.id === product.id);
    if (index >= 0) {
      const newItems = [...items];
      newItems[index].quantity += 1;
      setItems(newItems);
    } else {
      setItems([...items, { product, quantity: 1, discount: 0 }]);
    }
  };

  const handleRemoveItem = (id: number) => {
    setItems(items.filter((i) => i.product.id !== id));
  };

  const total = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity * (1 - i.discount / 100),
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
            <TextField
              placeholder="Tìm tên/SKU/mã sản phẩm"
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ mr: 2, width: 300 }}
            />
          </Toolbar>
        </AppBar>

        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Đơn hàng 1" />
          <Tab label="Đơn hàng 2" />
          <Tab label="Đơn hàng 3" />
          <IconButton>
            <Add />
          </IconButton>
          <IconButton>
            <Close />
          </IconButton>
        </Tabs>

        {/* Order table */}
        <Box flex={1} overflow="auto" p={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên/MSP</TableCell>
                <TableCell>Số lượng</TableCell>
                <TableCell>Đơn giá (VND)</TableCell>
                <TableCell>Giảm giá</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.product.id}>
                  <TableCell>
                    {item.product.name}
                    <br />
                    <Typography variant="caption">
                      SKU: {item.product.sku}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.product.price.toLocaleString()}</TableCell>
                  <TableCell>{item.discount}%</TableCell>
                  <TableCell>
                    {(item.product.price * item.quantity).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => handleRemoveItem(item.product.id)}
                    >
                      <Close />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>

        {/* Product grid */}
        <Box p={2} borderTop="1px solid #ddd">
          <Typography variant="subtitle1" gutterBottom>
            Chọn nhanh sản phẩm
          </Typography>
          <Grid container spacing={2}>
            {sampleProducts.map((p) => (
              <Grid item xs={2} key={p.id}>
                <Card
                  onClick={() => handleAddProduct(p)}
                  sx={{ cursor: "pointer", textAlign: "center" }}
                >
                  <CardContent>
                    <Box
                      sx={{
                        width: "100%",
                        height: 60,
                        bgcolor: "#f5f5f5",
                        mb: 1,
                      }}
                    />
                    <Typography variant="body2" fontWeight="bold">
                      {p.price.toLocaleString()} đ
                    </Typography>
                    <Typography variant="body2">{p.name}</Typography>
                    <Typography variant="caption">SL: {p.stock}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>

      {/* Sidebar */}
      <Box flex={1} p={2} component={Paper} elevation={2}>
        <Typography variant="h6">Khách lẻ</Typography>
        <Divider sx={{ my: 1 }} />

        <Typography>
          Tiền hàng (2 sản phẩm): {total.toLocaleString()} đ
        </Typography>
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
          Xác nhận thanh toán
        </Button>
      </Box>
    </Box>
  );
};

export default PosPage;
