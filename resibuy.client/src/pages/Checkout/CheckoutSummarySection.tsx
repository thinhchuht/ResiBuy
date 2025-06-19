import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormHelperText,
} from "@mui/material";
import type { PaperProps as MuiPaperProps } from "@mui/material";
import { Formik, Form, Field } from "formik";
import type { FieldProps } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import type { Room, Building, Area } from "../../types/models";
import { useToastify } from "../../hooks/useToastify";
import areaApi from "../../api/area.api";
import buildingApi from "../../api/building.api";
import roomApi from "../../api/room.api";

interface OrderSummary {
  totalBeforeDiscount: number;
  totalAfterDiscount: number;
  discount: number;
  itemCount: number;
  note?: string;
}

interface CheckoutSummarySectionProps {
  orders: OrderSummary[];
  grandTotal: number;
  PaperProps?: MuiPaperProps;
  onCheckout?: (info: {
    deliveryType: "my-room" | "other";
    selectedRoom: string;
    selectedArea: string;
    selectedBuilding: string;
    selectedOtherRoom: string;
    paymentMethod: string;
  }) => void;
  userRooms?: {
    roomId: string;
    roomName: string;
    buildingName: string;
    areaName: string;
  }[];
  isLoading?: boolean;
}

interface FormValues {
  deliveryType: "my-room" | "other";
  selectedRoom: string;
  selectedArea: string;
  selectedBuilding: string;
  selectedOtherRoom: string;
  paymentMethod: string;
}

const validationSchema = Yup.object().shape({
  deliveryType: Yup.string().required(),
  selectedRoom: Yup.string().when("deliveryType", {
    is: (val: string) => val === "my-room",
    then: (schema) =>  schema.required("Vui lòng chọn phòng"),
  }),
  selectedArea: Yup.string().when("deliveryType", {
    is: (val: string) => val === "other",
    then: (schema) => schema.required("Vui lòng chọn khu vực"),
  }),
  selectedBuilding: Yup.string().when("deliveryType", {
    is: (val: string) => val === "other",
    then: (schema) => schema.required("Vui lòng chọn tòa nhà"),
  }),
  selectedOtherRoom: Yup.string().when("deliveryType", {
    is: (val: string) => val === "other",
    then: (schema) => schema.required("Vui lòng chọn phòng"),
  }),
  paymentMethod: Yup.string().required("Vui lòng chọn phương thức thanh toán"),
});

const formatPrice = (price: number) => (
  <Box component="span" sx={{ display: "inline-flex", alignItems: "baseline" }}>
    {price.toLocaleString()}
    <Box component="span" sx={{ fontSize: "0.7em", ml: 0.5 }}>
      đ
    </Box>
  </Box>
);

const CheckoutSummarySection = ({
  orders,
  grandTotal,
  onCheckout,
  userRooms = [],
  isLoading = false,
}: CheckoutSummarySectionProps) => {
  const { error: showError } = useToastify();
  
  const [areasData, setAreasData] = useState<Area[]>([]);
  const [buildingsData, setBuildingsData] = useState<Building[]>([]);
  const [roomsData, setRoomsData] = useState<Room[]>([]);
  const [fetchedAreas, setFetchedAreas] = useState<Set<string>>(new Set());
  const [fetchedBuildings, setFetchedBuildings] = useState<Set<string>>(new Set());
  const [areasLoaded, setAreasLoaded] = useState(false);

  const initialValues: FormValues = {
    deliveryType: "my-room",
    selectedRoom: userRooms[0]?.roomId || "",
    selectedArea: "",
    selectedBuilding: "",
    selectedOtherRoom: "",
    paymentMethod: "BankTransfer",
  };

  const fetchBuildings = async (areaId: string) => {
    if (fetchedAreas.has(areaId)) {
      return;
    }

    try {
      setBuildingsData([]);
      setRoomsData([]);
      setFetchedBuildings(new Set()); 
      
      const buildingsData = await buildingApi.getByBuilingId(areaId);
      setBuildingsData(buildingsData);
      setFetchedAreas(prev => new Set([...prev, areaId]));
    } catch (error) {
      console.error("Error fetching buildings:", error);
      showError("Không thể tải danh sách tòa nhà");
    }
  };

  const fetchRooms = async (buildingId: string) => {
    if (fetchedBuildings.has(buildingId)) {
      return;
    }

    try {
      setRoomsData([]);
      const roomsData = await roomApi.getByBuilingId(buildingId);
      setRoomsData(roomsData);
      setFetchedBuildings(prev => new Set([...prev, buildingId]));
    } catch (error) {
      console.error("Error fetching rooms:", error);
      showError("Không thể tải danh sách phòng");
    }
  };

  const displayAreas = areasData.length > 0 ? areasData : [];
  const displayBuildings = buildingsData.length > 0 ? buildingsData : [];
  const displayRooms = roomsData.length > 0 ? roomsData : [];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        border: "1px solid #eee",
        position: "sticky",
        top: 80,
        height: "auto",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignSelf: "flex-start",
        transition: "all 0.3s ease-in-out",
        overflow: "hidden",
        bgcolor: "#ffffff",
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: "bold", color: "#2c3e50", mb: 2 }}
      >
        Tóm tắt đơn hàng
      </Typography>
      <Divider sx={{ mb: 2 }} />

      <Formik<FormValues>
        initialValues={initialValues}
        enableReinitialize
        validationSchema={validationSchema}
        onSubmit={(values) => {
          const formValues = {
            ...values,
            paymentMethod: values.paymentMethod || "BankTransfer"
          };
          console.log('CheckoutSummarySection onSubmit formValues:', formValues);
          onCheckout?.(formValues);
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          setFieldValue,
        }) => {
          const filteredBuildings = displayBuildings.filter(
            (b) => b.areaId === values.selectedArea
          );
          const filteredRooms = displayRooms.filter(
            (r) => r.buildingId === values.selectedBuilding
          );

          const handleFieldBlur = (fieldName: string) => {
            handleBlur(fieldName);
            const fieldError = errors[fieldName as keyof typeof errors];
            const fieldTouched = touched[fieldName as keyof typeof touched];
            
            if (fieldError && fieldTouched) {
              showError(fieldError as string);
            }
          };

          const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            
            if (values.deliveryType === "my-room" && !values.selectedRoom) {
              showError("Vui lòng chọn phòng");
              return;
            }
            
            if (values.deliveryType === "other") {
              if (!values.selectedArea) {
                showError("Vui lòng chọn khu vực");
                return;
              }
              if (!values.selectedBuilding) {
                showError("Vui lòng chọn tòa nhà");
                return;
              }
              if (!values.selectedOtherRoom) {
                showError("Vui lòng chọn phòng");
                return;
              }
            }

            const formValues = {
              ...values,
              paymentMethod: values.paymentMethod || "BankTransfer"
            };
            onCheckout?.(formValues);
          };

          return (
            <Form onSubmit={handleSubmit}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Địa chỉ nhận hàng
                </Typography>
                <Field name="deliveryType">
                  {({ field }: FieldProps) => (
                    <RadioGroup
                      {...field}
                      onChange={async (e) => {
                        field.onChange(e);
                        if (e.target.value === "other" && !areasLoaded) {
                          try {
                            const areas = await areaApi.getAll();
                            setAreasData(areas);
                            setAreasLoaded(true);
                          } catch {
                            showError("Không thể tải danh sách khu vực");
                          }
                        }
                        if (e.target.value === "my-room") {
                          setFieldValue("selectedArea", "");
                          setFieldValue("selectedBuilding", "");
                          setFieldValue("selectedOtherRoom", "");
                          if (!values.selectedRoom && userRooms.length > 0) {
                            setFieldValue("selectedRoom", userRooms[0].roomId);
                          }
                        } else {
                          setFieldValue("selectedRoom", "");
                        }
                      }}
                    >
                      <FormControlLabel
                        value="my-room"
                        control={<Radio />}
                        label="Chọn từ phòng của tôi"
                      />
                      <FormControlLabel
                        value="other"
                        control={<Radio />}
                        label="Địa chỉ khác"
                      />
                    </RadioGroup>
                  )}
                </Field>

                {values.deliveryType === "my-room" ? (
                  <FormControl
                    fullWidth
                    sx={{ mt: 2 }}
                    error={touched.selectedRoom && Boolean(errors.selectedRoom)}
                  >
                    <InputLabel>Chọn phòng</InputLabel>
                    <Select
                      name="selectedRoom"
                      value={values.selectedRoom}
                      label="Chọn phòng"
                      onChange={handleChange}
                      onBlur={() => handleFieldBlur("selectedRoom")}
                    >
                      {userRooms.map((room) => (
                        <MenuItem key={room.roomId} value={room.roomId}>
                          {`${room.roomName} - ${room.buildingName} - ${room.areaName}`}
                        </MenuItem>
                      ))}
                    </Select>
                    {touched.selectedRoom && errors.selectedRoom && (
                      <FormHelperText>{errors.selectedRoom}</FormHelperText>
                    )}
                  </FormControl>
                ) : (
                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <FormControl
                      fullWidth
                      error={
                        touched.selectedArea && Boolean(errors.selectedArea)
                      }
                    >
                      <InputLabel>Khu vực</InputLabel>
                      <Select
                        name="selectedArea"
                        value={values.selectedArea}
                        label="Khu vực"
                        onChange={(e) => {
                          handleChange(e);
                          setFieldValue("selectedBuilding", "");
                          setFieldValue("selectedOtherRoom", "");
                          // Fetch buildings for selected area
                          if (e.target.value) {
                            fetchBuildings(e.target.value);
                          }
                        }}
                        onBlur={() => handleFieldBlur("selectedArea")}
                      >
                        {displayAreas.map((area) => (
                          <MenuItem key={area.id} value={area.id}>
                            {area.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.selectedArea && errors.selectedArea && (
                        <FormHelperText>{errors.selectedArea}</FormHelperText>
                      )}
                    </FormControl>

                    <FormControl
                      fullWidth
                      error={
                        touched.selectedBuilding &&
                        Boolean(errors.selectedBuilding)
                      }
                    >
                      <InputLabel>Tòa nhà</InputLabel>
                      <Select
                        name="selectedBuilding"
                        value={values.selectedBuilding}
                        label="Tòa nhà"
                        onChange={(e) => {
                          handleChange(e);
                          setFieldValue("selectedOtherRoom", "");
                          // Fetch rooms for selected building
                          if (e.target.value) {
                            fetchRooms(e.target.value);
                          }
                        }}
                        onBlur={() => handleFieldBlur("selectedBuilding")}
                        disabled={!values.selectedArea}
                      >
                        {filteredBuildings.map((building) => (
                          <MenuItem key={building.id} value={building.id}>
                            {building.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.selectedBuilding && errors.selectedBuilding && (
                        <FormHelperText>
                          {errors.selectedBuilding}
                        </FormHelperText>
                      )}
                    </FormControl>

                    <FormControl
                      fullWidth
                      error={
                        touched.selectedOtherRoom &&
                        Boolean(errors.selectedOtherRoom)
                      }
                    >
                      <InputLabel>Phòng</InputLabel>
                      <Select
                        name="selectedOtherRoom"
                        value={values.selectedOtherRoom}
                        label="Phòng"
                        onChange={handleChange}
                        onBlur={() => handleFieldBlur("selectedOtherRoom")}
                        disabled={!values.selectedBuilding}
                      >
                        {filteredRooms.map((room) => (
                          <MenuItem key={room.id} value={room.id}>
                            {room.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.selectedOtherRoom &&
                        errors.selectedOtherRoom && (
                          <FormHelperText>
                            {errors.selectedOtherRoom}
                          </FormHelperText>
                        )}
                    </FormControl>
                  </Box>
                )}
              </Box>

              <Box
                sx={{
                  maxHeight: "600px", 
                  overflowY: "auto",
                  mb: 2,
                  "&::-webkit-scrollbar": {
                    width: "8px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "#f1f1f1",
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: "#888",
                    borderRadius: "4px",
                    "&:hover": {
                      background: "#555",
                    },
                  },
                }}
              >
                {orders.map((order, index) => (
                  <Box
                    key={index}
                    sx={{ mb: 1, p: 1, borderRadius: 2, bgcolor: "#fafbfc" }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 600, color: "#1976d2" }}
                    >
                      Đơn hàng {index + 1}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 1,
                      }}
                    >
                      <Typography variant="body2">Tổng sản phẩm:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {order.itemCount}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2">
                        Tổng tiền trước giảm:
                      </Typography>
                      <Typography variant="body2">
                        {formatPrice(order.totalBeforeDiscount)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2">Đã giảm:</Typography>
                      <Typography
                        variant="body2"
                        color="success.main"
                        sx={{ fontWeight: 600 }}
                      >
                        -{formatPrice(order.discount)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Cần thanh toán:
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "red" }}
                      >
                        {formatPrice(order.totalAfterDiscount)}
                      </Typography>
                    </Box>
                    {order.note && (
                      <>
                        <Box sx={{ mt: 1 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, color: "#1976d2", mb: 1 }}
                          >
                            Lời nhắn:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace: "pre-wrap",
                              color: "#666",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              wordBreak: "break-word",
                              lineHeight: 1.4,
                            }}
                          >
                            {order.note}
                          </Typography>
                        </Box>
                      </>
                    )}
                    <Divider sx={{ mt: 2 }} />
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "#333" }}
                >
                  Tổng cộng:
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", color: "red" }}
                >
                  {formatPrice(grandTotal)}
                </Typography>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Phương thức thanh toán
                </Typography>
                <Field name="paymentMethod">
                  {({ field }: FieldProps) => (
                    <RadioGroup {...field}>
                      <FormControlLabel
                        value="BankTransfer"
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="body1">
                              Chuyển khoản ngân hàng
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Thanh toán qua chuyển khoản ngân hàng
                            </Typography>
                          </Box>
                        }
                        sx={{ mb: 1 }}
                      />
                      <FormControlLabel
                        value="COD"
                        control={<Radio />}
                        label={
                          <Box>
                            <Typography variant="body1">Tiền mặt</Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Thanh toán khi nhận hàng
                            </Typography>
                          </Box>
                        }
                      />
                    </RadioGroup>
                  )}
                </Field>
              </Box>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  fontSize: "1.1rem",
                  borderRadius: 10,
                  backgroundColor: "#FF6B6B",
                  "&:hover": {
                    backgroundColor: "#FF5C5C",
                  },
                }}
              >
                {isLoading ? "Đang xử lý..." : "Tiếp tục Thanh toán"}
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Paper>
  );
};

export default CheckoutSummarySection;
