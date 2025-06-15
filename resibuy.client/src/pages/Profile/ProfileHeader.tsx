import { Typography } from "@mui/material";
import { Link } from "react-router-dom";

const ProfileHeader = () => {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: 24 }}>
      <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
        Trang chủ
      </Link>
      / Hồ sơ của bạn
    </Typography>
  );
};

export default ProfileHeader;
