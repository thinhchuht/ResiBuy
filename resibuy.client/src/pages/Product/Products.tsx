import { Container, Box } from "@mui/material";
import { useEffect, useState, useCallback } from "react";
import { Visibility, Store } from "@mui/icons-material";
import { useToastify } from "../../hooks/useToastify";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Category, Product } from "../../types/models";
import Carousel from "../../animations/Carousel";
import { fakeEventData } from "../../fakeData/fakeEventData";
import ProductDetail from "./ProductDetail/ProductDetail";
import ProductEmptySection from "./ProductEmptySection";
import SortBarSection from "./SortBarSection";
import ProductGridSection from "./ProductGridSection";
import ProductFilterSection from "./ProductFilterSection";
import productApi from "../../api/product.api";
import categoryApi from "../../api/category.api";
import Pagination from "@mui/material/Pagination";

const getProductMinPrice = (product: Product) => {
  if (!product.productDetails || product.productDetails.length === 0) return 0;
  return Math.min(...product.productDetails.map((pd) => pd.price));
};

const Products = () => {
  const navigate = useNavigate();
  const toast = useToastify();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("id");
  const categoryId = searchParams.get("categoryId");
  const storeId = searchParams.get("storeId");
  const searchKeyword = searchParams.get("search") || "";
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [total, setTotal] = useState(0);

  const fetchCategoryById = useCallback(async (id: string) => {
    try {
      const res = await categoryApi.getById(id);
      if (res.data) {
        setSelectedCategory(res.data);
      }
    } catch (error) {
      console.error("Error fetching category:", error);
      setSelectedCategory(null);
    }
  }, []);

  useEffect(() => {
    if (categoryId) {
      fetchCategoryById(categoryId);
    } else {
      setSelectedCategory(null);
    }
  }, [categoryId, fetchCategoryById]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await productApi.getAll({
          pageNumber: page,
          pageSize,
          categoryId: selectedCategory?.id || undefined,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          storeId: storeId || undefined,
          sortBy: sortBy === "price_asc" ? "price" : sortBy === "price_desc" ? "price" : sortBy === "popular" ? "sold" : "createdAt",
          sortDirection: sortBy === "price_asc" ? "asc" : sortBy === "price_desc" ? "desc" : sortBy === "popular" ? "desc" : "desc",
          search: searchKeyword || undefined,
        });
        setProducts(res.items || []);
        setTotal(res.totalCount || 0);
      } catch {
        toast.error("Không thể tải sản phẩm");
      }
    };
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, selectedCategory, priceRange, storeId, sortBy, searchKeyword]);



  const handleQuickView = (product: Product) => {
    setSelectedCategory(null);
    setSortBy("newest");
    setPriceRange([0, 50000000]);
    setPage(1);
    setTotal(0);
    setProducts([]);
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

  const handleCategoryChange = (category: Category | null) => {
    setSelectedCategory(category);
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

  const handleResetState = () => {
    setSelectedCategory(null);
    setSortBy("newest");
    setPriceRange([0, 50000000]);
    setPage(1);
    setTotal(0);
    setProducts([]);
  };

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
            {filteredProducts.length > 0 ? <ProductGridSection filteredProducts={filteredProducts} productActions={productActions} onResetState={handleResetState} /> : <ProductEmptySection />}
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
