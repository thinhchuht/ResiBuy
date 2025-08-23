import { useState } from "react";
import { Box, Typography, IconButton, Link, Breadcrumbs, List, ListItem, ListItemText, Button } from "@mui/material";
import { Edit, Lock, LockOpen, NavigateNext, LocationOn as AreaIcon, ExpandMore, ExpandLess } from "@mui/icons-material";
import CustomTable from "../../CustomTable";
import { AddAreaModal } from "./add-area-modal";
import { ImportExcelModal } from "./ImportExcelModal";
import { useAreasLogic, calculateAreaStats, handleImport } from "./seg/utlis"; // Sửa từ utlis thành utils
import { StatsCard } from "../../../layouts/AdminLayout/components/StatsCard";
import { ConfirmModal } from "../../ConfirmModal";
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

// Component để hiển thị danh sách có thể mở rộng
function ExpandableEntityList({ 
  title, 
  entities, 
  titleColor = "inherit" 
}: { 
  title: string; 
  entities: string[]; 
  titleColor?: string;
}) {
  const [showAll, setShowAll] = useState(false);
  const SHOW_LIMIT = 10;
  
  if (entities.length === 0) return null;

  const displayedEntities = showAll ? entities : entities.slice(0, SHOW_LIMIT);
  const hasMore = entities.length > SHOW_LIMIT;

  return (
    <>
      <Typography variant="h6" sx={{ mt: 2, color: titleColor }}>
        {title} ({entities.length})
      </Typography>
      <List>
        {displayedEntities.map((entity, index) => (
          <ListItem key={index}>
            <ListItemText primary={entity} />
          </ListItem>
        ))}
      </List>
      {hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Button
            variant="text"
            size="small"
            onClick={() => setShowAll(!showAll)}
            startIcon={showAll ? <ExpandLess /> : <ExpandMore />}
            sx={{ color: 'primary.main' }}
          >
            {showAll ? `Ẩn bớt (${entities.length - SHOW_LIMIT})` : `Xem thêm (${entities.length - SHOW_LIMIT})`}
          </Button>
        </Box>
      )}
    </>
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
    fetchAreas,
    handleViewArea,
    handleCloseDetailModal,
    handleAddArea,
    handleEditArea,
    handleCloseAddModal,
    handleSubmitArea,
    handleExportAreas,
    handleUpdateStatus,
  } = useAreasLogic();

  const { importModal, isConfirmLoading, handleOpenImportModal, handleFileChange, handleConfirmImport, handleDownloadTemplate, handleImportModalClose } = handleImport(fetchAreas);

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

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleOpenConfirmModal = (areaId: string, isActive: boolean) => {
    setConfirmModal({
      open: true,
      title: isActive ? "Khóa Khu vực" : "Mở Khóa Khu vực",
      message: `Bạn có muốn ${isActive ? "khóa" : "mở khóa"} khu vực này?`,
      onConfirm: () => {
        handleUpdateStatus(areaId);
        setConfirmModal((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleOpenImportExcelModal = () => {
    setIsImportModalOpen(true);
  };

  const handleCloseImportExcelModal = () => {
    setIsImportModalOpen(false);
  };

  const handleImportExcelSubmit = async (file: File) => {
    await handleFileChange(file);
    setIsImportModalOpen(false);
  };

  const columns = [
    
    {
    key: "stt" as keyof AreaDto,
    label: "STT",
    sortable: false,
    render: (area: AreaDto) => {
      const index = areas.indexOf(area); 
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
            onClick={() => handleOpenConfirmModal(area.id!, area.isActive)}
            sx={{
              color: area.isActive ? "error.main" : "success.main",
              p: 0.5,
              bgcolor: "background.paper",
              borderRadius: 1,
              "&:hover": {
                color: area.isActive ? "error.dark" : "success.dark",
                bgcolor: area.isActive ? "red[50]" : "green[50]",
              },
            }}
            title={area.isActive ? "Khóa Khu vực" : "Mở Khóa Khu vực"}
          >
            {area.isActive ? (
              <Lock sx={{ fontSize: 16, color: "error.main" }} />
            ) : (
              <LockOpen sx={{ fontSize: 16, color: "success.main" }} />
            )}
          </IconButton>
          <IconButton
            onClick={() => handleEditArea(area)}
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
            title="Sửa Khu vực"
          >
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
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal({ open: false, title: "", message: "", onConfirm: () => {} })}
      />
      <ConfirmModal
        open={importModal.open}
        title="Xác nhận Import"
        loading={isConfirmLoading}
        message={
          <Box>
            <Typography>{importModal.message}</Typography>
            {importModal.errors.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mt: 2, color: "error.main" }}>
                  Lỗi trong file: ({importModal.errors.length})
                </Typography>
                <List>
                  {importModal.errors.map((error, index) => (
                    <ListItem key={index}>
                      <ListItemText primary={error} />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
            <ExpandableEntityList 
              title="Thực thể đã tồn tại" 
              entities={importModal.existingEntities}
            />
            <ExpandableEntityList 
              title="Thực thể sẽ tạo mới" 
              entities={importModal.newEntities}
            />
          </Box>
        }
        onConfirm={importModal.onConfirm}
        onClose={() => handleImportModalClose()}
      />
      <ImportExcelModal
        isOpen={isImportModalOpen}
        onClose={handleCloseImportExcelModal}
        onSubmit={handleImportExcelSubmit}
        onDownloadTemplate={handleDownloadTemplate}
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
          itemsPerPage={100}
          showImport={true}
          onImport={handleOpenImportExcelModal}
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