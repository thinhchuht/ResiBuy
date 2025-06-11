import React from 'react';
import { Box, Typography, Container, Paper, TextField, Button, Divider } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import MessageIcon from '@mui/icons-material/Message';
import { useLocation } from 'react-router-dom';
import type { CartItem } from '../../types/models';

interface GroupedItems {
  storeId: string;
  storeName: string;
  items: CartItem[];
}

const Checkout: React.FC = () => {
  const location = useLocation();
  const { selectedItems } = location.state as { selectedItems: CartItem[] };

  const groupedItems = selectedItems.reduce((groups: GroupedItems[], item) => {
    const storeId = item.product.storeId;
    const existingGroup = groups.find(group => group.storeId === storeId);
    
    if (existingGroup) {
      existingGroup.items.push(item);
    } else {
      groups.push({
        storeId,
        storeName: `Đơn hàng ${groups.length + 1}`,
        items: [item]
      });
    }
    
    return groups;
  }, []);

  const calculateStoreTotal = (items: CartItem[]) => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const calculateTotalItems = () => {
    return selectedItems.reduce((total, item) => total + item.quantity, 0);
  };

  const calculateOverallTotal = () => {
    return groupedItems.reduce((overallTotal, group) => overallTotal + calculateStoreTotal(group.items), 0);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
        Thanh toán đơn hàng
      </Typography>
      
      <>
        {groupedItems.map((group) => (
          <Paper key={group.storeId} elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ShoppingCartIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#555' }}>
                {group.storeName}
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
              {group.items.map((item) => (
                <Box key={item.id} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 2, display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ minWidth: 60, mr: 2 }}>
                    <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '60px', height: '60px', borderRadius: '4px' }} />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {item.product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Loại: {item.product.categoryId}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right', minWidth: 80 }}>
                    <Typography variant="body2" color="text.secondary">
                      Cân nặng
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {item.product.weight}kg
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right', minWidth: 120 }}>
                    <Typography variant="body2" color="text.secondary">
                      Đơn giá
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      ₫{item.product.price.toFixed(3).replace(/\.?0+$/, '')}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                    <Typography variant="body2" color="text.secondary">
                      Số lượng
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {item.quantity}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right', minWidth: 80 }}>
                    <Typography variant="body2" color="text.secondary">
                      Thành tiền
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#ff6600' }}>
                      ₫{(item.product.price * item.quantity).toFixed(3).replace(/\.?0+$/, '')}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 4, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalOfferIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#555' }}>
                  Voucher của Shop
                </Typography>
              </Box>
              <Button variant="text" sx={{ textTransform: 'none', color: '#1976d2', '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}>
                Chọn Voucher
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
              <MessageIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#555' }}>
                Lời nhắn:
              </Typography>
              <TextField
                variant="outlined"
                placeholder="Lưu ý cho Người bán..."
                size="small"
                sx={{ ml: 2, flexGrow: 1 }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#555' }}>
                Tổng tiền đơn hàng:
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ff6600' }}>
                ₫{calculateStoreTotal(group.items).toFixed(3).replace(/\.?0+$/, '')}
              </Typography>
            </Box>
          </Paper>
        ))}
      </>

      {/* Overall Summary */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
            Tổng sản phẩm: {calculateTotalItems()}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ff6600' }}>
            Tổng tiền: ₫{calculateOverallTotal().toFixed(3).replace(/\.?0+$/, '')}
          </Typography>
        </Box>
        <Button variant="contained" color="primary" fullWidth sx={{ py: 1.5, fontSize: '1.1rem' }}>
          Tiếp tục Thanh toán
        </Button>
      </Paper>

    </Container>
  );
};

export default Checkout;