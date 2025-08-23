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
} from "@mui/icons-material";
import { v4 } from "uuid";
import axiosClient from "../../api/base.api";
import type { CategoryDto } from "../../types/storeData";
import { useNavigate, useParams } from "react-router-dom";

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
    image: Image;
    additionalData: AdditionalDataInput[];
}
interface ProductInput {
    name: string;
    describe: string;
    discount: number;
    storeId: string;
    categoryId: string;
    productDetails: ProductDetailInput[];
}
interface Classify {
    key: string;
    value: string[];
}

// Main component
export default function CreateProduct() {
    useEffect(() => {
        axiosClient
            .get("api/Category/categories")
            .then((res) => {
                const templist: CategoryDto[] = res.data.data || [];
                setListCategory(templist);
            })
            .catch((err) => console.error(err));
    }, []);

    const { storeId } = useParams<{ storeId: string }>();
    const navigate = useNavigate();

    const [listCategory, setListCategory] = useState<CategoryDto[]>([]);
    const [priceErrors, setPriceErrors] = useState<{ [key: number]: string }>({});
    const [weightErrors, setWeightErrors] = useState<{ [key: number]: string }>({});
    const [quantityErrors, setQuantityErrors] = useState<{ [key: number]: string }>({});
    const [uploadingImages, setUploadingImages] = useState<{
        [key: number]: boolean;
    }>({});

    const [product, setProduct] = useState<ProductInput>({
        name: "",
        describe: "",
        discount: 0,
        storeId: storeId || "",
        categoryId: "",
        productDetails: [],
    });
    const [listProductDetail, setListProductDetail] = useState<
        ProductDetailInput[]
    >([]);
    const [classifies, setClassifies] = useState<Classify[]>([]);

    const addClassifies = () =>
        setClassifies((prev) => [...prev, { key: "", value: [] }]);
    const removeClassify = (index: number) =>
        setClassifies((prev) => prev.filter((_, i) => i !== index));
    const removeclassifyValue = (classifyIndex: number, valueIndex: number) =>
        setClassifies((prev) =>
            prev.map((item, idx) =>
                idx === classifyIndex
                    ? { ...item, value: item.value.filter((_, vi) => vi !== valueIndex) }
                    : item
            )
        );

    const updateClassifyKey = (index: number, newKey: string) =>
        setClassifies((prev) =>
            prev.map((item, i) => (i === index ? { ...item, key: newKey } : item))
        );

    const updateClassifyValue = (
        classifyIndex: number,
        valueIndex: number,
        newValue: string
    ) =>
        setClassifies((prev) =>
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

    const addClassifyValue = (classifyIndex: number) =>
        setClassifies((prev) =>
            prev.map((item, i) =>
                i === classifyIndex ? { ...item, value: [...item.value, ""] } : item
            )
        );

    // Validate price function
    const validatePrice = (price: number, index: number) => {
        const newErrors = { ...priceErrors };

        if (price <= 0) {
            newErrors[index] = "Giá phải lớn hơn 0";
        } else if (price % 500 !== 0) {
            newErrors[index] = "Giá phải là bội số của 500";
        } else {
            delete newErrors[index];
        }

        setPriceErrors(newErrors);
    };

    // Updated validate weight function
    const validateWeight = (weight: number, index: number) => {
        const newErrors = { ...weightErrors };

        if (weight < 0) {
            newErrors[index] = "Cân nặng không được nhỏ hơn 0";
        } else if (weight > 999) {
            newErrors[index] = "Cân nặng không được vượt quá 999g";
        } else {
            delete newErrors[index];
        }

        setWeightErrors(newErrors);
    };

    // Updated validate quantity function
    const validateQuantity = (quantity: number, index: number) => {
        const newErrors = { ...quantityErrors };

        if (quantity < 0) {
            newErrors[index] = "Số lượng không được nhỏ hơn 0";
        } else if (quantity > 999) {
            newErrors[index] = "Số lượng không được vượt quá 999";
        } else {
            delete newErrors[index];
        }

        setQuantityErrors(newErrors);
    };

    // HÀM sinh tổ hợp các thuộc tính
    const generateProductDetail = () => {
        if (classifies.length === 0) {
            alert("nhập đủ thông tin thêm");
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
        console.log(listAdditionalData);
        addToProductDetail(listAdditionalData);
    };

    const addToProductDetail = (listAdditionalData: AdditionalDataInput[][]) => {
        if (listProductDetail.length === 0) {
            listAdditionalData.forEach((data) => {
                const productDetail: ProductDetailInput = {
                    price: 0,
                    weight: 0,
                    quantity: 0,
                    isOutOfStock: false,
                    image: { id: "", url: "", thumbUrl: "", name: "" },
                    additionalData: data,
                };
                setListProductDetail((prev) => [...prev, productDetail]);
            });
        } else {
            setListProductDetail([]);
            setPriceErrors({}); // Clear price errors when regenerating
            setWeightErrors({}); // Clear weight errors when regenerating
            setQuantityErrors({}); // Clear quantity errors when regenerating
            addToProductDetail(listAdditionalData);
        }
    };

    function classyfyText(productDetail: ProductDetailInput) {
        let text = "";
        productDetail.additionalData.forEach((data) => {
            if (text !== "") {
                text = text + ", ";
            }
            text = text + `${data.key}: ${data.value}`;
        });
        return text;
    }

    async function uploadImg(file: File, index: number) {
        setUploadingImages((prev) => ({ ...prev, [index]: true }));

        try {
            // Simulate loading delay for better UX (remove this in production)
            await new Promise((resolve) => setTimeout(resolve, 500));

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
                const newList = [...listProductDetail];
                newList[index].image = {
                    id: data.id,
                    thumbUrl: data.thumbnailUrl,
                    url: data.url,
                    name: data.name,
                };
                setListProductDetail(newList);
                console.log("listProductDetail", listProductDetail[index]);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Lỗi khi tải ảnh lên. Vui lòng thử lại!");
        } finally {
            setUploadingImages((prev) => ({ ...prev, [index]: false }));
        }
    }

    const CreateProductAsync = async () => {
        // Validate if there are no product details
        if (listProductDetail.length === 0) {
            alert(
                "Vui lòng tạo ít nhất một chi tiết sản phẩm trước khi tạo sản phẩm."
            );
            return;
        }

        // Validate all images are uploaded
        const missingImages = listProductDetail.some(
            (detail) => !detail.image?.url || detail.image.url === ""
        );
        if (missingImages) {
            alert("Vui lòng tải ảnh cho tất cả các chi tiết sản phẩm.");
            return;
        }

        // Validate all prices, weights, and quantities before creating product
        const hasErrors = Object.keys(priceErrors).length > 0 ||
            Object.keys(weightErrors).length > 0 ||
            Object.keys(quantityErrors).length > 0;

        const hasInvalidData = listProductDetail.some((detail, index) => {
            let hasError = false;

            // Validate price
            if (detail.price <= 0 || detail.price % 500 !== 0) {
                validatePrice(detail.price, index);
                hasError = true;
            }

            // Updated weight validation
            if (detail.weight < 0 || detail.weight > 999) {
                validateWeight(detail.weight, index);
                hasError = true;
            }

            // Updated quantity validation
            if (detail.quantity < 0 || detail.quantity > 999) {
                validateQuantity(detail.quantity, index);
                hasError = true;
            }

            return hasError;
        });

        if (hasErrors || hasInvalidData) {
            alert(
                "Vui lòng kiểm tra lại thông tin sản phẩm. Giá phải là bội số của 500 và lớn hơn 0, cân nặng và số lượng phải từ 0 đến 999."
            );
            return;
        }

        const tempProduct: ProductInput = {
            ...product,
            productDetails: listProductDetail,
        };
        await axiosClient.post("api/Product", tempProduct).then((res) => {
            if (res.status === 200) {
                navigate(`/store/${storeId}/productPage`);
            }
        });
    };

    return (
        <Box sx={{ p: 3, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
            <Container maxWidth="lg">
                <Stack spacing={4}>
                    {/* Header */}
                    <Paper elevation={0} sx={{ p: 3, bgcolor: "white", borderRadius: 2 }}>
                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            color="primary"
                            gutterBottom
                        >
                            Tạo sản phẩm mới
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Điền thông tin chi tiết để tạo sản phẩm cho cửa hàng của bạn
                        </Typography>
                    </Paper>

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
                                        onChange={(e) =>
                                            setProduct({ ...product, name: e.target.value })
                                        }
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
                                        variant="outlined"
                                        value={product.categoryId || ""}
                                        onChange={(e) =>
                                            setProduct({ ...product, categoryId: e.target.value })
                                        }
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
                                    onChange={(e) =>
                                        setProduct({ ...product, describe: e.target.value })
                                    }
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                        },
                                    }}
                                />

                                <Box sx={{ maxWidth: 300 }}>
                                    <TextField
                                        label="Giảm giá (%)"
                                        type="number"
                                        fullWidth
                                        variant="outlined"
                                        value={product.discount}
                                        error={product.discount > 99}
                                        helperText={
                                            product.discount > 99
                                                ? "Giảm giá không được vượt quá 99%"
                                                : ""
                                        }
                                        inputProps={{ min: 0, max: 100 }}
                                        onChange={(e) => {
                                            const value = Number(e.target.value);
                                            if (value >= 0 && value <= 100) {
                                                setProduct({ ...product, discount: value });
                                            }
                                        }}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: 2,
                                            },
                                        }}
                                    />
                                </Box>
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
                                                                    removeclassifyValue(
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
                                    background:
                                        "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                    color: "white",
                                }}
                            >
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                                        <PhotoCamera />
                                    </Avatar>
                                    <Typography variant="h6" fontWeight="bold">
                                        Chi tiết sản phẩm
                                    </Typography>
                                </Stack>
                            </Box>
                            <Box sx={{ overflow: "auto" }}>
                                <Table sx={{ minWidth: 800 }}>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: "grey.50" }}>
                                            <TableCell sx={{ fontWeight: "bold" }}>
                                                Phân loại
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: "bold" }}>
                                                Giá (VNĐ)
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: "bold" }}>
                                                Cân nặng (g)
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: "bold" }}>
                                                Số lượng
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: "bold" }}>
                                                Hết hàng
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: "bold" }}>
                                                Ảnh sản phẩm
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {listProductDetail.map((productDetail, index) => (
                                            <TableRow key={index} hover>
                                                <TableCell>
                                                    <Chip
                                                        label={classyfyText(productDetail)}
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
                                                            const newList = [...listProductDetail];
                                                            const newPrice = Number(e.target.value);
                                                            newList[index].price = newPrice;
                                                            setListProductDetail(newList);
                                                        }}
                                                        onBlur={() =>
                                                            validatePrice(productDetail.price, index)
                                                        }
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
                                                        inputProps={{ min: 0, max: 999 }}
                                                        onChange={(e) => {
                                                            const newList = [...listProductDetail];
                                                            const newWeight = Number(e.target.value);
                                                            if (newWeight <= 999) {
                                                                newList[index].weight = newWeight;
                                                                setListProductDetail(newList);
                                                            }
                                                        }}
                                                        onBlur={() =>
                                                            validateWeight(productDetail.weight, index)
                                                        }
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
                                                        inputProps={{ min: 0, max: 999 }}
                                                        onChange={(e) => {
                                                            const newList = [...listProductDetail];
                                                            const newQuantity = Number(e.target.value);
                                                            if (newQuantity <= 999) {
                                                                newList[index].quantity = newQuantity;
                                                                setListProductDetail(newList);
                                                            }
                                                        }}
                                                        onBlur={() =>
                                                            validateQuantity(productDetail.quantity, index)
                                                        }
                                                        sx={{
                                                            "& .MuiOutlinedInput-root": { borderRadius: 2 },
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={productDetail.isOutOfStock}
                                                        onChange={(e) => {
                                                            const newList = [...listProductDetail];
                                                            newList[index].isOutOfStock = e.target.checked;
                                                            setListProductDetail(newList);
                                                        }}
                                                        color="primary"
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
                                                                Tải ảnh
                                                                <input
                                                                    hidden
                                                                    accept="image/*"
                                                                    type="file"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) {
                                                                            // Reset input value để có thể chọn lại cùng file
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

                    {/* Create Product Button */}
                    {listProductDetail.length > 0 && (
                        <Stack direction="row" justifyContent="flex-end" spacing={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={CreateProductAsync}
                                size="large"
                                sx={{
                                    borderRadius: 3,
                                    px: 6,
                                    py: 2,
                                    boxShadow: 4,
                                    background:
                                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    "&:hover": {
                                        boxShadow: 6,
                                    },
                                }}
                            >
                                Tạo sản phẩm
                            </Button>
                        </Stack>
                    )}
                </Stack>
            </Container>
        </Box>
    );
}