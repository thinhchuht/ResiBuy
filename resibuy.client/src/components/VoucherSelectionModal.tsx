import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, Tabs, Tab, Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VoucherCard from "./VoucherCard";
import type { Voucher } from "../types/models";

interface VoucherSelectionModalProps {
  open: boolean;
  onClose: () => void;
  userVouchers: Voucher[];
  shopVouchers: Voucher[];
  onSelectVoucher: (voucher: Voucher) => void;
  selectedVoucherId?: string;
}

const VoucherSelectionModal = ({ open, onClose, userVouchers, shopVouchers, onSelectVoucher, selectedVoucherId }: VoucherSelectionModalProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const renderVoucherList = (vouchers: Voucher[], emptyMessage: string) => {
    if (vouchers.length === 0) {
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            gap: 2,
          }}>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: "bold" }}>
            {emptyMessage}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
            Hãy quay lại sau để xem các voucher mới
          </Typography>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          alignItems: "center",
        }}>
        {vouchers.map((voucher) => (
          <Box
            key={voucher.id}
            onClick={() => onSelectVoucher(voucher)}
            sx={{
              cursor: "pointer",
              opacity: selectedVoucherId === voucher.id ? 0.7 : 1,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 6px 24px rgba(0, 0, 0, 0.08)",
              },
            }}>
            <VoucherCard voucher={voucher} onGetVoucher={() => onSelectVoucher(voucher)} />
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: "60vh",
          width: "500px",
          maxWidth: "500px",
        },
      }}>
      <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
          Chọn Voucher
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="voucher tabs"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: "bold",
                fontSize: "1rem",
              },
            }}>
            <Tab label="Voucher của bạn" />
            <Tab label="Voucher của Shop" />
          </Tabs>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {activeTab === 0 ? renderVoucherList(userVouchers, "Bạn chưa có voucher nào") : renderVoucherList(shopVouchers, "Shop chưa có voucher nào")}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default VoucherSelectionModal;
