import { Box, Typography } from "@mui/material";
import type { TempProductDetailDto } from "../../types/models";

interface ProductTableSectionProps {
  items: TempProductDetailDto[];
  formatPrice: (price: number) => React.ReactNode;
}

const ProductTableSection = ({ items, formatPrice }: ProductTableSectionProps) => (
  <>
    {/* Table Header */}
    <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 1, bgcolor: "#fafbfc", borderRadius: 1, mb: 1, fontWeight: 600, fontSize: "1rem", color: "#555" }}>
      <Box sx={{ width: 80 }}></Box>
      <Box sx={{ flex: 2 }}>Sản phẩm</Box>
      <Box sx={{ flex: 1, textAlign: "center" }}>Cân nặng</Box>
      <Box sx={{ flex: 1, textAlign: "center" }}>Đơn giá</Box>
      <Box sx={{ flex: 1, textAlign: "center" }}>Số lượng</Box>
      <Box sx={{ flex: 1, textAlign: "right", color: "red" }}>Thành tiền</Box>
    </Box>
    {/* Table Body with scroll */}
    <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
      {items.map((item) => (
        <Box
          key={item.id}
          sx={{
            display: "flex",
            alignItems: "center",
            px: 2,
            py: 2,
            mb: 2,
            border: "1px solid #f0f0f0",
            borderRadius: 2,
            background: "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
          }}>
          <Box sx={{ width: 80, mr: 2 }}>
            <img src={item.image?.thumbUrl || item.image?.url} alt={item.name} style={{ width: "60px", height: "60px", borderRadius: "4px", objectFit: "cover" }} />
          </Box>
          <Box sx={{ flex: 2 }}>
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              {item.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Loại: {item.additionalDatas?.map((ad) => `${ad.value}`).join(", ")}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {item.weight}kg
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {formatPrice(item.price)}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {item.quantity}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: "right" }}>
            <Typography variant="body1" sx={{ fontWeight: "bold", color: "red" }}>
              {formatPrice(item.price * item.quantity)}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  </>
);

export default ProductTableSection;
