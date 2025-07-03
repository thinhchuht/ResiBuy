import { useState, useEffect } from "react";
import { Box, Typography, IconButton, Link, Breadcrumbs } from "@mui/material";
import { Edit, Visibility, Delete,ToggleOn, ToggleOff, LocationOn as AreaIcon, NavigateNext } from "@mui/icons-material";
import CustomTable from "../../CustomTable";
import { AddAreaModal } from "./add-area-modal";
import { useAreasLogic, calculateAreaStats } from "./seg/utlis";
import { StatsCard } from "../../../layouts/AdminLayout/components/StatsCard";
import type { AreaDto } from "../../../types/dtoModels";
import { Link as RouterLink } from "react-router-dom";

function AreaStatsCards({ areas }: { areas: AreaDto[] }) {
  const stats = calculateAreaStats(areas);

  const cards = [
    {
      title: "Tổng Khu vực",
      value: stats.totalAreas.toString(),
      icon: AreaIcon,
      iconColor: "#1976d2",
      iconBgColor: "#e3f2fd",
      valueColor: "#1976d2",
    },
    {
      title: "Khu vực Hoạt động",
      value: stats.activeAreas.toString(),
      icon: AreaIcon,
      iconColor: "#d81b60",
      iconBgColor: "#fce4ec",
      valueColor: "#d81b60",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: 3,
        mb: 3,
      }}
    >
      {cards.map((card, index) => (
        <StatsCard
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          iconColor={card.iconColor}
          iconBgColor={card.iconBgColor}
          valueColor={card.valueColor}
        />
      ))}
    </Box>
  );
}

export default function AreasPage() {
  const {
    areas,
    selectedArea,
    isDetailModalOpen,
    isAddModalOpen,
    editingArea,
    loading,
    error,
    handleViewArea,
    handleCloseDetailModal,
    handleAddArea,
    handleEditArea,
    handleCloseAddModal,
    handleSubmitArea,
    handleDeleteArea,
    handleExportAreas,
    handleUpdateStatus,
  } = useAreasLogic();

  const columns = [
    {
      key: "id" as keyof AreaDto,
      label: "ID Khu vực",
      sortable: true,
      render: (area: AreaDto) => (
        <Typography
          variant="body2"
          sx={{ fontFamily: "monospace", fontWeight: "medium", color: "primary.main" }}
        >
          {area.id}
        </Typography>
      ),
    },
    {
      key: "name" as keyof AreaDto,
      label: "Tên Khu vực",
      sortable: true,
      render: (area: AreaDto) => (
        <Link component={RouterLink} to={`/admin/buildings/${area.id}`} color="primary">
          {area.name}
        </Link>
      ),
    },
    {
      key: "isActive" as keyof AreaDto,
      label: "Trạng Thái",
      sortable: true,
      render: (area: AreaDto) => (
        <Typography sx={{ color: area.isActive ? "success.main" : "error.main" }}>
          {area.isActive ? "Hoạt động" : "Không hoạt động"}
        </Typography>
      ),
    },
    {
      key: "actions" as keyof AreaDto,
      label: "Hành Động",
      render: (area: AreaDto) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
         
            <IconButton
  onClick={() => handleUpdateStatus(area.id!)}
  title={area.isActive ? "Tắt Hoạt động" : "Bật Hoạt động"}
>
  {area.isActive ? (
    <ToggleOff sx={{ fontSize: 16, color: "warning.main" }} />
  ) : (
    <ToggleOn sx={{ fontSize: 16, color: "success.main" }} />
  )}
</IconButton>
          <IconButton onClick={() => handleEditArea(area)} title="Sửa Khu vực">
            <Edit sx={{ fontSize: 16 }} />
          </IconButton>
          
        </Box>
      ),
    },
  ];

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
          <Link component={RouterLink} to="/areas" color="inherit">
            <Typography variant="h6" sx={{ fontWeight: "medium" }}>
              Khu vực
            </Typography>
          </Link>
        </Breadcrumbs>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {loading && <Typography>Đang tải...</Typography>}
        {error && <Typography color="error">{error}</Typography>}
        <Box>
          <Typography
            variant="body2"
            sx={(theme) => ({
              color: theme.palette.grey[600],
            })}
          >
            Quản lý khu vực
          </Typography>
        </Box>

        <AreaStatsCards areas={areas} />

        <CustomTable
          data={areas}
          totalCount={areas.length}
          columns={columns}
          onAddItem={handleAddArea}
          onExport={handleExportAreas}
          headerTitle="Tất Cả Khu vực"
          description="Quản lý khu vực"
          showExport={true}
          showBulkActions={false}
          itemsPerPage={15}
        />

        <AddAreaModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          onSubmit={handleSubmitArea}
          editArea={editingArea}
        />
      </Box>
    </Box>
  );
}