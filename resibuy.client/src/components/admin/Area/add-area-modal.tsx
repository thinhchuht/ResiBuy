import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  Paper,
} from "@mui/material";
import {
  Close,
  LocationOn as AreaIcon,
  Fullscreen,
  FullscreenExit,
  Search as SearchIcon,
  MyLocation as MyLocationIcon,
} from "@mui/icons-material";
import type { AreaDto } from "../../../types/dtoModels";
import { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { AreaFormData } from "./seg/utlis";

// Cần cài đặt mapbox-gl: npm install mapbox-gl @types/mapbox-gl
import "mapbox-gl/dist/mapbox-gl.css";

interface AddAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (area: AreaDto) => void;
  editArea?: AreaDto | null;
}

const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "8px",
  border: "1px solid",
  borderColor: "grey.300",
};

const defaultCenter = {
  lat: 10.7769,
  lng: 106.7009,
};

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export const useAreaForm = (editArea?: AreaDto | null) => {
  const [formData, setFormData] = useState<AreaFormData>({
    name: editArea?.name || "",
    latitude: editArea?.latitude || 10.7769,
    longitude: editArea?.longitude || 106.7009,
    isActive: editArea?.isActive ?? true,
  });
  const [errors, setErrors] = useState<Partial<AreaFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({
      name: editArea?.name || "",
      latitude: editArea?.latitude || 10.7769,
      longitude: editArea?.longitude || 106.7009,
      isActive: editArea?.isActive ?? true,
    });
  }, [editArea]);

  const handleInputChange = (field: keyof AreaFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (data: AreaFormData) => {
    const errors: Partial<AreaFormData> = {};
    if (!data.name?.trim()) {
      errors.name = "Tên khu vực là bắt buộc";
    }
    if (data.latitude === undefined || isNaN(data.latitude)) {
      errors.latitude = "Vĩ độ không hợp lệ";
    }
    if (data.longitude === undefined || isNaN(data.longitude)) {
      errors.longitude = "Kinh độ không hợp lệ";
    }
    return errors;
  };

  const handleSubmit = async (
    e: React.FormEvent,
    onSubmit: (data: AreaDto) => void,
    onReset: () => void // Thêm callback để reset mapCenter
  ) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    const areaData: AreaDto = {
      ...formData,
      id: editArea?.id || undefined,
    };

    try {
      await onSubmit(areaData);
      if (!editArea) {
        setFormData({
          name: "",
          latitude: 10.7769,
          longitude: 106.7009,
          isActive: true,
        });
        setErrors({});
        onReset(); // Gọi reset mapCenter sau khi thêm mới
      }
    } catch (error: any) {
      console.error("Lỗi khi submit khu vực:", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      latitude: 10.7769,
      longitude: 106.7009,
      isActive: true,
    });
    setErrors({});
    setIsSubmitting(false);
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleInputChange,
    handleSubmit,
    handleClose,
  };
};

// Mapbox Map Component
interface MapboxMapProps {
  center: { lat: number; lng: number };
  onMapClick: (lng: number, lat: number) => void;
  isOpen: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

const MapboxMap: React.FC<MapboxMapProps> = ({
  center,
  onMapClick,
  isOpen,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Function to search places using Mapbox Geocoding API
  const searchPlaces = async (query: string) => {
    if (!query.trim() || !MAPBOX_ACCESS_TOKEN) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=VN&limit=5`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data.features || []);
    } catch (error) {
      console.error("Error searching places:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchPlaces(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onMapClick(longitude, latitude);
          if (map.current) {
            map.current.flyTo({
              center: [longitude, latitude],
              zoom: 15,
              duration: 2000,
            });
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "Không thể lấy vị trí hiện tại. Vui lòng kiểm tra quyền truy cập vị trí."
          );
        }
      );
    } else {
      alert("Trình duyệt không hỗ trợ định vị.");
    }
  };

  // Handle search result selection
  const handleSearchResultSelect = (result: SearchResult | null) => {
    if (result) {
      const [lng, lat] = result.center;
      onMapClick(lng, lat);
      if (map.current) {
        map.current.flyTo({
          center: [lng, lat],
          zoom: 15,
          duration: 2000,
        });
      }
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  useEffect(() => {
    if (
      !mapContainer.current ||
      !isOpen ||
      !MAPBOX_ACCESS_TOKEN ||
      MAPBOX_ACCESS_TOKEN === "YOUR_MAPBOX_ACCESS_TOKEN_HERE"
    ) {
      console.error("Mapbox access token is missing or invalid");
      return;
    }

    // Initialize map
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [center.lng, center.lat],
        zoom: 15,
        attributionControl: false,
      });

      // Handle map load event
      map.current.on("load", () => {
        console.log("Map loaded successfully");
      });

      // Handle map errors
      map.current.on("error", (e) => {
        console.error("Map error:", e.error);
      });

      // Add navigation control after map loads
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Add click event listener
      map.current.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        onMapClick(lng, lat);
      });

      // Add initial marker
      marker.current = new mapboxgl.Marker({
        color: "#3b82f6", // Blue color
        draggable: true,
      })
        .setLngLat([center.lng, center.lat])
        .addTo(map.current);

      // Add drag event to marker
      marker.current.on("dragend", () => {
        if (marker.current) {
          const lngLat = marker.current.getLngLat();
          onMapClick(lngLat.lng, lngLat.lat);
        }
      });
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      if (marker.current) {
        marker.current = null;
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (map.current && marker.current) {
      // Update map center and marker position
      map.current.setCenter([center.lng, center.lat]);
      marker.current.setLngLat([center.lng, center.lat]);
    }
  }, [center]);

  // Resize map when fullscreen changes
  useEffect(() => {
    if (map.current) {
      setTimeout(() => {
        map.current?.resize();
      }, 100);
    }
  }, [isFullscreen]);

  const mapHeight = isFullscreen ? "70vh" : "300px";

  return (
    <Box sx={{ position: "relative" }}>
      {/* Search and Controls Bar */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          left: 8,
          right: 8,
          zIndex: 10,
          display: "flex",
          gap: 1,
        }}
      >
        {/* Search Autocomplete */}
        <Autocomplete
          sx={{
            flex: 1,
            maxWidth: isFullscreen ? 400 : 250,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "white",
              fontSize: "14px",
            },
          }}
          options={searchResults}
          getOptionLabel={(option) => option.place_name}
          loading={isSearching}
          onInputChange={(_, newValue) => setSearchQuery(newValue)}
          onChange={(_, newValue) => handleSearchResultSelect(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Tìm kiếm địa điểm..."
              size="small"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <SearchIcon sx={{ color: "grey.500", mr: 1 }} />
                ),
              }}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Typography variant="body2" sx={{ fontSize: "14px" }}>
                {option.place_name}
              </Typography>
            </Box>
          )}
          PaperComponent={({ children, ...props }) => (
            <Paper {...props} sx={{ maxHeight: 200, overflow: "auto" }}>
              {children}
            </Paper>
          )}
        />

        {/* Control Buttons */}
        <Box sx={{ display: "flex", gap: 1 }}>
          {/* Current Location Button */}
          <IconButton
            onClick={getCurrentLocation}
            size="small"
            sx={{
              backgroundColor: "white",
              color: "primary.main",
              boxShadow: 1,
              "&:hover": {
                backgroundColor: "grey.100",
              },
            }}
          >
            <MyLocationIcon />
          </IconButton>

          {/* Fullscreen Toggle Button */}
          <IconButton
            onClick={onToggleFullscreen}
            size="small"
            sx={{
              backgroundColor: "white",
              color: "primary.main",
              boxShadow: 1,
              "&:hover": {
                backgroundColor: "grey.100",
              },
            }}
          >
            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        </Box>
      </Box>

      {/* Map Container */}
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: mapHeight,
          borderRadius: "8px",
          border: "1px solid #d1d5db",
          transition: "height 0.3s ease",
          minHeight: isFullscreen ? "70vh" : "300px",
          backgroundColor: "#f8f9fa", // Fallback background color
        }}
      />

      {/* Loading/Error Message */}
      {!MAPBOX_ACCESS_TOKEN ||
      MAPBOX_ACCESS_TOKEN === "YOUR_MAPBOX_ACCESS_TOKEN_HERE" ? (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            padding: 2,
            borderRadius: 1,
            border: "1px solid #e0e0e0",
          }}
        >
          <Typography variant="body2" color="error">
            Mapbox Access Token chưa được cấu hình
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Vui lòng cập nhật MAPBOX_ACCESS_TOKEN trong code
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
};

export function AddAreaModal({
  isOpen,
  onClose,
  onSubmit,
  editArea,
}: AddAreaModalProps) {
  const {
    formData,
    errors,
    isSubmitting,
    handleInputChange,
    handleSubmit,
    handleClose: clearFormData,
  } = useAreaForm(editArea);

  const [mapCenter, setMapCenter] = useState(
    editArea
      ? { lat: editArea.latitude, lng: editArea.longitude }
      : defaultCenter
  );

  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    if (editArea) {
      setMapCenter({
        lat: editArea.latitude,
        lng: editArea.longitude,
      });
    } else {
      setMapCenter(defaultCenter);
    }
  }, [editArea]);
  const handleMapClick = (lng: number, lat: number) => {
    handleInputChange("latitude", lat);
    handleInputChange("longitude", lng);
    setMapCenter({ lat, lng });
  };

  const handleModalClose = () => {
    clearFormData();
    setMapCenter(defaultCenter);
    setIsFullscreen(false); // Reset fullscreen khi đóng modal
    onClose();
  };

  const handleResetMap = () => {
    setMapCenter(defaultCenter);
  };

  const handleToggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (!isOpen) return null;

  return (
    <Dialog
      open={isOpen}
      onClose={handleModalClose}
      maxWidth={isFullscreen ? "lg" : "sm"}
      fullWidth
      fullScreen={isFullscreen}
      sx={{
        "& .MuiDialog-paper": {
          maxWidth: isFullscreen ? "none" : "32rem",
          margin: isFullscreen ? 0 : "auto",
          borderRadius: isFullscreen ? 0 : 0,
          boxShadow: 24,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease-in-out",
          height: isFullscreen ? "100vh" : "auto",
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
            {editArea ? "Sửa Khu vực" : "Thêm Khu vực Mới"}
          </Typography>
          <Typography variant="body2" sx={{ color: "grey.500" }}>
            {editArea ? "Cập nhật thông tin khu vực" : "Tạo khu vực mới"}
          </Typography>
        </Box>
        <IconButton
          onClick={handleModalClose}
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
        <form onSubmit={(e) => handleSubmit(e, onSubmit, handleResetMap)}>
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
              <AreaIcon sx={{ fontSize: 20 }} />
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
                  Tên Khu vực *
                </Typography>
                <TextField
                  fullWidth
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nhập tên khu vực"
                  size="small"
                  error={!!errors.name}
                  helperText={errors.name}
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
                  Vĩ Độ *
                </Typography>
                <TextField
                  fullWidth
                  value={formData.latitude}
                  disabled
                  size="small"
                  error={!!errors.latitude}
                  helperText={errors.latitude}
                  sx={{
                    bgcolor: "background.paper",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "& fieldset": {
                        borderColor: errors.latitude
                          ? "error.main"
                          : "grey.300",
                      },
                    },
                    "& .MuiInputBase-input": {
                      color: "grey.700",
                      px: 1.5,
                      py: 1,
                    },
                  }}
                />
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
                  Kinh Độ *
                </Typography>
                <TextField
                  fullWidth
                  value={formData.longitude}
                  disabled
                  size="small"
                  error={!!errors.longitude}
                  helperText={errors.longitude}
                  sx={{
                    bgcolor: "background.paper",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "& fieldset": {
                        borderColor: errors.longitude
                          ? "error.main"
                          : "grey.300",
                      },
                    },
                    "& .MuiInputBase-input": {
                      color: "grey.700",
                      px: 1.5,
                      py: 1,
                    },
                  }}
                />
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
                  Chọn Vị Trí Trên Bản Đồ
                </Typography>
                <MapboxMap
                  center={mapCenter}
                  onMapClick={handleMapClick}
                  isOpen={isOpen}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={handleToggleFullscreen}
                />
              </Box>

              {editArea && (
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isActive}
                        onChange={(e) =>
                          handleInputChange("isActive", e.target.checked)
                        }
                        color="primary"
                      />
                    }
                    label={
                      <Typography
                        variant="body2"
                        sx={{ color: "grey.700", fontWeight: "medium" }}
                      >
                        Hoạt động
                      </Typography>
                    }
                  />
                </Box>
              )}
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
          onClick={handleModalClose}
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
          disabled={isSubmitting}
          onClick={(e) => handleSubmit(e as any, onSubmit, handleResetMap)}
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
            : editArea
            ? "Cập Nhật Khu vực"
            : "Thêm Khu vực"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
