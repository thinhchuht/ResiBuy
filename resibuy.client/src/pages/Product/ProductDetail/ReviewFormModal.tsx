import React, { useState } from "react";
import { Modal, Box, Typography, IconButton, Rating, TextField, Button, Select, MenuItem, FormControl, InputLabel, Avatar } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { Product } from "../../../types/models";
import { formatPrice, getMinPrice } from "../../../utils/priceUtils";

interface ReviewFormModalProps {
  open: boolean;
  onClose: () => void;
  product: Product | null;
}

const ReviewFormModal: React.FC<ReviewFormModalProps> = ({ open, onClose, product }) => {
  const [rating, setRating] = useState<number | null>(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [productReview, setProductReview] = useState("");
  const [nameDisplayFormat, setNameDisplayFormat] = useState("anonymous");

  const handleSubmit = () => {
    console.log({
      rating,
      reviewTitle,
      productReview,
      nameDisplayFormat,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 600 },
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          outline: "none",
          maxHeight: "90vh",
          overflowY: "auto",
        }}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 2,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}>
          <CloseIcon />
        </IconButton>

        {product && (
          <Box display="flex" alignItems="center" gap={2} mb={3} border={1} borderColor="grey.300" p={2} borderRadius={1}>
            <Avatar variant="square" src={product.productImages[0]?.thumbUrl} alt={product.name} sx={{ width: 60, height: 60 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatPrice(getMinPrice(product))}
              </Typography>
            </Box>
          </Box>
        )}

        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={3}>
          Đánh giá sản phẩm
        </Typography>

        <Box display="flex" justifyContent="center" mb={3}>
          <Rating
            name="product-rating"
            value={rating}
            precision={1}
            onChange={(event, newValue) => {
              setRating(newValue);
            }}
            size="large"
            sx={{ "& .MuiRating-iconEmpty": { color: (theme) => theme.palette.grey[400] } }}
          />
        </Box>

        <Typography variant="subtitle1" mb={1}>
          Tiêu đề đánh giá
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ví dụ: Dễ sử dụng"
          value={reviewTitle}
          onChange={(e) => setReviewTitle(e.target.value)}
          inputProps={{ maxLength: 100 }}
          sx={{ mb: 2 }}
        />
        <Typography variant="caption" color="text.secondary" textAlign="right" display="block" mt={-1} mb={2}>
          {reviewTitle.length}/100
        </Typography>

        <Typography variant="subtitle1" mb={1}>
          Bình luận sản phẩm
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          placeholder="Ví dụ: Tôi đã mua sản phẩm này một tháng trước và rất hài lòng. Điều tôi thích nhất là..."
          value={productReview}
          onChange={(e) => setProductReview(e.target.value)}
          inputProps={{ maxLength: 2000 }}
          sx={{ mb: 2 }}
        />
        <Typography variant="caption" color="text.secondary" textAlign="right" display="block" mt={-1} mb={2}>
          {productReview.length}/2000
        </Typography>

        <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
          <InputLabel>Tên hiển thị</InputLabel>
          <Select value={nameDisplayFormat} onChange={(e) => setNameDisplayFormat(e.target.value as string)} label="Tên hiển thị">
            <MenuItem value="username">Tên thật</MenuItem>
            <MenuItem value="anonymous">Ẩn danh</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          fullWidth
          sx={{
            borderRadius: 1,
            py: 1.5,
            textTransform: "none",
            fontSize: "1.1rem",
            backgroundColor: "black",
            "&:hover": {
              backgroundColor: "#333",
            },
          }}
          onClick={handleSubmit}>
          Gửi đánh giá
        </Button>
      </Box>
    </Modal>
  );
};

export default ReviewFormModal;
