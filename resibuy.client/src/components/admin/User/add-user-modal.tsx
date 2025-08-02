import { useState, useEffect } from "react";
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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Person as PersonIcon, Add as AddIcon, Close as CloseIcon } from "@mui/icons-material";
import { useUserForm } from "./seg/utlis";
import roomApi from "../../../api/room.api";
import type { UserDto, RoomDto } from "../../../types/dtoModels";

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
  }) => Promise<void>;
  editingUser: UserDto | null;
}

export function AddUserModal({ isOpen, onClose, onSubmit, editingUser }: AddUserModalProps) {
  const { formData, errors, isSubmitting, handleInputChange, handleSubmit } = useUserForm(editingUser);
  const [roomModalOpen, setRoomModalOpen] = useState(false);
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [roomError, setRoomError] = useState<string | null>(null);

  // Lấy danh sách phòng
  useEffect(() => {
    if (roomModalOpen) {
      setIsLoadingRooms(true);
      roomApi
        .getAll(1, 100)
        .then((response) => {
          setRooms(response.items.filter((room) => room.isActive));
          setRoomError(null);
        })
        .catch((error) => {
          console.error("Error fetching rooms:", error);
          setRoomError(error.message || "Lỗi khi lấy danh sách phòng");
        })
        .finally(() => {
          setIsLoadingRooms(false);
        });
    }
  }, [roomModalOpen]);

  // Xử lý chọn/xóa phòng
  const handleRoomSelect = (roomId: string) => {
    const newRoomIds = formData.roomIds.includes(roomId)
      ? formData.roomIds.filter((id) => id !== roomId)
      : [...formData.roomIds, roomId];
    handleInputChange("roomIds", newRoomIds);
  };

  // Xóa phòng khỏi danh sách đã chọn
  const handleRoomDelete = (roomId: string) => {
    handleInputChange("roomIds", formData.roomIds.filter((id) => id !== roomId));
  };

  // Mở/đóng modal chọn phòng
  const handleOpenRoomModal = () => setRoomModalOpen(true);
  const handleCloseRoomModal = () => setRoomModalOpen(false);

  // Format ngày sinh
  const handleDateChange = (date: Date | null) => {
    if (date) {
      handleInputChange("dateOfBirth", date.toISOString().split("T")[0]);
    }
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
              {editingUser ? "Chỉnh Sửa Người Dùng" : "Thêm Người Dùng Mới"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "grey.500" }}
            >
              {editingUser ? "Cập nhật thông tin người dùng" : "Tạo người dùng mới"}
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
          <form id="user-form" onSubmit={(e) => handleSubmit(e, onSubmit)}>
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
                          const room = rooms.find((r) => r.id === roomId);
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
                          ) : null;
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
            {isSubmitting ? "Đang Lưu..." : editingUser ? "Cập Nhật Người Dùng" : "Thêm Người Dùng"}
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
            gap: 1,
          }}
        >
          {isLoadingRooms ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : roomError ? (
            <Typography color="error">{roomError}</Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {rooms.map((room) => (
                <Box key={room.id} sx={{ display: "flex", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={formData.roomIds.includes(room.id)}
                    onChange={() => handleRoomSelect(room.id)}
                  />
                  <Typography sx={{ ml: 1, color: "grey.700" }}>{room.name}</Typography>
                </Box>
              ))}
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