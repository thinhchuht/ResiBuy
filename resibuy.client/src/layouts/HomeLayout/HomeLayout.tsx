import React from "react";
import { Outlet } from "react-router-dom";
import {  Box, CssBaseline, Toolbar } from "@mui/material";
import { Main } from "./StyledComponents";
import AppBar from "./AppBar";
import Footer from "./Footer";

interface HomeLayoutProps {
  children?: React.ReactNode;
}

const HomeLayout: React.FC<HomeLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#F5F5F5" }}>
      <CssBaseline />
      <AppBar />
      <Main sx={{ flexGrow: 1 }}>
        <Toolbar />
        {children || <Outlet />}
      </Main>
      <Footer />
    </Box>
  );
};

export default HomeLayout;
