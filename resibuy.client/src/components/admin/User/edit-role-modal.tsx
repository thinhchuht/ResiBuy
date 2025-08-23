import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { vi } from "date-fns/locale";
import { useToastify } from "../../../hooks/useToastify";
import userApi from "../../../api/user.api";
import roomApi from "../../../api/room.api";
import areaApi from "../../../api/area.api";
import type { UserDto, RoomDto, AreaDto, UserRoomDto } from "../../../types/dtoModels";
import { formatDate, formatDateWithoutTime } from "./seg/utils";

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    id: string,
    data: {
      roles: string[];
      shipper?: { lastLocationId: string; startWorkTime: number; endWorkTime: number };
      store?: { name: string; description: string; phoneNumber: string; roomId: string };
      customer?: { roomId: string };
    }
  ) => Promise<void>;
  userId: string | null;
}

export function EditRoleModal({ isOpen, onClose, onSubmit, userId }: EditRoleModalProps) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [initialRoles, setInitialRoles] = useState<string[]>([]);
  const [shipperData, setShipperData] = useState({
    lastLocationId: "",
    startWorkTime: 0,
    endWorkTime: 0,
  });
  const [storeData, setStoreData] = useState({
    name: "",
    description: "",
    phoneNumber: "",
    roomId: "",
  });
  const [storeErrors, setStoreErrors] = useState({
    name: "",
    description: "",
    phoneNumber: "",
    roomId: "",
  });
  const [customerData, setCustomerData] = useState({ roomId: "" });
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [areas, setAreas] = useState<AreaDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const  toast  = useToastify();

  // Convert float hours to Date for TimePicker
  const floatToDate = (hours: number) => {
    const totalMinutes = hours * 60;
    const date = new Date();
    date.setHours(Math.floor(totalMinutes / 60), totalMinutes % 60, 0, 0);
    return date;
  };

  // Convert Date from TimePicker to float hours
  const dateToFloat = (date: Date | null) => {
    if (!date) return 0;
    return date.getHours() + date.getMinutes() / 60;
  };

  // Validate store fields
  const validateStoreField = (field: keyof typeof storeData, value: string) => {
    switch (field) {
      case "name":
        if (!value) return "Tên cửa hàng là bắt buộc";
        if (value.length > 100) return "Tên cửa hàng không được vượt quá 100 ký tự";
        return "";
      case "description":
        if (value.length > 500) return "Mô tả không được vượt quá 500 ký tự";
        return "";
      case "phoneNumber":
        if (!value) return "Số điện thoại cửa hàng là bắt buộc";
        if (!/^\d{10}$/.test(value)) return "Số điện thoại cửa hàng phải có 10 chữ số";
        if (!/^0[3|5|7|8|9]/.test(value)) return "Số điện thoại phải bắt đầu bằng 03, 05, 07, 08 hoặc 09";
        return "";
      case "roomId":
        if (!value) return "Vui lòng chọn phòng cho cửa hàng";
        return "";
      default:
        return "";
    }
  };

  // Fetch user data and rooms/areas when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      setIsLoading(true);
      Promise.all([
        userApi.getById(userId),
        roomApi.getAll(1, 100, true, false),
        areaApi.getAll(false),
      ])
        .then(([userResponse, roomsResponse, areasResponse]) => {
          if (userResponse.code === 0) {
            setUser(userResponse.data);
            setRoles(userResponse.data.roles || []);
            setInitialRoles(userResponse.data.roles || []);
            setCustomerData({
              roomId: userResponse.data.rooms?.[0]?.id || "",
            });
            setStoreData({
              name: userResponse.data.stores?.[0]?.name || "",
              description: userResponse.data.stores?.[0]?.description || "",
              phoneNumber: userResponse.data.stores?.[0]?.phoneNumber || "",
              roomId: userResponse.data.stores?.[0]?.roomId || "",
            });
            setShipperData({
              lastLocationId: userResponse.data.shipper?.lastLocationId || "",
              startWorkTime: userResponse.data.shipper?.startWorkTime || 0,
              endWorkTime: userResponse.data.shipper?.endWorkTime || 0,
            });
          } else {
            throw new Error(userResponse.error?.message || "Lỗi khi lấy thông tin người dùng");
          }
          setRooms(roomsResponse.data?.items || []);
          setAreas(areasResponse);
        })
        .catch((err: any) => {
          console.error("Error fetching data:", err);
          setError(err.message || "Lỗi khi lấy dữ liệu");
          toast.error(err.message || "Lỗi khi lấy dữ liệu");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, userId]);

  // Handle role checkbox changes
  const handleRoleChange = (role: string) => {
    if (initialRoles.includes(role)) return; // Prevent unchecking existing roles
    setRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  };

  // Handle shipper data changes
  const handleShipperChange = (field: keyof typeof shipperData, value: string | number | Date | null) => {
    if (field === "startWorkTime" || field === "endWorkTime") {
      setShipperData((prev) => ({ ...prev, [field]: dateToFloat(value as Date | null) }));
    } else {
      setShipperData((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Handle store data changes with validation
  const handleStoreChange = (field: keyof typeof storeData, value: string) => {
    setStoreData((prev) => ({ ...prev, [field]: value }));
    setStoreErrors((prev) => ({ ...prev, [field]: validateStoreField(field, value) }));
  };

  // Handle customer data changes
  const handleCustomerChange = (field: keyof typeof customerData, value: string) => {
    setCustomerData((prev) => ({ ...prev, [field]: value }));
  };

  // Validate form data for new roles only
  const validateForm = () => {
    const newRoles = roles.filter((role) => !initialRoles.includes(role));
    if (newRoles.includes("SHIPPER")) {
      if (!shipperData.lastLocationId) return "Vui lòng chọn khu vực cho shipper";
      if (shipperData.startWorkTime < 0 || shipperData.startWorkTime > 23)
        return "Giờ bắt đầu làm việc phải từ 0 đến 23";
      if (shipperData.endWorkTime < 0 || shipperData.endWorkTime > 23)
        return "Giờ kết thúc làm việc phải từ 0 đến 23";
    }
    if (newRoles.includes("SELLER")) {
      if (!storeData.name) return "Tên cửa hàng là bắt buộc";
      if (storeData.name.length > 100) return "Tên cửa hàng không được vượt quá 100 ký tự";
      if (storeData.description.length > 500) return "Mô tả không được vượt quá 500 ký tự";
      if (!storeData.phoneNumber) return "Số điện thoại cửa hàng là bắt buộc";
      if (!/^\d{10}$/.test(storeData.phoneNumber)) return "Số điện thoại cửa hàng phải có 10 chữ số";
      if (!/^0[3|5|7|8|9]/.test(storeData.phoneNumber)) return "Số điện thoại phải bắt đầu bằng 03, 05, 07, 08 hoặc 09";
      if (!storeData.roomId) return "Vui lòng chọn phòng cho cửa hàng";
    }
    if (newRoles.includes("CUSTOMER")) {
      if (!customerData.roomId) return "Vui lòng chọn phòng cho khách hàng";
    }
    return null;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const data: any = { roles };
      const newRoles = roles.filter((role) => !initialRoles.includes(role));
      if (newRoles.includes("SHIPPER")) {
        data.shipper = shipperData;
      }
      if (newRoles.includes("SELLER")) {
        data.store = storeData;
      }
      if (newRoles.includes("CUSTOMER")) {
        data.customer = customerData;
      }
      console.log("Submitting payload:", { userId, data });
      await onSubmit(userId!, data);
      toast.success("Cập nhật vai trò thành công!");
      onClose();
    } catch (error: any) {
      console.error("Submit role error:", error);
      toast.error(error.message || "Lỗi khi cập nhật vai trò");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !userId) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Dialog
        open={isOpen}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            maxWidth: "48rem",
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
            <Typography variant="h6" sx={{ color: "grey.900", fontWeight: "medium" }}>
              Chỉnh Sửa Vai Trò
            </Typography>
            <Typography variant="body2" sx={{ color: "grey.500" }}>
              Cập nhật vai trò cho người dùng
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
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <form id="role-form" onSubmit={handleSubmit}>
              {/* User Information */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "grey.900",
                    mb: 2,
                    fontWeight: "medium",
                  }}
                >
                  Thông Tin Người Dùng
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <TextField
                    label="ID Người Dùng"
                    value={user?.id || "N/A"}
                    fullWidth
                    disabled
                    size="small"
                    sx={{ bgcolor: "grey.100" }}
                  />
                  <TextField
                    label="Họ Tên"
                    value={user?.fullName || "N/A"}
                    fullWidth
                    disabled
                    size="small"
                    sx={{ bgcolor: "grey.100" }}
                  />
                  <TextField
                    label="Email"
                    value={user?.email || "N/A"}
                    fullWidth
                    disabled
                    size="small"
                    sx={{ bgcolor: "grey.100" }}
                  />
                  <TextField
                    label="Số Điện Thoại"
                    value={user?.phoneNumber || "N/A"}
                    fullWidth
                    disabled
                    size="small"
                    sx={{ bgcolor: "grey.100" }}
                  />
                  <TextField
                    label="CMND/CCCD"
                    value={user?.identityNumber || "N/A"}
                    fullWidth
                    disabled
                    size="small"
                    sx={{ bgcolor: "grey.100" }}
                  />
                  <TextField
                    label="Ngày Sinh"
                    value={user?.dateOfBirth ? formatDateWithoutTime(user.dateOfBirth) : "N/A"}
                    fullWidth
                    disabled
                    size="small"
                    sx={{ bgcolor: "grey.100" }}
                  />
                  <TextField
                    label="Trạng Thái Khóa"
                    value={user?.isLocked ? "Đã Khóa" : "Hoạt động"}
                    fullWidth
                    disabled
                    size="small"
                    sx={{ bgcolor: "grey.100" }}
                  />
                  <TextField
                    label="Ngày Tạo"
                    value={user?.createdAt ? formatDate(user.createdAt) : "N/A"}
                    fullWidth
                    disabled
                    size="small"
                    sx={{ bgcolor: "grey.100" }}
                  />
                  <TextField
                    label="Ngày Cập Nhật"
                    value={user?.updatedAt ? formatDate(user.updatedAt) : "N/A"}
                    fullWidth
                    disabled
                    size="small"
                    sx={{ bgcolor: "grey.100" }}
                  />
                 
                </Box>
              </Box>

              {/* Rooms */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "grey.900",
                    mb: 2,
                    fontWeight: "medium",
                  }}
                >
                  Phòng
                </Typography>
                {user?.rooms && user.rooms.length > 0 ? (
                  <List dense sx={{ bgcolor: "grey.100", borderRadius: 1, p: 1 }}>
                    {user.rooms.map((room) => (
                      <ListItem key={room.id}>
                        <ListItemText
                          primary={room.name}
                          secondary={`Tòa nhà: ${room.buildingName}, Khu vực: ${room.areaName} (ID: ${room.areaId})`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" sx={{ color: "grey.600" }}>
                    Chưa có phòng
                  </Typography>
                )}
              </Box>

             

              {/* Reports */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "grey.900",
                    mb: 2,
                    fontWeight: "medium",
                  }}
                >
                  Báo Cáo
                </Typography>
                <TextField
                  label="Báo Cáo"
                  value={user?.reportCount > 0 ? `${user.reportCount} báo cáo` : "Không có báo cáo"}
                  fullWidth
                  disabled
                  size="small"
                  sx={{ bgcolor: "grey.100" }}
                />
              </Box>

              {/* Stores */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "grey.900",
                    mb: 2,
                    fontWeight: "medium",
                  }}
                >
                  Cửa Hàng
                </Typography>
                {user?.stores && user.stores.length > 0 ? (
                  <List dense sx={{ bgcolor: "grey.100", borderRadius: 1, p: 1 }}>
                    {user.stores.map((store) => (
                      <ListItem key={store.id}>
                        <ListItemText
                          primary={store.name}
                          secondary={`SĐT: ${store.phoneNumber}, Trạng thái: ${store.isLocked ? "Đã Khóa" : "Hoạt động"}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" sx={{ color: "grey.600" }}>
                    Chưa có cửa hàng
                  </Typography>
                )}
              </Box>

              {/* Role Selection */}
             {/* Role Selection */}
<Box sx={{ mb: 3 }}>
  <Typography
    variant="h6"
    sx={{
      color: "grey.900",
      mb: 2,
      fontWeight: "medium",
    }}
  >
    Vai Trò
  </Typography>
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
    {[
      { value: "CUSTOMER", label: "Khách Hàng", color: "success.main" },
      { value: "USER", label: "Người Dùng", color: "info.main" },
      { value: "ADMIN", label: "Quản Trị", color: "error.main" },
      { value: "SELLER", label: "Người Bán", color: "warning.main" },
      { value: "SHIPPER", label: "Shipper", color: "primary.main" },
    ].map((role) => (
      <FormControlLabel
        key={role.value}
        control={
          <Checkbox
            checked={roles.includes(role.value)}
            onChange={() => handleRoleChange(role.value)}
            disabled={initialRoles.includes(role.value)}
            sx={{ color: role.color }}
          />
        }
        label={
          <Typography sx={{ color: role.color }}>
            {role.label}
          </Typography>
        }
        sx={{ color: "grey.700" }}
      />
    ))}
  </Box>
</Box>

              {/* Shipper Data */}
              {roles.includes("SHIPPER") && !initialRoles.includes("SHIPPER") && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "grey.900",
                      mb: 2,
                      fontWeight: "medium",
                    }}
                  >
                    Thông Tin Shipper
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="lastLocationId-label">Khu Vực</InputLabel>
                      <Select
                        labelId="lastLocationId-label"
                        value={shipperData.lastLocationId}
                        label="Khu Vực"
                        onChange={(e) => handleShipperChange("lastLocationId", e.target.value)}
                      >
                        <MenuItem value="">
                          <em>Chọn khu vực</em>
                        </MenuItem>
                        {areas.map((area) => (
                          <MenuItem key={area.id} value={area.id}>
                            {area.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TimePicker
                      label="Giờ Bắt Đầu Làm Việc"
                      value={floatToDate(shipperData.startWorkTime)}
                      onChange={(newValue) => handleShipperChange("startWorkTime", newValue)}
                      slotProps={{
                        textField: { size: "small", fullWidth: true },
                      }}
                      ampm={false}
                    />
                    <TimePicker
                      label="Giờ Kết Thúc Làm Việc"
                      value={floatToDate(shipperData.endWorkTime)}
                      onChange={(newValue) => handleShipperChange("endWorkTime", newValue)}
                      slotProps={{
                        textField: { size: "small", fullWidth: true },
                      }}
                      ampm={false}
                    />
                  </Box>
                </Box>
              )}

              {/* Seller Data */}
              {roles.includes("SELLER") && !initialRoles.includes("SELLER") && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "grey.900",
                      mb: 2,
                      fontWeight: "medium",
                    }}
                  >
                    Thông Tin Cửa Hàng
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField
                      label="Tên Cửa Hàng"
                      value={storeData.name}
                      onChange={(e) => handleStoreChange("name", e.target.value)}
                      fullWidth
                      size="small"
                      error={!!storeErrors.name}
                      helperText={storeErrors.name}
                    />
                    <TextField
                      label="Mô Tả"
                      value={storeData.description}
                      onChange={(e) => handleStoreChange("description", e.target.value)}
                      fullWidth
                      size="small"
                      error={!!storeErrors.description}
                      helperText={storeErrors.description}
                    />
                    <TextField
                      label="Số Điện Thoại"
                      value={storeData.phoneNumber}
                      onChange={(e) => handleStoreChange("phoneNumber", e.target.value)}
                      fullWidth
                      size="small"
                      error={!!storeErrors.phoneNumber}
                      helperText={storeErrors.phoneNumber}
                    />
                    <FormControl fullWidth size="small" error={!!storeErrors.roomId}>
                      <InputLabel id="store-roomId-label">Phòng</InputLabel>
                      <Select
                        labelId="store-roomId-label"
                        value={storeData.roomId}
                        label="Phòng"
                        onChange={(e) => handleStoreChange("roomId", e.target.value)}
                      >
                        <MenuItem value="">
                          <em>Chọn phòng</em>
                        </MenuItem>
                        {user?.rooms?.map((room: UserRoomDto) => (
                          <MenuItem key={room.id} value={room.id}>
                            {room.name} (Tòa nhà: {room.buildingName}, Khu vực: {room.areaName})
                          </MenuItem>
                        ))}
                      </Select>
                      {!!storeErrors.roomId && (
                        <Typography variant="caption" color="error">
                          {storeErrors.roomId}
                        </Typography>
                      )}
                    </FormControl>
                  </Box>
                </Box>
              )}

              {/* Customer Data */}
              {roles.includes("CUSTOMER") && !initialRoles.includes("CUSTOMER") && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "grey.900",
                      mb: 2,
                      fontWeight: "medium",
                    }}
                  >
                    Thông Tin Khách Hàng
                  </Typography>
                  <FormControl fullWidth size="small">
                    <InputLabel id="customer-roomId-label">Phòng</InputLabel>
                    <Select
                      labelId="customer-roomId-label"
                      value={customerData.roomId}
                      label="Phòng"
                      onChange={(e) => handleCustomerChange("roomId", e.target.value)}
                    >
                      <MenuItem value="">
                        <em>Chọn phòng</em>
                      </MenuItem>
                      {rooms.map((room) => (
                        <MenuItem key={room.id} value={room.id}>
                          {room.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
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
            disabled={isLoading}
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
            form="role-form"
            disabled={isLoading || Object.values(storeErrors).some((error) => !!error)}
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
            {isLoading ? "Đang Lưu..." : "Cập Nhật Vai Trò"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}