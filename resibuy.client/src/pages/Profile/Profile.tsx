import React, { useState } from "react";
import { Box, Container, Paper, Typography, Divider } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import ProfileHeader from "./ProfileHeader";
import ProfileSidebar from "./ProfileSidebar";
import PersonalInfoSection from "./PersonalInfoSection";
import PasswordChangeSection from "./PasswordChangeSection";
import SecuritySection from "./SecuritySection";
import ShipperSection from "./ShipperSection";
import StoreSection from "./StoreSection";

function maskMiddle(str: string | undefined) {
  if (!str || str.length < 3) return str || "";
  return str[0] + "*".repeat(str.length - 2) + str[str.length - 1];
}

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN");
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [selected, setSelected] = useState(0);
  const isAdmin = Boolean(user?.roles?.includes("ADMIN"));
  return (
    <Box sx={{ minHeight: "100vh", py: 6 }}>
      <Container maxWidth="lg">
        <ProfileHeader />
        {isAdmin && (
          <Typography variant="body1" color="error" mb={3}>
            Tài khoản Admin không thể chỉnh sửa thông tin cá nhân
          </Typography>
        )}
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ display: { xs: "block", md: "flex" }, gap: 3, alignItems: "flex-start" }}>
          <ProfileSidebar user={user} selected={selected} setSelected={setSelected} />
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              p: 4,
              borderRadius: 4,
              minWidth: 0,
              border: "1px solid rgba(33, 150, 243, 0.1)",
            }}>
            {selected === 0 && (
              <PersonalInfoSection
                isAdmin={isAdmin}
                formatDate={formatDate}
                maskMiddle={maskMiddle}
              />
            )}
            {selected === 1 && (
              <PasswordChangeSection
                user={user}
                isAdmin={isAdmin}
              />
            )}
            {selected === 2 && <SecuritySection />}
            {selected === 3 && user?.roles?.includes("SHIPPER") && <ShipperSection />}
            {selected === 4 && user?.roles?.includes("SELLER") && <StoreSection />}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Profile;
