import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import {  Box, CssBaseline, Toolbar } from "@mui/material";
import { drawerWidth, Main } from "./StyledComponents";
import AppBar from "./AppBar";
import Drawer from "./Drawer";
interface HomeLayoutProps {
  children?: React.ReactNode;
}

const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
  const [open, setOpen] = useState(true);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar open={open} drawerWidth={drawerWidth} onDrawerToggle={handleDrawerToggle} />
      <Drawer open={open} drawerWidth={drawerWidth} />
      <Main open={open}>
        <Toolbar />
        {children || <Outlet />}
      </Main>
    </Box>
  );
};

export default HomeLayout;
