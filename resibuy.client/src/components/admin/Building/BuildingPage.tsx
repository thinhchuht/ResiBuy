import { useState, useEffect, useCallback } from "react";
import { Box, Typography, IconButton, Link, Breadcrumbs } from "@mui/material";
import { Edit, Visibility, Apartment as BuildingIcon, NavigateNext, Lock, LockOpen } from "@mui/icons-material";
import CustomTable from "../../CustomTable";
import { AddBuildingModal } from "./add-building-modal";
import { useBuildingsLogic, calculateBuildingStats } from "./seg/utlis";
import { StatsCard } from "../../../layouts/AdminLayout/components/StatsCard";
import { ConfirmModal } from "../../../components/ConfirmModal"; // Thêm import ConfirmModal
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
  
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

 
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

  
  const handleOpenConfirmModal = (buildingId: string, isActive: boolean) => {
    setConfirmModal({
      open: true,
      title: isActive ? "Khóa Tòa Nhà" : "Mở Khóa Tòa Nhà",
      message: `Bạn có muốn ${isActive ? "khóa" : "mở khóa"} tòa nhà này?`,
      onConfirm: () => {
        handleUpdateStatus(buildingId);
        setConfirmModal((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const columns = [
     {
    key: "stt" as keyof BuildingDto,
    label: "STT",
    sortable: false,
    render: (area: BuildingDto) => {
      const index = buildings.indexOf(area); 
      const pageNumber = 1;
      const pageSize = 100; 
      console.log("STT render (AreasPage):", { pageNumber, pageSize, index }); // Debug log
      const stt = index >= 0 ? (pageNumber - 1) * pageSize + index + 1 : index + 1;
      return (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {stt}
        </Typography>
      );
    },
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
          <IconButton
            onClick={() => handleEditBuilding(building)}
            sx={{
              color: "success.main",
              p: 0.5,
              bgcolor: "background.paper",
              borderRadius: 1,
              "&:hover": {
                color: "success.dark",
                bgcolor: "green[50]",
              },
            }}
            title="Sửa Tòa Nhà"
          >
            <Edit sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            onClick={() => handleOpenConfirmModal(building.id!, building.isActive)}
            sx={{
              color: building.isActive ? "error.main" : "success.main",
              p: 0.5,
              bgcolor: "background.paper",
              borderRadius: 1,
              "&:hover": {
                color: building.isActive ? "error.dark" : "success.dark",
                bgcolor: building.isActive ? "red[50]" : "green[50]",
              },
            }}
            title={building.isActive ? "Khóa Tòa Nhà" : "Mở Khóa Tòa Nhà"}
          >
            {building.isActive ? (
              <Lock sx={{ fontSize: 16, color: "error.main" }} />
            ) : (
              <LockOpen sx={{ fontSize: 16, color: "success.main" }} />
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
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal({ open: false, title: "", message: "", onConfirm: () => {} })}
      />
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
          itemsPerPage={100}
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