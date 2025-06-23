import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

// Interface
interface AdditionalDataInput {
  key: string;
  value: string;
}
interface ProductDetailInput {
  price: number;
  weight: number;
  isOutOfStock: boolean;
  additionalData: AdditionalDataInput[];
}
interface ProductInput {
  name: string;
  describe: string;
  discount: number;
  storeId: string;
  categoryId: string;
  productDetails: ProductDetailInput[];
}

// Main component
export default function CreateProduct() {
  const [product, setProduct] = useState<ProductInput>({
    name: "",
    describe: "",
    discount: 0,
    storeId: "",
    categoryId: "",
    productDetails: [],
  });

  // Handler thêm ProductDetail
  const addProductDetail = () => {
    setProduct((prev) => ({
      ...prev,
      productDetails: [
        ...prev.productDetails,
        { price: 0, weight: 0, isOutOfStock: false, additionalData: [] },
      ],
    }));
  };
  // Handler xóa ProductDetail
  const removeProductDetail = (detailIndex: number) => {
    setProduct((prev) => {
      const productDetails = [...prev.productDetails];
      productDetails.splice(detailIndex, 1);
      return { ...prev, productDetails };
    });
  };
  // Handler thêm AdditionalData
  const addAdditionalData = (detailIndex: number) => {
    setProduct((prev) => {
      const productDetails = [...prev.productDetails];
      productDetails[detailIndex].additionalData.push({ key: "", value: "" });
      return { ...prev, productDetails };
    });
  };
  // Handler xóa AdditionalData
  const removeAdditionalData = (detailIndex: number, adIndex: number) => {
    setProduct((prev) => {
      const productDetails = [...prev.productDetails];
      productDetails[detailIndex].additionalData.splice(adIndex, 1);
      return { ...prev, productDetails };
    });
  };

  return (
    <Box p={2} display="flex" flexDirection="column" gap={2}>
      {/* Thông tin sản phẩm */}
      <Card>
        <CardContent>
          <Typography variant="h6">Thông tin sản phẩm</Typography>
          <Box mt={1} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Tên sản phẩm"
              fullWidth
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
            />
            <TextField
              label="Mô tả"
              fullWidth
              multiline
              value={product.describe}
              onChange={(e) => setProduct({ ...product, describe: e.target.value })}
            />
            <TextField
              label="Discount (%)"
              type="number"
              value={product.discount}
              onChange={(e) =>
                setProduct({ ...product, discount: Number(e.target.value) })
              }
            />
            <TextField
              label="Store ID"
              value={product.storeId}
              onChange={(e) => setProduct({ ...product, storeId: e.target.value })}
            />
            <TextField
              label="Category ID"
              value={product.categoryId}
              onChange={(e) => setProduct({ ...product, categoryId: e.target.value })}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Biến thể sản phẩm */}
      <Card>
        <CardContent>
          <Typography variant="h6">Biến thể sản phẩm</Typography>
          {product.productDetails.map((detail, index) => (
            <Box
              key={index}
              mt={2}
              p={2}
              border="1px solid #ccc"
              borderRadius={2}
              display="flex"
              flexDirection="column"
              gap={2}
            >
              {/* Các trường biến thể */}
              <Box display="flex" gap={2} alignItems="center">
                <TextField
                  label="Price"
                  type="number"
                  value={detail.price}
                  onChange={(e) => {
                    const productDetails = [...product.productDetails];
                    productDetails[index].price = Number(e.target.value);
                    setProduct({ ...product, productDetails });
                  }}
                />
                <TextField
                  label="Weight"
                  type="number"
                  value={detail.weight}
                  onChange={(e) => {
                    const productDetails = [...product.productDetails];
                    productDetails[index].weight = Number(e.target.value);
                    setProduct({ ...product, productDetails });
                  }}
                />
                <Checkbox
                  checked={detail.isOutOfStock}
                  onChange={(e) => {
                    const productDetails = [...product.productDetails];
                    productDetails[index].isOutOfStock = e.target.checked;
                    setProduct({ ...product, productDetails });
                  }}
                />
                Hết hàng
                <IconButton color="error" onClick={() => removeProductDetail(index)}>
                  <Delete />
                </IconButton>
              </Box>

              {/* AdditionalData */}
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => addAdditionalData(index)}
              >
                Thêm thông tin thêm
              </Button>
              {detail.additionalData.map((ad, adIndex) => (
                <Box mt={1} display="flex" gap={2} key={adIndex} alignItems="center">
                  <TextField
                    label="Key"
                    value={ad.key}
                    onChange={(e) => {
                      const productDetails = [...product.productDetails];
                      productDetails[index].additionalData[adIndex].key = e.target.value;
                      setProduct({ ...product, productDetails });
                    }}
                  />
                  <TextField
                    label="Value"
                    value={ad.value}
                    onChange={(e) => {
                      const productDetails = [...product.productDetails];
                      productDetails[index].additionalData[adIndex].value = e.target.value;
                      setProduct({ ...product, productDetails });
                    }}
                  />
                  <IconButton color="error" onClick={() => removeAdditionalData(index, adIndex)}>
                    <Delete />
                  </IconButton>
                </Box>
              ))}
            </Box>
          ))}

          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ mt: 2 }}
            onClick={addProductDetail}
          >
            Thêm biến thể sản phẩm
          </Button>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button
        variant="contained"
        color="primary"
        sx={{ alignSelf: "flex-end" }}
        onClick={() => {
          // Gửi API
          console.log(product); 
          // axios.post('/your-api-url', product)
        }}
      >
        Tạo sản phẩm
      </Button>
    </Box>
  );
}
