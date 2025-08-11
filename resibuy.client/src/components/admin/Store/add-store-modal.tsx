import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  Autocomplete,
  FormControl,
  CircularProgress,
} from "@mui/material";
import {
  Close,
  Store as StoreIcon,
  Info,
  Person,
  MeetingRoom,
} from "@mui/icons-material";
import { useStoreForm, useStoresLogic } from "./seg/utlis"; // Import useStoresLogic
import userApi from "../../../api/user.api";
import roomApi from "../../../api/room.api";
import storeApi from "../../../api/storee.api";
import { useToastify } from "../../../hooks/useToastify";

export function AddStoreModal({ isOpen, onClose, onSubmit, editStore }) {
  const { formData, errors, isSubmitting, handleInputChange, handleSubmit } = useStoreForm(editStore);
  const { getUserById } = useStoresLogic(); // Lấy getUserById từ useStoresLogic
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToastify();

  useEffect(() => {
    if (!isOpen) {
      setUsers([]);
      setRooms([]);
      setSelectedUser(null);
      setSelectedRoom(null);
      return;
    }

    setLoading(true);
    const fetchData = async () => {
      try {
        if (editStore) {
          // Chế độ chỉnh sửa: Lấy thông tin cửa hàng và thông tin người dùng
          const [storeRes, userRes] = await Promise.all([
            storeApi.getById(editStore.id),
            getUserById(editStore.ownerId), // Gọi getUserById từ useStoresLogic
          ]);

          if (storeRes.code === 0) {
            setSelectedRoom(storeRes.data.room || { id: editStore.roomId, name: editStore.roomId });
          } else {
            toast.error("Lỗi khi lấy thông tin cửa hàng");
            setSelectedRoom({ id: editStore.roomId, name: editStore.roomId });
          }

          if (userRes) {
            setSelectedUser(userRes); // Cập nhật selectedUser với dữ liệu từ getUserById
          } else {
            toast.error("Không thể lấy thông tin chủ sở hữu");
            setSelectedUser({ id: editStore.ownerId, fullName: "", email: editStore.ownerId });
          }
        } else {
          // Chế độ thêm mới: Lấy danh sách người dùng
          const res = await userApi.getAllUser(1, 100);
          if (res.code === 0) {
            setUsers(res.data.items || []);
          } else {
            toast.error("Lỗi khi lấy danh sách người dùng");
          }
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        toast.error("Lỗi khi tải dữ liệu");
        if (editStore) {
          setSelectedUser({ id: editStore.ownerId, fullName: "", email: editStore.ownerId });
          setSelectedRoom({ id: editStore.roomId, name: editStore.roomId });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, editStore ]);

  useEffect(() => {
    if (isOpen && !editStore && formData.ownerId) {
      setLoading(true);
      roomApi.getByUserId(formData.ownerId)
        .then((res) => {
          setRooms(res || []);
        })
        .catch((err) => {
          console.error("Lỗi khi lấy phòng:", err);
          toast.error("Lỗi khi lấy danh sách phòng");
          setRooms([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (!formData.ownerId) {
      setRooms([]);
    }
  }, [isOpen, editStore, formData.ownerId]);

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          maxWidth: "48rem",
          height: "100%",
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
            {editStore ? "Sửa Cửa Hàng" : "Thêm Cửa Hàng Mới"}
          </Typography>
          <Typography variant="body2" sx={{ color: "grey.500" }}>
            {editStore ? "Cập nhật thông tin cửa hàng" : "Tạo cửa hàng mới"}
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
          <Close sx={{ fontSize: 20 }} />
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
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress />
          </Box>
        ) : (
          <form onSubmit={(e) => handleSubmit(e, onSubmit)}>
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
                <StoreIcon sx={{ fontSize: 20 }} />
                Thông Tin Cơ Bản
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "grey.700",
                      fontWeight: "medium",
                      mb: 1,
                    }}
                  >
                    Tên Cửa Hàng *
                  </Typography>
                  <TextField
                    fullWidth
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Nhập tên cửa hàng"
                    size="small"
                    error={!!errors.name}
                    sx={{
                      bgcolor: "background.paper",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: errors.name ? "error.main" : "grey.300",
                        },
                        "&:hover fieldset": {
                          borderColor: errors.name ? "error.main" : "grey.500",
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
                  {errors.name && (
                    <Typography
                      variant="caption"
                      sx={{ color: "error.main", mt: 0.5 }}
                    >
                      {errors.name}
                    </Typography>
                  )}
                </Box>

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
                    placeholder="Nhập số điện thoại (VD: 0123456789)"
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

                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "grey.700",
                      fontWeight: "medium",
                      mb: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <Person sx={{ fontSize: 16 }} />
                    Chủ Sở Hữu *
                  </Typography>
                  {editStore ? (
                    <TextField
                      fullWidth
                      value={
                        selectedUser && (selectedUser.fullName || selectedUser.email)
                          ? `${selectedUser.fullName || "N/A"} - ${selectedUser.email || selectedUser.id}`
                          : formData.ownerId
                      }
                      disabled
                      size="small"
                      error={!!errors.ownerId}
                      sx={{
                        bgcolor: "background.paper",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "& fieldset": {
                            borderColor: errors.ownerId ? "error.main" : "grey.300",
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: "grey.700",
                          px: 1.5,
                          py: 1,
                        },
                      }}
                    />
                  ) : (
                    <FormControl fullWidth size="small" error={!!errors.ownerId}>
                      <Autocomplete
                        options={users}
                        getOptionLabel={(user) =>
                          user.fullName || user.email
                            ? `${user.fullName || "N/A"} - ${user.email || user.id}`
                            : user.id
                        }
                        value={users.find((user) => user.id === formData.ownerId) || null}
                        onChange={(event, newValue) => {
                          handleInputChange("ownerId", newValue ? newValue.id : "");
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Chọn chủ sở hữu"
                            placeholder="Nhập tên hoặc email để tìm kiếm"
                            error={!!errors.ownerId}
                            sx={{
                              bgcolor: "background.paper",
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                "& fieldset": {
                                  borderColor: errors.ownerId ? "error.main" : "grey.300",
                                },
                                "&:hover fieldset": {
                                  borderColor: errors.ownerId ? "error.main" : "grey.500",
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
                        )}
                      />
                    </FormControl>
                  )}
                  {errors.ownerId && (
                    <Typography
                      variant="caption"
                      sx={{ color: "error.main", mt: 0.5 }}
                    >
                      {errors.ownerId}
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "grey.700",
                      fontWeight: "medium",
                      mb: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <MeetingRoom sx={{ fontSize: 16 }} />
                    Phòng *
                  </Typography>
                  {editStore ? (
                    <TextField
                      fullWidth
                      value={selectedRoom ? (selectedRoom.name || selectedRoom.id) : formData.roomId}
                      disabled
                      size="small"
                      error={!!errors.roomId}
                      sx={{
                        bgcolor: "background.paper",
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "& fieldset": {
                            borderColor: errors.roomId ? "error.main" : "grey.300",
                          },
                        },
                        "& .MuiInputBase-input": {
                          color: "grey.700",
                          px: 1.5,
                          py: 1,
                        },
                      }}
                    />
                  ) : (
                    <FormControl fullWidth size="small" error={!!errors.roomId}>
                      <Autocomplete
                        options={rooms}
                        getOptionLabel={(room) => room.name || room.id}
                        value={rooms.find((room) => room.id === formData.roomId) || null}
                        onChange={(event, newValue) => {
                          handleInputChange("roomId", newValue ? newValue.id : "");
                        }}
                        disabled={!formData.ownerId}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Chọn phòng"
                            placeholder="Nhập tên phòng để tìm kiếm"
                            error={!!errors.roomId}
                            sx={{
                              bgcolor: "background.paper",
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 2,
                                "& fieldset": {
                                  borderColor: errors.roomId ? "error.main" : "grey.300",
                                },
                                "&:hover fieldset": {
                                  borderColor: errors.roomId ? "error.main" : "grey.500",
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
                        )}
                      />
                    </FormControl>
                  )}
                  {errors.roomId && (
                    <Typography
                      variant="caption"
                      sx={{ color: "error.main", mt: 0.5 }}
                    >
                      {errors.roomId}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

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
                <Info sx={{ fontSize: 20 }} />
                Cài Đặt Cửa Hàng
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "grey.700",
                      fontWeight: "medium",
                      mb: 1,
                    }}
                  >
                    Mô Tả
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows="3"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Nhập mô tả cửa hàng"
                    sx={{
                      bgcolor: "background.paper",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "& fieldset": {
                          borderColor: "grey.300",
                        },
                        "&:hover fieldset": {
                          borderColor: "grey.500",
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
                  <Typography
                    variant="caption"
                    sx={{ color: "grey.500", mt: 0.5 }}
                  >
                    Tùy chọn: Mô tả ngắn về cửa hàng
                  </Typography>
                </Box>

                {editStore && (
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "grey.700",
                        fontWeight: "medium",
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      Trạng Thái
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.isOpen}
                          onChange={(e) =>
                            handleInputChange("isOpen", e.target.checked)
                          }
                          sx={{
                            color: "grey.300",
                            "&.Mui-checked": {
                              color: "primary.main",
                            },
                            "&.Mui-focused": {
                              boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.5)",
                            },
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ color: "grey.700" }}>
                          Cửa hàng đang mở
                        </Typography>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={formData.isLocked}
                          onChange={(e) =>
                            handleInputChange("isLocked", e.target.checked)
                          }
                          sx={{
                            color: "grey.300",
                            "&.Mui-checked": {
                              color: "error.main",
                            },
                            "&.Mui-focused": {
                              boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.5)",
                            },
                          }}
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ color: "grey.700" }}>
                          Cửa hàng bị khóa
                        </Typography>
                      }
                    />
                    <Typography
                      variant="caption"
                      sx={{ color: "grey.500", mt: 0.5 }}
                    >
                      Quản lý trạng thái mở/đóng và khóa/mở khóa của cửa hàng
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </form>
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
          gap: 1,
        }}
      >
        <Button
          onClick={onClose}
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
          disabled={isSubmitting || loading}
          onClick={(e) => handleSubmit(e, onSubmit)}
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
          {isSubmitting
            ? "Đang Lưu..."
            : editStore
            ? "Cập Nhật Cửa Hàng"
            : "Thêm Cửa Hàng"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}