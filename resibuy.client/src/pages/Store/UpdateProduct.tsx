import { useEffect, useState } from "react";
import {
    Box,
    Button,
    CardContent,
    TextField,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Checkbox,
    MenuItem,
    IconButton,
    Alert,
    CircularProgress,
    Stack,
    Paper,
    Container,
    Avatar,
    Chip,
    Divider,
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
    Edit,
    Save,
    Cancel,
    LocalOffer,
    Lock,
    AddBox,
} from "@mui/icons-material";
import { v4 } from "uuid";
import axiosClient from "../../api/base.api";
import type { CategoryDto } from "../../types/storeData";
import { useNavigate, useParams } from "react-router-dom";
import { useToastify } from "../../hooks/useToastify.ts";

interface AdditionalDataInput {
    id?: number;
    key: string;
    value: string;
}

interface Image {
    id?: string;
    url: string;
    thumbUrl: string;
    name: string;
}

interface ProductDetailInput {
    id?: number;
    price: number;
    weight: number;
    quantity: number;
    isOutOfStock: boolean;
    image?: Image;
    additionalData: AdditionalDataInput[];
    barcodes: string[];
    isExisting?: boolean; // Flag to track existing product details
    sold?: number; // Add sold field to track sold quantity
}

interface ProductInput {
    id?: number;
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
    value: {
        text: string;
        isEdit: boolean;
    }[];
    isEdit: boolean;
}

interface TempAdditionalData {
    key: string;
    value: {
        text: string;
        isEdit: boolean;
    };
}

interface ValidationErrors {
    [key: string]: string;
}

export default function UpdateProduct() {
    const { productId, storeId } = useParams<{
        productId: string;
        storeId: string;
    }>();
    const navigate = useNavigate();
    const { error: showError, success: showSuccess } = useToastify();

    // State management
    const [listCategory, setListCategory] = useState<CategoryDto[]>([]);
    const [listPromotions, setListPromotions] = useState<PromotionDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [isLoadingPromotions, setIsLoadingPromotions] = useState(false);

    // Error states consolidated
    const [formErrors, setFormErrors] = useState<ValidationErrors>({});
    const [classifyErrors, setClassifyErrors] = useState<ValidationErrors>({});
    const [attributeErrors, setAttributeErrors] = useState<ValidationErrors>({});
    const [priceErrors, setPriceErrors] = useState<ValidationErrors>({});
    const [weightErrors, setWeightErrors] = useState<ValidationErrors>({});
    const [quantityErrors, setQuantityErrors] = useState<ValidationErrors>({});

    const [uploadingImages, setUploadingImages] = useState<{ [key: number]: boolean }>({});

    // Add state to track if classifications can be modified
    const [canModifyClassifications, setCanModifyClassifications] = useState<boolean>(true);
    const [hasSoldProducts, setHasSoldProducts] = useState<boolean>(false);

    const [product, setProduct] = useState<ProductInput>({
        name: "",
        describe: "",
        promotionId: 0,
        storeId: storeId || "",
        categoryId: "",
        expiryDate: undefined,
        warrantyMonths: undefined,
        productDetails: [],
    });

    const [listProductDetail, setListProductDetail] = useState<ProductDetailInput[]>([]);
    const [classifies, setClassifies] = useState<Classify[]>([]);

    // Store original quantities for validation
    const [originalQuantities, setOriginalQuantities] = useState<{ [key: number]: number }>({});

    // Function to check if any product detail has been sold
    const checkIfProductsHaveBeenSold = (productDetails: ProductDetailInput[]): boolean => {
        return productDetails.some(detail => (detail.sold || 0) > 0);
    };

    // Load data on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                await Promise.all([loadCategories(), loadPromotions()]);

                if (productId) {
                    const productRes = await axiosClient.get(`api/Product/${productId}`);
                    if (productRes.status === 200) {
                        const productData = productRes.data.data;
                        setProduct({
                            ...productData,
                            storeId: storeId || productData.storeId,
                            promotionId: productData.promotionId || 0,
                        });

                        const tempProductDetails: ProductDetailInput[] = productData.productDetails.map(detail => ({
                            id: detail.id,
                            price: detail.price,
                            weight: detail.weight,
                            quantity: detail.quantity,
                            isOutOfStock: detail.isOutOfStock,
                            image: detail.image,
                            additionalData: detail.additionalData,
                            barcodes: detail.barcodes.map(barcode => barcode.code ?? ''),
                            isExisting: true, // Mark as existing
                            sold: detail.sold || 0, // Add sold quantity
                        })) || [];

                        setListProductDetail(tempProductDetails);

                        // Check if any products have been sold
                        const soldProductsExist = checkIfProductsHaveBeenSold(tempProductDetails);
                        setHasSoldProducts(soldProductsExist);
                        setCanModifyClassifications(!soldProductsExist);

                        // Store original quantities for validation
                        const origQuantities: { [key: number]: number } = {};
                        tempProductDetails.forEach((detail, index) => {
                            origQuantities[index] = detail.quantity;
                        });
                        setOriginalQuantities(origQuantities);

                        const classifyMap: Record<string, Set<string>> = {};

                        tempProductDetails.forEach((detail) => {
                            detail.additionalData.forEach((data) => {
                                if (!classifyMap[data.key]) {
                                    classifyMap[data.key] = new Set();
                                }
                                classifyMap[data.key].add(data.value);
                            });
                        });

                        const newClassifies: Classify[] = Object.entries(classifyMap).map(
                            ([key, values]) => ({
                                key,
                                value: Array.from(values).map((val) => ({
                                    text: val,
                                    isEdit: !soldProductsExist, // Can only edit if no products sold
                                })),
                                isEdit: !soldProductsExist, // Can only edit if no products sold
                            })
                        );

                        setClassifies(newClassifies);
                    }
                } else {
                    setProduct((prev) => ({
                        ...prev,
                        storeId: storeId || "",
                    }));
                }
            } catch (err) {
                console.error("Error loading data:", err);
                showError("Không thể tải dữ liệu. Vui lòng thử lại!");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [productId, storeId]);

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
            const response = await axiosClient.get("api/Promotion", {
                params: { IsActive: true }
            });

            const promotions: PromotionDto[] = response.data.data || [];
            const currentDate = new Date();
            const validPromotions = promotions.filter(promotion => {
                const endDate = new Date(promotion.endDate);
                const startDate = new Date(promotion.startDate);
                return promotion.isActive && startDate <= currentDate && endDate >= currentDate;
            });

            setListPromotions(validPromotions);

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

    // Helper function to check if promotion is ending soon
    const isPromotionEndingSoon = (promotion: PromotionDto): boolean => {
        const endDate = new Date(promotion.endDate);
        const currentDate = new Date();
        const diffTime = endDate.getTime() - currentDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays > 0;
    };

    // Classification management functions - now with sales restriction
    const addClassifies = () => {
        if (!canModifyClassifications) {
            showError("Không thể thêm phân loại vì đã có sản phẩm được bán!");
            return;
        }
        setClassifies((prev) => [...prev, { key: "", value: [], isEdit: true }]);
    };

    const addClassifyValue = (classifyIndex: number) => {
        if (!canModifyClassifications) {
            showError("Không thể thêm thuộc tính vì đã có sản phẩm được bán!");
            return;
        }
        setClassifies((prev) =>
            prev.map((item, idx) =>
                idx === classifyIndex
                    ? { ...item, value: [...item.value, { text: "", isEdit: true }] }
                    : item
            )
        );
    };

    const removeClassify = (index: number) => {
        if (!canModifyClassifications) {
            showError("Không thể xóa phân loại vì đã có sản phẩm được bán!");
            return;
        }
        setClassifies((prev) => prev.filter((_, i) => i !== index));

        const newClassifyErrors = { ...classifyErrors };
        const newAttributeErrors = { ...attributeErrors };

        delete newClassifyErrors[`classify_${index}`];
        Object.keys(newAttributeErrors).forEach(key => {
            if (key.startsWith(`classify_${index}_`)) {
                delete newAttributeErrors[key];
            }
        });

        setClassifyErrors(newClassifyErrors);
        setAttributeErrors(newAttributeErrors);
    };

    const removeClassifyValue = (classifyIndex: number, valueIndex: number) => {
        if (!canModifyClassifications) {
            showError("Không thể xóa thuộc tính vì đã có sản phẩm được bán!");
            return;
        }
        setClassifies((prev) =>
            prev.map((item, idx) =>
                idx === classifyIndex
                    ? { ...item, value: item.value.filter((_, vi) => vi !== valueIndex) }
                    : item
            )
        );

        const newAttributeErrors = { ...attributeErrors };
        delete newAttributeErrors[`classify_${classifyIndex}_value_${valueIndex}`];
        setAttributeErrors(newAttributeErrors);
    };

    const updateClassifyKey = (index: number, newKey: string) => {
        if (!canModifyClassifications) {
            showError("Không thể chỉnh sửa phân loại vì đã có sản phẩm được bán!");
            return;
        }
        setClassifies((prev) =>
            prev.map((item, i) => (i === index ? { ...item, key: newKey } : item))
        );

        if (newKey.trim()) {
            const newClassifyErrors = { ...classifyErrors };
            delete newClassifyErrors[`classify_${index}`];
            setClassifyErrors(newClassifyErrors);
        }
    };

    const updateClassifyValue = (
        classifyIndex: number,
        valueIndex: number,
        newValue: string
    ) => {
        if (!canModifyClassifications) {
            showError("Không thể chỉnh sửa thuộc tính vì đã có sản phẩm được bán!");
            return;
        }
        setClassifies((prev) =>
            prev.map((item, i) =>
                i === classifyIndex
                    ? {
                        ...item,
                        value: item.value.map((val, vi) =>
                            vi === valueIndex ? { ...val, text: newValue } : val
                        ),
                    }
                    : item
            )
        );

        if (newValue.trim()) {
            const newAttributeErrors = { ...attributeErrors };
            delete newAttributeErrors[`classify_${classifyIndex}_value_${valueIndex}`];
            setAttributeErrors(newAttributeErrors);
        }
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

        if (product.warrantyMonths !== undefined && product.warrantyMonths <= 0) {
            product.warrantyMonths = 0;
        }

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
            if (!classify.key.trim()) {
                newClassifyErrors[`classify_${i}`] = "Tên phân loại không được để trống";
                isValid = false;
            }

            if (classify.value.length === 0) {
                showError(`Phân loại "${classify.key || `phân loại ${i + 1}`}" phải có ít nhất một thuộc tính`);
                isValid = false;
            }

            classify.value.forEach((value, j) => {
                if (!value.text.trim()) {
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

    const validateProductDetails = (allDetails: ProductDetailInput[]): boolean => {
        let isValid = true;
        const newPriceErrors: ValidationErrors = {};
        const newWeightErrors: ValidationErrors = {};
        const newQuantityErrors: ValidationErrors = {};

        allDetails.forEach((detail, index) => {
            if (detail.price <= 0) {
                newPriceErrors[index] = "Giá phải lớn hơn 0";
                isValid = false;
            }

            if (detail.weight < 0) {
                newWeightErrors[index] = "Cân nặng phải từ 0 trở lên";
                isValid = false;
            }

            if (detail.quantity < 0) {
                newQuantityErrors[index] = "Số lượng phải từ 0 trở lên";
                isValid = false;
            }

            if (detail.isOutOfStock && detail.quantity > 0) {
                newQuantityErrors[index] = "Sản phẩm đã hết hàng thì số lượng phải bằng 0";
                isValid = false;
            }

            if (!detail.image?.url) {
                showError(`Vui lòng tải ảnh cho tất cả các chi tiết sản phẩm`);
                console.error(`Chi tiết tại index ${index} chưa có ảnh`);
                isValid = false;
            }
        });

        setPriceErrors(newPriceErrors);
        setWeightErrors(newWeightErrors);
        setQuantityErrors(newQuantityErrors);

        if (!isValid) {
            console.error("Lỗi validateProductDetails:", {
                priceErrors: newPriceErrors,
                weightErrors: newWeightErrors,
                quantityErrors: newQuantityErrors,
                allDetails
            });
            showError("Vui lòng kiểm tra lại thông tin chi tiết sản phẩm");
        }

        return isValid;
    };

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

    const generateProductDetail = () => {
        if (!canModifyClassifications) {
            showError("Không thể tạo chi tiết sản phẩm mới vì đã có sản phẩm được bán!");
            return;
        }

        if (!validateBasicInfo() || !validateClassifies()) {
            return;
        }

        let combinations: TempAdditionalData[][] = [[]];

        classifies.forEach((classify) => {
            const allValues = classify.value;
            combinations = combinations.flatMap((combo) =>
                allValues.map((val) => [
                    ...combo,
                    {
                        key: classify.key,
                        value: val,
                    },
                ])
            );
        });

        const finalList: AdditionalDataInput[][] = combinations.map(
            (combo) =>
                combo.map((item) => ({
                    key: item.key,
                    value: item.value.text,
                }))
        );

        const newDetails: ProductDetailInput[] = finalList.map((data) => ({
            price: 0,
            weight: 0,
            quantity: 0,
            isOutOfStock: false,
            image: { id: "", url: "", thumbUrl: "", name: "" },
            additionalData: data,
            barcodes: [],
            isExisting: false, // Mark as new
            sold: 0, // Initialize sold as 0
        }));

        // Clear all errors when generating new product details
        setPriceErrors({});
        setWeightErrors({});
        setQuantityErrors({});

        // Replace all existing product details with new ones
        setListProductDetail(newDetails);
        showSuccess(`Đã tạo ${newDetails.length} chi tiết sản phẩm mới (đã thay thế tất cả chi tiết cũ)`);
    };

    const classifyText = (productDetail: ProductDetailInput) => {
        return productDetail.additionalData
            .map((data) => `${data.key}: ${data.value}`)
            .join(", ");
    };

    const uploadImg = async (
        file: File,
        index: number
    ) => {
        setUploadingImages((prev) => ({ ...prev, [index]: true }));

        try {
            const formData = new FormData();
            const id = v4();
            formData.append("id", id);
            formData.append("file", file);

            const resp = await axiosClient.post("/api/Cloudinary/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (resp.status === 200) {
                const data = resp.data;
                const imageData = {
                    id: data.id,
                    thumbUrl: data.thumbnailUrl,
                    url: data.url,
                    name: data.name,
                };

                const newList = [...listProductDetail];
                newList[index].image = imageData;
                setListProductDetail(newList);
                showSuccess("Tải ảnh thành công!");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            showError("Lỗi khi tải ảnh lên. Vui lòng thử lại!");
        } finally {
            setUploadingImages((prev) => ({ ...prev, [index]: false }));
        }
    };

    const updateProductField = (field: keyof ProductInput, value: string | number | undefined) => {
        setProduct(prev => ({ ...prev, [field]: value }));

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

    const updateBarcodes = (index: number, barcodesText: string) => {
        const barcodes = barcodesText.split('\n')
            .map(b => b.trim())
            .filter(b => b.length > 0);

        updateProductDetail(index, 'barcodes', barcodes);
    };

    const updateProductAsync = async () => {
        if (updating) return;

        if (!validateBasicInfo()) return;

        if (listProductDetail.length === 0) {
            showError("Sản phẩm phải có ít nhất một chi tiết sản phẩm.");
            return;
        }

        if (!validateProductDetails(listProductDetail)) return;

        setUpdating(true);

        try {
            // Remove the isExisting flag before sending to API
            const cleanDetails = listProductDetail.map(({ isExisting, ...detail }) => detail);

            const tempProduct: ProductInput = {
                ...product,
                productDetails: cleanDetails,
            };

            const response = await axiosClient.put("api/Product", tempProduct);
            if (response.status === 200) {
                showSuccess("Cập nhật sản phẩm thành công!");
                navigate(`/store/${storeId}/productPage`);
            }
        } catch (error: any) {
            console.error("Error updating product:", error);
            const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra";
            showError(`Lỗi khi cập nhật sản phẩm: ${errorMessage}. Vui lòng thử lại!`);
        } finally {
            setUpdating(false);
        }
    };

    const selectedPromotion = listPromotions.find(p => p.id === product.promotionId);

    if (loading) {
        return (
            <Box
                sx={{
                    p: 3,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "50vh",
                }}
            >
                <CircularProgress size={40} />
                <Typography variant="h6" sx={{ ml: 2 }}>
                    Đang tải dữ liệu...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
            <Container maxWidth="lg">
                <Stack spacing={4}>
                    <Paper elevation={0} sx={{ p: 3, bgcolor: "white", borderRadius: 2 }}>
                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            color="primary"
                            gutterBottom
                        >
                            {productId ? "Cập nhật sản phẩm" : "Tạo sản phẩm mới"}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {productId
                                ? "Chỉnh sửa thông tin chi tiết sản phẩm của bạn"
                                : "Tạo sản phẩm mới cho cửa hàng"}
                        </Typography>
                    </Paper>

                    {Object.keys(formErrors).length > 0 && (
                        <Alert severity="error">
                            Vui lòng sửa các lỗi sau: {Object.values(formErrors).join(", ")}
                        </Alert>
                    )}

                    {selectedPromotion && isPromotionEndingSoon(selectedPromotion) && (
                        <Alert severity="warning" icon={<LocalOffer />}>
                            Chương trình khuyến mãi "{selectedPromotion.name}" sẽ kết thúc vào {new Date(selectedPromotion.endDate).toLocaleDateString('vi-VN')}
                        </Alert>
                    )}

                    {/* Show warning when products have been sold */}
                    {hasSoldProducts && (
                        <Alert severity="warning" icon={<Lock />}>
                            <Typography variant="subtitle2" fontWeight="bold">
                                Không thể chỉnh sửa phân loại
                            </Typography>
                            <Typography variant="body2">
                                Sản phẩm này đã có đơn hàng được bán, do đó không thể thêm/sửa/xóa phân loại hoặc tạo chi tiết sản phẩm mới.
                                Bạn chỉ có thể chỉnh sửa thông tin cơ bản và chi tiết của các phân loại hiện có.
                            </Typography>
                        </Alert>
                    )}

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
                                    <Edit />
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

                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 3,
                            overflow: "hidden",
                            opacity: !canModifyClassifications ? 0.6 : 1,
                            position: "relative"
                        }}
                    >
                        {!canModifyClassifications && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    bgcolor: "rgba(0,0,0,0.1)",
                                    zIndex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Paper
                                    elevation={3}
                                    sx={{
                                        p: 2,
                                        bgcolor: "warning.light",
                                        color: "warning.contrastText",
                                        borderRadius: 2
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Lock />
                                        <Typography variant="body2" fontWeight="bold">
                                            Không thể chỉnh sửa - Đã có sản phẩm được bán
                                        </Typography>
                                    </Stack>
                                </Paper>
                            </Box>
                        )}
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
                                {!canModifyClassifications && (
                                    <Chip
                                        icon={<Lock fontSize="small" />}
                                        label="Đã khóa"
                                        size="small"
                                        color="warning"
                                        variant="filled"
                                    />
                                )}
                            </Stack>
                        </Box>
                        <CardContent sx={{ p: 4 }}>
                            <Alert
                                severity={!canModifyClassifications ? "warning" : "info"}
                                sx={{ mb: 3 }}
                            >
                                {!canModifyClassifications
                                    ? "Không thể chỉnh sửa phân loại vì sản phẩm đã có đơn hàng được bán. Chỉ có thể xem và chỉnh sửa thông tin chi tiết của các phân loại hiện có."
                                    : "Tạo và chỉnh sửa phân loại sản phẩm. Khi tạo chi tiết sản phẩm mới, tất cả các chi tiết cũ sẽ bị thay thế."
                                }
                            </Alert>

                            <Stack spacing={3}>
                                {classifies.map((data, classifiesIndex) => (
                                    <Paper
                                        key={classifiesIndex}
                                        elevation={1}
                                        sx={{
                                            p: 3,
                                            borderRadius: 3,
                                            border: "2px solid #e3f2fd",
                                            bgcolor: !canModifyClassifications ? "#f5f5f5" : "#f8f9ff",
                                            position: "relative"
                                        }}
                                    >
                                        <Stack spacing={3}>
                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                <TextField
                                                    label={`Phân loại ${classifiesIndex + 1}`}
                                                    value={data.key}
                                                    required
                                                    variant="outlined"
                                                    size="medium"
                                                    disabled={!canModifyClassifications}
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
                                                    disabled={!canModifyClassifications}
                                                    onClick={() => removeClassify(classifiesIndex)}
                                                    sx={{
                                                        bgcolor: !canModifyClassifications ? "grey.300" : "error.lighter",
                                                        "&:hover": {
                                                            bgcolor: !canModifyClassifications ? "grey.300" : "error.light"
                                                        },
                                                    }}
                                                    title={!canModifyClassifications ? "Không thể xóa phân loại" : "Xóa phân loại"}
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
                                                                value={classifyValue.text}
                                                                required
                                                                size="small"
                                                                variant="outlined"
                                                                disabled={!canModifyClassifications}
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
                                                                disabled={!canModifyClassifications}
                                                                onClick={() =>
                                                                    removeClassifyValue(
                                                                        classifiesIndex,
                                                                        valueIndex
                                                                    )
                                                                }
                                                                sx={{
                                                                    bgcolor: !canModifyClassifications ? "grey.300" : "error.lighter",
                                                                    "&:hover": {
                                                                        bgcolor: !canModifyClassifications ? "grey.300" : "error.light"
                                                                    },
                                                                }}
                                                                title={!canModifyClassifications ? "Không thể xóa thuộc tính" : "Xóa thuộc tính"}
                                                            >
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </Stack>
                                                    ))}
                                                    <Button
                                                        variant="outlined"
                                                        size="small"
                                                        startIcon={<Add />}
                                                        disabled={!canModifyClassifications}
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
                                    disabled={!canModifyClassifications}
                                    onClick={addClassifies}
                                    sx={{ alignSelf: "flex-start", borderRadius: 2, px: 3 }}
                                >
                                    Thêm phân loại
                                </Button>

                                <Divider />

                                {classifies.length > 0 && (
                                    <Box sx={{
                                        p: 2,
                                        bgcolor: !canModifyClassifications ? "grey.100" : "warning.lighter",
                                        borderRadius: 2
                                    }}>
                                        <Typography variant="body2" color={!canModifyClassifications ? "text.secondary" : "warning.dark"}>
                                            <strong>
                                                {!canModifyClassifications ? "Thông tin:" : "Lưu ý:"}
                                            </strong>
                                            {!canModifyClassifications
                                                ? " Phân loại hiện tại không thể thay đổi vì đã có sản phẩm được bán."
                                                : " Khi tạo chi tiết sản phẩm mới, tất cả các chi tiết sản phẩm hiện tại sẽ bị thay thế."
                                            }
                                            {canModifyClassifications && (
                                                <> Số tổ hợp sẽ được tạo: {
                                                    classifies.reduce((total, classify) =>
                                                        total * Math.max(1, classify.value.length), 1
                                                    )
                                                } chi tiết sản phẩm</>
                                            )}
                                        </Typography>
                                    </Box>
                                )}

                                <Button
                                    variant="contained"
                                    color="primary"
                                    disabled={!canModifyClassifications}
                                    onClick={generateProductDetail}
                                    size="large"
                                    sx={{
                                        alignSelf: "flex-end",
                                        borderRadius: 2,
                                        px: 4,
                                        py: 1.5,
                                        boxShadow: 3,
                                    }}
                                >
                                    {!canModifyClassifications
                                        ? "Không thể tạo chi tiết mới"
                                        : "Tạo chi tiết sản phẩm từ phân loại"
                                    }
                                </Button>
                            </Stack>
                        </CardContent>
                    </Paper>

                    {listProductDetail.length > 0 && (
                        <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
                            <Box
                                sx={{
                                    p: 3,
                                    background:
                                        "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                    color: "white",
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                                        <Inventory />
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
                                            <TableCell sx={{ fontWeight: "bold", minWidth: 120 }}>Cân nặng (kg)</TableCell>
                                            <TableCell sx={{ fontWeight: "bold", minWidth: 100 }}>Số lượng</TableCell>
                                            <TableCell sx={{ fontWeight: "bold", minWidth: 100 }}>Đã bán</TableCell>
                                            <TableCell sx={{ fontWeight: "bold", minWidth: 150 }}>Ảnh sản phẩm</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {listProductDetail.map((productDetail, index) => (
                                            <TableRow key={index} hover sx={{ bgcolor: "white" }}>
                                                <TableCell>
                                                    <Chip
                                                        label={classifyText(productDetail)}
                                                        variant="outlined"
                                                        size="small"
                                                        color="primary"
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
                                                                if (newQuantity === 0) {
                                                                    updateProductDetail(index, 'barcodes', []);
                                                                } else if (productDetail.barcodes.length !== newQuantity) {
                                                                    const newBarcodes = Array(newQuantity).fill('').map((_, i) =>
                                                                        productDetail.barcodes[i] || ''
                                                                    );
                                                                    updateProductDetail(index, 'barcodes', newBarcodes);
                                                                }
                                                            }
                                                        }}
                                                        onBlur={() => validateQuantity(productDetail.quantity, index)}
                                                        sx={{
                                                            "& .MuiOutlinedInput-root": {
                                                                borderRadius: 2,
                                                            },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={productDetail.sold || 0}
                                                        size="small"
                                                        color={(productDetail.sold || 0) > 0 ? "error" : "default"}
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Stack
                                                        spacing={2}
                                                        alignItems="center"
                                                        sx={{ minWidth: 120 }}
                                                    >
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
                                                                {productDetail.image?.url
                                                                    ? "Đổi ảnh"
                                                                    : "Tải ảnh"}
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

                                                        {productDetail.image?.thumbUrl ? (
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
                                                                <Warning
                                                                    color="warning"
                                                                    sx={{ fontSize: 24 }}
                                                                />
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

                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{ pt: 2 }}
                    >
                        <Button
                            variant="outlined"
                            startIcon={<Cancel />}
                            onClick={() => navigate(`/store/${storeId}/productPage`)}
                            size="large"
                            sx={{ borderRadius: 3, px: 4, py: 1.5 }}
                            disabled={updating}
                        >
                            Hủy
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={updating ? <CircularProgress size={20} /> : <Save />}
                            onClick={updateProductAsync}
                            size="large"
                            disabled={updating}
                            sx={{
                                borderRadius: 3,
                                px: 6,
                                py: 2,
                                boxShadow: 4,
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                "&:hover": {
                                    boxShadow: 6,
                                },
                                "&:disabled": {
                                    background: "linear-gradient(135deg, #ccc 0%, #999 100%)",
                                },
                            }}
                        >
                            {updating ? (
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <CircularProgress size={20} color="inherit" />
                                    <Typography>Đang cập nhật...</Typography>
                                </Stack>
                            ) : (
                                "Cập nhật sản phẩm"
                            )}
                        </Button>
                    </Stack>
                </Stack>
            </Container>
        </Box>
    );
}