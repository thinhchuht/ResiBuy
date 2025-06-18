// components/ProductList.tsx
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
}

const mockProducts: Product[] = [
  { id: '1', name: 'Sản phẩm A', price: 100000, isActive: true },
  { id: '2', name: 'Sản phẩm B', price: 200000, isActive: false },
  { id: '3', name: 'Sản phẩm C', price: 150000, isActive: true },
];

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const navigate = useNavigate();

  const toggleProductStatus = (id: string) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, isActive: !p.isActive } : p
      )
    );
  };

  return (
    <Paper sx={{ padding: 2 }}>
      <Typography variant="h5" gutterBottom>Danh sách sản phẩm</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell>Giá</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} hover>
                <TableCell onClick={() => navigate(`/products/${product.id}`)} style={{ cursor: 'pointer' }}>{product.name}</TableCell>
                <TableCell>{product.price.toLocaleString()} VND</TableCell>
                <TableCell>{product.isActive ? 'Đang bán' : 'Ngưng bán'}</TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => navigate(`/products/update/${product.id}`)} sx={{ mr: 1 }}>
                    Sửa
                  </Button>
                  <Button variant="outlined" color={product.isActive ? 'warning' : 'success'} onClick={() => toggleProductStatus(product.id)}>
                    {product.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ProductList;
