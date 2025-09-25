import {
    Box,
    TextField,
    Typography,
    Button,
    Stack,
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    Chip,
    IconButton,
    Divider,
    Paper,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon, CameraAlt as CameraIcon, UploadFile as UploadFileIcon } from "@mui/icons-material";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/base.api";
import { useToastify } from "../../hooks/useToastify.ts";
import { BrowserMultiFormatReader } from '@zxing/library';
import CloseIcon from "@mui/icons-material/Close";
interface OrderItem {
    id: string;
    productId: number;
    productDetailId: number;
    productName: string;
    quantity: number;
    price: number;
    image: {
        id: string;
        url: string;
        thumbUrl: string;
        name: string;
    };
    addtionalData: Array<{
        id: number;
        key: string;
        value: string;
    }>;
    barcode: string[];
}

interface Order {
    id: string;
    userId: string;
    user: {
        id: string;
        fullName: string;
        phoneNumber: string;
    };
    createAt: string;
    updateAt: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    totalPrice: number;
    shippingFee: number;
    cancelReason?: string;
    roomQueryResult: {
        id: string;
        name: string;
        buildingName: string;
        areaName: string;
        areaId: string;
    };
    store: {
        id: string;
        name: string;
        phoneNumber: string;
    };
    orderItems: OrderItem[];
}

interface UpdateBarcodePayload {
    id: string;
    storeId: string;
    voucherId?: string;
    note?: string;
    totalPrice: number;
    shippingFee: number;
    items: Array<{
        productDetailId: number;
        quantity: number;
        price: number;
        barcodes: string[];
    }>;
}

const UpdateBarcodeOrderPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const reader = useRef(new BrowserMultiFormatReader());

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [itemBarcodes, setItemBarcodes] = useState<{ [key: string]: string[] }>({});
    const [newBarcodeInputs, setNewBarcodeInputs] = useState<{ [key: string]: string }>({});
    const [openModal, setOpenModal] = useState(false);
    const [modalType, setModalType] = useState<'webcam' | 'image' | null>(null);
    const [selectedProductDetailId, setSelectedProductDetailId] = useState<number | null>(null);
    const [scanning, setScanning] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [cameraError, setCameraError] = useState<string | null>(null);

    const { error: showError, success: showSuccess } = useToastify();

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
        return () => {
            stopScanning();
        };
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/Order/${orderId}`);

            if (response.data.code === 0) {
                const orderData = response.data.data as Order;
                setOrder(orderData);

                const initialBarcodes: { [key: string]: string[] } = {};
                const initialInputs: { [key: string]: string } = {};

                orderData.orderItems.forEach(item => {
                    const itemKey = `${item.productDetailId}`;
                    initialBarcodes[itemKey] = item.barcode || [];
                    initialInputs[itemKey] = "";
                });

                setItemBarcodes(initialBarcodes);
                setNewBarcodeInputs(initialInputs);
            } else {
                showError("Không thể tải thông tin đơn hàng");
            }
        } catch (error: any) {
            console.error("Lỗi khi tải đơn hàng:", error);
            showError("Lỗi khi tải thông tin đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    const openScanModal = (productDetailId: number, type: 'webcam' | 'image') => {
        setSelectedProductDetailId(productDetailId);
        setModalType(type);
        setOpenModal(true);
        setCameraError(null);
    };

    const closeModal = () => {
        setOpenModal(false);
        setModalType(null);
        setSelectedProductDetailId(null);
        setScanning(false);
        setUploadedImage(null);
        setCameraError(null);
        stopScanning();
    };

    const startScanning = async () => {
        if (!videoRef.current) {
            setCameraError("Không tìm thấy phần tử video để quét barcode");
            showError("Không tìm thấy phần tử video để quét barcode");
            return;
        }

        try {
            setScanning(true);
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            videoRef.current.srcObject = stream;
            await videoRef.current.play();

            reader.current.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
                if (result && selectedProductDetailId) {
                    handleBarcodeScan(selectedProductDetailId, result.getText());
                    closeModal();
                }
                if (err && !(err instanceof Error)) {
                    console.error("Lỗi khi quét barcode:", err);
                    if (err.name === 'NotAllowedError') {
                        setCameraError("Quyền truy cập webcam bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt.");
                    } else if (err.name === 'NotFoundError') {
                        setCameraError("Không tìm thấy webcam trên thiết bị.");
                    } else {
                        setCameraError("Lỗi khi quét barcode. Vui lòng thử lại!");
                    }
                    closeModal();
                }
            });
        } catch (err) {
            console.error("Lỗi truy cập webcam:", err);
            if (err instanceof Error) {
                if (err.name === 'NotAllowedError') {
                    setCameraError("Quyền truy cập webcam bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt.");
                } else if (err.name === 'NotFoundError') {
                    setCameraError("Không tìm thấy webcam trên thiết bị.");
                } else {
                    setCameraError("Không thể khởi động webcam. Vui lòng kiểm tra thiết bị và thử lại!");
                }
            }
            setScanning(false);
        }
    };

    const stopScanning = () => {
        setScanning(false);
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        reader.current.reset();
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !selectedProductDetailId) return;

        try {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            setUploadedImage(img.src);
            img.onload = async () => {
                try {
                    const result = await reader.current.decodeFromImage(img);
                    handleBarcodeScan(selectedProductDetailId, result.getText());
                    closeModal();
                } catch (err) {
                    console.error("Lỗi khi quét barcode từ ảnh:", err);
                    showError("Không thể quét barcode từ ảnh. Vui lòng thử lại!");
                } finally {
                    URL.revokeObjectURL(img.src);
                }
            };
        } catch (err) {
            console.error("Lỗi khi xử lý ảnh:", err);
            showError("Lỗi khi xử lý ảnh. Vui lòng thử lại!");
        }
    };

    const handleBarcodeScan = (productDetailId: number, barcode: string) => {
        const itemKey = `${productDetailId}`;
        const currentBarcodes = itemBarcodes[itemKey] || [];

        if (currentBarcodes.includes(barcode)) {
            showError("Mã vạch này đã tồn tại");
            return;
        }

        const quantity = order?.orderItems.find(item => item.productDetailId === productDetailId)?.quantity || 0;
        if (currentBarcodes.length >= quantity) {
            showError(`Không thể thêm mã vạch. Số lượng mã vạch tối đa là ${quantity}`);
            return;
        }

        setItemBarcodes(prev => ({
            ...prev,
            [itemKey]: [...currentBarcodes, barcode]
        }));
        showSuccess(`Đã quét mã vạch: ${barcode}`);
    };

    const addBarcode = (productDetailId: number, quantity: number) => {
        const itemKey = `${productDetailId}`;
        const newBarcode = newBarcodeInputs[itemKey]?.trim();

        if (!newBarcode) {
            showError("Vui lòng nhập mã vạch");
            return;
        }

        if (itemBarcodes[itemKey]?.includes(newBarcode)) {
            showError("Mã vạch này đã tồn tại");
            return;
        }

        if ((itemBarcodes[itemKey]?.length || 0) >= quantity) {
            showError(`Không thể thêm mã vạch. Số lượng mã vạch tối đa là ${quantity}`);
            return;
        }

        setItemBarcodes(prev => ({
            ...prev,
            [itemKey]: [...(prev[itemKey] || []), newBarcode]
        }));

        setNewBarcodeInputs(prev => ({
            ...prev,
            [itemKey]: ""
        }));
    };

    const removeBarcode = (productDetailId: number, barcodeToRemove: string) => {
        const itemKey = `${productDetailId}`;
        setItemBarcodes(prev => ({
            ...prev,
            [itemKey]: (prev[itemKey] || []).filter(barcode => barcode !== barcodeToRemove)
        }));
    };

    const handleBarcodeInputChange = (productDetailId: number, value: string) => {
        const itemKey = `${productDetailId}`;
        setNewBarcodeInputs(prev => ({
            ...prev,
            [itemKey]: value
        }));
    };

    const handleBarcodeInputKeyPress = (productDetailId: number, quantity: number, event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            addBarcode(productDetailId, quantity);
        }
    };

    const handleUpdate = async () => {
        if (!order) return;

        const incompleteItems = order.orderItems.filter(item => {
            const itemKey = `${item.productDetailId}`;
            const currentBarcodes = itemBarcodes[itemKey] || [];
            return currentBarcodes.length !== item.quantity;
        });

        if (incompleteItems.length > 0) {
            const itemNames = incompleteItems.map(item => item.productName).join(", ");
            showError(`Các sản phẩm sau chưa đủ mã vạch theo số lượng yêu cầu: ${itemNames}`);
            return;
        }

        try {
            setSubmitting(true);

            const payload: UpdateBarcodePayload = {
                id: order.id,
                storeId: order.store.id,
                voucherId: undefined,
                note: undefined,
                totalPrice: order.totalPrice,
                shippingFee: order.shippingFee,
                items: order.orderItems.map(item => ({
                    productDetailId: item.productDetailId,
                    quantity: item.quantity,
                    price: item.price,
                    barcodes: itemBarcodes[`${item.productDetailId}`] || []
                }))
            };

            await axios.post("/api/Order/UpdateBarCodeToOrder", payload);
            showSuccess("Cập nhật mã vạch thành công");
            navigate(-1);
        } catch (error: any) {
            console.error("Lỗi khi cập nhật mã vạch:", error);
            showError(
                `Cập nhật mã vạch thất bại: ${
                    error.response?.data?.message || "Đã có lỗi xảy ra"
                }`
            );
        } finally {
            setSubmitting(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    const canAddBarcode = (productDetailId: number, quantity: number): boolean => {
        const itemKey = `${productDetailId}`;
        const currentBarcodes = itemBarcodes[itemKey] || [];
        return currentBarcodes.length < quantity && Boolean(newBarcodeInputs[itemKey]?.trim());
    };

    const getBarcodeStatus = (productDetailId: number, quantity: number): { current: number; required: number; isComplete: boolean } => {
        const itemKey = `${productDetailId}`;
        const current = (itemBarcodes[itemKey] || []).length;
        return {
            current,
            required: quantity,
            isComplete: current === quantity
        };
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (!order) {
        return (
            <Box p={4}>
                <Typography variant="h6" color="error">
                    Không tìm thấy đơn hàng
                </Typography>
            </Box>
        );
    }

    return (
        <Box p={4}>
            <Card>
                <CardHeader
                    title={<Typography variant="h5">Cập nhật mã vạch cho đơn hàng</Typography>}
                />
                <CardContent>
                    <Stack spacing={3}>
                        <Paper elevation={1} sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Thông tin đơn hàng
                            </Typography>
                            <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={2}>
                                <Box flex={1}>
                                    <Typography><strong>Mã đơn hàng:</strong> {order.id}</Typography>
                                    <Typography><strong>Khách hàng:</strong> {order.user.fullName}</Typography>
                                    <Typography><strong>Số điện thoại:</strong> {order.user.phoneNumber}</Typography>
                                </Box>
                                <Box flex={1}>
                                    <Typography><strong>Trạng thái:</strong> {order.status}</Typography>
                                    <Typography><strong>Tổng tiền:</strong> {formatPrice(order.totalPrice)}</Typography>
                                    <Typography><strong>Ngày tạo:</strong> {formatDate(order.createAt)}</Typography>
                                </Box>
                            </Box>
                        </Paper>

                        <Divider />

                        <Typography variant="h6">Sản phẩm và mã vạch</Typography>

                        <Alert severity="info">
                            Mỗi sản phẩm cần có số lượng mã vạch bằng với số lượng sản phẩm đã đặt.
                        </Alert>

                        {order.orderItems.map((item) => {
                            const itemKey = `${item.productDetailId}`;
                            const currentBarcodes = itemBarcodes[itemKey] || [];
                            const barcodeStatus = getBarcodeStatus(item.productDetailId, item.quantity);

                            return (
                                <Card key={item.id} variant="outlined">
                                    <CardContent>
                                        <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={2}>
                                            <Box flex={1}>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {item.productName}
                                                </Typography>
                                                <Typography color="text.secondary">
                                                    Số lượng: {item.quantity} | Giá: {formatPrice(item.price)}
                                                </Typography>
                                                {item.addtionalData.map(data => (
                                                    <Typography key={data.id} variant="body2" color="text.secondary">
                                                        {data.key}: {data.value}
                                                    </Typography>
                                                ))}
                                            </Box>

                                            <Box flex={1}>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                                    <Typography variant="subtitle2">
                                                        Mã vạch:
                                                    </Typography>
                                                    <Chip
                                                        label={`${barcodeStatus.current}/${barcodeStatus.required}`}
                                                        color={barcodeStatus.isComplete ? "success" : "warning"}
                                                        size="small"
                                                    />
                                                </Box>

                                                <Box mb={2}>
                                                    {currentBarcodes.map((barcode, barcodeIndex) => (
                                                        <Chip
                                                            key={barcodeIndex}
                                                            label={barcode}
                                                            onDelete={() => removeBarcode(item.productDetailId, barcode)}
                                                            deleteIcon={<DeleteIcon />}
                                                            variant="outlined"
                                                            size="small"
                                                            sx={{ mr: 1, mb: 1 }}
                                                        />
                                                    ))}
                                                </Box>

                                                {currentBarcodes.length < item.quantity && (
                                                    <Stack spacing={2}>
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <TextField
                                                                size="small"
                                                                placeholder={`Nhập mã vạch (còn thiếu ${item.quantity - currentBarcodes.length})`}
                                                                value={newBarcodeInputs[itemKey] || ""}
                                                                onChange={(e) => handleBarcodeInputChange(item.productDetailId, e.target.value)}
                                                                onKeyPress={(e) => handleBarcodeInputKeyPress(item.productDetailId, item.quantity, e)}
                                                                fullWidth
                                                                disabled={openModal}
                                                            />
                                                            <IconButton
                                                                color="primary"
                                                                onClick={() => addBarcode(item.productDetailId, item.quantity)}
                                                                disabled={!canAddBarcode(item.productDetailId, item.quantity) || openModal}
                                                            >
                                                                <AddIcon />
                                                            </IconButton>
                                                        </Stack>

                                                        <Stack direction="row" spacing={1}>
                                                            <Button
                                                                variant="outlined"
                                                                startIcon={<CameraIcon />}
                                                                onClick={() => openScanModal(item.productDetailId, 'webcam')}
                                                                disabled={openModal}
                                                                size="small"
                                                            >
                                                                Quét Barcode
                                                            </Button>
                                                            <Button
                                                                variant="outlined"
                                                                startIcon={<UploadFileIcon />}
                                                                onClick={() => openScanModal(item.productDetailId, 'image')}
                                                                disabled={openModal}
                                                                size="small"
                                                            >
                                                                Tải ảnh
                                                            </Button>
                                                        </Stack>
                                                    </Stack>
                                                )}

                                                {currentBarcodes.length >= item.quantity && (
                                                    <Alert severity="success" sx={{ mt: 1 }}>
                                                        Đã đủ mã vạch cho sản phẩm này
                                                    </Alert>
                                                )}
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        })}

                        <Dialog open={openModal} onClose={closeModal} maxWidth="sm" fullWidth>
                            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                {modalType === 'webcam' ? 'Quét Barcode bằng Webcam' : 'Quét Barcode từ Ảnh'}
                                <IconButton onClick={closeModal}>
                                    <CloseIcon />
                                </IconButton>
                            </DialogTitle>
                            <DialogContent>
                                {cameraError && (
                                    <Alert severity="error" sx={{ mb: 2 }}>
                                        {cameraError}
                                    </Alert>
                                )}
                                {modalType === 'webcam' && !cameraError && (
                                    <Box>
                                        <Box
                                            sx={{
                                                width: "100%",
                                                height: 200,
                                                bgcolor: "#000",
                                                borderRadius: 2,
                                                overflow: "hidden",
                                                mb: 2,
                                            }}
                                        >
                                            <video
                                                ref={videoRef}
                                                style={{ width: "100%", height: "100%" }}
                                            />
                                        </Box>
                                        <Button
                                            variant="contained"
                                            onClick={scanning ? stopScanning : startScanning}
                                            disabled={cameraError !== null}
                                            sx={{ width: "100%" }}
                                        >
                                            {scanning ? "Dừng Quét" : "Bắt Đầu Quét"}
                                        </Button>
                                        {scanning && (
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                                Đang quét... Đưa mã vạch vào khung hình.
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                                {modalType === 'image' && (
                                    <Stack spacing={2}>
                                        {uploadedImage ? (
                                            <Box>
                                                <img
                                                    src={uploadedImage}
                                                    alt="Uploaded Barcode"
                                                    style={{ width: "100%", maxWidth: "400px", borderRadius: "8px" }}
                                                />
                                            </Box>
                                        ) : (
                                            <Button
                                                variant="outlined"
                                                startIcon={<UploadFileIcon />}
                                                component="label"
                                            >
                                                Chọn ảnh barcode
                                                <input
                                                    hidden
                                                    accept="image/*"
                                                    type="file"
                                                    onChange={handleImageUpload}
                                                />
                                            </Button>
                                        )}
                                    </Stack>
                                )}
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={closeModal}>Hủy</Button>
                            </DialogActions>
                        </Dialog>

                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button variant="outlined" onClick={() => navigate(-1)}>
                                Hủy
                            </Button>
                            <Button
                                variant="contained"
                                onClick={handleUpdate}
                                disabled={submitting}
                            >
                                {submitting ? <CircularProgress size={24} /> : "Cập nhật mã vạch"}
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};

export default UpdateBarcodeOrderPage;