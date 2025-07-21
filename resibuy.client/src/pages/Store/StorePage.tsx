// StorePage.tsx
import { Box } from "@mui/material";
import { Routes, Route, useParams } from "react-router-dom";
import Sidebar from "./Sidebar";
import { menuItems } from "./menuItems";
import Dashboard from "./Dashboard";
import ProductPage from "./ProductPage";
import Orders from "./Orders";
import CreateProduct from "./CreateProduct";
import UpdateProduct from "./UpdateProduct";
import OrderNotifier from "./OrderNotifier";
import VoucherPage from "./Voucher/VoucherPage";
import CreateVoucher from "./Voucher/CreateVoucher";

const StorePage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>(); // lấy param

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        p: 2,
        bgcolor: "#c9b6b2",
      }}
    >
      <OrderNotifier />
      <Sidebar menuItems={menuItems(storeId!)} />

      {/* Content bên phải */}
      <Box sx={{ flex: 1, p: 2 }}>
        <Routes>
          <Route path="" element={<Dashboard />} />
          <Route path="productPage" element={<ProductPage />} />

          <Route path="orders" element={<Orders />} />
          <Route path="product-create" element={<CreateProduct />} />
          <Route path="product-update/:id" element={<UpdateProduct />} />
          <Route path="vouchers" element={<VoucherPage />} />
          <Route path="voucher-create" element={<CreateVoucher />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default StorePage;
