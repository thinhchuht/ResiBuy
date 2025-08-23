import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  Pagination,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Close, Edit, People as UsersIcon, Info as InfoIcon, Add, Search, Delete } from "@mui/icons-material";
import { formatDate } from "./seg/utlis";
import buildingApi from "../../../api/building.api";
import userApi from "../../../api/user.api";
import roomApi from "../../../api/room.api";
import type { RoomDetailDto, BuildingDto, UserDto } from "../../../types/dtoModels";
import { useToastify } from "../../../hooks/useToastify";
import { formatDateWithoutTime } from "../User/seg/utils";

interface RoomDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: RoomDetailDto | null;
  onEdit: (room: RoomDetailDto) => void;
  onUpdateStatus: (roomId: string) => void;
}

interface AddUserToRoomModalProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
  room: RoomDetailDto;
  onUserAdded: () => void;
}

const AddUserToRoomModal: React.FC<AddUserToRoomModalProps> = ({
  open,
  onClose,
  roomId,
  room,
  onUserAdded,
}) => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const  toast  = useToastify();

  useEffect(() => {
  if (open) {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = searchTerm
          ? await userApi.searchUsers(searchTerm, pageNumber, pageSize)
          : await userApi.getAllUser(pageNumber, pageSize);
        console.log("Fetch users response:", JSON.stringify(response, null, 2));
        if (response.code !== 0) {
          toast.error(response.message || "Lỗi khi lấy danh sách người dùng");
          setUsers([]);
          setTotalCount(0);
        } else {
          setUsers(response.data?.items || []);
          setTotalCount(response.data?.totalCount || 0);
        }
      } catch (err: any) {
        console.error("Fetch users error:", JSON.stringify(err, null, 2));
        toast.error(err.message || "Lỗi khi lấy danh sách người dùng");
        setUsers([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }
}, [open, pageNumber, pageSize, searchTerm, ]);
  const handleAddUser = async () => {
  if (selectedUserIds.length === 0) {
    toast.error("Vui lòng chọn ít nhất một người dùng");
    return;
  }

  setLoading(true);
  try {
    const response = await userApi.addUserToRooms(selectedUserIds, [roomId]);
    console.log("Add users to rooms response:", JSON.stringify(response, null, 2));
    if (response.code !== 0) {
      toast.error(response.message || "Lỗi khi thêm người dùng vào phòng");
    } else {
      toast.success(`Thêm ${selectedUserIds.length} người dùng vào phòng thành công!`);
      onUserAdded();
      onClose();
    }
  } catch (err: any) {
    console.error("Add users error:", JSON.stringify(err, null, 2));
    toast.error(err.message || "Lỗi khi thêm người dùng vào phòng");
  } finally {
    setLoading(false);
  }
};
  const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPageNumber(newPage);
    setSelectedUserIds([]);
  };

  const handleCheckboxChange = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 2,
          boxShadow: 24,
          p: 2,
        },
      }}
    >
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h6" sx={{ color: "grey.900" }}>
          Thêm Người Dùng Vào Phòng
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "grey.500" }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          placeholder="Tìm kiếm người dùng..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPageNumber(1);
          }}
          size="small"
          sx={{ maxWidth: 300, mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: "grey.400" }} />
              </InputAdornment>
            ),
          }}
        />
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : users.length > 0 ? (
          <Box>
            <Typography variant="h6" sx={{ color: "grey.900", mb: 2 }}>
              Danh Sách Người Dùng
            </Typography>
            <Typography variant="body2" sx={{ color: "grey.500", mb: 2 }}>
              Chọn một hoặc nhiều người dùng để thêm vào phòng
            </Typography>
            <Box sx={{ border: 1, borderColor: "grey.200", borderRadius: 2, overflow: "hidden" }}>
              <Table>
                <TableHead sx={{ bgcolor: "grey.50" }}>
                  <TableRow>
                    <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                      Chọn
                    </TableCell>
                    <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                      Họ Tên
                    </TableCell>
                    <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                      Số Điện Thoại
                    </TableCell>
                    <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                      Phòng Hiện Tại
                    </TableCell>
                    <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                      Vai Trò
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ "& tr:hover": { bgcolor: "grey.50" } }}>
                  {users.map((user) => {
                    const isInRoom = user.rooms?.some((r) => r.id === roomId);
                    return (
                      <TableRow key={user.id}>
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={selectedUserIds.includes(user.id)}
                                onChange={() => handleCheckboxChange(user.id)}
                                disabled={isInRoom}
                              />
                            }
                            label=""
                            sx={{ m: 0 }}
                          />
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                          {user.fullName}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                          {user.phoneNumber || "N/A"}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                          {user.rooms && user.rooms.length > 0
                            ? user.rooms.map((r) => (
                                <Typography
                                  key={r.id}
                                  component="span"
                                  sx={{ color: r.id === roomId ? "error.main" : "grey.900", mr: 0.5 }}
                                >
                                  {r.name}{r.id !== user.rooms[user.rooms.length - 1].id ? ", " : ""}
                                </Typography>
                              ))
                            : "Chưa có phòng"}
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                          {user.roles.map((role) => (
                            <Chip
                              key={role}
                              label={role}
                              sx={{
                                bgcolor: "primary.light",
                                color: "primary.main",
                                fontSize: "0.75rem",
                                height: 24,
                                mr: 0.5,
                              }}
                            />
                          ))}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
            {totalCount > 0 && (
              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Pagination
                  count={totalPages}
                  page={pageNumber}
                  onChange={handlePageChange}
                  color="primary"
                  sx={{
                    ".MuiPagination-ul": {
                      justifyContent: "flex-end",
                    },
                  }}
                />
              </Box>
            )}
            <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button
                onClick={onClose}
                sx={{
                  px: 3,
                  py: 1,
                  bgcolor: "grey.200",
                  color: "grey.800",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "grey.300" },
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleAddUser}
                disabled={loading || selectedUserIds.length === 0}
                sx={{
                  px: 3,
                  py: 1,
                  bgcolor: "primary.main",
                  color: "white",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "primary.dark" },
                }}
              >
                Thêm
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 4, color: "grey.500" }}>
            <UsersIcon sx={{ fontSize: 48, color: "grey.300", mb: 2 }} />
            <Typography>Không tìm thấy người dùng</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default function RoomDetailModal({
  isOpen,
  onClose,
  room: roomProp,
  onEdit,
  onUpdateStatus,
}: RoomDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "users">("overview");
  const [building, setBuilding] = useState<BuildingDto | null>(null);
  const [loadingBuilding, setLoadingBuilding] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [room, setRoom] = useState<RoomDetailDto | null>(null);
  const [refreshUsers, setRefreshUsers] = useState(0);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const  toast  = useToastify();

  // Sync room prop with local state
  useEffect(() => {
    if (isOpen && roomProp) {
      setRoom(roomProp);
    }
  }, [isOpen, roomProp]);

  // Fetch building details when modal opens
  useEffect(() => {
    if (isOpen && room?.buildingId) {
      const fetchBuilding = async () => {
        setLoadingBuilding(true);
        try {
          const response = await buildingApi.getById(room.buildingId);
          setBuilding(response);
        } catch (err: any) {
          toast.error(err.message || "Lỗi khi lấy thông tin tòa nhà");
        } finally {
          setLoadingBuilding(false);
        }
      };
      fetchBuilding();
    }
  }, [isOpen, room?.buildingId, ]);

  // Refresh room details when a user is added or removed
  useEffect(() => {
    if (isOpen && room?.id && refreshUsers > 0) {
      const fetchRoomDetail = async () => {
        try {
          const response = await roomApi.getDetail(room.id);
          console.log("Refreshed room details:", response);
          setRoom(response);
        } catch (err: any) {
          toast.error(err.message || "Lỗi khi làm mới danh sách người dùng");
        }
      };
      fetchRoomDetail();
    }
  }, [refreshUsers, isOpen, room?.id, ]);

  const handleOpenAddUserModal = () => {
    setIsAddUserModalOpen(true);
  };

  const handleCloseAddUserModal = () => {
    setIsAddUserModalOpen(false);
  };

  const handleUserAdded = () => {
    setRefreshUsers((prev) => prev + 1);
  };

  const handleOpenDeleteConfirm = (userId: string) => {
    setUserIdToDelete(userId);
    setIsDeleteConfirmOpen(true);
  };

const handleCloseDeleteConfirm = () => {
  console.log("Before closing: isDeleteConfirmOpen =", isDeleteConfirmOpen);
  setIsDeleteConfirmOpen(false);
  setUserIdToDelete(null);
  // Ép buộc kiểm tra trạng thái
  setTimeout(() => {
    console.log("After closing (timeout): isDeleteConfirmOpen =", isDeleteConfirmOpen);
    if (isDeleteConfirmOpen) {
      console.warn("isDeleteConfirmOpen still true, forcing update");
      setIsDeleteConfirmOpen(false); // Thử lại
    }
  }, 0);
};
const handleDeleteUser = async () => {
  if (!userIdToDelete) {
    console.warn("No userIdToDelete provided");
    return;
  }
  if (!room?.id) {
    console.warn("No room id provided");
    toast.error("Không tìm thấy ID phòng");
    return;
  }

  setDeleteLoading(true);
  try {
    const response = await userApi.removeUserRom(userIdToDelete,[ room.id]);
    console.log("Remove user from room response:", JSON.stringify(response, null, 2));

    if (response.code !== 0) {
      console.log("Error response received:", response.message);
      toast.error(response.message || "Lỗi khi xóa người dùng khỏi phòng");
    } else {
      console.log("Success: Starting success handling");
      try {
        console.log("Calling toast.success");
        toast.success(response.message || "Xóa người dùng khỏi phòng thành công!");
      } catch (toastError) {
        console.error("Error in toast.success:", JSON.stringify(toastError, null, 2));
      }

      try {
        console.log("Calling setRefreshUsers");
        setRefreshUsers((prev) => {
          console.log("Updating refreshUsers from", prev, "to", prev + 1);
          return prev + 1;
        });
      } catch (refreshError) {
        console.error("Error in setRefreshUsers:", JSON.stringify(refreshError, null, 2));
      }

      try {
        console.log("Calling handleCloseDeleteConfirm");
        handleCloseDeleteConfirm();
      } catch (closeError) {
        console.error("Error in handleCloseDeleteConfirm:", JSON.stringify(closeError, null, 2));
      }
    }
  } catch (err: any) {
    console.error("Error in handleDeleteUser:", JSON.stringify(err, null, 2));
    toast.error(err.message || "Lỗi khi xóa người dùng khỏi phòng");
  } finally {
    console.log("Setting deleteLoading to false");
    setDeleteLoading(false);
  }
};
  if (!isOpen || !room) return null;

  const totalUsers = room.users.length;

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            maxWidth: "80rem",
            height: "90vh",
            margin: 0,
            borderRadius: 0,
            boxShadow: 24,
            transform: isOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.3s ease-in-out",
            display: "flex",
            flexDirection: "column",
          },
        }}
        PaperProps={{ sx: { bgcolor: "background.paper" } }}
      >
        <DialogTitle
          sx={{
            p: 3,
            borderBottom: 1,
            borderColor: "grey.200",
            bgcolor: "background.paper",
            position: "sticky",
            top: 0,
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ color: "grey.900", fontWeight: "medium" }}
            >
              Chi Tiết Phòng
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "grey.500" }}
            >
              ID Phòng: {room.id}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              onClick={() => onEdit(room)}
              startIcon={<Edit sx={{ fontSize: 16 }} />}
              sx={{
                px: 1.5,
                py: 1,
                bgcolor: "primary.main",
                color: "white",
                borderRadius: 2,
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              Sửa
            </Button>
            <Button
              onClick={() => onUpdateStatus(room.id)}
              sx={{
                px: 1.5,
                py: 1,
                bgcolor: room.isActive ? "warning.main" : "success.main",
                color: "white",
                borderRadius: 2,
                "&:hover": { bgcolor: room.isActive ? "warning.dark" : "success.dark" },
              }}
            >
              {room.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
            </Button>
            <IconButton
              onClick={onClose}
              sx={{
                color: "grey.400",
                bgcolor: "background.paper",
                p: 1,
                borderRadius: 2,
                "&:hover": {
                  color: "grey.600",
                  bgcolor: "grey.100",
                },
              }}
            >
              <Close sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 3,
            bgcolor: "grey.50",
            borderBottom: 1,
            borderColor: "grey.200",
            flex: "0 0 auto",
          }}
        >
          <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
            <Box sx={{ width: 80, height: 80 }}>
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #3b82f6 0%, #a855f7 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                }}
              >
                {room.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </Box>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h5"
                sx={{ color: "grey.900", fontWeight: "bold", mb: 1 }}
              >
                {room.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "grey.500" }}
              >
                {building ? building.name : loadingBuilding ? "Đang tải..." : "Không tìm thấy tòa nhà"}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 2,
                textAlign: "left",
              }}
            >
              <Box>
                <Typography
                  variant="h5"
                  sx={{ color: "primary.main", fontWeight: "bold" }}
                >
                  {totalUsers}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "grey.500" }}
                >
                  Tổng Người Dùng
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <Box
          sx={{
            borderBottom: 1,
            borderColor: "grey.200",
            position: "sticky",
            top: 0,
            zIndex: 9,
            bgcolor: "background.paper",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ "& .MuiTabs-indicator": { bgcolor: "primary.main" } }}
          >
            {[
              { id: "overview", label: "Tổng Quan", icon: <InfoIcon sx={{ fontSize: 16 }} /> },
              { id: "users", label: "Người Dùng", icon: <UsersIcon sx={{ fontSize: 16 }} /> },
            ].map((tab) => (
              <Tab
                key={tab.id}
                value={tab.id}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {tab.icon}
                    {tab.label}
                  </Box>
                }
                sx={{
                  px: 3,
                  py: 2,
                  fontSize: "0.875rem",
                  fontWeight: "medium",
                  color: activeTab === tab.id ? "primary.main" : "grey.500",
                  "&:hover": { color: "grey.700" },
                }}
              />
            ))}
          </Tabs>
        </Box>

        <DialogContent
          sx={{
            p: 3,
            flex: 1,
            overflowY: "auto",
            minHeight: "300px",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          {activeTab === "overview" && (
            <Box>
              <Typography
                variant="h6"
                sx={{ color: "grey.900", mb: 2 }}
              >
                Thông Tin Phòng
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 3,
                }}
              >
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", fontWeight: "medium" }}
                  >
                    ID Phòng
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {room.id}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", fontWeight: "medium" }}
                  >
                    Tên Phòng
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {room.name}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", fontWeight: "medium" }}
                  >
                    Tòa Nhà
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {building ? building.name : loadingBuilding ? "Đang tải..." : "N/A"}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "grey.500", fontWeight: "medium" }}
                  >
                    Trạng Thái
                  </Typography>
                  <Typography sx={{ color: "grey.900" }}>
                    {room.isActive ? "Hoạt động" : "Không hoạt động"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {activeTab === "users" && (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography
                  variant="h6"
                  sx={{ color: "grey.900" }}
                >
                  Người Dùng ({totalUsers} người dùng)
                </Typography>
                <Button
                  onClick={handleOpenAddUserModal}
                  startIcon={<Add sx={{ fontSize: 16 }} />}
                  sx={{
                    px: 1.5,
                    py: 1,
                    bgcolor: "primary.main",
                    color: "white",
                    borderRadius: 2,
                    "&:hover": { bgcolor: "primary.dark" },
                  }}
                >
                  Thêm Người Dùng
                </Button>
              </Box>
              {room.users.length > 0 ? (
                <Box sx={{ border: 1, borderColor: "grey.200", borderRadius: 2, overflow: "hidden" }}>
                  <Table>
                    <TableHead sx={{ bgcolor: "grey.50" }}>
                      <TableRow>
                        <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                          ID Người Dùng
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                          Họ Tên
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                          Email
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                          Số Điện Thoại
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                          Vai Trò
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                          Trạng Thái
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                          Ngày Sinh
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                          Ngày Tạo
                        </TableCell>
                        <TableCell sx={{ px: 2, py: 1.5, color: "grey.500", fontSize: "0.75rem", fontWeight: "medium", textTransform: "uppercase" }}>
                          Hành Động
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody sx={{ "& tr:hover": { bgcolor: "grey.50" } }}>
                      {room.users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell sx={{ px: 2, py: 1.5, fontFamily: "monospace", fontSize: "0.875rem", color: "primary.main" }}>
                            {user.id}
                          </TableCell>
                          <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                            {user.fullName}
                          </TableCell>
                          <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                            {user.email}
                          </TableCell>
                          <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                            {user.phoneNumber}
                          </TableCell>
                          <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                            {user.roles.map((role) => (
                              <Chip
                                key={role}
                                label={role}
                                sx={{
                                  bgcolor: "primary.light",
                                  color: "primary.main",
                                  fontSize: "0.75rem",
                                  height: 24,
                                  mr: 0.5,
                                }}
                              />
                            ))}
                          </TableCell>
                          <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem" }}>
                            <Chip
                              label={user.isLocked ? "Khóa" : "Hoạt động"}
                              sx={{
                                bgcolor: user.isLocked ? "error.light" : "success.light",
                                color: user.isLocked ? "error.main" : "success.main",
                                fontSize: "0.75rem",
                                height: 24,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                            {formatDateWithoutTime(user.dateOfBirth)}
                          </TableCell>
                          <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                            {formatDate(user.createdAt)}
                          </TableCell>
                          <TableCell sx={{ px: 2, py: 1.5 }}>
                            <IconButton
                              onClick={() => handleOpenDeleteConfirm(user.id)}
                              sx={{ color: "error.main" }}
                            >
                              <Delete sx={{ fontSize: 20 }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              ) : (
                <Box sx={{ textAlign: "center", py: 4, color: "grey.500" }}>
                  <UsersIcon sx={{ fontSize: 48, color: "grey.300", mb: 2 }} />
                  <Typography>Không tìm thấy người dùng trong phòng này</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      <AddUserToRoomModal
        open={isAddUserModalOpen}
        onClose={handleCloseAddUserModal}
        roomId={room.id}
        room={room}
        onUserAdded={handleUserAdded}
      />

      <Dialog
        open={isDeleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: "grey.900" }}>
          Xác Nhận Xóa
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "grey.900" }}>
            Bạn có chắc chắn muốn xóa người dùng này khỏi phòng không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseDeleteConfirm}
            sx={{
              px: 3,
              py: 1,
              bgcolor: "grey.200",
              color: "grey.800",
              borderRadius: 2,
              "&:hover": { bgcolor: "grey.300" },
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleDeleteUser}
            disabled={deleteLoading}
            sx={{
              px: 3,
              py: 1,
              bgcolor: "error.main",
              color: "white",
              borderRadius: 2,
              "&:hover": { bgcolor: "error.dark" },
            }}
          >
            {deleteLoading ? <CircularProgress size={24} color="inherit" /> : "Xóa"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}