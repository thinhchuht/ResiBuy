import { Container, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { fakeProducts } from "../../fakeData/fakeProductData";
import { fakeCategories } from "../../fakeData/fakeCategoryData";
import { ShoppingCart, Visibility, Store } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { useToastify } from "../../hooks/useToastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Product } from "../../types/models";
import Carousel from "../../animations/Carousel";
import { fakeEventData } from "../../fakeData/fakeEventData";
import ProductDetail from "./ProductDetail/ProductDetail";
import ProductEmptySection from "./ProductEmptySection";
import SortBarSection from "./SortBarSection";
import ProductGridSection from "./ProductGridSection";
import ProductFilterSection from "./ProductFilterSection";
import { getMinPrice } from "../../utils/priceUtils";

const Products = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToastify();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("id");
  const categoryId = searchParams.get("categoryId");
  const storeId = searchParams.get("storeId");
  const [selectedCategory, setSelectedCategory] = useState(categoryId || "all");
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 50000000]);

  useEffect(() => {
    setSelectedCategory(categoryId || "all");
  }, [categoryId]);

  const handleAddToCart = (product: Product) => {
    if (user) {
      toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
    } else {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      navigate("/login");
    }
  };

  const handleQuickView = (product: Product) => {
    navigate(`/products?id=${product.id}`);
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
  if (storeId) {
    filteredProducts = filteredProducts.filter((product) => product.storeId === storeId);
  }
  if (selectedCategory !== "all") {
    filteredProducts = filteredProducts.filter((product) => product.categoryId === selectedCategory);
  }
  filteredProducts = filteredProducts.filter((product) => {
    const minPrice = getMinPrice(product);
    return minPrice >= priceRange[0] && minPrice <= priceRange[1];
  });
  switch (sortBy) {
    case "price_asc":
      filteredProducts.sort((a, b) => getMinPrice(a) - getMinPrice(b));
      break;
    case "price_desc":
      filteredProducts.sort((a, b) => getMinPrice(b) - getMinPrice(a));
      break;
    case "popular":
      filteredProducts.sort((a, b) => b.sold - a.sold);
      break;
    default:
      filteredProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  if (productId) {
    return <ProductDetail />;
  }

  return (
    <Box>
      <Carousel items={fakeEventData} />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", gap: 3 }}>
          <Box sx={{ width: { xs: "100%", md: "25%" } }}>
            <ProductFilterSection
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              fakeCategories={fakeCategories}
              storeId={storeId || undefined}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <SortBarSection selectedCategory={selectedCategory} sortBy={sortBy} setSortBy={setSortBy} fakeCategories={fakeCategories} />
            {filteredProducts.length > 0 ? <ProductGridSection filteredProducts={filteredProducts} productActions={productActions} /> : <ProductEmptySection />}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Products;
