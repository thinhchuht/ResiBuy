import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  IconButton,
  Link,
  Breadcrumbs,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Edit, Visibility, MeetingRoom as RoomIcon, NavigateNext, Lock, LockOpen } from "@mui/icons-material";
import CustomTable from "../../CustomTable";
import AddRoomModal from "./add-room-modal";
import RoomDetailModal from "./room-detail-modal";
import { useRoomsLogic, calculateRoomStats } from "./seg/utlis";
import { StatsCard } from "../../../layouts/AdminLayout/components/StatsCard";
import { ConfirmModal } from "../../../components/ConfirmModal";
import type { RoomDto, BuildingDto, AreaDto, RoomFilter } from "../../../types/dtoModels";
import { useParams, Link as RouterLink } from "react-router-dom";
import buildingApi from "../../../api/building.api";
import areaApi from "../../../api/area.api";
import { useToastify } from "../../../hooks/useToastify";

function RoomStatsCards({ stats }: { stats: { totalRooms: number; activeRooms: number; inactiveRooms: number } }) {
  const cards = [
    {
      title: "Tổng Phòng",
      value: stats.totalRooms.toString(),
      icon: RoomIcon,
      iconColor: "#1976d2",
      iconBgColor: "#e3f2fd",
      valueColor: "#1976d2",
    },
    {
      title: "Phòng Hoạt động",
      value: stats.activeRooms.toString(),
      icon: RoomIcon,
      iconColor: "#d81b60",
      iconBgColor: "#fce4ec",
      valueColor: "#d81b60",
    },
    {
      title: "Phòng Không Hoạt động",
      value: stats.inactiveRooms.toString(),
      icon: RoomIcon,
      iconColor: "#f57c00",
      iconBgColor: "#fff3e0",
      valueColor: "#f57c00",
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
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

export default function RoomsPage() {
  const { buildingId } = useParams<{ buildingId: string }>();
  const {
    rooms,
    selectedRoom,
    isDetailModalOpen,
    isAddModalOpen,
    editingRoom,
    loading,
    error,
    pageNumber,
    pageSize,
    totalCount,
    setPageNumber,
    fetchRoomsByBuildingId,
    fetchRoomsByBuildingIdAndStatus,
    fetchRoomDetail,
    searchRoomsInBuilding,
    handleViewRoom,
    handleCloseDetailModal,
    handleAddRoom,
    handleEditRoom,
    handleCloseAddModal,
    handleSubmitRoom,
    handleUpdateStatus,
    handleExportRooms,
  } = useRoomsLogic(buildingId);
  const [building, setBuilding] = useState<BuildingDto | null>(null);
  const [area, setArea] = useState<AreaDto | null>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | null>(null);
  const [stats, setStats] = useState({ totalRooms: 0, activeRooms: 0, inactiveRooms: 0 }); // Di chuyển stats vào RoomsPage
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

  // Lấy thông tin tòa nhà và khu vực
  const fetchBuildingAndArea = useCallback(async () => {
    if (!buildingId) return;
    try {
      const response = await buildingApi.getById(buildingId);
      setBuilding(response);
      if (response.areaId) {
        const areaResponse = await areaApi.getById(response.areaId);
        setArea(areaResponse);
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi lấy thông tin tòa nhà hoặc khu vực");
    }
  }, [buildingId, toast]);

  // Làm mới danh sách phòng và thống kê
  const fetchRoomsAndStats = useCallback(
    async (newPageNumber = pageNumber) => {
      if (!buildingId) return;
      try {
        // Fetch danh sách phòng
        if (searchKeyword) {
          const filter: RoomFilter = { buildingId, keyword: searchKeyword };
          await searchRoomsInBuilding(filter);
        } else if (isActiveFilter !== null) {
          await fetchRoomsByBuildingIdAndStatus(buildingId, isActiveFilter, newPageNumber);
        } else {
          await fetchRoomsByBuildingId(buildingId, newPageNumber);
        }
        // Fetch thống kê
        const statsData = await calculateRoomStats(buildingId);
        setStats(statsData);
      } catch (err: any) {
        toast.error(err.message || "Lỗi khi tải danh sách phòng hoặc thống kê");
      }
    },
    [
      buildingId,
      searchKeyword,
      isActiveFilter,
      pageNumber,
      fetchRoomsByBuildingId,
      fetchRoomsByBuildingIdAndStatus,
      searchRoomsInBuilding,
      toast,
    ]
  );

  // Gọi API khi buildingId hoặc pageNumber thay đổi
  useEffect(() => {
    if (buildingId) {
      fetchRoomsAndStats();
      fetchBuildingAndArea();
    }
  }, [buildingId, pageNumber]);

  // Xử lý tìm kiếm
  const handleSearch = useCallback(() => {
    setPageNumber(1); // Reset về trang 1 khi tìm kiếm
    fetchRoomsAndStats(1);
  }, [fetchRoomsAndStats]);

  // Xử lý thay đổi trạng thái lọc
  const handleFilterChange = useCallback(
    (event: React.ChangeEvent<{ value: unknown }>) => {
      const value = event.target.value as string;
      setIsActiveFilter(value === "" ? null : value === "true");
      setPageNumber(1); // Reset về trang 1 khi thay đổi bộ lọc
    },
    []
  );

  // Hàm mở modal xác nhận khi khóa/mở khóa phòng
  const handleOpenConfirmModal = (roomId: string, isActive: boolean) => {
    setConfirmModal({
      open: true,
      title: isActive ? "Khóa Phòng" : "Mở Khóa Phòng",
      message: `Bạn có muốn ${isActive ? "khóa" : "mở khóa"} phòng này?`,
      onConfirm: async () => {
        try {
          await handleUpdateStatus(roomId); // Gọi API khóa/mở khóa
          await fetchRoomsAndStats(pageNumber); // Làm mới danh sách phòng và thống kê
          setConfirmModal((prev) => ({ ...prev, open: false }));
          
        } catch (err: any) {
          toast.error(err.message || `Lỗi khi ${isActive ? "khóa" : "mở khóa"} phòng`);
        }
      },
    });
  };

  const columns = [
    {
      key: "id" as keyof RoomDto,
      label: "ID Phòng",
      sortable: true,
      render: (room: RoomDto) => (
        <Typography
          variant="body2"
          sx={{ fontFamily: "monospace", fontWeight: "medium", color: "primary.main" }}
        >
          {room.id}
        </Typography>
      ),
    },
    {
      key: "name" as keyof RoomDto,
      label: "Tên Phòng",
      sortable: true,
      render: (room: RoomDto) => (
        <Typography sx={{ color: "grey.900" }}>{room ? room.name : "N/A"}</Typography>
      ),
    },
    {
      key: "buildingId" as keyof RoomDto,
      label: "Tòa Nhà",
      sortable: true,
      render: (room: RoomDto) => (
        <Typography sx={{ color: "grey.900" }}>{building ? building.name : "N/A"}</Typography>
      ),
    },
    {
      key: "isActive" as keyof RoomDto,
      label: "Trạng Thái",
      sortable: true,
      render: (room: RoomDto) => (
        <Typography sx={{ color: room.isActive ? "success.main" : "error.main" }}>
          {room.isActive ? "Hoạt động" : "Không hoạt động"}
        </Typography>
      ),
    },
    {
      key: "actions" as keyof RoomDto,
      label: "Hành Động",
      render: (room: RoomDto) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            onClick={() => handleViewRoom(room)}
            sx={{
              color: "primary.main",
              p: 0.5,
              bgcolor: "background.paper",
              borderRadius: 1,
              "&:hover": {
                color: "primary.dark",
                bgcolor: "blue[50]",
              },
            }}
            title="Xem Chi Tiết"
          >
            <Visibility sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            onClick={() => handleEditRoom(room)}
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
            title="Sửa Phòng"
          >
            <Edit sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            onClick={() => handleOpenConfirmModal(room.id!, room.isActive)}
            sx={{
              color: room.isActive ? "error.main" : "success.main",
              p: 0.5,
              bgcolor: "background.paper",
              borderRadius: 1,
              "&:hover": {
                color: room.isActive ? "error.dark" : "success.dark",
                bgcolor: room.isActive ? "red[50]" : "green[50]",
              },
            }}
            title={room.isActive ? "Khóa Phòng" : "Mở Khóa Phòng"}
          >
            {room.isActive ? (
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
          <Link component={RouterLink} to={`/admin/buildings/${building?.areaId}`} color="inherit">
            {area ? area.name : "Đang tải..."}
          </Link>
          <Typography color={building ? "text.primary" : "text.disabled"}>
            {building ? building.name : "Đang tải..."}
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
        <Box>
          <Typography
            variant="body2"
            sx={(theme) => ({
              color: theme.palette.grey[600],
            })}
          >
            Quản lý phòng theo tòa nhà
          </Typography>
        </Box>

        <RoomStatsCards stats={stats} />

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Tìm kiếm phòng"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            size="small"
            sx={{ flex: 1 }}
          />
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={isActiveFilter === null ? "" : isActiveFilter.toString()}
              label="Trạng thái"
              onChange={handleFilterChange}
            >
              <MenuItem value="">Tất cả</MenuItem>
              <MenuItem value="true">Hoạt động</MenuItem>
              <MenuItem value="false">Không hoạt động</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={handleSearch}>
            Tìm kiếm
          </Button>
        </Box>

        <CustomTable
          data={rooms}
          totalCount={totalCount}
          columns={columns}
          showSearch={false}
          onAddItem={handleAddRoom}
          onExport={handleExportRooms}
          headerTitle="Tất Cả Phòng"
          description="Quản lý phòng"
          showExport={true}
          showBulkActions={false}
          itemsPerPage={pageSize}
          page={pageNumber}
          onPageChange={setPageNumber}
        />

        <AddRoomModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          onSubmit={handleSubmitRoom}
          editRoom={editingRoom}
        />

        <RoomDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          room={selectedRoom}
          onEdit={handleEditRoom}
          onUpdateStatus={handleUpdateStatus}
        />
      </Box>
    </Box>
  );
}