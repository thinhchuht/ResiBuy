import { useEffect, useState } from "react";
import {
    Box,
    Button,
    CardContent,
    IconButton,
    TextField,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Checkbox,
    MenuItem,
    Divider,
    Chip,
    Avatar,
    CircularProgress,
    Stack,
    Paper,
    Container,
    Alert,
} from "@mui/material";
import {
    Add,
    Delete,
    CloudUpload,
    CheckCircle,
    Warning,
    Category,
    Inventory,
    PhotoCamera,
    LocalOffer,
} from "@mui/icons-material";
import { v4 } from "uuid";
import axiosClient from "../../api/base.api";
import type { CategoryDto } from "../../types/storeData";
import { useNavigate, useParams } from "react-router-dom";
import { useToastify } from "../../hooks/useToastify.ts";

interface AdditionalDataInput {
    key: string;
    value: string;
}

interface Image {
    id: string;
    url: string;
    thumbUrl: string;
    name: string;
}

interface ProductDetailInput {
    price: number;
    weight: number;
    quantity: number;
    isOutOfStock: boolean;
    image: Image | null;
    additionalData: AdditionalDataInput[];
    barcodes: string[];
}

interface ProductInput {
    name: string;
    describe: string;
    promotionId: number;
    storeId: string;
    categoryId: string;
    expiryDate?: string;
    warrantyMonths?: number;
    productDetails: ProductDetailInput[];
}

// Promotion interface based on your API
interface PromotionDto {
    id: number;
    name: string;
    discount: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
}

interface Classify {
    key: string;
    value: string[];
}

interface ValidationErrors {
    [key: string]: string;
}

// Main component
export default function CreateProduct() {
    const { error: showError, success: showSuccess } = useToastify();
    const { storeId } = useParams<{ storeId: string }>();
    const navigate = useNavigate();

    // State declarations
    const [listCategory, setListCategory] = useState<CategoryDto[]>([]);
    const [listPromotions, setListPromotions] = useState<PromotionDto[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPromotions, setIsLoadingPromotions] = useState(false);

    // Error states consolidated
    const [formErrors, setFormErrors] = useState<ValidationErrors>({});
    const [classifyErrors, setClassifyErrors] = useState<ValidationErrors>({});
    const [attributeErrors, setAttributeErrors] = useState<ValidationErrors>({});
    const [priceErrors, setPriceErrors] = useState<ValidationErrors>({});
    const [weightErrors, setWeightErrors] = useState<ValidationErrors>({});
    const [quantityErrors, setQuantityErrors] = useState<ValidationErrors>({});
    const [barcodeErrors, setBarcodeErrors] = useState<ValidationErrors>({});
    const [uploadingImages, setUploadingImages] = useState<{ [key: number]: boolean }>({});

    const [product, setProduct] = useState<ProductInput>({
        name: "",
        describe: "",
        promotionId: 0, // Changed to 0 to indicate no selection
        storeId: storeId || "",
        categoryId: "",
        expiryDate: undefined,
        warrantyMonths: undefined,
        productDetails: [],
    });

    const [listProductDetail, setListProductDetail] = useState<ProductDetailInput[]>([]);
    const [classifies, setClassifies] = useState<Classify[]>([]);

    // Load categories and promotions on mount
    useEffect(() => {
        const loadInitialData = async () => {
            await Promise.all([loadCategories(), loadPromotions()]);
        };

        loadInitialData();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await axiosClient.get("api/Category/categories");
            const categories: CategoryDto[] = response.data.data || [];
            setListCategory(categories);
        } catch (error) {
            console.error("Error loading categories:", error);
            showError("Không thể tải danh sách danh mục");
        }
    };

    const loadPromotions = async () => {
        try {
            setIsLoadingPromotions(true);
            // Fetch only active promotions
            const response = await axiosClient.get("api/Promotion", {
                params: {
                    IsActive: true // Only get active promotions
                }
            });

            const promotions: PromotionDto[] = response.data.data || [];

            // Filter promotions that are currently valid (not expired)
            const currentDate = new Date();
            const validPromotions = promotions.filter(promotion => {
                const endDate = new Date(promotion.endDate);
                const startDate = new Date(promotion.startDate);
                return promotion.isActive && startDate <= currentDate && endDate >= currentDate;
            });

            setListPromotions(validPromotions);

            // Auto-select first promotion if available
            if (validPromotions.length > 0 && product.promotionId === 0) {
                setProduct(prev => ({ ...prev, promotionId: validPromotions[0].id }));
            }
        } catch (error) {
            console.error("Error loading promotions:", error);
            showError("Không thể tải danh sách khuyến mãi");
        } finally {
            setIsLoadingPromotions(false);
        }
    };

    // Helper function to format promotion display text
    const formatPromotionDisplay = (promotion: PromotionDto): string => {
        const startDate = new Date(promotion.startDate).toLocaleDateString('vi-VN');
        const endDate = new Date(promotion.endDate).toLocaleDateString('vi-VN');
        return `${promotion.name} (${promotion.discount}% - ${startDate} đến ${endDate})`;
    };

    // Helper function to check if promotion is ending soon (within 7 days)
    const isPromotionEndingSoon = (promotion: PromotionDto): boolean => {
        const endDate = new Date(promotion.endDate);
        const currentDate = new Date();
        const diffTime = endDate.getTime() - currentDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays > 0;
    };

    // Classification management functions
    const addClassifies = () => {
        setClassifies(prev => [...prev, { key: "", value: [] }]);
    };

    const removeClassify = (index: number) => {
        setClassifies(prev => prev.filter((_, i) => i !== index));
        // Clear related errors
        const newClassifyErrors = { ...classifyErrors };
        const newAttributeErrors = { ...attributeErrors };

        delete newClassifyErrors[`classify_${index}`];

        // Clear attribute errors for this classify
        Object.keys(newAttributeErrors).forEach(key => {
            if (key.startsWith(`classify_${index}_`)) {
                delete newAttributeErrors[key];
            }
        });

        setClassifyErrors(newClassifyErrors);
        setAttributeErrors(newAttributeErrors);
    };

    const removeClassifyValue = (classifyIndex: number, valueIndex: number) => {
        setClassifies(prev =>
            prev.map((item, idx) =>
                idx === classifyIndex
                    ? { ...item, value: item.value.filter((_, vi) => vi !== valueIndex) }
                    : item
            )
        );

        // Clear related error
        const newAttributeErrors = { ...attributeErrors };
        delete newAttributeErrors[`classify_${classifyIndex}_value_${valueIndex}`];
        setAttributeErrors(newAttributeErrors);
    };

    const updateClassifyKey = (index: number, newKey: string) => {
        setClassifies(prev =>
            prev.map((item, i) => (i === index ? { ...item, key: newKey } : item))
        );

        // Clear error when user starts typing
        if (newKey.trim()) {
            const newClassifyErrors = { ...classifyErrors };
            delete newClassifyErrors[`classify_${index}`];
            setClassifyErrors(newClassifyErrors);
        }
    };

    const updateClassifyValue = (classifyIndex: number, valueIndex: number, newValue: string) => {
        setClassifies(prev =>
            prev.map((item, i) =>
                i === classifyIndex
                    ? {
                        ...item,
                        value: item.value.map((val, vi) =>
                            vi === valueIndex ? newValue : val
                        ),
                    }
                    : item
            )
        );

        // Clear error when user starts typing
        if (newValue.trim()) {
            const newAttributeErrors = { ...attributeErrors };
            delete newAttributeErrors[`classify_${classifyIndex}_value_${valueIndex}`];
            setAttributeErrors(newAttributeErrors);
        }
    };

    const addClassifyValue = (classifyIndex: number) => {
        setClassifies(prev =>
            prev.map((item, i) =>
                i === classifyIndex ? { ...item, value: [...item.value, ""] } : item
            )
        );
    };

    // Validation functions
    const validateBasicInfo = (): boolean => {
        const newFormErrors: ValidationErrors = {};
        let isValid = true;

        if (!product.name.trim()) {
            newFormErrors.name = "Tên sản phẩm không được để trống";
            isValid = false;
        } else if (product.name.length > 255) {
            newFormErrors.name = "Tên sản phẩm không được vượt quá 255 ký tự";
            isValid = false;
        }

        if (!product.categoryId) {
            newFormErrors.categoryId = "Vui lòng chọn danh mục sản phẩm";
            isValid = false;
        }

        if (!product.promotionId || product.promotionId <= 0) {
            newFormErrors.promotionId = "Vui lòng chọn chương trình khuyến mãi";
            isValid = false;
        }

        // Validate warranty months if provided
        if (product.warrantyMonths !== undefined && product.warrantyMonths <= 0) {
            newFormErrors.warrantyMonths = "Thời gian bảo hành phải lớn hơn 0 tháng";
            isValid = false;
        }

        // Validate expiry date if provided
        if (product.expiryDate && new Date(product.expiryDate) <= new Date()) {
            newFormErrors.expiryDate = "Hạn sử dụng phải sau ngày hiện tại";
            isValid = false;
        }

        setFormErrors(newFormErrors);

        if (!isValid) {
            showError("Vui lòng kiểm tra lại thông tin cơ bản");
        }

        return isValid;
    };

    const validateClassifies = (): boolean => {
        const newClassifyErrors: ValidationErrors = {};
        const newAttributeErrors: ValidationErrors = {};
        let isValid = true;

        if (classifies.length === 0) {
            showError("Vui lòng thêm ít nhất một phân loại sản phẩm");
            return false;
        }

        classifies.forEach((classify, i) => {
            // Check classify key
            if (!classify.key.trim()) {
                newClassifyErrors[`classify_${i}`] = "Tên phân loại không được để trống";
                isValid = false;
            }

            // Check if classify has values
            if (classify.value.length === 0) {
                showError(`Phân loại "${classify.key || `phân loại ${i + 1}`}" phải có ít nhất một thuộc tính`);
                isValid = false;
            }

            // Check each value
            classify.value.forEach((value, j) => {
                if (!value.trim()) {
                    newAttributeErrors[`classify_${i}_value_${j}`] = "Thuộc tính không được để trống";
                    isValid = false;
                }
            });
        });

        setClassifyErrors(newClassifyErrors);
        setAttributeErrors(newAttributeErrors);

        if (!isValid) {
            showError("Vui lòng kiểm tra lại thông tin phân loại");
        }

        return isValid;
    };

    const validateProductDetails = (): boolean => {
        let isValid = true;
        const newPriceErrors: ValidationErrors = {};
        const newWeightErrors: ValidationErrors = {};
        const newQuantityErrors: ValidationErrors = {};
        const newBarcodeErrors: ValidationErrors = {};

        // Collect all barcodes to check for duplicates across details
        const allBarcodes: string[] = [];

        listProductDetail.forEach((detail, index) => {
            // Validate price
            if (detail.price <= 0) {
                newPriceErrors[index] = "Giá phải lớn hơn 0";
                isValid = false;
            }

            // Validate weight
            if (detail.weight < 0) {
                newWeightErrors[index] = "Cân nặng phải từ 0 trở lên";
                isValid = false;
            }

            // Validate quantity
            if (detail.quantity < 0) {
                newQuantityErrors[index] = "Số lượng phải từ 0 trở lên";
                isValid = false;
            }

            // Validate business logic: out of stock should have quantity 0
            if (detail.isOutOfStock && detail.quantity > 0) {
                newQuantityErrors[index] = "Sản phẩm đã hết hàng thì số lượng phải bằng 0";
                isValid = false;
            }

            // Validate image
            if (!detail.image?.url) {
                showError(`Vui lòng tải ảnh cho tất cả các chi tiết sản phẩm`);
                isValid = false;
            }

            // Validate barcodes
            if (detail.quantity > 0) {
                if (!detail.barcodes || detail.barcodes.length === 0) {
                    newBarcodeErrors[index] = "Nếu số lượng > 0 thì phải có barcode";
                    isValid = false;
                } else if (detail.barcodes.length !== detail.quantity) {
                    newBarcodeErrors[index] = `Số lượng barcode (${detail.barcodes.length}) phải bằng số lượng sản phẩm (${detail.quantity})`;
                    isValid = false;
                } else {
                    // Check for duplicate barcodes within the same detail
                    const uniqueBarcodes = new Set(detail.barcodes.map(b => b.trim()));
                    if (uniqueBarcodes.size !== detail.barcodes.length) {
                        newBarcodeErrors[index] = "Barcode bị trùng trong cùng chi tiết sản phẩm";
                        isValid = false;
                    } else {
                        // Add to global barcode list for cross-detail validation
                        detail.barcodes.forEach(barcode => {
                            const trimmedBarcode = barcode.trim();
                            if (trimmedBarcode) {
                                allBarcodes.push(trimmedBarcode);
                            }
                        });
                    }
                }
            } else {
                // If quantity is 0, barcodes should be empty
                if (detail.barcodes && detail.barcodes.length > 0) {
                    newBarcodeErrors[index] = "Nếu số lượng = 0 thì không nên có barcode";
                    isValid = false;
                }
            }
        });

        // Check for duplicate barcodes across different details
        const barcodeFrequency = new Map<string, number>();
        allBarcodes.forEach(barcode => {
            barcodeFrequency.set(barcode, (barcodeFrequency.get(barcode) || 0) + 1);
        });

        const duplicateBarcodes = Array.from(barcodeFrequency.entries())
            .filter(([_, count]) => count > 1)
            .map(([barcode, _]) => barcode);

        if (duplicateBarcodes.length > 0) {
            showError(`Barcode bị trùng giữa các chi tiết sản phẩm: ${duplicateBarcodes.join(", ")}`);
            isValid = false;
        }

        setPriceErrors(newPriceErrors);
        setWeightErrors(newWeightErrors);
        setQuantityErrors(newQuantityErrors);
        setBarcodeErrors(newBarcodeErrors);

        if (!isValid) {
            showError("Vui lòng kiểm tra lại thông tin chi tiết sản phẩm");
        }

        return isValid;
    };

    // Individual field validation
    const validatePrice = (price: number, index: number) => {
        const newErrors = { ...priceErrors };

        if (price <= 0) {
            newErrors[index] = "Giá phải lớn hơn 0";
        } else {
            delete newErrors[index];
        }

        setPriceErrors(newErrors);
    };

    const validateWeight = (weight: number, index: number) => {
        const newErrors = { ...weightErrors };

        if (weight < 0) {
            newErrors[index] = "Cân nặng không được nhỏ hơn 0";
        } else {
            delete newErrors[index];
        }

        setWeightErrors(newErrors);
    };

    const validateQuantity = (quantity: number, index: number) => {
        const newErrors = { ...quantityErrors };

        if (quantity < 0) {
            newErrors[index] = "Số lượng không được nhỏ hơn 0";
        } else {
            delete newErrors[index];
        }

        setQuantityErrors(newErrors);
    };

    // Generate product combinations
    const generateProductDetail = () => {
        if (!validateBasicInfo() || !validateClassifies()) {
            return;
        }

        let listAdditionalData: AdditionalDataInput[][] = [[]];

        classifies.forEach((classify) => {
            listAdditionalData = listAdditionalData.flatMap((combination) => {
                return classify.value.map((val) => [
                    ...combination,
                    { key: classify.key, value: val } as AdditionalDataInput,
                ]);
            });
        });

        // Clear existing product details and errors
        setListProductDetail([]);
        setPriceErrors({});
        setWeightErrors({});
        setQuantityErrors({});
        setBarcodeErrors({});

        // Generate new product details
        const newProductDetails: ProductDetailInput[] = listAdditionalData.map((data) => ({
            price: 0,
            weight: 0,
            quantity: 0,
            isOutOfStock: false,
            image: null,
            additionalData: data,
            barcodes: [],
        }));

        setListProductDetail(newProductDetails);
        showSuccess(`Đã tạo ${newProductDetails.length} chi tiết sản phẩm`);
    };

    // Helper function to format classification text
    const classifyText = (productDetail: ProductDetailInput): string => {
        return productDetail.additionalData
            .map((data) => `${data.key}: ${data.value}`)
            .join(", ");
    };

    // Image upload function
    const uploadImg = async (file: File, index: number) => {
        setUploadingImages(prev => ({ ...prev, [index]: true }));

        try {
            const formData = new FormData();
            const id = v4();
            formData.append("id", id);
            formData.append("file", file);

            const response = await axiosClient.post("/api/Cloudinary/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.status === 200) {
                const data = response.data;
                setListProductDetail(prev => {
                    const newList = [...prev];
                    newList[index].image = {
                        id: data.id,
                        thumbUrl: data.thumbnailUrl,
                        url: data.url,
                        name: data.name,
                    };
                    return newList;
                });
                showSuccess("Tải ảnh thành công!");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            showError("Lỗi khi tải ảnh lên. Vui lòng thử lại!");
        } finally {
            setUploadingImages(prev => ({ ...prev, [index]: false }));
        }
    };

    // Create product function
    const createProductAsync = async () => {
        if (isLoading) return;

        if (!validateBasicInfo()) return;

        if (listProductDetail.length === 0) {
            showError("Vui lòng tạo ít nhất một chi tiết sản phẩm trước khi tạo sản phẩm.");
            return;
        }

        if (!validateProductDetails()) return;

        setIsLoading(true);

        try {
            const productToCreate: ProductInput = {
                ...product,
                productDetails: listProductDetail,
            };

            const response = await axiosClient.post("api/Product", productToCreate);

            if (response.status === 200) {
                showSuccess("Tạo sản phẩm thành công!");
                navigate(`/store/${storeId}/productPage`);
            }
        } catch (error: any) {
            console.error("Error creating product:", error);
            const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra";
            showError(`Lỗi khi tạo sản phẩm: ${errorMessage}. Vui lòng thử lại!`);
        } finally {
            setIsLoading(false);
        }
    };

    // Handler functions for form updates
    const updateProductField = (field: keyof ProductInput, value: string | number | undefined) => {
        setProduct(prev => ({ ...prev, [field]: value }));

        // Clear related errors
        if (field === 'name' && value && formErrors.name) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.name;
                return newErrors;
            });
        } else if (field === 'categoryId' && value && formErrors.categoryId) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.categoryId;
                return newErrors;
            });
        } else if (field === 'promotionId' && value && formErrors.promotionId) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.promotionId;
                return newErrors;
            });
        }
    };

    const updateProductDetail = (index: number, field: keyof ProductDetailInput, value: any) => {
        setListProductDetail(prev => {
            const newList = [...prev];
            (newList[index] as any)[field] = value;
            return newList;
        });
    };

    // Handle barcode input
    const updateBarcodes = (index: number, barcodesText: string) => {
        const barcodes = barcodesText.split('\n')
            .map(b => b.trim())
            .filter(b => b.length > 0);

        updateProductDetail(index, 'barcodes', barcodes);

        // Clear barcode error when user updates
        if (barcodes.length > 0) {
            const newErrors = { ...barcodeErrors };
            delete newErrors[index];
            setBarcodeErrors(newErrors);
        }
    };

    // Get the selected promotion for display
    const selectedPromotion = listPromotions.find(p => p.id === product.promotionId);

    return (
        <Box sx={{ p: 3, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
            <Container maxWidth="lg">
                <Stack spacing={4}>
                    {/* Header */}
                    <Paper elevation={0} sx={{ p: 3, bgcolor: "white", borderRadius: 2 }}>
                        <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                            Tạo sản phẩm mới
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Điền thông tin chi tiết để tạo sản phẩm cho cửa hàng của bạn
                        </Typography>
                    </Paper>

                    {/* Show validation summary if there are errors */}
                    {Object.keys(formErrors).length > 0 && (
                        <Alert severity="error">
                            Vui lòng sửa các lỗi sau: {Object.values(formErrors).join(", ")}
                        </Alert>
                    )}

                    {/* Show promotion ending soon warning */}
                    {selectedPromotion && isPromotionEndingSoon(selectedPromotion) && (
                        <Alert severity="warning" icon={<LocalOffer />}>
                            Chương trình khuyến mãi "{selectedPromotion.name}" sẽ kết thúc vào {new Date(selectedPromotion.endDate).toLocaleDateString('vi-VN')}
                        </Alert>
                    )}

                    {/* Product Basic Information */}
                    <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
                        <Box
                            sx={{
                                p: 3,
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "white",
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                                    <Inventory />
                                </Avatar>
                                <Typography variant="h6" fontWeight="bold">
                                    Thông tin cơ bản
                                </Typography>
                            </Stack>
                        </Box>
                        <CardContent sx={{ p: 4 }}>
                            <Stack spacing={3}>
                                <Stack direction="row" spacing={3}>
                                    <TextField
                                        label="Tên sản phẩm"
                                        fullWidth
                                        required
                                        variant="outlined"
                                        value={product.name}
                                        error={!!formErrors.name}
                                        helperText={formErrors.name}
                                        onChange={(e) => updateProductField('name', e.target.value)}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: 2,
                                            },
                                        }}
                                    />
                                    <TextField
                                        select
                                        label="Danh mục"
                                        fullWidth
                                        required
                                        variant="outlined"
                                        value={product.categoryId || ""}
                                        error={!!formErrors.categoryId}
                                        helperText={formErrors.categoryId}
                                        onChange={(e) => updateProductField('categoryId', e.target.value)}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: 2,
                                            },
                                        }}
                                    >
                                        {listCategory.map((category) => (
                                            <MenuItem key={category.id} value={category.id}>
                                                {category.name}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Stack>

                                <TextField
                                    label="Mô tả sản phẩm"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    variant="outlined"
                                    value={product.describe}
                                    onChange={(e) => updateProductField('describe', e.target.value)}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                        },
                                    }}
                                />

                                <Stack direction="row" spacing={3}>
                                    <TextField
                                        select
                                        label="Chương trình khuyến mãi"
                                        fullWidth
                                        required
                                        variant="outlined"
                                        value={product.promotionId || ""}
                                        error={!!formErrors.promotionId}
                                        helperText={formErrors.promotionId || (selectedPromotion ? `Giảm ${selectedPromotion.discount}%` : "")}
                                        disabled={isLoadingPromotions}
                                        onChange={(e) => updateProductField('promotionId', Number(e.target.value))}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: 2,
                                            },
                                        }}
                                    >
                                        {isLoadingPromotions ? (
                                            <MenuItem disabled>
                                                <CircularProgress size={16} sx={{ mr: 1 }} />
                                                Đang tải...
                                            </MenuItem>
                                        ) : listPromotions.length > 0 ? (
                                            listPromotions.map((promotion) => (
                                                <MenuItem key={promotion.id} value={promotion.id}>
                                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                                                        <LocalOffer fontSize="small" color="primary" />
                                                        <Typography variant="body2" sx={{ flex: 1 }}>
                                                            {formatPromotionDisplay(promotion)}
                                                        </Typography>
                                                        {isPromotionEndingSoon(promotion) && (
                                                            <Chip
                                                                label="Sắp hết hạn"
                                                                size="small"
                                                                color="warning"
                                                                variant="outlined"
                                                            />
                                                        )}
                                                    </Stack>
                                                </MenuItem>
                                            ))
                                        ) : (
                                            <MenuItem disabled>
                                                <Typography color="text.secondary">
                                                    Không có chương trình khuyến mãi nào khả dụng
                                                </Typography>
                                            </MenuItem>
                                        )}
                                        <MenuItem>
                                            <Button
                                                variant="text"
                                                size="small"
                                                onClick={loadPromotions}
                                                disabled={isLoadingPromotions}
                                                startIcon={isLoadingPromotions ? <CircularProgress size={16} /> : undefined}
                                            >
                                                Tải lại danh sách
                                            </Button>
                                        </MenuItem>
                                    </TextField>
                                    <TextField
                                        label="Thời gian bảo hành (tháng)"
                                        type="number"
                                        variant="outlined"
                                        value={product.warrantyMonths || ""}
                                        error={!!formErrors.warrantyMonths}
                                        helperText={formErrors.warrantyMonths || "Tùy chọn"}
                                        inputProps={{ min: 1 }}
                                        onChange={(e) => {
                                            const value = e.target.value ? Number(e.target.value) : undefined;
                                            updateProductField('warrantyMonths', value);
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: 2,
                                            },
                                        }}
                                    />
                                    <TextField
                                        label="Hạn sử dụng"
                                        type="date"
                                        variant="outlined"
                                        value={product.expiryDate || ""}
                                        error={!!formErrors.expiryDate}
                                        helperText={formErrors.expiryDate || "Tùy chọn"}
                                        InputLabelProps={{ shrink: true }}
                                        onChange={(e) => {
                                            const value = e.target.value || undefined;
                                            updateProductField('expiryDate', value);
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: 2,
                                            },
                                        }}
                                    />
                                </Stack>

                                {/* Show selected promotion details */}
                                {selectedPromotion && (
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            bgcolor: "primary.lighter",
                                            borderRadius: 2,
                                            border: "1px solid",
                                            borderColor: "primary.light"
                                        }}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <LocalOffer color="primary" />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                                                    {selectedPromotion.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Giảm giá: {selectedPromotion.discount}% |
                                                    Từ {new Date(selectedPromotion.startDate).toLocaleDateString('vi-VN')} đến {new Date(selectedPromotion.endDate).toLocaleDateString('vi-VN')}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={selectedPromotion.isActive ? "Đang hoạt động" : "Không hoạt động"}
                                                color={selectedPromotion.isActive ? "success" : "error"}
                                                size="small"
                                            />
                                        </Stack>
                                    </Paper>
                                )}
                            </Stack>
                        </CardContent>
                    </Paper>

                    {/* Product Classifications */}
                    <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
                        <Box
                            sx={{
                                p: 3,
                                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                                color: "white",
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                                    <Category />
                                </Avatar>
                                <Typography variant="h6" fontWeight="bold">
                                    Phân loại sản phẩm
                                </Typography>
                            </Stack>
                        </Box>
                        <CardContent sx={{ p: 4 }}>
                            <Stack spacing={3}>
                                {classifies.map((data, classifiesIndex) => (
                                    <Paper
                                        key={classifiesIndex}
                                        elevation={1}
                                        sx={{ p: 3, borderRadius: 3, border: "2px solid #f0f0f0" }}
                                    >
                                        <Stack spacing={3}>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <TextField
                                                    label={`Phân loại ${classifiesIndex + 1}`}
                                                    value={data.key}
                                                    required
                                                    variant="outlined"
                                                    size="medium"
                                                    error={!!classifyErrors[`classify_${classifiesIndex}`]}
                                                    helperText={classifyErrors[`classify_${classifiesIndex}`]}
                                                    onChange={(e) =>
                                                        updateClassifyKey(classifiesIndex, e.target.value)
                                                    }
                                                    sx={{
                                                        flex: 1,
                                                        "& .MuiOutlinedInput-root": { borderRadius: 2 },
                                                    }}
                                                />
                                                <IconButton
                                                    color="error"
                                                    onClick={() => removeClassify(classifiesIndex)}
                                                    sx={{
                                                        bgcolor: "error.lighter",
                                                        "&:hover": { bgcolor: "error.light" },
                                                    }}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </Stack>

                                            <Box>
                                                <Typography
                                                    variant="subtitle2"
                                                    color="text.secondary"
                                                    gutterBottom
                                                >
                                                    Thuộc tính:
                                                </Typography>
                                                <Stack
                                                    direction="row"
                                                    flexWrap="wrap"
                                                    gap={2}
                                                    alignItems="center"
                                                >
                                                    {data.value.map((classifyValue, valueIndex) => (
                                                        <Stack
                                                            key={valueIndex}
                                                            direction="row"
                                                            alignItems="center"
                                                            spacing={1}
                                                        >
                                                            <TextField
                                                                label="Thuộc tính"
                                                                value={classifyValue}
                                                                required
                                                                size="small"
                                                                variant="outlined"
                                                                error={!!attributeErrors[`classify_${classifiesIndex}_value_${valueIndex}`]}
                                                                helperText={attributeErrors[`classify_${classifiesIndex}_value_${valueIndex}`]}
                                                                onChange={(e) =>
                                                                    updateClassifyValue(
                                                                        classifiesIndex,
                                                                        valueIndex,
                                                                        e.target.value
                                                                    )
                                                                }
                                                                sx={{
                                                                    "& .MuiOutlinedInput-root": {
                                                                        borderRadius: 2,
                                                                    },
                                                                }}
                                                            />
                                                            <IconButton
                                                                color="error"
                                                                size="small"
                                                                onClick={() =>
                                                                    removeClassifyValue(
                                                                        classifiesIndex,
                                                                        valueIndex
                                                                    )
                                                                }
                                                            >
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </Stack>
                                                    ))}
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<Add />}
                                                        onClick={() => addClassifyValue(classifiesIndex)}
                                                        sx={{ borderRadius: 2 }}
                                                    >
                                                        Thêm thuộc tính
                                                    </Button>
                                                </Stack>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                ))}

                                <Button
                                    variant="outlined"
                                    startIcon={<Add />}
                                    onClick={addClassifies}
                                    sx={{ alignSelf: "flex-start", borderRadius: 2, px: 3 }}
                                >
                                    Thêm phân loại
                                </Button>

                                <Divider />

                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={generateProductDetail}
                                    disabled={classifies.length === 0}
                                    size="large"
                                    sx={{
                                        alignSelf: "flex-end",
                                        borderRadius: 2,
                                        px: 4,
                                        py: 1.5,
                                        boxShadow: 3,
                                    }}
                                >
                                    Tạo chi tiết sản phẩm
                                </Button>
                            </Stack>
                        </CardContent>
                    </Paper>

                    {/* Product Details Table */}
                    {listProductDetail.length > 0 && (
                        <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
                            <Box
                                sx={{
                                    p: 3,
                                    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                    color: "white",
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                                        <PhotoCamera />
                                    </Avatar>
                                    <Typography variant="h6" fontWeight="bold">
                                        Chi tiết sản phẩm ({listProductDetail.length})
                                    </Typography>
                                </Stack>
                            </Box>
                            <Box sx={{ overflow: "auto" }}>
                                <Table sx={{ minWidth: 1000 }}>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: "grey.50" }}>
                                            <TableCell sx={{ fontWeight: "bold", minWidth: 200 }}>Phân loại</TableCell>
                                            <TableCell sx={{ fontWeight: "bold", minWidth: 120 }}>Giá (VNĐ)</TableCell>
                                            <TableCell sx={{ fontWeight: "bold", minWidth: 120 }}>Cân nặng (g)</TableCell>
                                            <TableCell sx={{ fontWeight: "bold", minWidth: 100 }}>Số lượng</TableCell>
                                            <TableCell sx={{ fontWeight: "bold", minWidth: 100 }}>Hết hàng</TableCell>
                                            <TableCell sx={{ fontWeight: "bold", minWidth: 200 }}>Barcode</TableCell>
                                            <TableCell sx={{ fontWeight: "bold", minWidth: 150 }}>Ảnh sản phẩm</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {listProductDetail.map((productDetail, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell>
                                                    <Chip
                                                        label={classifyText(productDetail)}
                                                        variant="outlined"
                                                        size="small"
                                                        sx={{ maxWidth: 200 }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        value={productDetail.price}
                                                        error={!!priceErrors[index]}
                                                        helperText={priceErrors[index]}
                                                        onChange={(e) => {
                                                            const newPrice = Number(e.target.value);
                                                            updateProductDetail(index, 'price', newPrice);
                                                        }}
                                                        onBlur={() => validatePrice(productDetail.price, index)}
                                                        sx={{
                                                            "& .MuiOutlinedInput-root": { borderRadius: 2 },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        value={productDetail.weight}
                                                        error={!!weightErrors[index]}
                                                        helperText={weightErrors[index]}
                                                        inputProps={{ min: 0 }}
                                                        onChange={(e) => {
                                                            const newWeight = Number(e.target.value);
                                                            if (newWeight >= 0) {
                                                                updateProductDetail(index, 'weight', newWeight);
                                                            }
                                                        }}
                                                        onBlur={() => validateWeight(productDetail.weight, index)}
                                                        sx={{
                                                            "& .MuiOutlinedInput-root": { borderRadius: 2 },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        value={productDetail.quantity}
                                                        error={!!quantityErrors[index]}
                                                        helperText={quantityErrors[index]}
                                                        inputProps={{ min: 0 }}
                                                        onChange={(e) => {
                                                            const newQuantity = Number(e.target.value);
                                                            if (newQuantity >= 0) {
                                                                updateProductDetail(index, 'quantity', newQuantity);
                                                                // Auto-generate or clear barcodes based on quantity
                                                                if (newQuantity === 0) {
                                                                    updateProductDetail(index, 'barcodes', []);
                                                                } else if (productDetail.barcodes.length !== newQuantity) {
                                                                    // Generate empty barcode slots
                                                                    const newBarcodes = Array(newQuantity).fill('').map((_, i) =>
                                                                        productDetail.barcodes[i] || ''
                                                                    );
                                                                    updateProductDetail(index, 'barcodes', newBarcodes);
                                                                }
                                                            }
                                                        }}
                                                        onBlur={() => validateQuantity(productDetail.quantity, index)}
                                                        sx={{
                                                            "& .MuiOutlinedInput-root": { borderRadius: 2 },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={productDetail.isOutOfStock}
                                                        onChange={(e) => {
                                                            updateProductDetail(index, 'isOutOfStock', e.target.checked);
                                                            // If marking as out of stock, set quantity to 0
                                                            if (e.target.checked) {
                                                                updateProductDetail(index, 'quantity', 0);
                                                                updateProductDetail(index, 'barcodes', []);
                                                            }
                                                        }}
                                                        color="primary"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Stack spacing={1}>
                                                        <TextField
                                                            size="small"
                                                            multiline
                                                            rows={3}
                                                            placeholder={`Nhập ${productDetail.quantity} barcode (mỗi dòng một barcode)`}
                                                            value={productDetail.barcodes.join('\n')}
                                                            error={!!barcodeErrors[index]}
                                                            helperText={barcodeErrors[index] || `${productDetail.barcodes.filter(b => b.trim()).length}/${productDetail.quantity} barcode`}
                                                            disabled={productDetail.quantity === 0}
                                                            onChange={(e) => updateBarcodes(index, e.target.value)}
                                                            sx={{
                                                                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                                                                minWidth: 180,
                                                            }}
                                                        />
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack spacing={2} alignItems="center" sx={{ minWidth: 120 }}>
                                                        {uploadingImages[index] ? (
                                                            <Box
                                                                sx={{
                                                                    display: "flex",
                                                                    flexDirection: "column",
                                                                    alignItems: "center",
                                                                    gap: 1,
                                                                }}
                                                            >
                                                                <CircularProgress size={24} color="primary" />
                                                                <Typography variant="caption" color="primary">
                                                                    Đang tải...
                                                                </Typography>
                                                            </Box>
                                                        ) : (
                                                            <Button
                                                                variant="outlined"
                                                                component="label"
                                                                size="small"
                                                                startIcon={<CloudUpload />}
                                                                sx={{ borderRadius: 2, minWidth: 100 }}
                                                            >
                                                                Tải ảnh
                                                                <input
                                                                    hidden
                                                                    accept="image/*"
                                                                    type="file"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            e.target.value = "";
                                                                            uploadImg(file, index);
                                                                        }
                                                                    }}
                                                                />
                                                            </Button>
                                                        )}

                                                        {uploadingImages[index] ? (
                                                            <Box
                                                                sx={{
                                                                    width: 80,
                                                                    height: 80,
                                                                    borderRadius: 2,
                                                                    border: "2px dashed #ccc",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    bgcolor: "grey.50",
                                                                }}
                                                            >
                                                                <CircularProgress size={32} />
                                                            </Box>
                                                        ) : productDetail.image?.thumbUrl ? (
                                                            <Box position="relative">
                                                                <img
                                                                    src={productDetail.image.thumbUrl}
                                                                    alt="Ảnh sản phẩm"
                                                                    style={{
                                                                        width: 80,
                                                                        height: 80,
                                                                        objectFit: "cover",
                                                                        borderRadius: 8,
                                                                        border: "2px solid #e0e0e0",
                                                                    }}
                                                                />
                                                                <CheckCircle
                                                                    sx={{
                                                                        position: "absolute",
                                                                        top: -4,
                                                                        right: -4,
                                                                        color: "success.main",
                                                                        bgcolor: "white",
                                                                        borderRadius: "50%",
                                                                        fontSize: 20,
                                                                    }}
                                                                />
                                                            </Box>
                                                        ) : (
                                                            <Box
                                                                sx={{
                                                                    width: 80,
                                                                    height: 80,
                                                                    borderRadius: 2,
                                                                    border: "2px dashed #ccc",
                                                                    display: "flex",
                                                                    flexDirection: "column",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    bgcolor: "grey.50",
                                                                }}
                                                            >
                                                                <Warning color="warning" sx={{ fontSize: 24 }} />
                                                                <Typography
                                                                    variant="caption"
                                                                    color="text.secondary"
                                                                    textAlign="center"
                                                                    sx={{ mt: 0.5 }}
                                                                >
                                                                    Chưa có ảnh
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Paper>
                    )}

                    {/* Create Product Button */}
                    {listProductDetail.length > 0 && (
                        <Stack direction="row" justifyContent="flex-end" spacing={2}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate(`/store/${storeId}/productPage`)}
                                size="large"
                                sx={{ borderRadius: 3, px: 4, py: 2 }}
                            >
                                Hủy
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={createProductAsync}
                                disabled={isLoading}
                                size="large"
                                sx={{
                                    borderRadius: 3,
                                    px: 6,
                                    py: 2,
                                    boxShadow: 4,
                                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    "&:hover": { boxShadow: 6 },
                                    "&:disabled": { opacity: 0.7 },
                                }}
                            >
                                {isLoading ? (
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <CircularProgress size={20} color="inherit" />
                                        <Typography>Đang tạo...</Typography>
                                    </Stack>
                                ) : (
                                    "Tạo sản phẩm"
                                )}
                            </Button>
                        </Stack>
                    )}
                </Stack>
            </Container>
        </Box>
    );
}