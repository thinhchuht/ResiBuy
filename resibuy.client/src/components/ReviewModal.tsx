import React, { useState, useCallback } from "react";
import { 
  Modal, 
  Box, 
  Typography, 
  IconButton, 
  Rating, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Avatar 
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { formatPrice } from "../utils/priceUtils";
import { useAuth } from "../contexts/AuthContext";
import { useToastify } from "../hooks/useToastify";
import reviewApi from "../api/review.api";
import type { OrderItemQueryResult } from "../pages/Order/OrderCard";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  orderItem: OrderItemQueryResult | null;
  onReviewSubmitted?: () => void; // Callback to refresh reviews after submission
}

const ReviewModal: React.FC<ReviewModalProps> = ({ 
  open, 
  onClose, 
  orderItem, 
  onReviewSubmitted 
}) => {
  const [rating, setRating] = useState<number | null>(0);
  const [productReview, setProductReview] = useState("");
  const [nameDisplayFormat, setNameDisplayFormat] = useState("anonymous");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const toast = useToastify();

  const resetForm = useCallback(() => {
    setRating(0);
    setProductReview("");
    setNameDisplayFormat("anonymous");
    setIsSubmitting(false);
  }, []);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Vui lòng đăng nhập để đánh giá sản phẩm");
      return;
    }

    if (!orderItem) {
      toast.error("Không tìm thấy thông tin sản phẩm");
      return;
    }

    if (!rating || rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }

    if (!productReview.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá");
      return;
    }

    try {
      setIsSubmitting(true);
      
      await reviewApi.create(
        user.id,
        orderItem.productDetailId,
        rating || 0,
        productReview,
        nameDisplayFormat === "anonymous"
      );

      toast.success("Đánh giá đã được gửi thành công!");
      handleClose();
      
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: "80%", md: "600px" },
          maxHeight: "90vh",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 3,
          overflowY: "auto",
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>

        {orderItem && (
          <Box display="flex" alignItems="center" gap={2} mb={3} border={1} borderColor="grey.300" p={2} borderRadius={1}>
            <Avatar 
              variant="square" 
              src={orderItem.image?.thumbUrl || orderItem.image?.url} 
              alt={orderItem.productName} 
              sx={{ width: 60, height: 60 }} 
            />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {orderItem.productName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatPrice(orderItem.price)}
              </Typography>
              {orderItem.addtionalData && orderItem.addtionalData.length > 0 && (
                <Typography 
                  variant="caption" 
                  component="div"
                  sx={{ 
                    color: "text.secondary",
                    lineHeight: 1.5,
                    overflow: 'hidden',
                    fontWeight: 500,
                    mt: 0.5
                  }}
                >
                  {orderItem.addtionalData.map((data, index) => (
                    <span key={data.id}>
                      {data.key} : {data.value}
                      {index < orderItem.addtionalData.length - 1 && ' - '}
                    </span>
                  ))}
                </Typography>
              )}
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
            onChange={(_event, newValue) => {
              setRating(newValue);
            }}
            size="large"
            sx={{ "& .MuiRating-iconEmpty": { color: (theme) => theme.palette.grey[400] } }}
          />
        </Box>

        <Typography variant="subtitle1" mb={1}>
          Bình luận sản phẩm *
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
          required
        />
        <Typography variant="caption" color="text.secondary" textAlign="right" display="block" mt={-1} mb={2}>
          {productReview.length}/2000
        </Typography>

        <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
          <InputLabel>Tên hiển thị</InputLabel>
          <Select 
            value={nameDisplayFormat} 
            onChange={(e) => setNameDisplayFormat(e.target.value as string)} 
            label="Tên hiển thị"
          >
            <MenuItem value="username">Tên thật</MenuItem>
            <MenuItem value="anonymous">Ẩn danh</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant="contained"
          fullWidth
          disabled={isSubmitting}
          sx={{
            borderRadius: 1,
            py: 1.5,
            textTransform: "none",
            fontSize: "1.1rem",
            backgroundColor: "black",
            "&:hover": {
              backgroundColor: "#333",
            },
            "&:disabled": {
              backgroundColor: "#ccc",
            },
          }}
          onClick={handleSubmit}>
          {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
        </Button>
      </Box>
    </Modal>
  );
};

export default ReviewModal;
