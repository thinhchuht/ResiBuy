import { Avatar, Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Paper, Typography } from "@mui/material";
import { Person, Lock, Security, LocalShipping, Store } from "@mui/icons-material";
import type { User } from "../../types/models";

interface ProfileSidebarProps {
  user: User | null;
  selected: number;
  setSelected: (index: number) => void;
}

const ProfileSidebar = ({ user, selected, setSelected }: ProfileSidebarProps) => {
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
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
        <Avatar
          src={user?.avatar?.url}
          sx={{
            width: 100,
            height: 100,
            mb: 2,
            bgcolor: "#fce4ec",
            color: "#e91e63",
            fontSize: 48,
            border: "4px solid #fce4ec",
            boxShadow: "0 4px 12px rgba(233, 30, 99, 0.2)",
            "& img": {
              objectFit: "cover",
              width: "100%",
              height: "100%"
            }
          }}>
          {!user?.avatar?.url && <Person fontSize="inherit" />}
        </Avatar>
        <Typography variant="h6" fontWeight={700} textAlign="center" color="#e91e63">
          {user?.fullName || "User Name"}
        </Typography>
      </Box>
      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={selected === 0}
            onClick={() => setSelected(0)}
            sx={{
              borderRadius: 2,
              mb: 1,
              "&.Mui-selected": {
                backgroundColor: "rgba(233, 30, 99, 0.08)",
                "&:hover": {
                  backgroundColor: "rgba(233, 30, 99, 0.12)",
                },
              },
            }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Person sx={{ color: selected === 0 ? "#e91e63" : "inherit" }} />
            </ListItemIcon>
            <ListItemText
              primary="Thông tin cá nhân"
              primaryTypographyProps={{
                fontWeight: selected === 0 ? 600 : 400,
                color: selected === 0 ? "#e91e63" : "inherit",
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={selected === 1}
            onClick={() => setSelected(1)}
            sx={{
              borderRadius: 2,
              mb: 1,
              "&.Mui-selected": {
                backgroundColor: "rgba(233, 30, 99, 0.08)",
                "&:hover": {
                  backgroundColor: "rgba(233, 30, 99, 0.12)",
                },
              },
            }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Lock sx={{ color: selected === 1 ? "#e91e63" : "inherit" }} />
            </ListItemIcon>
            <ListItemText
              primary="Đổi mật khẩu"
              primaryTypographyProps={{
                fontWeight: selected === 1 ? 600 : 400,
                color: selected === 1 ? "#e91e63" : "inherit",
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={selected === 2}
            onClick={() => setSelected(2)}
            sx={{
              borderRadius: 2,
              mb: 1,
              "&.Mui-selected": {
                backgroundColor: "rgba(233, 30, 99, 0.08)",
                "&:hover": {
                  backgroundColor: "rgba(233, 30, 99, 0.12)",
                },
              },
            }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Security sx={{ color: selected === 2 ? "#e91e63" : "inherit" }} />
            </ListItemIcon>
            <ListItemText
              primary="Bảo mật"
              primaryTypographyProps={{
                fontWeight: selected === 2 ? 600 : 400,
                color: selected === 2 ? "#e91e63" : "inherit",
              }}
            />
          </ListItemButton>
        </ListItem>
        {user?.roles?.includes("SHIPPER") && (
          <ListItem disablePadding>
            <ListItemButton
              selected={selected === 3}
              onClick={() => setSelected(3)}
              sx={{
                borderRadius: 2,
                mb: 1,
                "&.Mui-selected": {
                  backgroundColor: "rgba(233, 30, 99, 0.08)",
                  "&:hover": {
                    backgroundColor: "rgba(233, 30, 99, 0.12)",
                  },
                },
              }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <LocalShipping sx={{ color: selected === 3 ? "#e91e63" : "inherit" }} />
              </ListItemIcon>
              <ListItemText
                primary="Tài khoản giao hàng"
                primaryTypographyProps={{
                  fontWeight: selected === 3 ? 600 : 400,
                  color: selected === 3 ? "#e91e63" : "inherit",
                }}
              />
            </ListItemButton>
          </ListItem>
        )}
        {user?.roles?.includes("SELLER") && (
          <ListItem disablePadding>
            <ListItemButton
              selected={selected === 4}
              onClick={() => setSelected(4)}
              sx={{
                borderRadius: 2,
                mb: 1,
                "&.Mui-selected": {
                  backgroundColor: "rgba(233, 30, 99, 0.08)",
                  "&:hover": {
                    backgroundColor: "rgba(233, 30, 99, 0.12)",
                  },
                },
              }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Store sx={{ color: selected === 4 ? "#e91e63" : "inherit" }} />
              </ListItemIcon>
              <ListItemText
                primary="Cửa hàng của bạn"
                primaryTypographyProps={{
                  fontWeight: selected === 4 ? 600 : 400,
                  color: selected === 4 ? "#e91e63" : "inherit",
                }}
              />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Paper>
  );
};

export default ProfileSidebar;
