import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Chip,
  IconButton,
  FormControl,
  FormHelperText,
  CircularProgress,
  Typography,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Person as PersonIcon, Add as AddIcon, Close as CloseIcon, ArrowBack, ArrowForward } from "@mui/icons-material";
import { useUserForm } from "./seg/utils";
import roomApi from "../../../api/room.api";
import areaApi from "../../../api/area.api";
import buildingApi from "../../../api/building.api";
import type { UserDto, RoomDto, AreaDto, BuildingDto } from "../../../types/dtoModels";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: {
    email: string;
    fullName: string;
    phoneNumber: string;
    dateOfBirth: string;
    identityNumber: string;
    password: string;
    roomIds: string[];
  }, rooms: RoomDto[]) => Promise<void>;
  editingUser: UserDto | null;
}

export function AddUserModal({ isOpen, onClose, onSubmit, editingUser }: AddUserModalProps) {
  const { formData, errors, isSubmitting, handleInputChange, handleSubmit } = useUserForm(editingUser);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<RoomDto[]>([]); // Thêm trạng thái để lưu các phòng đã chọn
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isActiveFilter, setIsActiveFilter] = useState(true);
  const [noUsersFilter, setNoUsersFilter] = useState(false);
  const [areas, setAreas] = useState<AreaDto[]>([]);
  const [buildings, setBuildings] = useState<BuildingDto[]>([]);
  const [areaId, setAreaId] = useState<string>("");
  const [buildingId, setBuildingId] = useState<string>("");

  // Khởi tạo rooms và selectedRooms với editingUser.rooms khi edit
  useEffect(() => {
    if (editingUser && editingUser.rooms) {
      setRooms(editingUser.rooms);
      setSelectedRooms(editingUser.rooms);
    } else {
      setRooms([]);
      setSelectedRooms([]);
    }
  }, [editingUser]);

  // Lấy danh sách khu vực khi mở modal chọn phòng
  useEffect(() => {
    if (roomModalOpen) {
      const fetchAreas = async () => {
        try {
          const response = await areaApi.getAll();
          setAreas(response);
        } catch (error: any) {
          console.error("Error fetching areas:", error);
          setRoomError(error.message || "Lỗi khi lấy danh sách khu vực");
        }
      };
      fetchAreas();
    }
  }, [roomModalOpen]);

  // Lấy danh sách tòa nhà khi areaId thay đổi
  useEffect(() => {
    if (roomModalOpen && areaId) {
      const fetchBuildings = async () => {
        try {
          const response = await buildingApi.getByAreaId(areaId);
          setBuildings(response);
          setBuildingId(""); // Reset buildingId khi areaId thay đổi
        } catch (error: any) {
          console.error("Error fetching buildings:", error);
          setRoomError(error.message || "Lỗi khi lấy danh sách tòa nhà");
        }
      };
      fetchBuildings();
    } else {
      setBuildings([]);
      setBuildingId("");
    }
  }, [roomModalOpen, areaId]);

  // Hàm lấy danh sách phòng
  const fetchRooms = useCallback(async () => {
    setIsLoadingRooms(true);
    try {
      let response;
      if (buildingId) {
        if (searchTerm) {
          response = await roomApi.searchInBuilding({
            keyword: searchTerm,
            buildingId,
            pageNumber,
            pageSize,
            isActive: isActiveFilter,
            noUsers: noUsersFilter,
          });
        } else {
          response = await roomApi.getByBuildingId(buildingId, pageNumber, pageSize, isActiveFilter, noUsersFilter);
        }
      } else {
        if (searchTerm) {
          response = await roomApi.search({
            keyword: searchTerm,
            pageNumber,
            pageSize,
            isActive: isActiveFilter,
            noUsers: noUsersFilter,
          });
        } else {
          response = await roomApi.getAll(pageNumber, pageSize, isActiveFilter, noUsersFilter);
        }
      }
      // Giữ các phòng đã chọn (selectedRooms) và thêm các phòng mới từ API
      const existingRoomIds = selectedRooms.map((r) => r.id);
      const newRooms = response.items.filter((room) => !existingRoomIds.includes(room.id));
      setRooms([...selectedRooms, ...newRooms]);
      setTotalCount(response.totalCount);
      setTotalPages(response.totalPages);
      setRoomError(null);
    } catch (error: any) {
      console.error("Error fetching rooms:", error);
      setRoomError(error.message || "Lỗi khi lấy danh sách phòng");
    } finally {
      setIsLoadingRooms(false);
    }
  }, [pageNumber, pageSize, searchTerm, isActiveFilter, noUsersFilter, buildingId, selectedRooms]);

  // Lấy danh sách phòng khi mở modal chọn phòng hoặc khi các bộ lọc/tham số thay đổi
  useEffect(() => {
    if (roomModalOpen) {
      fetchRooms();
    } else {
      // Khi đóng modal, chỉ giữ selectedRooms
      setRooms(selectedRooms);
      setPageNumber(1);
      setSearchTerm("");
      setIsActiveFilter(true);
      setNoUsersFilter(false);
      setAreaId("");
      setBuildingId("");
    }
  }, [roomModalOpen, fetchRooms, selectedRooms]);

  // Xử lý chọn/xóa phòng
  const handleRoomSelect = (roomId: string) => {
    const newRoomIds = formData.roomIds.includes(roomId)
      ? formData.roomIds.filter((id) => id !== roomId)
      : [...formData.roomIds, roomId];
    handleInputChange("roomIds", newRoomIds);

    // Cập nhật selectedRooms
    if (newRoomIds.includes(roomId)) {
      const selectedRoom = rooms.find((r) => r.id === roomId);
      if (selectedRoom && !selectedRooms.find((r) => r.id === roomId)) {
        setSelectedRooms([...selectedRooms, selectedRoom]);
      }
    } else {
      setSelectedRooms(selectedRooms.filter((r) => r.id !== roomId));
    }
  };

  // Xóa phòng khỏi danh sách đã chọn
  const handleRoomDelete = (roomId: string) => {
    handleInputChange("roomIds", formData.roomIds.filter((id) => id !== roomId));
    setSelectedRooms(selectedRooms.filter((r) => r.id !== roomId));
  };

  // Mở/đóng modal chọn phòng
  const handleOpenRoomModal = () => setRoomModalOpen(true);
  const handleCloseRoomModal = () => {
    setRoomModalOpen(false);
  };

  // Xử lý thay đổi khu vực
  const handleAreaChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setAreaId(event.target.value as string);
    setPageNumber(1); // Reset về trang 1 khi thay đổi khu vực
  };

  // Xử lý thay đổi tòa nhà
  const handleBuildingChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setBuildingId(event.target.value as string);
    setPageNumber(1); // Reset về trang 1 khi thay đổi tòa nhà
  };

  // Xử lý tìm kiếm
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPageNumber(1); // Reset về trang 1 khi tìm kiếm
  };

  // Xử lý thay đổi bộ lọc
  const handleIsActiveFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsActiveFilter(e.target.checked);
    setPageNumber(1); // Reset về trang 1 khi thay đổi bộ lọc
  };

  const handleNoUsersFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNoUsersFilter(e.target.checked);
    setPageNumber(1); // Reset về trang 1 khi thay đổi bộ lọc
  };

  // Xử lý phân trang
  const handlePreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const handleNextPage = () => {
    if (pageNumber < totalPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  // Format ngày sinh
  const handleDateChange = (date: Date | null) => {
    if (date) {
      handleInputChange("dateOfBirth", date.toISOString().split("T")[0]);
    }
  };

  // Gửi formData và rooms khi submit
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    console.log("handleFormSubmit called");
    handleSubmit(e, (user) => onSubmit(user, selectedRooms));
  };

  if (!isOpen) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            maxWidth: "32rem",
            margin: 0,
            borderRadius: 0,
            boxShadow: 24,
            transform: isOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.3s ease-in-out",
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
              {editingUser ? "Chỉnh Sửa Phòng Người Dùng" : "Thêm Người Dùng Mới"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "grey.500" }}
            >
              {editingUser ? "Cập nhật danh sách phòng của người dùng" : "Tạo người dùng mới"}
            </Typography>
          </Box>
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
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            p: 3,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <form id="user-form" onSubmit={handleFormSubmit}>
            {/* Thông Tin Cơ Bản */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "grey.900",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <PersonIcon sx={{ fontSize: 20 }} />
                Thông Tin Cơ Bản
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Email */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "grey.700",
                      fontWeight: "medium",
                      mb: 1,
                    }}
                  >
                    Email *
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Nhập email"
                    size="small"
                    error={!!errors.email}
                    disabled={!!editingUser}
                    sx={{
                      bgcolor: "background.paper",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: errors.email ? "error.main" : "grey.300",
                        },
                        "&:hover fieldset": {
                          borderColor: errors.email ? "error.main" : "grey.500",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "primary.main",
                          boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                        },
                      },
                      "& .MuiInputBase-input": {
                        color: "grey.700",
                        px: 1.5,
                        py: 1,
                      },
                    }}
                  />
                  {errors.email && (
                    <Typography
                      variant="caption"
                      sx={{ color: "error.main", mt: 0.5 }}
                    >
                      {errors.email}
                    </Typography>
                  )}
                </Box>

                {/* Họ Tên */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "grey.700",
                      fontWeight: "medium",
                      mb: 1,
                    }}
                  >
                    Họ Tên *
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="Nhập họ tên"
                    size="small"
                    error={!!errors.fullName}
                    disabled={!!editingUser}
                    sx={{
                      bgcolor: "background.paper",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: errors.fullName ? "error.main" : "grey.300",
                        },
                        "&:hover fieldset": {
                          borderColor: errors.fullName ? "error.main" : "grey.500",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "primary.main",
                          boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                        },
                      },
                      "& .MuiInputBase-input": {
                        color: "grey.700",
                        px: 1.5,
                        py: 1,
                      },
                    }}
                  />
                  {errors.fullName && (
                    <Typography
                      variant="caption"
                      sx={{ color: "error.main", mt: 0.5 }}
                    >
                      {errors.fullName}
                    </Typography>
                  )}
                </Box>

                {/* Số Điện Thoại */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "grey.700",
                      fontWeight: "medium",
                      mb: 1,
                    }}
                  >
                    Số Điện Thoại *
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    placeholder="Nhập số điện thoại"
                    size="small"
                    error={!!errors.phoneNumber}
                    disabled={!!editingUser}
                    sx={{
                      bgcolor: "background.paper",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: errors.phoneNumber ? "error.main" : "grey.300",
                        },
                        "&:hover fieldset": {
                          borderColor: errors.phoneNumber ? "error.main" : "grey.500",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "primary.main",
                          boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                        },
                      },
                      "& .MuiInputBase-input": {
                        color: "grey.700",
                        px: 1.5,
                        py: 1,
                      },
                    }}
                  />
                  {errors.phoneNumber && (
                    <Typography
                      variant="caption"
                      sx={{ color: "error.main", mt: 0.5 }}
                    >
                      {errors.phoneNumber}
                    </Typography>
                  )}
                </Box>

                {/* Ngày Sinh */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "grey.700",
                      fontWeight: "medium",
                      mb: 1,
                    }}
                  >
                    Ngày Sinh *
                  </Typography>
                  <DatePicker
                    value={formData.dateOfBirth ? new Date(formData.dateOfBirth) : null}
                    onChange={handleDateChange}
                    disabled={!!editingUser}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                        error: !!errors.dateOfBirth,
                        placeholder: "Chọn ngày sinh",
                        sx: {
                          bgcolor: "background.paper",
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            "& fieldset": {
                              borderColor: errors.dateOfBirth ? "error.main" : "grey.300",
                            },
                            "&:hover fieldset": {
                              borderColor: errors.dateOfBirth ? "error.main" : "grey.500",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "primary.main",
                              boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                            },
                          },
                          "& .MuiInputBase-input": {
                            color: "grey.700",
                            px: 1.5,
                            py: 1,
                          },
                        },
                      },
                    }}
                  />
                  {errors.dateOfBirth && (
                    <Typography
                      variant="caption"
                      sx={{ color: "error.main", mt: 0.5 }}
                    >
                      {errors.dateOfBirth}
                    </Typography>
                  )}
                </Box>

                {/* CMND/CCCD */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "grey.700",
                      fontWeight: "medium",
                      mb: 1,
                    }}
                  >
                    CMND/CCCD *
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.identityNumber}
                    onChange={(e) => handleInputChange("identityNumber", e.target.value)}
                    placeholder="Nhập CMND/CCCD"
                    size="small"
                    error={!!errors.identityNumber}
                    disabled={!!editingUser}
                    sx={{
                      bgcolor: "background.paper",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: errors.identityNumber ? "error.main" : "grey.300",
                        },
                        "&:hover fieldset": {
                          borderColor: errors.identityNumber ? "error.main" : "grey.500",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "primary.main",
                          boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                        },
                      },
                      "& .MuiInputBase-input": {
                        color: "grey.700",
                        px: 1.5,
                        py: 1,
                      },
                    }}
                  />
                  {errors.identityNumber && (
                    <Typography
                      variant="caption"
                      sx={{ color: "error.main", mt: 0.5 }}
                    >
                      {errors.identityNumber}
                    </Typography>
                  )}
                </Box>

                {/* Mật Khẩu */}
                {!editingUser && (
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "grey.700",
                        fontWeight: "medium",
                        mb: 1,
                      }}
                    >
                      Mật Khẩu *
                    </Typography>
                    <TextField
                      fullWidth
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="Nhập mật khẩu"
                      size="small"
                      error={!!errors.password}
                      sx={{
                        bgcolor: "background.paper",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "& fieldset": {
                            borderColor: errors.password ? "error.main" : "grey.300",
                          },
                          "&:hover fieldset": {
                            borderColor: errors.password ? "error.main" : "grey.500",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "primary.main",
                            boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: "grey.700",
                          px: 1.5,
                          py: 1,
                        },
                      }}
                    />
                    {errors.password && (
                      <Typography
                        variant="caption"
                        sx={{ color: "error.main", mt: 0.5 }}
                      >
                        {errors.password}
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Phòng Đã Chọn */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "grey.700",
                      fontWeight: "medium",
                      mb: 1,
                    }}
                  >
                    Phòng Đã Chọn
                  </Typography>
                  <FormControl fullWidth error={!!errors.roomIds}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleOpenRoomModal}
                        sx={{
                          borderRadius: 2,
                          borderColor: "grey.300",
                          color: "grey.700",
                          "&:hover": {
                            borderColor: "grey.500",
                            bgcolor: "grey.100",
                          },
                        }}
                      >
                        Chọn Phòng
                      </Button>
                    </Box>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {formData.roomIds.length > 0 ? (
                        formData.roomIds.map((roomId) => {
                          const room = selectedRooms.find((r) => r.id === roomId);
                          return room ? (
                            <Chip
                              key={roomId}
                              label={room.name}
                              onDelete={() => handleRoomDelete(roomId)}
                              deleteIcon={<CloseIcon />}
                              sx={{
                                bgcolor: "grey.100",
                                color: "grey.700",
                                borderRadius: 1,
                              }}
                            />
                          ) : (
                            <Chip
                              key={roomId}
                              label={`Phòng ${roomId}`}
                              onDelete={() => handleRoomDelete(roomId)}
                              deleteIcon={<CloseIcon />}
                              sx={{
                                bgcolor: "grey.100",
                                color: "grey.700",
                                borderRadius: 1,
                              }}
                            />
                          );
                        })
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Chưa chọn phòng
                        </Typography>
                      )}
                    </Box>
                    {errors.roomIds && (
                      <Typography
                        variant="caption"
                        sx={{ color: "error.main", mt: 0.5 }}
                      >
                        {errors.roomIds}
                      </Typography>
                    )}
                  </FormControl>
                </Box>
              </Box>
            </Box>
          </form>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            borderTop: 1,
            borderColor: "grey.200",
            bgcolor: "background.paper",
            position: "sticky",
            bottom: 0,
            display: "flex",
            justifyContent: "flex-end",
            gap: 1,
          }}
        >
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              px: 3,
              py: 1,
              bgcolor: "grey.100",
              color: "grey.700",
              borderRadius: 2,
              "&:hover": { bgcolor: "grey.200" },
            }}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            form="user-form"
            disabled={isSubmitting}
            onClick={() => console.log("Submit button clicked, isSubmitting:", isSubmitting)}
            sx={{
              px: 3,
              py: 1,
              bgcolor: "primary.main",
              color: "white",
              borderRadius: 2,
              "&:hover": { bgcolor: "primary.dark" },
              "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
            }}
          >
            {isSubmitting ? "Đang Lưu..." : editingUser ? "Cập Nhật Phòng" : "Thêm Người Dùng"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal chọn phòng */}
      <Dialog
        open={roomModalOpen}
        onClose={handleCloseRoomModal}
        maxWidth="sm"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            maxWidth: "32rem",
            margin: 0,
            borderRadius: 0,
            boxShadow: 24,
            transform: roomModalOpen ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.3s ease-in-out",
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
          }}
        >
          Chọn Phòng
        </DialogTitle>
        <DialogContent
          sx={{
            p: 3,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Tìm kiếm và bộ lọc */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="area-select-label">Khu Vực</InputLabel>
              <Select
                labelId="area-select-label"
                value={areaId}
                label="Khu Vực"
                onChange={handleAreaChange}
                sx={{
                  bgcolor: "background.paper",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "& fieldset": { borderColor: "grey.300" },
                    "&:hover fieldset": { borderColor: "grey.500" },
                    "&.Mui-focused fieldset": {
                      borderColor: "primary.main",
                      boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                    },
                  },
                }}
              >
                <MenuItem value="">
                  <em>Tất cả khu vực</em>
                </MenuItem>
                {areas.map((area) => (
                  <MenuItem key={area.id} value={area.id}>
                    {area.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel id="building-select-label">Tòa Nhà</InputLabel>
              <Select
                labelId="building-select-label"
                value={buildingId}
                label="Tòa Nhà"
                onChange={handleBuildingChange}
                disabled={!areaId}
                sx={{
                  bgcolor: "background.paper",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    "& fieldset": { borderColor: "grey.300" },
                    "&:hover fieldset": { borderColor: "grey.500" },
                    "&.Mui-focused fieldset": {
                      borderColor: "primary.main",
                      boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                    },
                  },
                }}
              >
                <MenuItem value="">
                  <em>Tất cả tòa nhà</em>
                </MenuItem>
                {buildings.map((building) => (
                  <MenuItem key={building.id} value={building.id}>
                    {building.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm phòng..."
              size="small"
              sx={{
                bgcolor: "background.paper",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "& fieldset": { borderColor: "grey.300" },
                  "&:hover fieldset": { borderColor: "grey.500" },
                  "&.Mui-focused fieldset": {
                    borderColor: "primary.main",
                    boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "grey.700",
                  px: 1.5,
                  py: 1,
                },
              }}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isActiveFilter}
                    onChange={handleIsActiveFilterChange}
                  />
                }
                label="Chỉ hiển thị phòng hoạt động"
                sx={{ color: "grey.700" }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={noUsersFilter}
                    onChange={handleNoUsersFilterChange}
                  />
                }
                label="Phòng chưa có người dùng"
                sx={{ color: "grey.700" }}
              />
            </Box>
          </Box>

          {/* Danh sách phòng */}
          {isLoadingRooms ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : roomError ? (
            <Typography color="error">{roomError}</Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <Box key={room.id} sx={{ display: "flex", alignItems: "center" }}>
                    <Checkbox
                      checked={formData.roomIds.includes(room.id)}
                      onChange={() => handleRoomSelect(room.id)}
                    />
                    <Typography sx={{ ml: 1, color: "grey.700" }}>{room.name}</Typography>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">Không tìm thấy phòng</Typography>
              )}
            </Box>
          )}

          {/* Phân trang */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
              <Typography variant="body2" color="grey.700">
                Trang {pageNumber} / {totalPages} (Tổng: {totalCount} phòng)
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={handlePreviousPage}
                  disabled={pageNumber === 1}
                  sx={{
                    borderRadius: 2,
                    borderColor: "grey.300",
                    color: "grey.700",
                    "&:hover": { borderColor: "grey.500", bgcolor: "grey.100" },
                    "&:disabled": { opacity: 0.5 },
                  }}
                >
                  Trước
                </Button>
                <Button
                  variant="outlined"
                  endIcon={<ArrowForward />}
                  onClick={handleNextPage}
                  disabled={pageNumber === totalPages}
                  sx={{
                    borderRadius: 2,
                    borderColor: "grey.300",
                    color: "grey.700",
                    "&:hover": { borderColor: "grey.500", bgcolor: "grey.100" },
                    "&:disabled": { opacity: 0.5 },
                  }}
                >
                  Sau
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            p: 3,
            borderTop: 1,
            borderColor: "grey.200",
            bgcolor: "background.paper",
            position: "sticky",
            bottom: 0,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={handleCloseRoomModal}
            sx={{
              px: 3,
              py: 1,
              bgcolor: "grey.100",
              color: "grey.700",
              borderRadius: 2,
              "&:hover": { bgcolor: "grey.200" },
            }}
          >
            Xong
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}