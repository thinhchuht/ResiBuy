import { useState } from "react";
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
  Chip,
} from "@mui/material";
import {
  Close,
  LocalShipping as ShipperIcon,
  ShoppingCart as OrderIcon,
  Edit,
  Delete,
} from "@mui/icons-material";
import {
  formatCurrency,
  formatDate,
  formatOrderStatus,
  getOrderStatusColor,
  useShippersLogic,
} from "./seg/utlis";
import type { Shipper, User, Order } from "../../../types/models";

interface ShipperDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipper: Shipper | null;
  user: User | null;
  onEdit?: (shipper: Shipper, user: User) => void;
  onDelete?: (shipperId: string) => void;
}

export function ShipperDetailModal({
  isOpen,
  onClose,
  shipper,
  user,
  onEdit,
  onDelete,
}: ShipperDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "orders">("overview");
  const {
    countOrdersByShipperId,
    calculateShipperRevenue,
    getShipperOrders,
    formatWorkTime,
    isShipperAvailable,
  } = useShippersLogic();

  if (!isOpen || !shipper || !user) return null;

  const totalOrders = countOrdersByShipperId(shipper.id);
  const totalRevenue = calculateShipperRevenue(shipper.id);
  const orders = getShipperOrders(shipper.id);

  return (
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
            Chi Tiết Shipper
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "grey.500" }}
          >
            ID Shipper: {shipper.id}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {onEdit && (
            <Button
              onClick={() => onEdit(shipper, user)}
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
          {onDelete && (
            <Button
              onClick={() => onDelete(shipper.id)}
              startIcon={<Delete sx={{ fontSize: 16 }} />}
              sx={{
                px: 1.5,
                py: 1,
                bgcolor: "error.main",
                color: "white",
                borderRadius: 2,
                "&:hover": { bgcolor: "error.dark" },
              }}
            >
              Xóa
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
        {/* Shipper Summary */}
        <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
          <Box sx={{ width: 80, height: 80 }}>
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
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </Box>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h5"
              sx={{ color: "grey.900", fontWeight: "bold", mb: 1 }}
            >
              {user.fullName}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "grey.500" }}
            >
              {user.email}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              textAlign: "left",
            }}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{ color: "primary.main", fontWeight: "bold" }}
              >
                {totalOrders}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "grey.500" }}
              >
                Tổng Đơn Hàng
              </Typography>
            </Box>
            <Box>
              <Typography
                variant="h5"
                sx={{ color: "success.main", fontWeight: "bold" }}
              >
                {formatCurrency(totalRevenue)}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "grey.500" }}
              >
                Tổng Doanh Thu
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      {/* Tabs */}
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
            { id: "overview", label: "Tổng Quan", icon: <ShipperIcon sx={{ fontSize: 16 }} /> },
            { id: "orders", label: "Đơn Hàng", icon: <OrderIcon sx={{ fontSize: 16 }} /> },
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

      {/* Tab Content */}
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
            <Typography
              variant="h6"
              sx={{ color: "grey.900", mb: 2 }}
            >
              Thông Tin Shipper
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 3,
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: "grey.500", fontWeight: "medium" }}
                >
                  Số Điện Thoại
                </Typography>
                <Typography sx={{ color: "grey.900" }}>
                  {user.phoneNumber}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: "grey.500", fontWeight: "medium" }}
                >
                  Ngày Sinh
                </Typography>
                <Typography sx={{ color: "grey.900" }}>
                  {formatDate(user.dateOfBirth)}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: "grey.500", fontWeight: "medium" }}
                >
                  CMND/CCCD
                </Typography>
                <Typography sx={{ color: "grey.900" }}>
                  {user.identityNumber}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: "grey.500", fontWeight: "medium" }}
                >
                  Trạng Thái
                </Typography>
                <Typography sx={{ color: "grey.900" }}>
                  {isShipperAvailable(shipper) ? "Sẵn Sàng" : "Không Sẵn Sàng"}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: "grey.500", fontWeight: "medium" }}
                >
                  Thời Gian Làm Việc
                </Typography>
                <Typography sx={{ color: "grey.900" }}>
                  {formatWorkTime(shipper.startWorkTime)} - {formatWorkTime(shipper.endWorkTime)}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  sx={{ color: "grey.500", fontWeight: "medium" }}
                >
                  Số Lần Báo Cáo
                </Typography>
                <Typography sx={{ color: "grey.900" }}>
                  {shipper.reportCount}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {activeTab === "orders" && (
          <Box>
            <Typography
              variant="h6"
              sx={{ color: "grey.900", mb: 2 }}
            >
              Đơn Hàng ({totalOrders} đơn hàng)
            </Typography>
            {orders.length > 0 ? (
              <Box sx={{ border: 1, borderColor: "grey.200", borderRadius: 2, overflow: "hidden" }}>
                <Table>
                  <TableHead sx={{ bgcolor: "grey.50" }}>
                    <TableRow>
                      <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                        ID Đơn Hàng
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                        Trạng Thái
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                        Tổng Tiền
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                        Địa Chỉ Giao Hàng
                      </TableCell>
                      <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                        Ngày Tạo
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody sx={{ "& tr:hover": { bgcolor: "grey.50" } }}>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell sx={{ px: 2, py: 1.5, fontFamily: "monospace", fontSize: "0.875rem", color: "primary.main" }}>
                          {order.id}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem" }}>
                          <Chip
                            label={formatOrderStatus(order.status)}
                            sx={{
                              bgcolor: getOrderStatusColor(order.status).bgcolor,
                              color: getOrderStatusColor(order.status).color,
                              fontSize: "0.75rem",
                              height: 24,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                          {order.shippingAddress}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                          {formatDate(order.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            ) : (
              <Box sx={{ textAlign: "center", py: 4, color: "grey.500" }}>
                <OrderIcon sx={{ fontSize: 48, color: "grey.300", mb: 2 }} />
                <Typography>Không tìm thấy đơn hàng cho shipper này</Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}