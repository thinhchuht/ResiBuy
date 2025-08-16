import { Container, Box, Typography, Button } from "@mui/material";
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [total, setTotal] = useState(0);
  
  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getAll(true);
        setCategories(res.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

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
          IsGettingCategory: true,
          isNotGetOutOfStock : true
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

  if (categories.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          p: { xs: 3, sm: 4 },
          bgcolor: 'background.paper',
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: 'divider',
          maxWidth: 600,
          mx: 'auto',
          position: 'relative',
          overflow: 'hidden',
          '&:before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'linear-gradient(90deg, #FF6B6B 0%, #FF8E53 100%)',
          }
        }}>
          <Box sx={{ 
            width: 80, 
            height: 80, 
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            bgcolor: 'rgba(255, 107, 107, 0.1)'
          }}>
            <Box component="span" sx={{ fontSize: 40, color: 'primary.main' }}>📦</Box>
          </Box>
          
          <Typography variant="h5" sx={{ 
            color: 'text.primary',
            fontWeight: 700,
            mb: 2,
            fontSize: { xs: '1.5rem', sm: '1.75rem' }
          }}>
            Danh mục chưa sẵn sàng
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ 
            mb: 4,
            maxWidth: '80%',
            mx: 'auto',
            lineHeight: 1.6
          }}>
            Hiện chưa có danh mục sản phẩm nào để hiển thị. Vui lòng thử lại sau hoặc quay về trang chủ.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button 
              variant="contained"
              color="primary"
              onClick={() => window.location.reload()}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                minWidth: 140,
                boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(255, 107, 107, 0.4)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Tải lại trang
            </Button>
            
            <Button 
              variant="outlined"
              color="primary"
              onClick={() => navigate('/')}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                minWidth: 140,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              Về trang chủ
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Box>
      <Carousel items={fakeEventData} />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", gap: 3 }}>
          <Box sx={{ width: { xs: "100%", md: "25%" } }}>
            <ProductFilterSection
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={handleCategoryChange}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              storeId={storeId || undefined}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <SortBarSection 
              categories={categories}
              selectedCategory={selectedCategory} 
              sortBy={sortBy} 
              setSortBy={setSortBy} 
            />
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
