// Sidebar.tsx
import { List, ListItemButton, ListItemText } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import type { MenuItem } from "./menuItems";

interface SidebarProps {
  menuItems: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ menuItems }) => {
  const location = useLocation();

  return (
    <List
      sx={{
        width: 240,
        backgroundColor: "#f5f5f5",
        height: "100vh",
        borderRight: "1px solid #ccc", // dễ nhìn layout hơn
      }}
    >
      {menuItems.map((item) => (
        <ListItemButton
          key={item.path}
          component={Link}
          to={item.path}
          selected={location.pathname === item.path}
        >
          <ListItemText primary={item.label} />
        </ListItemButton>
      ))}
    </List>
  );
};

export default Sidebar;
