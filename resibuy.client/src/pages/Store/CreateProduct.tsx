// components/CreateProduct.tsx
import React, { useState } from 'react';
import {
  Paper,
  TextField,
  Button,
  Typography,
  FormControlLabel,
  Switch,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CostDataEditor from './CostDataEditor';

const CreateProduct: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    describe: '',
    weight: '',
    discount: '',
    isOutOfStock: false,
    isActive: true,
    storeId: '',
    categoryId: '',
  });

  const [costData, setCostData] = useState([]);

  const stores = [
    { id: 'store-1', name: 'Cửa hàng A' },
    { id: 'store-2', name: 'Cửa hàng B' },
  ];

  const categories = [
    { id: 'category-1', name: 'Điện tử' },
    { id: 'category-2', name: 'Thời trang' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name as string]: value }));
  };

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      weight: parseFloat(form.weight),
      discount: parseInt(form.discount),
      costData,
    };
    console.log('Đã tạo sản phẩm:', payload);
    navigate('/products');
  };

  return (
    <Paper sx={{ padding: 4 }}>
      <Typography variant="h5" gutterBottom>Tạo sản phẩm mới</Typography>
      <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
        <TextField label="Tên sản phẩm" name="name" value={form.name} onChange={handleChange} required />
        <TextField label="Mô tả" name="describe" value={form.describe} onChange={handleChange} multiline />
        <TextField label="Trọng lượng (kg)" name="weight" type="number" value={form.weight} onChange={handleChange} required />
        <TextField label="Giảm giá (%)" name="discount" type="number" value={form.discount} onChange={handleChange} />
        <FormControl fullWidth>
          <InputLabel>Cửa hàng</InputLabel>
          <Select name="storeId" value={form.storeId} label="Cửa hàng" onChange={handleChange} required>
            {stores.map(store => <MenuItem key={store.id} value={store.id}>{store.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Danh mục</InputLabel>
          <Select name="categoryId" value={form.categoryId} label="Danh mục" onChange={handleChange} required>
            {categories.map(cat => <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControlLabel control={<Switch checked={form.isOutOfStock} onChange={handleToggle} name="isOutOfStock" />} label="Hết hàng" />
        <FormControlLabel control={<Switch checked={form.isActive} onChange={handleToggle} name="isActive" />} label="Kích hoạt sản phẩm" />

        <CostDataEditor costData={costData} setCostData={setCostData} />

        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" onClick={() => navigate('/products')}>Hủy</Button>
          <Button type="submit" variant="contained" color="primary">Tạo</Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default CreateProduct;
