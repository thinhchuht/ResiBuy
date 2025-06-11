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

interface ReviewItemProps {
  reviewerName: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  avatarLetter: string;
  avatarBgColor: string;
}

const ReviewItem: React.FC<ReviewItemProps> = ({
  reviewerName,
  rating,
  title,
  body,
  date,
  avatarLetter,
  avatarBgColor,
}) => {
  const theme = useTheme();

  return (
    <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 16px)' } }}>
      <Box display="flex" gap={2} mb={3}>
        <Avatar sx={{ bgcolor: avatarBgColor, color: theme.palette.common.white }}>
          {avatarLetter}
        </Avatar>
        <Box flexGrow={1}>
          <Typography variant="subtitle1" fontWeight="bold">
            {reviewerName}
          </Typography>
          <Rating value={rating} precision={0.5} readOnly size="small" sx={{ color: theme.palette.warning.main }} />
          <Typography variant="h6" fontWeight="bold" mt={1}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {body}
          </Typography>
          <Typography variant="caption" color="text.secondary" mt={1}>
            Đánh giá vào {date}
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