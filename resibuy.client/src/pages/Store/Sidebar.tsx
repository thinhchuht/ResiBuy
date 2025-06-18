// components/Sidebar.tsx
import React from 'react';
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import StoreIcon from '@mui/icons-material/Store';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Danh sách sản phẩm', icon: <ListAltIcon />, path: '/products' },
    { text: 'Thêm sản phẩm', icon: <AddBoxIcon />, path: '/products/create' },
  ];

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: 240,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: 240, boxSizing: 'border-box' },
      }}
    >
      <List>
        <ListItemButton onClick={() => navigate('/')}> 
          <ListItemIcon><StoreIcon /></ListItemIcon>
          <ListItemText primary="Trang chủ" />
        </ListItemButton>
        {menuItems.map((item, index) => (
          <ListItemButton key={index} onClick={() => navigate(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
