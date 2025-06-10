import { Container, Box } from "@mui/material";
import { useState } from "react";
import { fakeProducts } from "../../fakeData/fakeProductData";
import { fakeCategories } from "../../fakeData/fakeCategoryData";
import { ShoppingCart, Visibility, Store } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { useToastify } from "../../hooks/useToastify";
import { useNavigate } from "react-router-dom";
import type { Product } from "../../types/models";
import ProductFilter from "./ProductFilter";
import SortBar from "./SortBar";
import ProductGrid from "./ProductGrid";
import ProductEmpty from "./ProductEmpty";

const Products = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToastify();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 50000000]);

  const handleAddToCart = (product: Product) => {
    if (user) {
      toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
    } else {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      navigate("/login");
    }
  };

  const handleQuickView = (product: Product) => {
    alert(`Xem nhanh: ${product.name}`);
  };

  const productActions = [
    {
      icon: <ShoppingCart sx={{ color: "#FF6B6B", fontSize: 22 }} />,
      onClick: handleAddToCart,
      label: "Thêm vào giỏ",
    },
    {
      icon: <Visibility sx={{ color: "#FF6B6B", fontSize: 22 }} />,
      onClick: handleQuickView,
      label: "Xem nhanh",
    },
    {
      icon: <Store sx={{ color: "#FF6B6B", fontSize: 22 }} />,
      onClick: (product: Product) => navigate(`/store/${product.storeId}`),
      label: "Ghé thăm cửa hàng",
    },
  ];

  let filteredProducts = [...fakeProducts];
  if (selectedCategory !== "all") {
    filteredProducts = filteredProducts.filter((product) => product.categoryId === selectedCategory);
  }
  filteredProducts = filteredProducts.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1]);
  switch (sortBy) {
    case "price_asc":
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case "price_desc":
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case "popular":
      filteredProducts.sort((a, b) => b.sold - a.sold);
      break;
    default:
      filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", gap: 3 }}>
        <Box sx={{ width: { xs: "100%", md: "25%" } }}>
          <ProductFilter
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            fakeCategories={fakeCategories}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <SortBar selectedCategory={selectedCategory} sortBy={sortBy} setSortBy={setSortBy} fakeCategories={fakeCategories} />
          {filteredProducts.length > 0 ? <ProductGrid filteredProducts={filteredProducts} productActions={productActions} /> : <ProductEmpty />}
        </Box>
      </Box>
    </Container>
  );
};

export default Products;
