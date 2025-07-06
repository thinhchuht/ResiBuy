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
        width: 280,
        bgcolor: "#fff",
        borderRadius: "16px",
        boxShadow: 3,
        p: 2,
        display: "inline-block", // Chỉ chiếm chiều cao theo nội dung
        height: "auto",
      }}
    >
      {menuItems.map((item) => {
        const selected = location.pathname === item.path;

        return (
          <ListItemButton
            key={item.path}
            component={Link}
            to={item.path}
            selected={selected}
            sx={{
              borderRadius: 2,
              mb: 1,
              bgcolor: selected ? "#fdecef" : "transparent",
              color: selected ? "#e91e63" : "#333",
              fontWeight: selected ? "bold" : "normal",
              justifyContent: "flex-start",
              "& .MuiListItemText-root": {
                textAlign: "left",
              },
              "&:hover": {
                bgcolor: "#fdecef",
                color: "#e91e63",
              },
            }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        );
      })}
    </List>
  );
};

export default Sidebar;
