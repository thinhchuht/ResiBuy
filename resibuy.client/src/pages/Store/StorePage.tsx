// StorePage.tsx
import React, { useState } from "react";
import {
  Box,
  CssBaseline,
  useTheme,
  useMediaQuery,
  Fab,
  Fade,
  Container,
  Paper,
  Breadcrumbs,
  Typography,
  Link,
  IconButton,
} from "@mui/material";
import {
  Menu as MenuIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import {
  Routes,
  Route,
  useParams,
  useLocation,
  Link as RouterLink,
} from "react-router-dom";
import Sidebar from "./Sidebar";
import Dashboard from "./Dashboard";
import ProductPage from "./ProductPage";
import Orders from "./Orders";
import CreateProduct from "./CreateProduct";
import UpdateProduct from "./UpdateProduct";
import VoucherPage from "./Voucher/VoucherPage";
import CreateVoucher from "./Voucher/CreateVoucher";
import UpdateVoucher from "./Voucher/UpdateVoucher";

// Interface cho route config
interface RouteConfig {
  title: string;
  icon: string;
  parent?: string; // Optional parent property
}

// Route configuration với breadcrumb info
const routeConfig: Record<string, RouteConfig> = {
  "": { title: "Tổng quan", icon: "🏠" },
  productPage: { title: "Sản phẩm", icon: "📦" },
  orders: { title: "Đơn hàng", icon: "📋" },
  "product-create": {
    title: "Thêm sản phẩm",
    icon: "➕",
    parent: "productPage",
  },
  "product-update": {
    title: "Cập nhật sản phẩm",
    icon: "✏️",
    parent: "productPage",
  },
  vouchers: { title: "Voucher", icon: "🎟️" },
  "voucher-create": { title: "Thêm voucher", icon: "➕", parent: "vouchers" },
  "voucher-update": {
    title: "Cập nhật voucher",
    icon: "✏️",
    parent: "vouchers",
  },
};

// Scroll to top button component
const ScrollToTop: React.FC = () => {
  const [show, setShow] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Fade in={show}>
      <Fab
        color="primary"
        size="small"
        onClick={handleScrollToTop}
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <KeyboardArrowUpIcon />
      </Fab>
    </Fade>
  );
};

// Breadcrumb component
const PageBreadcrumbs: React.FC<{ storeId: string }> = ({ storeId }) => {
  const location = useLocation();

  // Parse current path to get route segments
  const pathSegments = location.pathname
    .replace(`/store/${storeId}`, "")
    .split("/")
    .filter(Boolean);

  const currentRoute = pathSegments[0] || "";
  const currentConfig = routeConfig[currentRoute];

  if (!currentConfig) return null;

  const breadcrumbItems = [
    {
      title: "Cửa hàng",
      icon: "🏪",
      path: `/store/${storeId}`,
    },
  ];

  // Add parent route if exists
  if (currentConfig.parent) {
    const parentConfig = routeConfig[currentConfig.parent];
    if (parentConfig) {
      breadcrumbItems.push({
        title: parentConfig.title,
        icon: parentConfig.icon,
        path: `/store/${storeId}/${currentConfig.parent}`,
      });
    }
  }

  // Add current route
  breadcrumbItems.push({
    title: currentConfig.title,
    icon: currentConfig.icon,
    path: location.pathname,
  });

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        borderRadius: 2,
      }}
    >
      <Breadcrumbs separator="›" sx={{ color: "text.primary" }}>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return isLast ? (
            <Box
              key={item.path}
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <span>{item.icon}</span>
              <Typography color="text.primary" fontWeight="medium">
                {item.title}
              </Typography>
            </Box>
          ) : (
            <Link
              key={item.path}
              component={RouterLink}
              to={item.path}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                textDecoration: "none",
                color: "text.secondary",
                "&:hover": {
                  color: "primary.main",
                },
              }}
            >
              <span>{item.icon}</span>
              <Typography>{item.title}</Typography>
            </Link>
          );
        })}
      </Breadcrumbs>
    </Paper>
  );
};

const StorePage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  if (!storeId) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h5" color="error" gutterBottom>
            Lỗi: Không tìm thấy ID cửa hàng
          </Typography>
          <Typography color="text.secondary">
            Vui lòng kiểm tra lại đường dẫn
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* Mobile menu button */}
      {isMobile && (
        <IconButton
          color="primary"
          onClick={handleDrawerToggle}
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 1300,
            backgroundColor: "background.paper",
            boxShadow: 2,
            "&:hover": {
              backgroundColor: "background.paper",
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* Sidebar */}
      <Sidebar
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerClose}
        variant={isMobile ? "temporary" : "permanent"}
        width={280}
      />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
          transition: theme.transitions.create(["margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          ...(isMobile && {
            width: "100%",
          }),
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            pt: isMobile ? 8 : 3,
            pb: 3,
            px: { xs: 2, sm: 3 },
          }}
        >
          {/* Breadcrumbs */}
          <PageBreadcrumbs storeId={storeId} />

          {/* Page content */}
          <Box
            sx={{
              minHeight: "calc(100vh - 200px)",
              "& > *": {
                animation: "fadeInUp 0.6s ease-out",
              },
              "@keyframes fadeInUp": {
                "0%": {
                  opacity: 0,
                  transform: "translateY(30px)",
                },
                "100%": {
                  opacity: 1,
                  transform: "translateY(0)",
                },
              },
            }}
          >
            <Routes>
              <Route path="" element={<Dashboard />} />
              <Route path="productPage" element={<ProductPage />} />
              <Route path="orders" element={<Orders />} />
              <Route path="product-create" element={<CreateProduct />} />
              <Route path="product-update/:id" element={<UpdateProduct />} />
              <Route path="vouchers" element={<VoucherPage />} />
              <Route path="voucher-create" element={<CreateVoucher />} />
              <Route
                path="voucher-update/:voucherId"
                element={<UpdateVoucher />}
              />

              {/* 404 Route */}
              <Route
                path="*"
                element={
                  <Paper
                    sx={{
                      p: 4,
                      textAlign: "center",
                      background:
                        "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
                    }}
                  >
                    <Typography variant="h4" gutterBottom>
                      🚫 Trang không tồn tại
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      gutterBottom
                    >
                      Trang bạn đang tìm kiếm không tồn tại hoặc đã được di
                      chuyển.
                    </Typography>
                    <Link
                      component={RouterLink}
                      to={`/store/${storeId}`}
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 2,
                        textDecoration: "none",
                        color: "primary.main",
                        fontWeight: "medium",
                      }}
                    >
                      <HomeIcon />
                      Quay về trang chủ
                    </Link>
                  </Paper>
                }
              />
            </Routes>
          </Box>
        </Container>

        {/* Scroll to top button */}
        <ScrollToTop />
      </Box>
    </Box>
  );
};

export default StorePage;
