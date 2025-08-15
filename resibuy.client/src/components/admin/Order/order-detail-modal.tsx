import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { formatCurrency, formatDate, formatOrderStatus } from "./seg/utils";
import type { Order } from "../../../types/models";

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export function OrderDetailModal({ isOpen, onClose, order }: OrderDetailModalProps) {
  const navigate = useNavigate();

  if (!order) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Chi Tiết Đơn Hàng #{order.id}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="h6">Thông Tin Khách Hàng</Typography>
            <Typography variant="body2">Tên: {order.user.fullName || "N/A"}</Typography>
            <Typography variant="body2">Số điện thoại: {order.user.phoneNumber || "N/A"}</Typography>
          </Box>
          <Divider />
          <Box>
            <Typography variant="h6">Thông Tin Shipper</Typography>
            <Typography variant="body2">
              Số điện thoại: {order.shipper?.phoneNumber || "Chưa phân shipper"}
            </Typography>
          </Box>
          <Divider />
          <Box>
            <Typography variant="h6">Thông Tin Cửa Hàng</Typography>
            <Typography variant="body2">Tên: {order.store.name || "N/A"}</Typography>
            <Typography variant="body2">Số điện thoại: {order.store.phoneNumber || "N/A"}</Typography>
          </Box>
          <Divider />
          <Box>
            <Typography variant="h6">Thông Tin Đơn Hàng</Typography>
            <Typography variant="body2">Trạng thái: {formatOrderStatus(order.status)}</Typography>
            <Typography variant="body2">Thanh toán: {order.paymentStatus}</Typography>
            <Typography variant="body2">Phương thức: {order.paymentMethod}</Typography>
            <Typography variant="body2">Tổng tiền: {formatCurrency(order.totalPrice)}</Typography>
            <Typography variant="body2">Phí vận chuyển: {formatCurrency(order.shippingFee)}</Typography>
            <Typography variant="body2">Ngày tạo: {formatDate(order.createAt)}</Typography>
            <Typography variant="body2">Cập nhật: {formatDate(order.updateAt)}</Typography>
            <Typography variant="body2">Ghi chú: {order.note || "Không có"}</Typography>
          </Box>
          <Divider />
          <Box>
            <Typography variant="h6">Địa Chỉ Giao Hàng</Typography>
            <Typography variant="body2">Phòng: {order.roomQueryResult.name}</Typography>
            <Typography variant="body2">Tòa nhà: {order.roomQueryResult.buildingName}</Typography>
            <Typography variant="body2">Khu vực: {order.roomQueryResult.areaName}</Typography>
          </Box>
          <Divider />
          <Box>
            <Typography variant="h6">Sản Phẩm</Typography>
            <List>
              {order.orderItems.map((item) => (
                <ListItem key={item.id}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        {item.image?.thumbUrl && (
                          <img
                            src={item.image.thumbUrl}
                            alt={item.image.name}
                            style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 4 }}
                          />
                        )}
                        <Box>
                          <Typography
                            variant="body2"
                            component="a"
                            onClick={() => navigate(`/products?id=${item.productId}`)}
                            sx={{
                              color: "primary.main",
                              textDecoration: "underline",
                              cursor: "pointer",
                              "&:hover": { color: "primary.dark" },
                            }}
                          >
                          {`${item.productName} ` }  
                          </Typography>
                          <Typography variant="caption">
                             Số lượng: {item.quantity} | Giá: {formatCurrency(item.price)}
                          </Typography>
                          {item.addtionalData.length > 0 && (
                            <Typography variant="caption" component="div">
                              Thuộc tính: {item.addtionalData.map((data) => `${data.key}: ${data.value}`).join(", ")}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}