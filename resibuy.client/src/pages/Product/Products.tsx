import { Container, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { Visibility, Store } from "@mui/icons-material";
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
import productApi from "../../api/product.api";
import Pagination from '@mui/material/Pagination';

const getProductMinPrice = (product: Product) => {
  if (!product.productDetails || product.productDetails.length === 0) return 0;
  return Math.min(...product.productDetails.map(pd => pd.price));
};

const Products = () => {
  const navigate = useNavigate();
  const toast = useToastify();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("id");
  const categoryId = searchParams.get("categoryId");
  const storeId = searchParams.get("storeId");
  const [selectedCategory, setSelectedCategory] = useState(categoryId || null);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let res;
        if (selectedCategory) {
          res = await productApi.getByCategoryId(selectedCategory, page, pageSize);
        } else {
          res = await productApi.getAll(page, pageSize);
        }
        setProducts(res.items || []);
        setTotal(res.totalCount || 0);
      } catch {
        toast.error("Không thể tải sản phẩm");
      } 
    };
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, selectedCategory]);

  const handleQuickView = (product: Product) => {
    navigate(`/products?id=${product.id}`);
  };

  const productActions = [
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

  const handleCategoryChange = (catId: string | null) => {
    setSelectedCategory(catId);
    setPage(1);
  };

  let filteredProducts = [...products];
  if (storeId) {
    filteredProducts = filteredProducts.filter((product) => product.storeId === storeId);
  }
  filteredProducts = filteredProducts.filter((product) => {
    const minPrice = getProductMinPrice(product);
    return minPrice >= priceRange[0] && minPrice <= priceRange[1];
  });
  switch (sortBy) {
    case "price_asc":
      filteredProducts.sort((a, b) => getProductMinPrice(a) - getProductMinPrice(b));
      break;
    case "price_desc":
      filteredProducts.sort((a, b) => getProductMinPrice(b) - getProductMinPrice(a));
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
              setSelectedCategory={handleCategoryChange}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              storeId={storeId || undefined}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <SortBarSection selectedCategory={selectedCategory} sortBy={sortBy} setSortBy={setSortBy} />
            {filteredProducts.length > 0 ? (
              <ProductGridSection filteredProducts={filteredProducts} productActions={productActions} />
            ) : (
              <ProductEmptySection />
            )}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Pagination
                count={Math.ceil(total / pageSize)}
                page={page}
                onChange={(_, value) => setPage(value)}
                siblingCount={1}
                boundaryCount={1}
                shape="rounded"
                color="primary"
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Products;
