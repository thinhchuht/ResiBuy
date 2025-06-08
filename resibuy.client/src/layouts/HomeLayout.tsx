import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import { Menu as MenuIcon, Dashboard, ShoppingCart, LocalShipping, Person, Settings } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import Logo from "../assets/Logo.png";
import { useAuth } from "../contexts/AuthContext";

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface HomeLayoutProps {
  children?: React.ReactNode;
}
const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    logout();
    navigate("/login");
  };

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/home" },
    { text: "Orders", icon: <ShoppingCart />, path: user ? "/orders" : "/login" },
    { text: "Shipping", icon: <LocalShipping />, path: user ? "/shipping" : "/login" },
    { text: "Profile", icon: <Person />, path: user ? "/profile" : "/login" },
    { text: "Settings", icon: <Settings />, path: "/settings" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${open ? drawerWidth : 0}px)`,
          ml: `${open ? drawerWidth : 0}px`,
          transition: (theme) =>
            theme.transitions.create(["margin", "width"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}>
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            ResiBuy
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Avatar sx={{ width: 32, height: 32, cursor: "pointer" }} onClick={handleProfileMenuOpen}>
            U
          </Avatar>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleProfileMenuClose}>
            <MenuItem onClick={() => navigate("/profile")}>Profile</MenuItem>
            <MenuItem onClick={() => navigate("/settings")}>Settings</MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}>
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
            <img src={Logo} alt="ResiBuy Logo" style={{ height: 40, marginRight: 8 }} />
            <Typography variant="h6" noWrap component="div">
              ResiBuy
            </Typography>
          </Box>
        </Toolbar>
        <Divider />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton onClick={() => navigate(item.path)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      <Main open={open}>
        <Toolbar />
        {children || <Outlet />}
      </Main>
    </Box>
  );
};

export default HomeLayout;
