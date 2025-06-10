import React, { useState } from "react";
import {
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
} from "@mui/material";
import { Login, Logout, Person, Settings } from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import SearchBase from "../../components/SearchBase";
import logo from "../../assets/Images/Logo.png";
const AppBar: React.FC = () => {
  const { logout } = useAuth();
  const { user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handleSearch = () => {
    console.log(searchValue);
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

  return (
    <MuiAppBar
      position="fixed"
      elevation={3}
      sx={{
        paddingTop: "7px",
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(8px)",
        color: "#333",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        width: `100%`,
        ml: 0,
        transition: (theme) =>
          theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        borderBottom: "1px solid black",
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
      }}
    >
      <Toolbar>
        <Link to={"/"}>
          <img
            src={logo}
            alt="ResiBuy"
            style={{ width: "65px", height: "60px" }}
          />
        </Link>

        <Box sx={{ flexGrow: 1 }} />
        <SearchBase
          value={searchValue}
          onChange={handleSearchChange}
          onSearch={handleSearch}
          sx={{ width: "300px", marginRight: 3 }}
          inputSx={{ width: "100%" }}
        />
        {user ? (
          <Avatar
            sx={{
              width: 36,
              height: 36,
              cursor: "pointer",
              bgcolor: "#EB5C60",
              color: "#fff",
              fontWeight: 600,
            }}
            onClick={handleProfileMenuOpen}
          >
            <Person />
          </Avatar>
        ) : (
          <Tooltip title="Đăng nhập">
            <IconButton color="inherit" onClick={() => navigate("/login")}>
              <Login sx={{ color: "red" }} />
            </IconButton>
          </Tooltip>
        )}
        <Menu
          sx={{
            marginRight: 2,
          }}
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
        >
          <MenuItem onClick={() => navigate("/profile")} sx={{ gap: 1 }}>
            <Person fontSize="small" />
            <Typography variant="body2">Hồ sơ</Typography>
          </MenuItem>
          <MenuItem onClick={() => navigate("/settings")} sx={{ gap: 1 }}>
            <Settings fontSize="small" />
            <Typography variant="body2">Cài đặt</Typography>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={handleLogout}
            sx={{
              gap: 1,
              color: "error.main",
              "&:hover": { backgroundColor: "rgba(255, 0, 0, 0.08)" },
            }}
          >
            <Logout />
            <Typography variant="body2">Đăng xuất</Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;
