// StorePage.tsx
import { Box } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import { menuItems } from "./menuItems";
import Dashboard from "./Dashboard";
import Products from "./Products";
import Orders from "./Orders";
import CreateProduct from "./CreateProduct";
import UpdateProduct from "./UpdateProduct";

const StorePage: React.FC = () => {
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar menuItems={menuItems} />

      {/* Content bên phải */}
      <Box sx={{ flex: 1, p: 2 }}>
        <Routes>
          <Route path="" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="create" element={<CreateProduct />} />
          <Route path="update/:id" element={<UpdateProduct />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default StorePage;
