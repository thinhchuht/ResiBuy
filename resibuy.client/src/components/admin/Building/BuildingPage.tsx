import { useState, useEffect, useCallback } from "react";
import { Box, Typography, IconButton, Link, Breadcrumbs } from "@mui/material";
import { Edit, Visibility, Apartment as BuildingIcon, NavigateNext,ToggleOff,ToggleOn } from "@mui/icons-material";
import CustomTable from "../../CustomTable";
import { AddBuildingModal } from "./add-building-modal";
import { useBuildingsLogic, calculateBuildingStats } from "./seg/utlis";
import { StatsCard } from "../../../layouts/AdminLayout/components/StatsCard";
import type { BuildingDto, AreaDto } from "../../../types/dtoModels";
import { useParams, Link as RouterLink } from "react-router-dom";
import areaApi from "../../../api/area.api";
import { useToastify } from "../../../hooks/useToastify";

function BuildingStatsCards({ buildings }: { buildings: BuildingDto[] }) {
  const stats = calculateBuildingStats(buildings);

  const cards = [
    {
      title: "Tổng Tòa Nhà",
      value: stats.totalBuildings.toString(),
      icon: BuildingIcon,
      iconColor: "#1976d2",
      iconBgColor: "#e3f2fd",
      valueColor: "#1976d2",
    },
    {
      title: "Tòa Nhà Hoạt động",
      value: stats.activeBuildings.toString(),
      icon: BuildingIcon,
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

export default function BuildingsPage() {
  const { areaId } = useParams<{ areaId: string }>();
  const {
    buildings,
    selectedBuilding,
    isDetailModalOpen,
    isAddModalOpen,
    editingBuilding,
    loading,
    error,
    fetchBuildingsByAreaId,
    fetchBuildingById,
    handleViewBuilding,
    handleCloseDetailModal,
    handleAddBuilding,
    handleEditBuilding,
    handleCloseAddModal,
    handleSubmitBuilding,
    handleUpdateStatus,
    handleExportBuildings,
  } = useBuildingsLogic(areaId);
  const [area, setArea] = useState<AreaDto | null>(null);
  const [areaError, setAreaError] = useState<string | null>(null);
  const toast = useToastify();

  // Memoize fetchArea để tránh tạo hàm mới mỗi render
  const fetchArea = useCallback(async () => {
    if (!areaId) return;
    try {
      const response = await areaApi.getById(areaId);
      setArea(response);
      setAreaError(null);
    } catch (err: any) {
      const errorMessage = err.message || "Không tìm thấy khu vực";
      setAreaError(errorMessage);
      toast.error(errorMessage);
    }
  }, [areaId, toast]);

  useEffect(() => {
    if (areaId) {
      fetchBuildingsByAreaId(areaId);
      fetchArea();
    }
  }, [areaId]);

  const columns = [
    {
      key: "id" as keyof BuildingDto,
      label: "ID Tòa Nhà",
      sortable: true,
      render: (building: BuildingDto) => (
        <Typography
          variant="body2"
          sx={{ fontFamily: "monospace", fontWeight: "medium", color: "primary.main" }}
        >
          {building.id}
        </Typography>
      ),
    },
    {
      key: "name" as keyof BuildingDto,
      label: "Tên Tòa Nhà",
      sortable: true,
      render: (building: BuildingDto) => (
        <Link component={RouterLink} to={`/admin/rooms/${building.id}`} color="primary">
          {building.name}
        </Link>
      ),
    },
    {
      key: "isActive" as keyof BuildingDto,
      label: "Trạng Thái",
      sortable: true,
      render: (building: BuildingDto) => (
        <Typography sx={{ color: building.isActive ? "success.main" : "error.main" }}>
          {building.isActive ? "Hoạt động" : "Không hoạt động"}
        </Typography>
      ),
    },
    {
      key: "areaId" as keyof BuildingDto,
      label: "Khu vực",
      sortable: true,
      render: (building: BuildingDto) => (
        <Typography sx={{ color: "grey.900" }}>
          {area ? area.name : areaError || building.areaId || "N/A"}
        </Typography>
      ),
    },
    {
      key: "actions" as keyof BuildingDto,
      label: "Hành Động",
      render: (building: BuildingDto) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
         
          <IconButton onClick={() => handleEditBuilding(building)} title="Sửa Tòa Nhà">
            <Edit sx={{ fontSize: 16 }} />
          </IconButton>
          
                      <IconButton
            onClick={() => handleUpdateStatus(building.id!)}
            title={building.isActive ? "Tắt Hoạt động" : "Bật Hoạt động"}
          >
            {building.isActive ? (
              <ToggleOff sx={{ fontSize: 16, color: "warning.main" }} />
            ) : (
              <ToggleOn sx={{ fontSize: 16, color: "success.main" }} />
            )}
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
          <Link component={RouterLink} to="/admin/area" color="inherit">
            Khu vực 
          </Link>
          <Typography color={area ? "text.primary" : "text.disabled"}>
            {area ? area.name : areaError || "Đang tải..."}
          </Typography>
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
        {areaError && <Typography color="error">{areaError}</Typography>}
        <Box>
          <Typography
            variant="body2"
            sx={(theme) => ({
              color: theme.palette.grey[600],
            })}
          >
            Quản lý tòa nhà theo khu vực
          </Typography>
        </Box>

        <BuildingStatsCards buildings={buildings} />

        <CustomTable
          data={buildings}
          totalCount={buildings.length}
          columns={columns}
          onAddItem={handleAddBuilding}
          onExport={handleExportBuildings}
          headerTitle="Tất Cả Tòa Nhà"
          description="Quản lý tòa nhà"
          showExport={true}
          showBulkActions={false}
          itemsPerPage={15}
        />

        <AddBuildingModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          onSubmit={handleSubmitBuilding}
          editBuilding={editingBuilding}
        />
      </Box>
    </Box>
  );
}