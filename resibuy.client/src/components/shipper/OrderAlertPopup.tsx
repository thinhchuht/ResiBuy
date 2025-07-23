import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface OrderAlertPopupProps {
  open: boolean;
  onClose: () => void;
  order?: {
    id: number;
    customerName: string;
    address: string;
    storeAddress: string;
  };
}

const OrderAlertPopup: React.FC<OrderAlertPopupProps> = ({ open, onClose, order }) => {
  const [countdown, setCountdown] = useState(40);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (open) {
      setCountdown(40);

      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onClose(); // Tự đóng sau 40s
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [open, onClose]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>🔔 Có đơn hàng mới!</DialogTitle>
      <DialogContent>
        <Typography>
          Bạn vừa nhận được một đơn hàng mới. Vui lòng xác nhận trong vòng {countdown} giây.
        </Typography>

        {order && (
          <>
            <Typography sx={{ mt: 2 }}>
              <strong>Mã đơn hàng:</strong> #{order.id}
            </Typography>
            <Typography>
              <strong>Khách hàng:</strong> {order.customerName}
            </Typography>
            <Typography>
              <strong>Địa chỉ nhận:</strong> {order.address}
            </Typography>
            <Typography>
              <strong>Địa chỉ cửa hàng:</strong> {order.storeAddress}
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Xác nhận
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderAlertPopup;
