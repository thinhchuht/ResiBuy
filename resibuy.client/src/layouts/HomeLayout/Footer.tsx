import React from "react";
import { Box, Container, Typography, Grid, Link, IconButton, Divider, useTheme } from "@mui/material";
import { Facebook, Twitter, Instagram, LinkedIn, Email, Phone, LocationOn } from "@mui/icons-material";

interface FooterProps {
  open: boolean;
  drawerWidth: number;
}

const Footer: React.FC<FooterProps> = ({ open, drawerWidth }) => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: theme.palette.primary.main,
        color: "white",
        py: 6,
        mt: "auto",
        position: "relative",
        bottom: 0,
        width: `calc(100% - ${open ? drawerWidth : 0}px)`,
        ml: `${open ? drawerWidth : 0}px`,
        transition: (theme) =>
          theme.transitions.create(["margin", "width"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
      }}>
      <Container maxWidth="lg">
        <Grid>
          {/* Company Info */}
          <Grid>
            <Typography variant="h6" gutterBottom>
              ResiBuy
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Your trusted partner in residential property management and real estate solutions.
            </Typography>
            <Box sx={{ mt: 2 }}>
              <IconButton color="inherit" aria-label="Facebook">
                <Facebook />
              </IconButton>
              <IconButton color="inherit" aria-label="Twitter">
                <Twitter />
              </IconButton>
              <IconButton color="inherit" aria-label="Instagram">
                <Instagram />
              </IconButton>
              <IconButton color="inherit" aria-label="LinkedIn">
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
        {/* Quick Links */}
        <Grid>
          <Typography variant="h6" gutterBottom>
            Quick Links
          </Typography>
          <Link href="/about" color="inherit" display="block" sx={{ mb: 1 }}>
            About Us
          </Link>
          <Link href="/services" color="inherit" display="block" sx={{ mb: 1 }}>
            Services
          </Link>
          <Link href="/properties" color="inherit" display="block" sx={{ mb: 1 }}>
            Properties
          </Link>
          <Link href="/contact" color="inherit" display="block" sx={{ mb: 1 }}>
            Contact
          </Link>
        </Grid>

        {/* Contact Info */}
        <Grid>
          <Typography variant="h6" gutterBottom>
            Contact Us
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <LocationOn sx={{ mr: 1 }} />
            <Typography variant="body2">123 Real Estate Street, City, Country</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Phone sx={{ mr: 1 }} />
            <Typography variant="body2">+1 234 567 890</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Email sx={{ mr: 1 }} />
            <Typography variant="body2">info@resibuy.com</Typography>
          </Box>
        </Grid>

        <Divider sx={{ my: 3, bgcolor: "rgba(255, 255, 255, 0.2)" }} />

        {/* Copyright */}
        <Typography variant="body2" align="center">
          © {new Date().getFullYear()} ResiBuy. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
