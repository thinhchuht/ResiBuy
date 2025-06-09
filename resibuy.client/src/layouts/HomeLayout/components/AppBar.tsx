import React, { useState } from "react";
import { AppBar as MuiAppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu, MenuItem, Divider } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

interface AppBarProps {
  open: boolean;
  drawerWidth: number;
  onDrawerToggle: () => void;
}

const AppBar: React.FC<AppBarProps> = ({ open, drawerWidth, onDrawerToggle }) => {
  const { logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

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

  return (
    <MuiAppBar
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
        <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={onDrawerToggle} sx={{ mr: 2 }}>
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
    </MuiAppBar>
  );
};

export default AppBar;
