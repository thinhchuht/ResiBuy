import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
} from "@mui/material";
import type { Product, Store, Category, User } from "../../types/storeData";

const mockProducts: Product[] = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    describe: "Điện thoại Apple với chip A17 Pro và camera nâng cấp",
    weight: 0.24,
    isOutOfStock: false,
    discount: 10,
    sold: 120,
    createdAt: new Date(),
    updatedAt: new Date(),
    storeId: "store_1",
    categoryId: "category_1",
    store: {} as Store,
    category: {} as Category,
    productDetails: [
      {
        id: 101,
        isOutOfStock: false,
        productId: 1,
        product: {} as Product,
        sold: 120,
        price: 29990000,
        image: {
          id: "img_1",
          url: "https://via.placeholder.com/400x250",
          thumbUrl: "",
          name: "image",
          categoryId: "",
          userId: "",
          user: {} as User,
        },
        cartItems: [],
        orderItems: [],
        additionalData: [],
      },
    ],
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    describe: "Flagship Samsung với màn hình 120Hz, S-Pen tích hợp",
    weight: 0.22,
    isOutOfStock: false,
    discount: 5,
    sold: 80,
    createdAt: new Date(),
    updatedAt: new Date(),
    storeId: "store_2",
    categoryId: "category_1",
    store: {} as Store,
    category: {} as Category,
    productDetails: [
      {
        id: 102,
        isOutOfStock: false,
        productId: 2,
        product: {} as Product,
        sold: 80,
        price: 25990000,
        image: {
          id: "img_2",
          url: "https://via.placeholder.com/400x250",
          thumbUrl: "",
          name: "image2",
          categoryId: "",
          userId: "",
          user: {} as unknown as User,
        },
        cartItems: [],
        orderItems: [],
        additionalData: [],
      },
    ],
  },
];

const Products: React.FC = () => {
  return (
    <Box p={2}>
      <Typography variant="h4" mb={3} fontWeight="bold">
        Danh sách sản phẩm
      </Typography>

      {/* Flex container */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
        }}
      >
        {mockProducts.map((product) => {
          const imageUrl = product.productDetails?.[0]?.image?.url;
          return (
            <Box
              key={product.id}
              sx={{ flex: "0 0 calc(25% - 24px)", }}
            >
              <Card sx={{ borderRadius: 2, boxShadow: 3, height: "100%" }}>
                <CardMedia
                  component="img"
                  image={imageUrl || "https://via.placeholder.com/400x250"}
                  height="200"
                  alt={product.name}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {product.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {product.describe}
                  </Typography>
                  <Button variant="contained" color="primary" fullWidth>
                    Chi tiết
                  </Button>
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default Products;
