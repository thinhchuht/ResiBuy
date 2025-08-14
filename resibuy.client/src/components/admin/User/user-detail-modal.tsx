import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Close,
  Person as UserIcon,
  Edit,
  Lock,
  LockOpen,
  ShoppingCart,
  Visibility,
} from "@mui/icons-material";
import userApi from "../../../api/user.api";
import orderApi from "../../../api/order.api";
import { useToastify } from "../../../hooks/useToastify";
import type { UserDto, OrderDto } from "../../../types/dtoModels";
import { formatDate, formatDateWithoutTime } from "./seg/utils";
import CustomTable from "../../../components/CustomTable";

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserDto | null;
  onEdit?: (user: UserDto) => void;
  onToggleLock?: (userId: string, isLocked: boolean) => void;
}

interface OrderDetailDialogProps {
  open: boolean;
  onClose: () => void;
  order: OrderDto | null;
}

interface OrderData {
  items: OrderDto[];
  totalCount: number;
  pageNumber: number;
  totalPages: number;
  totalSpent: number;
}

const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({ open, onClose, order }) => {
  const navigate = useNavigate();
  if (!open || !order) return null;

  const formatShippingAddress = (order: OrderDto): string => {
    const { roomQueryResult } = order;
    if (!roomQueryResult) return "Không có thông tin địa chỉ";
    const { name, buildingName, areaName } = roomQueryResult;
    return `${name}, ${buildingName}, ${areaName}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 2,
          boxShadow: 24,
          p: 2,
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" sx={{ color: "grey.900" }}>
          Chi Tiết Đơn Hàng
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "grey.500" }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              ID Đơn Hàng
            </Typography>
            <Typography sx={{ color: "grey.900" }}>{order.id}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              ID Người Dùng
            </Typography>
            <Typography sx={{ color: "grey.900" }}>{order.userId}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              Số Điện Thoại Shipper
            </Typography>
            <Typography sx={{ color: "grey.900" }}>{order.shipper?.phoneNumber || "N/A"}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              Ngày Tạo
            </Typography>
            <Typography sx={{ color: "grey.900" }}>{formatDate(order.createAt)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              Ngày Cập Nhật
            </Typography>
            <Typography sx={{ color: "grey.900" }}>{order.updateAt ? formatDate(order.updateAt) : "N/A"}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              Trạng Thái
            </Typography>
            <Typography sx={{ color: "grey.900" }}>{order.status}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              Trạng Thái Thanh Toán
            </Typography>
            <Typography sx={{ color: "grey.900" }}>{order.paymentStatus}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              Phương Thức Thanh Toán
            </Typography>
            <Typography sx={{ color: "grey.900" }}>{order.paymentMethod}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              Tổng Tiền
            </Typography>
            <Typography sx={{ color: "grey.900" }}>{order.totalPrice.toLocaleString("vi-VN")} VND</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              Phí Vận Chuyển
            </Typography>
            <Typography sx={{ color: "grey.900" }}>{order.shippingFee ? order.shippingFee.toLocaleString("vi-VN") + " VND" : "N/A"}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              Ghi Chú
            </Typography>
            <Typography sx={{ color: "grey.900" }}>{order.note || "Không có ghi chú"}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              Địa Chỉ Giao Hàng
            </Typography>
            <Typography sx={{ color: "grey.900" }}>{formatShippingAddress(order)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
              Cửa Hàng
            </Typography>
            <Typography sx={{ color: "grey.900" }}>{order.store?.name || "N/A"}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium", mb: 1 }}>
              Sản Phẩm
            </Typography>
            {order.orderItems?.length > 0 ? (
              <Table sx={{ border: 1, borderColor: "grey.200", borderRadius: 1 }}>
                <TableHead sx={{ bgcolor: "grey.50" }}>
                  <TableRow>
                    <TableCell sx={{ fontSize: "0.75rem", color: "grey.500", fontWeight: "medium" }}>
                      Tên Sản Phẩm
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.75rem", color: "grey.500", fontWeight: "medium" }}>
                      Số Lượng
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.75rem", color: "grey.500", fontWeight: "medium" }}>
                      Giá
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.orderItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell
                        sx={{
                          px: 2,
                          py: 1.5,
                          fontSize: "0.875rem",
                          color: "primary.main",
                          cursor: "pointer",
                          textDecoration: "none",
                          transition: "all 0.3s ease-in-out",
                          "&:hover": {
                            backgroundImage: "linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          },
                        }}
                        onClick={() => navigate(`/products?id=${item.productId}`)}
                      >
                        {item.productName}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.875rem" }}>{item.quantity}</TableCell>
                      <TableCell sx={{ fontSize: "0.875rem" }}>{item.price.toLocaleString("vi-VN")} VND</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography sx={{ color: "grey.500" }}>Không có sản phẩm</Typography>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export function UserDetailModal({ isOpen, onClose, user, onEdit, onToggleLock }: UserDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "orders">("overview");
  const [orders, setOrders] = useState<OrderData>({
    items: [],
    totalCount: 0,
    pageNumber: 1,
    totalPages: 1,
    totalSpent: 0,
  });
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const { toast } = useToastify();
  const navigate = useNavigate();
  const pageSize = 10;

  // Fetch total order count and total spent when modal opens
  useEffect(() => {
    if (isOpen && user?.id) {
      setLoadingStats(true);
      Promise.all([
        orderApi.countOrder({ userId: user.id }),
        orderApi.getTotalOrderAmount({ userId: user.id }),
      ])
        .then(([countResponse, amountResponse]) => {
          console.log("countOrder response:", countResponse);
          console.log("getTotalOrderAmount response:", amountResponse);
          if (countResponse.code === 0 && amountResponse.code === 0) {
            setOrders((prev) => ({
              ...prev,
              totalCount: countResponse.data || 0,
              totalSpent: amountResponse.data.totalOrderAmount || 0,
            }));
          } else {
            throw new Error("Lỗi khi lấy thống kê đơn hàng");
          }
        })
        .catch((err: any) => {
          console.error("Fetch order stats error:", err);
          toast.error(err.message || "Lỗi khi lấy thống kê đơn hàng");
        })
        .finally(() => {
          setLoadingStats(false);
        });
    }
  }, [isOpen, user?.id, toast]);

  // Fetch order list when switching to orders tab
  useEffect(() => {
    if (isOpen && user?.id && activeTab === "orders") {
      setLoadingOrders(true);
      orderApi
        .getAll("None", "None", "None", undefined, user.id, undefined, orders.pageNumber, pageSize)
        .then((response) => {
          console.log("orderApi.getAll response:", response);
          if (response && Array.isArray(response.items)) {
            setOrders((prev) => ({
              ...prev,
              items: response.items,
              pageNumber: response.pageNumber || 1,
              totalPages: response.totalPages || 1,
            }));
          } else {
            throw new Error("Dữ liệu đơn hàng không hợp lệ");
          }
        })
        .catch((err: any) => {
          console.error("Fetch orders error:", err);
          toast.error(err.message || "Lỗi khi lấy danh sách đơn hàng");
        })
        .finally(() => {
          setLoadingOrders(false);
        });
    }
  }, [isOpen, user?.id, activeTab, orders.pageNumber, toast]);

  const handleViewOrder = (order: OrderDto) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  const handleCloseOrderDetail = () => {
    setIsOrderDetailOpen(false);
    setSelectedOrder(null);
  };

  const getStatusIcon = (isLocked: boolean) => {
    return isLocked ? (
      <Lock sx={{ fontSize: 20, color: "error.main" }} />
    ) : (
      <LockOpen sx={{ fontSize: 20, color: "success.main" }} />
    );
  };

  const columns = [
    {
      key: "id" as keyof OrderDto,
      label: "ID Đơn Hàng",
      sortable: true,
      render: (order: OrderDto) => (
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            fontWeight: "medium",
            color: "primary.main",
          }}
        >
          {order.id}
        </Typography>
      ),
    },
    {
      key: "status" as keyof OrderDto,
      label: "Trạng Thái",
      sortable: true,
      render: (order: OrderDto) => (
        <Chip
          label={order.status}
          sx={{
            bgcolor: "primary.light",
            color: "primary.main",
            fontSize: "0.75rem",
            height: 24,
          }}
        />
      ),
    },
    {
      key: "totalPrice" as keyof OrderDto,
      label: "Tổng Tiền",
      sortable: true,
      render: (order: OrderDto) => (
        <Typography sx={{ fontSize: "0.875rem", color: "grey.900" }}>
          {order.totalPrice.toLocaleString("vi-VN")} VND
        </Typography>
      ),
    },
    {
      key: "shippingFee" as keyof OrderDto,
      label: "Phí Giao Hàng",
      sortable: true,
      render: (order: OrderDto) => (
        <Typography sx={{ fontSize: "0.875rem", color: "grey.900" }}>
          {order.shippingFee ? order.shippingFee.toLocaleString("vi-VN") + " VND" : "N/A"}
        </Typography>
      ),
    },
    {
      key: "roomQueryResult" as keyof OrderDto,
      label: "Địa Chỉ Giao Hàng",
      sortable: false,
      render: (order: OrderDto) => (
        <Typography sx={{ fontSize: "0.875rem", color: "grey.900" }}>
          {order.roomQueryResult
            ? `${order.roomQueryResult.name}, ${order.roomQueryResult.buildingName}, ${order.roomQueryResult.areaName}`
            : "Không có thông tin địa chỉ"}
        </Typography>
      ),
    },
    {
      key: "createAt" as keyof OrderDto,
      label: "Ngày Tạo",
      sortable: true,
      render: (order: OrderDto) => (
        <Typography sx={{ fontSize: "0.875rem", color: "grey.900" }}>
          {formatDate(order.createAt)}
        </Typography>
      ),
    },
    {
      key: "actions" as keyof OrderDto,
      label: "Hành Động",
      sortable: false,
      render: (order: OrderDto) => (
        <IconButton
          onClick={() => handleViewOrder(order)}
          sx={{ color: "primary.main" }}
        >
          <Visibility sx={{ fontSize: 20 }} />
        </IconButton>
      ),
    },
  ];

  if (!isOpen || !user) return null;

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            maxWidth: "80rem",
            height: "90vh",
            margin: 0,
            borderRadius: 0,
            boxShadow: 24,
            transform: isOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.3s ease-in-out",
            display: "flex",
            flexDirection: "column",
          },
        }}
        PaperProps={{ sx: { bgcolor: "background.paper" } }}
      >
        <DialogTitle
          sx={{
            p: 3,
            borderBottom: 1,
            borderColor: "grey.200",
            bgcolor: "background.paper",
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ color: "grey.900", fontWeight: "medium" }}
            >
              Chi Tiết Người Dùng
            </Typography>
            <Typography variant="body2" sx={{ color: "grey.500" }}>
              ID Người Dùng: {user.id}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {onEdit && (
              <Button
                onClick={() => onEdit(user)}
                startIcon={<Edit sx={{ fontSize: 16 }} />}
                sx={{
                  px: 1.5,
                  py: 1,
                  bgcolor: "primary.main",
                  color: "white",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Sửa
              </Button>
            )}
            {onToggleLock && (
              <Button
                onClick={() => onToggleLock(user.id, user.isLocked)}
                startIcon={getStatusIcon(user.isLocked)}
                sx={{
                  px: 1.5,
                  py: 1,
                  bgcolor: user.isLocked ? "success.main" : "error.main",
                  color: "white",
                  borderRadius: 2,
                  "&:hover": {
                    bgcolor: user.isLocked ? "success.dark" : "error.dark",
                  },
                }}
              >
                {user.isLocked ? "Mở Khóa" : "Khóa"}
              </Button>
            )}
            <IconButton
              onClick={onClose}
              sx={{
                color: "grey.400",
                bgcolor: "background.paper",
                p: 1,
                borderRadius: 2,
                "&:hover": {
                  color: "grey.600",
                  bgcolor: "grey.100",
                },
              }}
            >
              <Close sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 3,
            bgcolor: "grey.50",
            borderBottom: 1,
            borderColor: "grey.200",
            flex: "0 0 auto",
          }}
        >
          <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
            <Box sx={{ width: 80, height: 80 }}>
              {user.avatar?.url ? (
                <Box
                  component="img"
                  src={user.avatar.url}
                  alt={user.fullName || "User Avatar"}
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                  }}
                >
                  {user.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "?"}
                </Box>
              )}
            </Box>

            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Typography
                  variant="h5"
                  sx={{ color: "grey.900", fontWeight: "bold" }}
                >
                  {user.fullName || "N/A"}
                </Typography>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 1,
                    py: 0.5,
                    fontSize: "0.75rem",
                    fontWeight: "medium",
                    borderRadius: 1,
                    bgcolor: user.isLocked ? "error.light" : "success.light",
                    color: user.isLocked ? "error.dark" : "success.dark",
                  }}
                >
                  {getStatusIcon(user.isLocked)}
                  {user.isLocked ? "Khóa" : "Hoạt Động"}
                </Box>
              </Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                  fontSize: "0.875rem",
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                    Email
                  </Typography>
                  <Typography sx={{ color: "grey.600" }}>
                    {user.email || "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                    Số Điện Thoại
                  </Typography>
                  <Typography sx={{ color: "grey.600" }}>
                    {user.phoneNumber || "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                    Ngày Sinh
                  </Typography>
                  <Typography sx={{ color: "grey.600" }}>
                    {user.dateOfBirth ? formatDateWithoutTime(user.dateOfBirth) : "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                    CMND/CCCD
                  </Typography>
                  <Typography sx={{ color: "grey.600" }}>
                    {user.identityNumber || "N/A"}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                textAlign: "center",
              }}
            >
              <Box>
                {loadingStats ? (
                  <CircularProgress size={20} />
                ) : (
                  <Typography
                    variant="h5"
                    sx={{ color: "primary.main", fontWeight: "bold" }}
                  >
                    {orders.totalCount}
                  </Typography>
                )}
                <Typography variant="caption" sx={{ color: "grey.500" }}>
                  Tổng Đơn Hàng
                </Typography>
              </Box>
              <Box>
                {loadingStats ? (
                  <CircularProgress size={20} />
                ) : (
                  <Typography
                    variant="h5"
                    sx={{ color: "success.main", fontWeight: "bold" }}
                  >
                    {orders.totalSpent.toLocaleString("vi-VN")} VND
                  </Typography>
                )}
                <Typography variant="caption" sx={{ color: "grey.500" }}>
                  Tổng Chi Tiêu
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <Box
          sx={{
            borderBottom: 1,
            borderColor: "grey.200",
            position: "sticky",
            top: 0,
            zIndex: 9,
            bgcolor: "background.paper",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ "& .MuiTabs-indicator": { bgcolor: "primary.main" } }}
          >
            {[
              { id: "overview", label: "Thông Tin", icon: <UserIcon sx={{ fontSize: 16 }} /> },
              { id: "orders", label: "Đơn Hàng", icon: <ShoppingCart sx={{ fontSize: 16 }} /> },
            ].map((tab) => (
              <Tab
                key={tab.id}
                value={tab.id}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {tab.icon}
                    {tab.label}
                  </Box>
                }
                sx={{
                  px: 3,
                  py: 2,
                  fontSize: "0.875rem",
                  fontWeight: "medium",
                  color: activeTab === tab.id ? "primary.main" : "grey.500",
                  "&:hover": { color: "grey.700" },
                }}
              />
            ))}
          </Tabs>
        </Box>

        <DialogContent
          sx={{
            p: 3,
            flex: 1,
            overflowY: "auto",
            minHeight: "300px",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {activeTab === "overview" && (
            <Box>
              <Typography variant="h6" sx={{ color: "grey.900", mb: 2 }}>
                Thông Tin Người Dùng
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 3,
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                    ID Người Dùng
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>{user.id}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                    Trạng Thái
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {user.isLocked ? "Khóa" : "Hoạt Động"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                    Ngày Tạo
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {formatDate(user.createdAt)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                    Ngày Cập Nhật
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {user.updatedAt ? formatDate(user.updatedAt) : "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                    Vai Trò
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {user.roles.length > 0 ? (
                      user.roles.map((role) => (
                        <Chip
                          key={role}
                          label={role}
                          sx={{
                            bgcolor: "primary.light",
                            color: "primary.main",
                            fontSize: "0.75rem",
                            height: 24,
                          }}
                        />
                      ))
                    ) : (
                      <Typography sx={{ color: "grey.900" }}>Chưa có vai trò</Typography>
                    )}
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                    Phòng
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {user.rooms?.map((room) => room.name).join(", ") || "Chưa có phòng"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                    Cửa Hàng
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {user.stores?.map((store) => store.name).join(", ") || "Chưa có cửa hàng"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                    Voucher
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {user.voucherIds?.join(", ") || "Không có voucher"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: "grey.500", fontWeight: "medium" }}>
                    Báo Cáo
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {user.reports?.length > 0 ? `${user.reports.length} báo cáo` : "Không có báo cáo"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {activeTab === "orders" && (
            <Box>
              <Typography variant="h6" sx={{ color: "grey.900", mb: 2 }}>
                Đơn Hàng ({orders.totalCount} đơn hàng)
              </Typography>
              {loadingOrders ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : orders.items.length > 0 ? (
                <CustomTable
                  data={orders.items}
                  totalCount={orders.totalCount}
                  columns={columns}
                  onPageChange={(event, newPage) => setOrders((prev) => ({ ...prev, pageNumber: newPage + 1 }))}
                  itemsPerPage={pageSize}
                  headerTitle="Danh Sách Đơn Hàng"
                  description={`Đơn hàng của ${user.fullName || "người dùng"}`}
                  showExport={false}
                  showBulkActions={false}
                  
                />
              ) : (
                <Box sx={{ textAlign: "center", py: 4, color: "grey.500" }}>
                  <ShoppingCart sx={{ fontSize: 48, color: "grey.300", mb: 2 }} />
                  <Typography>Không tìm thấy đơn hàng cho người dùng này</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
      <OrderDetailDialog
        open={isOrderDetailOpen}
        onClose={handleCloseOrderDetail}
        order={selectedOrder}
      />
    </>
  );
}