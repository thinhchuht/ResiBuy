import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Rating,
  Stack,
  useTheme,
  CircularProgress,
  Pagination,
  Chip,
} from "@mui/material";
import ReviewItem from "./ReviewItem";
import type { Product, Review, PagedResult } from "../../../types/models";
import { useToastify } from "../../../hooks/useToastify";
import reviewApi from "../../../api/review.api";

interface CustomerReviewsSectionProps {
  product: Product;
}

const CustomerReviewsSection: React.FC<CustomerReviewsSectionProps> = ({
  product,
}) => {
  const theme = useTheme();
  const toast = useToastify();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [ratingCounts, setRatingCounts] = useState<{ [key: number]: number }>({});
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const pageSize = 10;

  // Fetch reviews from API with pagination
  const fetchReviews = async (page: number = 1, rate: number = 0) => {
    try {
      setLoading(true);
      const response: PagedResult<Review> = await reviewApi.getAll(
        product.id.toString(), 
        rate, 
        page, 
        pageSize
      );
      console.log('response', response)
      setReviews(response.items || []);
      setTotalReviews(response.totalCount || 0);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(page);
      
      // Calculate average rating and rating distribution
      if (response.items && response.items.length > 0) {
        const avgRating = response.items.reduce((sum: number, review: Review) => sum + review.rate, 0) / response.items.length;
        setAverageRating(avgRating);
        
        // Calculate rating distribution for all reviews (not just current page)
        const counts: { [key: number]: number } = {};
        for (let i = 1; i <= 5; i++) {
          counts[i] = 0;
        }
        response.items.forEach((review: Review) => {
          counts[review.rate] = (counts[review.rate] || 0) + 1;
        });
        setRatingCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (product.id) {
      fetchReviews(1, 0);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    fetchReviews(value, 0);
  };

  const handleRatingFilter = (rating: number) => {
    setSelectedRating(rating === selectedRating ? 0 : rating);
    fetchReviews(1, rating === selectedRating ? 0 : rating);
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
          {averageRating.toFixed(1)}
        </Typography>
        <Rating value={averageRating} precision={0.1} readOnly size="large" />
        <Typography variant="body2" color="text.secondary" mb={2}>
          {totalReviews} Đánh giá
        </Typography>
        <Stack spacing={1} alignItems="center" mb={3}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingCounts[star] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <Box 
                key={star} 
                display="flex" 
                alignItems="center" 
                width="80%"
                sx={{ cursor: 'pointer' }}
                onClick={() => handleRatingFilter(star)}
              >
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
                      width: `${percentage}%`,
                      height: "100%",
                      bgcolor: theme.palette.warning.main,
                      borderRadius: 1,
                    }}
                  />
                </Box>
                <Typography variant="body2" ml={1}>
                  {percentage.toFixed(0)}%
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>

      <Box sx={{ maxHeight: 500, overflowY: "auto" }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h5" fontWeight="bold">
            Đánh giá với bình luận
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            flexWrap: 'wrap',
            bgcolor: 'grey.50',
            p: 1,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <Chip
              label="Tất cả"
              onClick={() => handleRatingFilter(0)}
              color={selectedRating === 0 ? 'primary' : 'default'}
              variant={selectedRating === 0 ? 'filled' : 'outlined'}
              sx={{
                borderRadius: '8px',
                fontWeight: 500,
                px: 1.5,
                '&.MuiChip-filled': {
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                }
              }}
            />
            {[5, 4, 3, 2, 1].map((star) => (
              <Chip
                key={star}
                icon={
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    '& .MuiSvgIcon-root': {
                      color: selectedRating === star ? 'common.white' : 'warning.main',
                      fontSize: '1.1rem',
                      mr: 0.5
                    }
                  }}>
                    <span>★</span>
                    <Typography component="span" variant="body2" sx={{
                      fontWeight: 500,
                      color: selectedRating === star ? 'common.white' : 'inherit'
                    }}>
                      {star}
                    </Typography>
                  </Box>
                }
                onClick={() => handleRatingFilter(star)}
                color={selectedRating === star ? 'primary' : 'default'}
                variant={selectedRating === star ? 'filled' : 'outlined'}
                sx={{
                  borderRadius: '8px',
                  px: 1.5,
                  '& .MuiChip-label': {
                    pl: 0.5,
                    pr: 0
                  },
                  '&.MuiChip-filled': {
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  },
                  borderColor: selectedRating === star ? 'primary.main' : 'divider',
                  bgcolor: selectedRating === star ? 'primary.main' : 'background.paper',
                  '&:hover': {
                    bgcolor: selectedRating === star ? 'primary.dark' : 'action.hover',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              />
            ))}
          </Box>
        </Box>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
              {reviews.map((review: Review) => (
                <ReviewItem
                  key={review.id}
                  review={review}
                />
              ))}
              {reviews.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center", width: "100%" }}>
                  Chưa có đánh giá nào cho sản phẩm này.
                </Typography>
              )}
            </Box>
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="medium"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default CustomerReviewsSection;
