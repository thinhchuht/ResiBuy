import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
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
  Radio,
  RadioGroup,
  FormControlLabel,
  Pagination,
} from "@mui/material";
import { Close, Edit, People as UsersIcon, Info as InfoIcon, Add } from "@mui/icons-material";
import { formatDate } from "./seg/utlis";
import buildingApi from "../../../api/building.api";
import userApi from "../../../api/user.api";
import roomApi from "../../../api/room.api";
import type { RoomDetailDto, BuildingDto, UserDto } from "../../../types/dtoModels";
import { useToastify } from "../../../hooks/useToastify";

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
  onUserAdded: () => void;
}

const AddUserToRoomModal: React.FC<AddUserToRoomModalProps> = ({
  open,
  onClose,
  roomId,
  onUserAdded,
}) => {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10); 
  const [totalCount, setTotalCount] = useState(0);
  const  toast  = useToastify();

  useEffect(() => {
    if (open) {
      const fetchUsers = async () => {
        setLoading(true);
        try {
          const response = await userApi.getAllUser(pageNumber, pageSize);
          console.log("Get all users response:", response);
          if (response.error) {
            toast.error(response.error.message);
            setUsers([]);
            setTotalCount(0);
          } else {
            setUsers(response.data.items || []);
            setTotalCount(response.data.totalCount || 0);
          }
        } catch (err: any) {
          console.error("Fetch users error:", err);
          toast.error(err.message || "Lỗi khi lấy danh sách người dùng");
          setUsers([]);
          setTotalCount(0);
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    }
  }, [open, pageNumber, pageSize, ]);

  const handleAddUser = async () => {
    if (!selectedUserId) {
      toast.error("Vui lòng chọn một người dùng");
      return;
    }

    setLoading(true);
    try {
      const response = await userApi.addUserToRooms(selectedUserId, [roomId]);
      console.log("Add user to rooms response:", response);
      if (response.error) {
        toast.error(response.error.message);
      } else {
        toast.success("Thêm người dùng vào phòng thành công!");
          toast.success(response.data);
        onUserAdded();
        onClose();
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi thêm người dùng vào phòng");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPageNumber(newPage);
    setSelectedUserId(null); // Đặt lại lựa chọn khi chuyển trang
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
              Chọn một người dùng để thêm vào phòng
            </Typography>
            <RadioGroup value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
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
                       Vai trò
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody sx={{ "& tr:hover": { bgcolor: "grey.50" } }}>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell sx={{ px: 2, py: 1.5 }}>
                          <FormControlLabel
                            value={user.id}
                            control={<Radio />}
                            label=""
                            sx={{ m: 0 }}
                            checked={selectedUserId === user.id}
                            onChange={() => setSelectedUserId(user.id)}
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
                            ? user.rooms.map((room) => room.name).join(", ")
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
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </RadioGroup>
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
                disabled={loading || !selectedUserId}
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

// Phần còn lại của RoomDetailModal giữ nguyên như mã gốc
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

  // Refresh room details when a user is added
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
                            {formatDate(user.dateOfBirth)}
                          </TableCell>
                          <TableCell sx={{ px: 2, py: 1.5, fontSize: "0.875rem", color: "grey.900" }}>
                            {formatDate(user.createdAt)}
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
        onUserAdded={handleUserAdded}
      />
    </>
  );
}