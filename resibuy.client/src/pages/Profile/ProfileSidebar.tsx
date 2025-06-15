import { Avatar, Box, List, ListItem, ListItemIcon, ListItemText, Paper, Typography } from "@mui/material";
import { Person, Settings, Security } from "@mui/icons-material";
import type { User } from "../../types/models";

interface ProfileSidebarProps {
  user: User | null;
  selected: number;
  setSelected: (index: number) => void;
  avatar: string | null;
}

const ProfileSidebar = ({ user, selected, setSelected, avatar }: ProfileSidebarProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        minWidth: { xs: "100%", md: 280 },
        maxWidth: 320,
        mb: { xs: 3, md: 0 },
        border: "1px solid rgba(233, 30, 99, 0.1)",
      }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Avatar
          src={avatar || undefined}
          sx={{
            width: 100,
            height: 100,
            mb: 2,
            bgcolor: "#fce4ec",
            color: "#e91e63",
            fontSize: 48,
            border: "4px solid #fce4ec",
            boxShadow: "0 4px 12px rgba(233, 30, 99, 0.2)",
          }}>
          {!avatar && <Person fontSize="inherit" />}
        </Avatar>
        <Typography variant="h6" fontWeight={700} mb={2} textAlign="center" color="#e91e63">
          {user?.fullName || "User Name"}
        </Typography>
      </Box>
      <List sx={{ width: "100%" }}>
        <ListItem
          sx={{
            borderRadius: 3,
            mb: 1.5,
            bgcolor: selected === 0 ? "rgba(233, 30, 99, 0.08)" : "transparent",
            cursor: "pointer",
            border: selected === 0 ? "2px solid #e91e63" : "none",
            transition: "all 0.3s ease",
            "&:hover": {
              bgcolor: "rgba(233, 30, 99, 0.04)",
              transform: "translateX(4px)",
            },
            "& .MuiListItemText-primary": {
              fontWeight: selected === 0 ? 700 : 500,
              color: selected === 0 ? "#e91e63" : "inherit",
              fontSize: "1rem",
            },
          }}
          onClick={() => setSelected(0)}>
          <ListItemIcon>
            <Person
              sx={{
                color: selected === 0 ? "#e91e63" : "inherit",
                transition: "all 0.3s ease",
              }}
            />
          </ListItemIcon>
          <ListItemText primary="Thông tin cá nhân" />
        </ListItem>
        <ListItem
          sx={{
            borderRadius: 3,
            mb: 1.5,
            bgcolor: selected === 1 ? "rgba(233, 30, 99, 0.08)" : "transparent",
            cursor: "pointer",
            border: selected === 1 ? "2px solid #e91e63" : "none",
            transition: "all 0.3s ease",
            "&:hover": {
              bgcolor: "rgba(233, 30, 99, 0.04)",
              transform: "translateX(4px)",
            },
            "& .MuiListItemText-primary": {
              fontWeight: selected === 1 ? 700 : 500,
              color: selected === 1 ? "#e91e63" : "inherit",
              fontSize: "1rem",
            },
          }}
          onClick={() => setSelected(1)}>
          <ListItemIcon>
            <Settings
              sx={{
                color: selected === 1 ? "#e91e63" : "inherit",
                transition: "all 0.3s ease",
              }}
            />
          </ListItemIcon>
          <ListItemText primary="Đổi mật khẩu" />
        </ListItem>
        <ListItem
          sx={{
            borderRadius: 3,
            bgcolor: selected === 2 ? "rgba(233, 30, 99, 0.08)" : "transparent",
            cursor: "pointer",
            border: selected === 2 ? "2px solid #e91e63" : "none",
            transition: "all 0.3s ease",
            "&:hover": {
              bgcolor: "rgba(233, 30, 99, 0.04)",
              transform: "translateX(4px)",
            },
            "& .MuiListItemText-primary": {
              fontWeight: selected === 2 ? 700 : 500,
              color: selected === 2 ? "#e91e63" : "inherit",
              fontSize: "1rem",
            },
          }}
          onClick={() => setSelected(2)}>
          <ListItemIcon>
            <Security
              sx={{
                color: selected === 2 ? "#e91e63" : "inherit",
                transition: "all 0.3s ease",
              }}
            />
          </ListItemIcon>
          <ListItemText primary="Bảo mật" />
        </ListItem>
      </List>
    </Paper>
  );
};

export default ProfileSidebar;
