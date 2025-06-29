import { Breadcrumbs, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
const ProfileHeader = () => {
  return (
    <Breadcrumbs
    separator={<NavigateNextIcon fontSize="small" />}
    aria-label="breadcrumb"
    sx={{
      mb: 3,
      fontSize: 20,
      fontWeight: 500,
      '& .MuiBreadcrumbs-separator': { color: '#bdbdbd' }
    }}
  >
    <Link
      to="/"
      style={{
        display: 'flex',
        alignItems: 'center',
        textDecoration: 'none',
        color: '#1976d2',
        fontWeight: 600
      }}
    >
      <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
      Trang chủ
    </Link>
    <Typography color="#2c3e50" fontWeight={700}>
     Hồ sơ của bạn
    </Typography>
  </Breadcrumbs>
  );
};

export default ProfileHeader;
