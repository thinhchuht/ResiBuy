import { Box, Breadcrumbs, Link, Typography } from "@mui/material";
import { NavigateNext } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import AreasPage from "../../../components/admin/Area/AreasPage";

export default function OverviewPage() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: (theme) => theme.palette.grey[50],
      }}
    >
      <Box
        component="header"
        sx={{
          display: "flex",
          height: 64,
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          px: 2,
        }}
      >
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} aria-label="breadcrumb">
          <Link component={RouterLink} to="/overview" color="inherit">
            <Typography variant="h6" sx={{ fontWeight: "medium" }}>
              Tổng Quan
            </Typography>
          </Link>
        </Breadcrumbs>
      </Box>

      <AreasPage />
    </Box>
  );
}