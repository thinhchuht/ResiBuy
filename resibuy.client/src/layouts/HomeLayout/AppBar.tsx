import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Button,
  ListItemIcon,
  ListItemText,
  Popover,
  Badge,
} from "@mui/material";
import {
  Login,
  Logout,
  Person,
  Settings,
  Home,
  ShoppingCart,
  Receipt,
  KeyboardArrowDown,
  Category,
  Notifications,
  Dashboard,
  Store,
  LocalShipping,
  Storefront,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import SearchBase from "../../components/SearchBase";
import logo from "../../assets/Images/Logo.png";
import cartApi from "../../api/cart.api";
import { HubEventType, useEventHub, type HubEventHandler } from "../../hooks/useEventHub";
import type { OrderStatusChangedData } from "../../types/hubData";
import notificationApi from "../../api/notification.api";

interface Notification {
  id: string | number;
  title: string;
  message: string;
  time?: string;
  isRead?: boolean;
}

interface NotificationApiItem {
  id: string;
  eventName: string;
  createdAt: string;
  isRead: boolean;
  [key: string]: unknown;
}

function notifiConvert(item: NotificationApiItem): Notification {
  const formattedTime = new Date(item.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const formattedDate = new Date(item.createdAt).toLocaleDateString("vi-VN");
  let title = "";
  let message = "";

  switch (item.eventName) {
    case "OrderCreated":
      title = "Đơn hàng mới";
      message = `Đơn hàng #${item.orderId ?? item.id} đã được tạo`;
      break;
    case "OrderStatusChanged":
      title =
        item.orderStatus === "Processing"
          ? "Đơn hàng đã được xử lý"
          : item.orderStatus === "Shipped"
          ? "Đơn hàng đang được giao"
          : item.orderStatus === "Delivered"
          ? "Đơn hàng đã được giao"
          : "Đơn hàng đã bị hủy";
      message = `Đơn hàng #${item.orderId ?? item.id} ` +
        (item.orderStatus === "Processing"
          ? "đã được xử lý"
          : item.orderStatus === "Shipped"
          ? "đang được giao"
          : item.orderStatus === "Delivered"
          ? "đã được giao"
          : "đã bị hủy");
      break;
    default:
      title = "Thông báo";
      message = item.eventName;
  }

  return {
    id: item.id,
    title,
    message,
    time: `${formattedTime} ${formattedDate}`,
    isRead: item.isRead,
  };
}

const AppBar: React.FC = () => {
  const { logout } = useAuth();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [homeAnchorEl, setHomeAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [storeMenuAnchorEl, setStoreMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 3;
  const notificationListRef = useRef<HTMLDivElement>(null);

  const fetchItemCount = useCallback(async () => {
    if (user) {
      const response = await cartApi.countItems(user?.cartId);
      setCartItems(response.data.data);
    }
  }, [user]);

  const fetchUnreadCount = useCallback(async () => {
    if (user) {
      try {
        const count = await notificationApi.getUnreadCountNotification(user.id);
        setUnreadCount(count);
      } catch {
        setUnreadCount(0);
      }
    }
  }, [user]);

  const fetchNotifications = useCallback(async (page = 1) => {
    if (user) {
      setLoadingNotifications(true);
      try {
        const data = await notificationApi.getByUserId(user.id, page, pageSize);
        if (page === 1) {
          setNotifications((data.items || []).map(notifiConvert));
        } else {
          setNotifications((prev) => [...prev, ...(data.items || []).map(notifiConvert)]);
        }
        setHasMore(page < data.totalPages);
      } catch {
        if (page === 1) setNotifications([]);
      } finally {
        setLoadingNotifications(false);
      }
    }
  }, [user]);

  const loadMore = () => {
    if (hasMore && !loadingNotifications) {
      const nextPage = pageNumber + 1;
      setPageNumber(nextPage);
      fetchNotifications(nextPage);
    }
  };

  useEffect(() => {
    fetchItemCount();
    fetchUnreadCount();
  }, [fetchItemCount, fetchUnreadCount]);

  const handleCartItemAdded = useCallback(() => {
    fetchItemCount();
  }, [fetchItemCount]);

  const handleOrderCreated = useCallback(
    (data: OrderStatusChangedData) => {
      console.log("hihehah súuus");
      fetchItemCount();
      const formattedTime = new Date(data.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      const formattedDate = new Date(data.createdAt).toLocaleDateString("vi-VN");
      console.log(formattedDate, formattedTime);
      const newNotifications = {
        id: data.id,
        title: "Đơn hàng mới",
        message: `Đơn hàng #${data.id} đã được tạo`,
        time: `${formattedTime} ${formattedDate}`,
        isRead : false
      };
      console.log("hhihi");
      console.log(newNotifications);
      setNotifications((prev) => [newNotifications, ...prev]);
      fetchUnreadCount();
    },
    [setNotifications, fetchItemCount, fetchUnreadCount]
  );

  const handleOrderStatusChanged = useCallback((data: OrderStatusChangedData) => {
    console.log("hihehah");
    const formattedTime = new Date(data.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    const formattedDate = new Date(data.createdAt).toLocaleDateString("vi-VN");
    const newNotifications = {
      id: `order-${data.id}-${data.orderStatus}`,
      title:
        data.orderStatus === "Processing"
          ? "Đơn hàng đã được xử lý"
          : data.orderStatus === "Shipped"
          ? "Đơn hàng đang được giao"
          : data.orderStatus === "Delivered"
          ? "Đơn hàng đã được giao"
          : "Đơn hàng đã bị hủy",
      message: `Đơn hàng #${data.id} ${
        data.orderStatus === "Processing" ? "đã được xử lý" : data.orderStatus === "Shipped" ? "đang được giao" : data.orderStatus === "Delivered" ? "đã được giao" : "đã bị hủy"
      }`,
      time: `${formattedTime} ${formattedDate}`,
      isRead : false
    };
    setNotifications((prev) => [newNotifications, ...prev]);
    fetchUnreadCount(); // cập nhật badge khi có notification mới
  }, [fetchUnreadCount]);

  const eventHandlers = useMemo(
    () => ({
      [HubEventType.CartItemAdded]: handleCartItemAdded,
      [HubEventType.OrderCreated]: handleOrderCreated,
      [HubEventType.OrderStatusChanged]: handleOrderStatusChanged,
    }),
    [handleCartItemAdded, handleOrderCreated, handleOrderStatusChanged]
  );

  useEventHub(eventHandlers as Partial<Record<HubEventType, HubEventHandler>>);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleSearch = () => {
    if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`);
    } else {
      navigate(`/products`);
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate("/login");
  };

  const handleHomeMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setHomeAnchorEl(event.currentTarget);
  };

  const handleHomeMenuClose = () => {
    setHomeAnchorEl(null);
  };

  const handleNavigation = (path: string, closeMenu: () => void) => {
    navigate(path);
    closeMenu();
  };

  const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
    setPageNumber(1);
    fetchNotifications(1);
  };

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };

  const handleStoreMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    if (user?.stores && Array.isArray(user.stores) && user.stores.length > 1) {
      setStoreMenuAnchorEl(event.currentTarget);
    } else {
      const storeId = Array.isArray(user?.stores) ? user.stores[0]?.id : user?.stores?.id;
      if (storeId) {
        navigate(`/store/${storeId}`);
        handleProfileMenuClose();
      }
    }
  };

  const handleStoreMenuClose = () => {
    setStoreMenuAnchorEl(null);
    handleProfileMenuClose();
  };

  const handleStoreSelect = (storeId: string) => {
    navigate(`/store/${storeId}`);
    setStoreMenuAnchorEl(null);
    handleProfileMenuClose();
  };

  const handleNotificationClick = async (notification: Notification) => {
    handleNotificationClose();
    if (notification.isRead === false && user) {
      try {
        await notificationApi.readNotification(notification.id as string, user.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
      } catch {
        // Xử lý lỗi nếu cần
      }
    }
  };

  return (
    <MuiAppBar
      position="fixed"
      elevation={3}
      sx={{
        paddingTop: "7px",
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(8px)",
        color: "#333",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        width: `100%`,
        ml: 0,
        transition: (theme) =>
          theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        borderBottom: "1px solid rgba(0,0,0,0.1)",
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
      }}>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Link to={"/"}>
            <img src={logo} alt="ResiBuy" style={{ width: "65px", height: "60px" }} />
          </Link>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}>
          <Box onMouseEnter={handleHomeMenuOpen} onMouseLeave={handleHomeMenuClose} sx={{ position: "relative" }}>
            <Button
              color="inherit"
              endIcon={<KeyboardArrowDown />}
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.04)",
                  color: "#EB5C60",
                  "& .MuiSvgIcon-root": {
                    color: "#EB5C60",
                  },
                },
                borderRadius: 2,
                transition: "all 0.2s ease-in-out",
              }}>
              <Link
                to="/"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  alignItems: "center",
                }}>
                <Home sx={{ mr: 1 }} />
                <span>Trang chủ</span>
              </Link>
            </Button>
            <Popover
              open={Boolean(homeAnchorEl)}
              anchorEl={homeAnchorEl}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: 2,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  minWidth: 200,
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background: "linear-gradient(90deg, #EB5C60 0%, #FF8E8E 100%)",
                  },
                },
              }}
              onClose={handleHomeMenuClose}
              disableRestoreFocus
              disableEnforceFocus
              disableAutoFocus
              sx={{
                pointerEvents: "none",
                "& .MuiPopover-paper": {
                  pointerEvents: "auto",
                },
              }}>
              <Box sx={{ p: 1.5, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                <Typography variant="subtitle2" sx={{ color: "text.secondary", fontWeight: 500 }}>
                  Điều hướng nhanh
                </Typography>
              </Box>
              <MenuItem
                onClick={() => handleNavigation("/", handleHomeMenuClose)}
                sx={{
                  py: 1.5,
                  px: 2,
                  gap: 1.5,
                  "&:hover": {
                    backgroundColor: "rgba(235, 92, 96, 0.08)",
                    "& .MuiListItemIcon-root": {
                      color: "#EB5C60",
                      transform: "scale(1.1)",
                    },
                    "& .MuiListItemText-primary": {
                      color: "#EB5C60",
                    },
                  },
                  transition: "all 0.2s ease-in-out",
                }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Home fontSize="small" sx={{ transition: "all 0.2s ease-in-out" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Trang chủ"
                  primaryTypographyProps={{
                    variant: "body2",
                    fontWeight: 500,
                  }}
                />
              </MenuItem>
              <MenuItem
                onClick={() => handleNavigation("/products", handleHomeMenuClose)}
                sx={{
                  py: 1.5,
                  px: 2,
                  gap: 1.5,
                  "&:hover": {
                    backgroundColor: "rgba(235, 92, 96, 0.08)",
                    "& .MuiListItemIcon-root": {
                      color: "#EB5C60",
                      transform: "scale(1.1)",
                    },
                    "& .MuiListItemText-primary": {
                      color: "#EB5C60",
                    },
                  },
                  transition: "all 0.2s ease-in-out",
                }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Category fontSize="small" sx={{ transition: "all 0.2s ease-in-out" }} />
                </ListItemIcon>
                <ListItemText
                  primary="Sản phẩm"
                  primaryTypographyProps={{
                    variant: "body2",
                    fontWeight: 500,
                  }}
                />
              </MenuItem>
            </Popover>
          </Box>

          {user && user.roles?.includes("CUSTOMER") && (
            <>
              <Button
                color="inherit"
                onClick={() => navigate("/cart")}
                sx={{
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.04)",
                    color: "#EB5C60",
                    "& .MuiSvgIcon-root": {
                      color: "#EB5C60",
                    },
                  },
                  borderRadius: 2,
                  transition: "all 0.2s ease-in-out",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}>
                <Box
                  sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                  }}>
                  <Badge
                    badgeContent={cartItems}
                    color="error"
                    overlap="circular"
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    sx={{
                      "& .MuiBadge-badge": {
                        minWidth: 18,
                        height: 18,
                        fontSize: 12,
                        padding: 0,
                        border: "2px solid #fff",
                        top: 2,
                        right: 2,
                      },
                    }}>
                    <ShoppingCart sx={{ mr: 0 }} />
                  </Badge>
                </Box>
                <span style={{ marginLeft: 4 }}>Giỏ hàng</span>
              </Button>

              <Button
                color="inherit"
                onClick={() => navigate("/orders")}
                sx={{
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.04)",
                    color: "#EB5C60",
                    "& .MuiSvgIcon-root": {
                      color: "#EB5C60",
                    },
                  },
                  borderRadius: 2,
                  transition: "all 0.2s ease-in-out",
                }}>
                <Receipt sx={{ mr: 1 }} />
                Đơn hàng
              </Button>
            </>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <SearchBase value={searchValue} onChange={handleSearchChange} onSearch={handleSearch} sx={{ width: "300px" }} inputSx={{ width: "100%" }} />
          {user && (
            <Tooltip title="Thông báo" >
              <IconButton
                color="inherit"
                onClick={handleNotificationOpen}
                sx={{
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: "rgba(235, 92, 96, 0.08)",
                    transform: "scale(1.05)",
                    "& .MuiSvgIcon-root": {
                      color: "#EB5C60",
                    },
                  },
                }}>
                <Badge badgeContent={unreadCount} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          {user ? (
            <Tooltip title="Tài khoản">
              <Avatar
                src={user?.avatar?.thumbUrl || undefined}
                sx={{
                  width: 36,
                  height: 36,
                  cursor: "pointer",
                  bgcolor: user?.avatar?.thumbUrl ? undefined : "#EB5C60",
                  color: user?.avatar?.thumbUrl ? undefined : "#fff",
                  fontWeight: 600,
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: "0 2px 8px rgba(235, 92, 96, 0.3)",
                  },
                }}
                onClick={handleProfileMenuOpen}>
                {!user?.avatar?.thumbUrl && <Person />}
              </Avatar>
            </Tooltip>
          ) : (
            <Tooltip title="Đăng nhập">
              <IconButton
                color="inherit"
                onClick={() => navigate("/login")}
                sx={{
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: "rgba(235, 92, 96, 0.08)",
                    transform: "scale(1.05)",
                  },
                }}>
                <Login sx={{ color: "red" }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          disableEnforceFocus
          disableAutoFocus
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              minWidth: 200,
              overflow: "hidden",
            },
          }}>
          <Box sx={{ p: 1.5, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
            <Typography variant="subtitle2" sx={{ color: "text.secondary", fontWeight: 500 }}>
              {user?.fullName}
            </Typography>
          </Box>
          {user?.roles?.includes("ADMIN") && (
            <MenuItem
              onClick={() => handleNavigation("/admin", handleProfileMenuClose)}
              sx={{
                py: 1.5,
                px: 2,
                gap: 1.5,
                "&:hover": {
                  backgroundColor: "rgba(235, 92, 96, 0.08)",
                  "& .MuiSvgIcon-root": {
                    color: "#EB5C60",
                    transform: "scale(1.1)",
                  },
                  "& .MuiTypography-root": {
                    color: "#EB5C60",
                  },
                },
                transition: "all 0.2s ease-in-out",
              }}>
              <Dashboard fontSize="small" sx={{ transition: "all 0.2s ease-in-out" }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Trang quản trị
              </Typography>
            </MenuItem>
          )}
          {user?.roles?.includes("SELLER") && (
            <MenuItem
              onClick={handleStoreMenuClick}
              sx={{
                py: 1.5,
                px: 2,
                gap: 1.5,
                "&:hover": {
                  backgroundColor: "rgba(235, 92, 96, 0.08)",
                  "& .MuiSvgIcon-root": {
                    color: "#EB5C60",
                    transform: "scale(1.1)",
                  },
                  "& .MuiTypography-root": {
                    color: "#EB5C60",
                  },
                },
                transition: "all 0.2s ease-in-out",
              }}>
              <Store fontSize="small" sx={{ transition: "all 0.2s ease-in-out" }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {Array.isArray(user?.stores) && user.stores.length === 1
                  ? user.stores[0]?.name
                  : !Array.isArray(user?.stores) && user?.stores?.name
                  ? user.stores.name
                  : "Cửa hàng của bạn"}
              </Typography>
            </MenuItem>
          )}
          {user?.roles?.includes("SHIPPER") && (
            <MenuItem
              onClick={() => handleNavigation("/shipper", handleProfileMenuClose)}
              sx={{
                py: 1.5,
                px: 2,
                gap: 1.5,
                "&:hover": {
                  backgroundColor: "rgba(235, 92, 96, 0.08)",
                  "& .MuiSvgIcon-root": {
                    color: "#EB5C60",
                    transform: "scale(1.1)",
                  },
                  "& .MuiTypography-root": {
                    color: "#EB5C60",
                  },
                },
                transition: "all 0.2s ease-in-out",
              }}>
              <LocalShipping fontSize="small" sx={{ transition: "all 0.2s ease-in-out" }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Trang giao hàng
              </Typography>
            </MenuItem>
          )}
          {user?.roles?.includes("CUSTOMER") && (
            <MenuItem
              onClick={() => handleNavigation("/", handleProfileMenuClose)}
              sx={{
                py: 1.5,
                px: 2,
                gap: 1.5,
                "&:hover": {
                  backgroundColor: "rgba(235, 92, 96, 0.08)",
                  "& .MuiSvgIcon-root": {
                    color: "#EB5C60",
                    transform: "scale(1.1)",
                  },
                  "& .MuiTypography-root": {
                    color: "#EB5C60",
                  },
                },
                transition: "all 0.2s ease-in-out",
              }}>
              <Storefront fontSize="small" sx={{ transition: "all 0.2s ease-in-out" }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Trang chủ
              </Typography>
            </MenuItem>
          )}
          {(user?.roles?.includes("ADMIN") || user?.roles?.includes("SELLER") || user?.roles?.includes("SHIPPER") || user?.roles?.includes("CUSTOMER")) && (
            <Divider sx={{ my: 0.5 }} />
          )}
          <MenuItem
            onClick={() => handleNavigation("/profile", handleProfileMenuClose)}
            sx={{
              py: 1.5,
              px: 2,
              gap: 1.5,
              "&:hover": {
                backgroundColor: "rgba(235, 92, 96, 0.08)",
                "& .MuiSvgIcon-root": {
                  color: "#EB5C60",
                  transform: "scale(1.1)",
                },
                "& .MuiTypography-root": {
                  color: "#EB5C60",
                },
              },
              transition: "all 0.2s ease-in-out",
            }}>
            <Person fontSize="small" sx={{ transition: "all 0.2s ease-in-out" }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Hồ sơ
            </Typography>
          </MenuItem>
          <MenuItem
            onClick={() => handleNavigation("/settings", handleProfileMenuClose)}
            sx={{
              py: 1.5,
              px: 2,
              gap: 1.5,
              "&:hover": {
                backgroundColor: "rgba(235, 92, 96, 0.08)",
                "& .MuiSvgIcon-root": {
                  color: "#EB5C60",
                  transform: "scale(1.1)",
                },
                "& .MuiTypography-root": {
                  color: "#EB5C60",
                },
              },
              transition: "all 0.2s ease-in-out",
            }}>
            <Settings fontSize="small" sx={{ transition: "all 0.2s ease-in-out" }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Cài đặt
            </Typography>
          </MenuItem>
          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.5,
              px: 2,
              gap: 1.5,
              color: "error.main",
              "&:hover": {
                backgroundColor: "rgba(235, 92, 96, 0.08)",
                "& .MuiSvgIcon-root": {
                  color: "#EB5C60",
                  transform: "scale(1.1)",
                },
                "& .MuiTypography-root": {
                  color: "#EB5C60",
                },
              },
              transition: "all 0.2s ease-in-out",
            }}>
            <Logout fontSize="small" sx={{ transition: "all 0.2s ease-in-out" }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Đăng xuất
            </Typography>
          </MenuItem>
        </Menu>

        <Popover
          open={Boolean(notificationAnchorEl)}
          anchorEl={notificationAnchorEl}
          onClose={handleNotificationClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              width: 320,
              maxHeight: 3250,
              overflowY: "auto",
            },
          }}>
          <Box sx={{ p: 2, borderBottom: "1px solid rgba(0,0,0,0.1)", display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Thông báo
            </Typography>
            {notifications.length > 0 && unreadCount > 0 && (
              <Button
                size="small"
                color="primary"
                sx={{ textTransform: 'none', fontWeight: 500, fontSize: 13, ml: 1, minWidth: 0, p: 0.5 }}
                onClick={async () => {
                  if (user) {
                    try {
                      await notificationApi.readAllNotification(user.id);
                      setNotifications((prev) => prev.map(n => ({ ...n, isRead: true })));
                      setUnreadCount(0);
                    } catch {
                      // Xử lý lỗi nếu cần
                    }
                  }
                }}
              >
                Đánh dấu đã đọc
              </Button>
            )}
          </Box>
          <Box
            ref={notificationListRef}
            sx={{ maxHeight: 210, overflowY: "auto" }}
            onScroll={() => {
              const el = notificationListRef.current;
              if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
                loadMore();
              }
            }}
          >
            {loadingNotifications && pageNumber === 1 ? (
              <Box sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Đang tải thông báo...
                </Typography>
              </Box>
            ) : notifications.length > 0 ? (
              <>
                {notifications.map((notification) => (
                  <MenuItem
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      py: 1.5,
                      px: 2,
                      backgroundColor: notification.isRead === false ? 'rgba(33,150,243,0.10)' : undefined,
                      borderBottom: '1px solid #e3e8ef',
                      '&:hover': {
                        backgroundColor: notification.isRead === false ? 'rgba(33,150,243,0.18)' : 'rgba(235, 92, 96, 0.08)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}>
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-end",
                          mb: 0.5,
                          gap: 2,
                        }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: notification.isRead === false ? 700 : 400,
                              wordBreak: "break-word",
                            }}>
                            {notification.title}
                          </Typography>
                          {notification.isRead === false && (
                            <Box
                              component="span"
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '50%',
                                bgcolor: '#1ecb4f',
                                display: 'inline-block',
                                ml: 0.5,
                              }}
                            />
                          )}
                        </Box>
                        {notification.time && (
                          <Typography
                            variant="caption"
                            sx={{
                              fontStyle: "italic",
                              color: "text.secondary",
                              whiteSpace: "nowrap",
                              fontWeight: 600,
                            }}>
                            {notification.time}
                          </Typography>
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ wordBreak: "break-word", whiteSpace: "break-spaces" }}>
                        {notification.message}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
                {loadingNotifications && pageNumber > 1 && (
                  <Box sx={{ p: 1, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Đang tải thêm...
                    </Typography>
                  </Box>
                )}
                {!hasMore && notifications.length > 0 && (
                  <Box sx={{ p: 1, textAlign: "center",  }}>
                    <Typography variant="body2" color="#676767" sx={{ fontWeight : 600, fontSize: '14px'}}>
                      Đã hiển thị tất cả thông báo
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <Box sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  Không có thông báo mới
                </Typography>
              </Box>
            )}
          </Box>
        </Popover>

        {/* Menu chọn store nếu có nhiều store */}
        <Menu
          anchorEl={storeMenuAnchorEl}
          open={Boolean(storeMenuAnchorEl)}
          onClose={handleStoreMenuClose}
          PaperProps={{
            sx: {
              mt: 1,
              borderRadius: 2,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              minWidth: 220,
              overflow: "hidden",
            },
          }}>
          {Array.isArray(user?.stores) &&
            user.stores.map((store) => (
              <MenuItem
                key={store.id}
                onClick={() => handleStoreSelect(store.id)}
                sx={{
                  py: 1.5,
                  px: 2,
                  gap: 1.5,
                  "&:hover": {
                    backgroundColor: "rgba(235, 92, 96, 0.08)",
                    "& .MuiTypography-root": {
                      color: "#EB5C60",
                    },
                  },
                  transition: "all 0.2s ease-in-out",
                }}>
                <Storefront fontSize="small" sx={{ color: "#e91e63", mr: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {store.name}
                </Typography>
              </MenuItem>
            ))}
        </Menu>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;
