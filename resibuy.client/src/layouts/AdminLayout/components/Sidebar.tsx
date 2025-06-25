
import Logo from "../../../assets/Images/Logo.png"
import { useLocation, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Paper,
} from "@mui/material";
import { Settings, Logout, ShoppingBag } from "@mui/icons-material";
import { menuItems } from "../../../constants/share";

export function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <Paper
      elevation={0}
      sx={{
        width: 256,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #e0e0e0",
      }}
    >
      {/* Header */}
      <Box sx={{ px: 1, py: 2, borderBottom: "1px solid #e0e0e0" }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
        
          >
           <img src={Logo} alt="Logo" width={100} height={72} />

          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Admin
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Dashboard
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Main Menu */}
      <Box sx={{ flex: 1, py: 2, px: 2 }}>
        <Typography
          variant="caption"
          fontWeight={600}
          color="text.secondary"
          sx={{ mb: 1.5, px: 1, display: "block", textTransform: "uppercase" }}
        >
          Main Menu
        </Typography>
        <List disablePadding>
          {menuItems.map((item) => {
            const isActive = pathname === item.url;
            const Icon = item.icon;

            return (
              <ListItemButton
                key={item.title}
                component={Link}
                to={item.url}
                selected={isActive}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  color: isActive ? "primary.main" : "text.secondary",
                  "&:hover": {
                    backgroundColor: "action.hover",
                    color: "text.primary",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                  <Icon sx={{ fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{ fontSize: 14 }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Divider />
      <Box sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          <Avatar sx={{ bgcolor: "grey.200", width: 32, height: 32 }}>
            <Typography fontSize={12}>AD</Typography>
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap fontWeight={500}>
              Admin User
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              admin@b
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1}>
          <IconButton size="small" sx={{ color: "text.secondary" }}>
            <Settings sx={{ width: 16, height: 16 }} />
          </IconButton>
          <IconButton size="small" sx={{ color: "text.secondary" }}>
            <Logout sx={{ width: 16, height: 16 }} />
          </IconButton>
        </Stack>
      </Box>
    </Paper>
  );
}

export default Sidebar;
