import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "../../api/base.api";

interface Store {
  id: string; // Guid → string
  name: string;
  description: string;
  isLocked: boolean;
  isOpen: boolean;
  reportCount: number;
  createdAt: Date;
  ownerId: string;
  roomId: string;
}

const StoreList: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await axios.get(`api/User/${userId}`);
        const stores: Store[] = response.data.data.stores || [];
        setStores(stores);
      } catch (error) {
        console.error("Lỗi khi tải danh sách cửa hàng:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const handleStoreClick = (storeId: string) => {
    navigate(`/store/${storeId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Danh sách cửa hàng của bạn
      </Typography>

      <Box display="flex" flexWrap="wrap" gap={2}>
        {stores.map((store) => (
          <Card
            key={store.id}
            sx={{
              width: 280,
              flexShrink: 0,
              cursor: "pointer",
              transition: "transform 0.2s",
              "&:hover": { transform: "scale(1.03)" },
            }}
            onClick={() => handleStoreClick(store.id)}
          >
            <CardActionArea>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {store.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {store.description || "Không có mô tả"}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default StoreList;
