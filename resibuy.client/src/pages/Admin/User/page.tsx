import { useState, useEffect } from "react";
import { Box, Typography, IconButton, Chip, CircularProgress } from "@mui/material";
import {
  Edit,
  Visibility,
  Person as UserIcon,
  Lock,
  LockOpen,
  AdminPanelSettings,
} from "@mui/icons-material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import CustomTable from "../../../components/CustomTable";
import { StatsCard } from "../../../layouts/AdminLayout/components/StatsCard";
import type { UserDto } from "../../../types/dtoModels";
import {
  calculateUserStats,
  useUsersLogic,
  formatDate,
} from "../../../components/admin/User/seg/utils";
import { AddUserModal } from "../../../components/admin/User/add-user-modal";
import { EditRoleModal } from "../../../components/admin/User/edit-role-modal";
import { UserDetailModal } from "../../../components/admin/User/user-detail-modal";

function UserStatsCards() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    lockedUsers: 0,
    totalReportCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    calculateUserStats()
      .then((data) => {
        console.log("calculateUserStats result:", data);
        if (data.error) {
          setError(data.error.message || "Lỗi khi lấy thống kê");
        } else {
          setStats(data);
        }
      })
      .catch((err) => {
        console.error("Error in UserStatsCards:", err);
        setError(err.message || "Lỗi khi lấy thống kê");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const cards = [
    {
      title: "Tổng Người Dùng",
      value: stats.totalUsers.toString(),
      icon: UserIcon,
      iconColor: "#1976d2",
      iconBgColor: "#e3f2fd",
      valueColor: "#1976d2",
    },
    {
      title: "Người Dùng Bị Khóa",
      value: stats.lockedUsers.toString(),
      icon: UserIcon,
      iconColor: "#ef4444",
      iconBgColor: "#fee2e2",
      valueColor: "#ef4444",
    },
    {
      title: "Tổng Báo Cáo",
      value: stats.totalReportCount.toString(),
      icon: UserIcon,
      iconColor: "#d81b60",
      iconBgColor: "#fce4ec",
      valueColor: "#d81b60",
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        mb: 3,
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
            lg: "1fr 1fr 1fr",
          },
          gap: 3,
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
    </Box>
  );
}

export default function UserPage() {
  const {
    users,
    totalCount,
    pageNumber,
    pageSize,
    totalPages,
    selectedUser,
    isDetailModalOpen,
    isAddModalOpen,
    isEditRoleModalOpen,
    editingUser,
    editingRoleUser,
    searchTerm,
    handleViewUser,
    handleCloseDetailModal,
    handleAddUser,
    handleEditUser,
    handleEditRole,
    handleCloseAddModal,
    handleCloseEditRoleModal,
    handleSubmitUser,
    handleSubmitRole,
    handleToggleLockUser,
    handleExportUsers,
    handlePageChange,
    handleSearch,
  } = useUsersLogic();

  const columns = [
    {
      key: "id" as keyof UserDto,
      label: "ID Người Dùng",
      sortable: true,
      render: (user: UserDto) => (
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            fontWeight: "medium",
            color: "primary.main",
          }}
        >
          {user.id}
        </Typography>
      ),
    },
    {
      key: "fullName" as keyof UserDto,
      label: "Họ Tên",
      sortable: true,
      render: (user: UserDto) => (
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box sx={{ width: 40, height: 40, mr: 1.5 }}>
            <Box
              sx={{
                width: "100%",
                height: "100%",
                bgcolor: "linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "0.875rem",
                fontWeight: "bold",
              }}
            >
              {user.fullName
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "?"}
            </Box>
          </Box>
          <Typography
            variant="body2"
            sx={{ fontWeight: "medium", color: "grey.900" }}
          >
            {user.fullName || "N/A"}
          </Typography>
        </Box>
      ),
    },
    {
      key: "email" as keyof UserDto,
      label: "Email",
      sortable: true,
      render: (user: UserDto) => (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {user.email || "N/A"}
        </Typography>
      ),
    },
    {
      key: "phoneNumber" as keyof UserDto,
      label: "Số Điện Thoại",
      sortable: true,
      render: (user: UserDto) => (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {user.phoneNumber || "N/A"}
        </Typography>
      ),
    },
    {
      key: "isLocked" as keyof UserDto,
      label: "Trạng Thái Khóa",
      sortable: true,
      render: (user: UserDto) => (
        <Typography
          variant="body2"
          sx={{ color: user.isLocked ? "error.main" : "success.main" }}
        >
          {user.isLocked ? "Đã Khóa" : "Hoạt động"}
        </Typography>
      ),
    },
    {
      key: "roles" as keyof UserDto,
      label: "Vai Trò",
      sortable: false,
      render: (user: UserDto) => (
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {user.roles.map((role) => (
            <Chip
              key={role}
              label={role}
              sx={{
                bgcolor: "primary.light",
                color: "primary.main",
                fontSize: "0.75rem",
                height: 24,
              }}
            />
          ))}
        </Box>
      ),
    },
    {
      key: "rooms" as keyof UserDto,
      label: "Phòng",
      sortable: false,
      render: (user: UserDto) => (
        <Typography variant="body2" sx={{ color: "grey.900" }}>
          {user.rooms?.map((room) => room.name).join(", ") || "Chưa có phòng"}
        </Typography>
      ),
    },
    {
      key: "actions" as keyof UserDto,
      label: "Hành Động",
      render: (user: UserDto) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            onClick={() => {
              handleViewUser(user);
              console.log("User data:", user);
            }}
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
            onClick={() => handleEditUser(user)}
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
            title="Sửa Người Dùng"
          >
            <Edit sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            onClick={() => handleEditRole(user.id)}
            sx={{
              color: "purple.main",
              p: 0.5,
              bgcolor: "background.paper",
              borderRadius: 1,
              "&:hover": {
                color: "purple.dark",
                bgcolor: "purple[50]",
              },
            }}
            title="Chỉnh Sửa Vai Trò"
          >
            <AdminPanelSettings sx={{ fontSize: 16 }} />
          </IconButton>
          <IconButton
            onClick={() => handleToggleLockUser(user.id, user.isLocked)}
            sx={{
              color: user.isLocked ? "warning.main" : "info.main",
              p: 0.5,
              bgcolor: "background.paper",
              borderRadius: 1,
              "&:hover": {
                color: user.isLocked ? "warning.dark" : "info.dark",
                bgcolor: user.isLocked ? "yellow[50]" : "cyan[50]",
              },
            }}
            title={user.isLocked ? "Mở Khóa Người Dùng" : "Khóa Người Dùng"}
          >
            {user.isLocked ? <LockOpen sx={{ fontSize: 16 }} /> : <Lock sx={{ fontSize: 16 }} />}
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
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
          <Typography
            variant="h6"
            sx={(theme) => ({
              color: theme.palette.grey[700],
              fontWeight: theme.typography.fontWeightMedium,
            })}
          >
            Quản Lý Người Dùng
          </Typography>
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
          <Box>
            <Typography
              variant="body2"
              sx={(theme) => ({
                color: theme.palette.grey[600],
              })}
            >
              Quản lý người dùng và vai trò
            </Typography>
          </Box>

          <UserStatsCards />

          <CustomTable
            data={users}
            totalCount={totalCount}
            columns={columns}
            onAddItem={handleAddUser}
            onExport={handleExportUsers}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            headerTitle="Tất Cả Người Dùng"
            description="Quản lý người dùng và vai trò"
            showExport={true}
            showBulkActions={false}
            itemsPerPage={pageSize}
            searchTerm={searchTerm}
          />

          <AddUserModal
            isOpen={isAddModalOpen}
            onClose={handleCloseAddModal}
            onSubmit={handleSubmitUser}
            editingUser={editingUser}
          />

          <EditRoleModal
            isOpen={isEditRoleModalOpen}
            onClose={handleCloseEditRoleModal}
            onSubmit={handleSubmitRole}
            userId={editingRoleUser}
          />

          <UserDetailModal
            isOpen={isDetailModalOpen}
            onClose={handleCloseDetailModal}
            user={selectedUser}
          />
        </Box>
      </Box>
    </LocalizationProvider>
  );
}