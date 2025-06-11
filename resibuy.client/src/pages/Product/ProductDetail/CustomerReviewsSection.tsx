import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Rating,
  Divider,
  Button,
  Chip,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import ReviewItem from "./ReviewItem";
import { fakeReviewData } from "../../../fakeData/fakeReviewData";
import ReviewFormModal from "./ReviewFormModal";
import type { Product } from "../../../types/models";
import { useAuth } from "../../../contexts/AuthContext";
import { useToastify } from "../../../hooks/useToastify";
import { useNavigate } from "react-router-dom";

interface Review {
  reviewerName: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  avatarLetter: string;
  avatarBgColor: string;
  helpfulCount?: number;
}

interface CustomerReviewsSectionProps {
  product: Product;
}

const CustomerReviewsSection: React.FC<CustomerReviewsSectionProps> = ({
  product,
}) => {
  const theme = useTheme();
  const user = useAuth();
  const toast = useToastify()
  const navigate = useNavigate()
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("mostHelpful");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    if (user) {
      setIsModalOpen(true);
    } else {
      toast.error("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
      navigate("/login");
    }

  };
  const handleCloseModal = () => setIsModalOpen(false);

  const filteredAndSortedReviews = useMemo(() => {
    let result = [...fakeReviewData] as Review[];

    if (selectedRating !== null) {
      result = result.filter((review) => review.rating === selectedRating);
    }

    switch (sortBy) {
      case "mostHelpful":
        result.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
        break;
      case "newest":
        result.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        break;
      default:
        break;
    }

    return result;
  }, [selectedRating, sortBy]);

  const handleRatingFilter = (rating: number) => {
    setSelectedRating(selectedRating === rating ? null : rating);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortBy(event.target.value);
  };

  return (
    <Box
      sx={{
        mt: 4,
        borderRadius: 2,
        p: 2,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 2fr" },
        gap: 4,
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h2" fontWeight="bold" color="primary">
          4.0
        </Typography>
        <Rating value={4} precision={0.5} readOnly size="large" />
        <Typography variant="body2" color="text.secondary" mb={2}>
          {fakeReviewData.length} Đánh giá
        </Typography>
        <Stack spacing={1} alignItems="center" mb={3}>
          {[5, 4, 3, 2, 1].map((star) => (
            <Box key={star} display="flex" alignItems="center" width="80%">
              <Typography variant="body2" mr={1}>
                {star}★
              </Typography>
              <Box
                sx={{
                  flexGrow: 1,
                  height: 8,
                  bgcolor: theme.palette.grey[300],
                  borderRadius: 1,
                }}
              >
                <Box
                  sx={{
                    width: star === 4 ? "100%" : "0%",
                    height: "100%",
                    bgcolor:
                      star === 4 ? theme.palette.warning.main : "transparent",
                    borderRadius: 1,
                  }}
                />
              </Box>
              <Typography variant="body2" ml={1}>
                {star === 4 ? "100%" : "0%"}
              </Typography>
            </Box>
          ))}
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" fontWeight="medium" mb={1}>
          Đánh giá sản phẩm này
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Chia sẻ suy nghĩ của bạn với những khách hàng khác
        </Typography>
        <Button
          variant="contained"
          sx={{
            borderRadius: 8,
            px: 4,
            py: 1.5,
            textTransform: "none",
            fontSize: "1.1rem",
            backgroundColor: theme.palette.primary.main,
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
          onClick={handleOpenModal}
        >
          Viết đánh giá
        </Button>
      </Box>

      <Box sx={{ maxHeight: 500, overflowY: "auto" }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Đánh giá với bình luận
        </Typography>
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            bgcolor: "background.paper",
            py: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
            mb: 2,
          }}
        >
          <Chip
            label="Tất cả"
            clickable
            color={selectedRating === null ? "primary" : "default"}
            onClick={() => setSelectedRating(null)}
            sx={{
              bgcolor:
                selectedRating === null
                  ? theme.palette.text.primary
                  : undefined,
              color:
                selectedRating === null
                  ? theme.palette.common.white
                  : undefined,
            }}
          />
          {[5, 4, 3, 2, 1].map((star) => (
            <Chip
              key={star}
              label={`${star} ★`}
              clickable
              color={selectedRating === star ? "primary" : "default"}
              onClick={() => handleRatingFilter(star)}
              sx={{
                bgcolor:
                  selectedRating === star
                    ? theme.palette.text.primary
                    : undefined,
                color:
                  selectedRating === star
                    ? theme.palette.common.white
                    : undefined,
              }}
            />
          ))}
          <Box sx={{ flexGrow: 1 }} />
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sắp xếp theo</InputLabel>
            <Select
              label="Sắp xếp theo"
              value={sortBy}
              onChange={handleSortChange}
            >
              <MenuItem value="mostHelpful">Hữu ích nhất</MenuItem>
              <MenuItem value="newest">Mới nhất</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {filteredAndSortedReviews.map((review, index) => (
            <ReviewItem
              key={index}
              reviewerName={review.reviewerName}
              rating={review.rating}
              title={review.title}
              body={review.body}
              date={review.date}
              avatarLetter={review.avatarLetter}
              avatarBgColor={review.avatarBgColor}
            />
          ))}
        </Box>
      </Box>
      <ReviewFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        product={product}
      />
    </Box>
  );
};

export default CustomerReviewsSection;
