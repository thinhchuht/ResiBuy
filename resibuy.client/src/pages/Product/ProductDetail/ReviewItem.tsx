import React from "react";
import {
  Box,
  Typography,
  Rating,
  Button,
  Avatar,
  useTheme,
} from "@mui/material";
import { ThumbUpAltOutlined, FlagOutlined } from "@mui/icons-material";
import type { Review } from "../../../types/models";

interface ReviewItemProps {
  review: Review;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review }) => {
  const theme = useTheme();
  console.log('review', review);
  // Generate avatar letter and color from user name
  const avatarLetter = review.isAnonymous
    ? "A"
    : review.user?.name?.charAt(0).toUpperCase() || "U";
  const avatarBgColor = theme.palette.primary.main;
  const displayName = review.isAnonymous
    ? "Người dùng ẩn danh"
    : review.user?.name || "Người dùng";

  return (
    <Box sx={{ width: { xs: "100%", sm: "calc(50% - 16px)" } }}>
      <Box display="flex" gap={2} mb={3}>
        <Avatar
          src={
            !review.isAnonymous && review.user?.avatar?.url
              ? review.user.avatar.url
              : undefined
          }
          sx={{ bgcolor: avatarBgColor, color: theme.palette.common.white }}
        >
          {avatarLetter}
        </Avatar>
        <Box flexGrow={1}>
          <Typography variant="subtitle1" fontWeight="bold">
            {displayName}
          </Typography>
          <Rating
            value={review.rate}
            precision={0.5}
            readOnly
            size="small"
            sx={{ color: theme.palette.warning.main }}
          />

          <Typography 
            variant="subtitle2" 
            color="text.secondary" 
            mt={1.5}
            sx={{
              display: 'inline-block',
              backgroundColor: (theme) => theme.palette.grey[100],
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontWeight: 500
            }}
          >
            Sản phẩm: {review.productDetail.name}
          </Typography>
          {review.productDetail.additionalData && review.productDetail.additionalData.length > 0 && (
            <Box mt={1}>
              <Typography 
                variant="caption" 
                component="span"
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 500,
                  mr: 1
                }}
              >
                Phân loại:
              </Typography>
              <Typography 
                variant="caption" 
                component="span"
                sx={{ 
                color: "text.secondary",
                  lineHeight: 1.5,
                  overflow: 'hidden',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                {review.productDetail.additionalData.map((data, index) => (
                  <span key={data.id}>
                    {data.key} : {data.value}
                    {index < review.productDetail.additionalData.length - 1 && ' - '}
                  </span>
                ))}
              </Typography>
            </Box>
          )}
          <Typography 
            variant="body1" 
            color="text.primary" 
            mt={1.5} 
            sx={{ 
              lineHeight: 1.6,
              letterSpacing: '0.00938em',
              whiteSpace: 'pre-line' // Preserve line breaks in the comment
            }}
          >
            {review.comment}
          </Typography>
          <Box display="flex" alignItems="center" gap={2} mt={2}>
            <Button
              startIcon={<ThumbUpAltOutlined />}
              size="small"
              sx={{ textTransform: "none" }}
            >
              (0)
            </Button>
            <Button
              startIcon={<FlagOutlined />}
              size="small"
              sx={{ textTransform: "none" }}
              variant="text"
            >
              Báo cáo
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ReviewItem;
