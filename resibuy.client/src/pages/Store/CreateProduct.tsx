import React, { useState } from 'react';
import { Card, CardContent, TextField, Typography, Button, Box } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface ProductOption {
  key: string;
  values: string[];
}

interface ProductDetail {
  id: number;
  options: ProductOption[];
}

interface AdditionalDataItem {
  id: number;
  key: string;
  values: string[];
}

const ProductDetailUI: React.FC = () => {
  const [productDetails, setProductDetails] = useState<ProductDetail[]>([{
    id: Date.now(),
    options: [{ key: 'Ram', values: ['2GB', '4GB'] }]
  }]);

  const [additionalData, setAdditionalData] = useState<AdditionalDataItem[]>([{
    id: Date.now(),
    key: 'Màu sắc',
    values: ['Cam', 'Vàng'],
  }]);

  const addProductDetailOption = () => {
    setProductDetails([...productDetails, { id: Date.now(), options: [] }]);
  };

  const addAdditionalData = () => {
    setAdditionalData([...additionalData, { id: Date.now(), key: '', values: [''] }]);
  };

  return (
    <Box p={2}>
      <Box mb={3}>
        <Typography variant="h6">Product Details (Phân loại 1)</Typography>
        {productDetails.map((detail, index) => (
          <Card key={detail.id} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Typography>Phân loại 1 - {index + 1}</Typography>
              {detail.options.map((option, optIndex) => (
                <Box key={optIndex} display="flex" gap={2} mb={2}>
                  <TextField label="Key" value={option.key} fullWidth />
                  <TextField label="Values" value={option.values.join(', ')} fullWidth />
                </Box>
              ))}
            </CardContent>
          </Card>
        ))}
        <Button onClick={addProductDetailOption} variant="contained" startIcon={<AddIcon />}>
          Thêm chi tiết sản phẩm
        </Button>
      </Box>

      <Box mb={3}>
        <Typography variant="h6">Additional Data (Phân loại 2)</Typography>
        {additionalData.map((data) => (
          <Card key={data.id} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" gap={2}>
                <TextField label="Key" value={data.key} fullWidth />
                <TextField label="Values" value={data.values.join(', ')} fullWidth />
              </Box>
            </CardContent>
          </Card>
        ))}
        <Button onClick={addAdditionalData} variant="contained" startIcon={<AddIcon />}>
          Thêm phân loại
        </Button>
      </Box>
    </Box>
  );
};

export default ProductDetailUI;