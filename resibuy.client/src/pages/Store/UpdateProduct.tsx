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
} from "@mui/icons-material";
import { v4 } from "uuid";
import axiosClient from "../../api/base.api";
import type { CategoryDto } from "../../types/storeData";
import { useNavigate, useParams } from "react-router-dom";
import {useToastify} from "../../hooks/useToastify.ts";

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
}

interface ProductInput {
  id?: number;
  name: string;
  describe: string;
  discount: number;
  storeId: string;
  categoryId: string;
  productDetails: ProductDetailInput[];
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

export default function UpdateProduct() {
  const { productId, storeId } = useParams<{
    productId: string;
    storeId: string;
  }>();
  const navigate = useNavigate();

  // State management
  const [listCategory, setListCategory] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [updating, setUpdating] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<{
    [key: number]: boolean;
  }>({});
  const [priceErrors, setPriceErrors] = useState<{ [key: number]: string }>({});

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
  const [newProductDetails, setNewProductDetails] = useState<
    ProductDetailInput[]
  >([]);
  const [classifies, setClassifies] = useState<Classify[]>([]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        // Load categories
        const categoriesRes = await axiosClient.get("api/Category/categories");
        setListCategory(categoriesRes.data.data || []);

        // Load product data if editing
        if (productId) {
          const productRes = await axiosClient.get(`api/Product/${productId}`);
          if (productRes.status === 200) {
            const productData = productRes.data.data;
            setProduct({
              ...productData,
              storeId: storeId || productData.storeId,
            });

            const tempProductDetails: ProductDetailInput[] =
              productData.productDetails || [];
            setListProductDetail(tempProductDetails);

            // Convert classify from productDetails
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
                  isEdit: false,
                })),
                isEdit: false,
              })
            );

            setClassifies(newClassifies);
          }
        } else {
          // Set default storeId for new product
          setProduct((prev) => ({
            ...prev,
            storeId: storeId || "",
          }));
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [productId, storeId]);
  const { error: showError, success:showSuccess } = useToastify();
  // Classification management functions
  const addClassifies = () =>
    setClassifies((prev) => [...prev, { key: "", value: [], isEdit: true }]);

  const removeClassify = (index: number) => {
    const classify = classifies[index];
    if (!classify.isEdit) {
      // Remove from existing product details
      setListProductDetail((prev) =>
        prev.filter(
          (detail) =>
            !detail.additionalData.some((data) => data.key === classify.key)
        )
      );
    }
    setClassifies((prev) => prev.filter((_, i) => i !== index));
  };

  const removeClassifyValue = (classifyIndex: number, valueIndex: number) => {
    const classify = classifies[classifyIndex];
    const valueToRemove = classify.value[valueIndex];

    if (!valueToRemove.isEdit) {
      // Remove from existing product details
      setListProductDetail((prev) =>
        prev.filter(
          (detail) =>
            !detail.additionalData.some(
              (data) =>
                data.key === classify.key && data.value === valueToRemove.text
            )
        )
      );
    }

    setClassifies((prev) =>
      prev.map((item, idx) =>
        idx === classifyIndex
          ? { ...item, value: item.value.filter((_, vi) => vi !== valueIndex) }
          : item
      )
    );
  };

  const updateClassifyKey = (index: number, newKey: string) => {
    const oldKey = classifies[index].key;

    setClassifies((prev) =>
      prev.map((item, i) => (i === index ? { ...item, key: newKey } : item))
    );

    // Update existing product details if not editing
    if (!classifies[index].isEdit) {
      setListProductDetail((prev) =>
        prev.map((detail) => ({
          ...detail,
          additionalData: detail.additionalData.map((additionalData) =>
            additionalData.key === oldKey
              ? { ...additionalData, key: newKey }
              : additionalData
          ),
        }))
      );
    }
  };

  const updateClassifyValue = (
    classifyIndex: number,
    valueIndex: number,
    newValue: string
  ) => {
    const classify = classifies[classifyIndex];
    const oldValue = classify.value[valueIndex].text;

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

    // Update existing product details if not editing
    if (!classify.value[valueIndex].isEdit) {
      setListProductDetail((prev) =>
        prev.map((detail) => ({
          ...detail,
          additionalData: detail.additionalData.map((additionalData) =>
            additionalData.key === classify.key &&
            additionalData.value === oldValue
              ? { ...additionalData, value: newValue }
              : additionalData
          ),
        }))
      );
    }
  };

  const addClassifyValue = (classifyIndex: number) =>
    setClassifies((prev) =>
      prev.map((item, i) =>
        i === classifyIndex
          ? { ...item, value: [...item.value, { text: "", isEdit: true }] }
          : item
      )
    );

  // Price validation
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

  // Generate product details from classifications
  const generateProductDetail = () => {
    if (classifies.length === 0) {
        showError("Vui lòng nhập thông tin phân loại");
      return;
    }

    // Generate combinations of all TempAdditionalData
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

    // Filter combinations that have at least one new value
    const filteredCombinations = combinations.filter((combo) =>
      combo.some((item) => item.value.isEdit)
    );

    // Convert to AdditionalDataInput[][]
    const finalList: AdditionalDataInput[][] = filteredCombinations.map(
      (combo) =>
        combo.map((item) => ({
          key: item.key,
          value: item.value.text,
        }))
    );

    // Create new product details
    const newDetails: ProductDetailInput[] = finalList.map((data) => ({
      price: 0,
      weight: 0,
      quantity: 0,
      isOutOfStock: false,
      image: { id: "", url: "", thumbUrl: "", name: "" },
      additionalData: data,
    }));

    setNewProductDetails(newDetails);
  };

  // Helper function to display classification text
  const classifyText = (productDetail: ProductDetailInput) => {
    return productDetail.additionalData
      .map((data) => `${data.key}: ${data.value}`)
      .join(", ");
  };

  // Image upload functions
  const uploadImg = async (
    file: File,
    index: number,
    isNewDetail: boolean = false
  ) => {
    const globalIndex = isNewDetail ? listProductDetail.length + index : index;
    setUploadingImages((prev) => ({ ...prev, [globalIndex]: true }));

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

        if (isNewDetail) {
          const newList = [...newProductDetails];
          newList[index].image = imageData;
          setNewProductDetails(newList);
        } else {
          const newList = [...listProductDetail];
          newList[index].image = imageData;
          setListProductDetail(newList);
        }
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      showError("Lỗi khi tải ảnh lên. Vui lòng thử lại!");
    } finally {
      setUploadingImages((prev) => ({ ...prev, [globalIndex]: false }));
    }
  };

  // Update product function
  const updateProductAsync = async () => {
    try {
      setUpdating(true);

      // Validation
      const allDetails = [...listProductDetail, ...newProductDetails];

      if (allDetails.length === 0) {
        showError("Sản phẩm phải có ít nhất một chi tiết sản phẩm.");
        return;
      }

      // Validate required fields
      if (!product.name.trim()) {
        showError("Vui lòng nhập tên sản phẩm.");
        return;
      }

      if (!product.categoryId) {
        showError("Vui lòng chọn danh mục sản phẩm.");
        return;
      }

      // Validate prices
      const hasErrors = Object.keys(priceErrors).length > 0;
      const hasInvalidPrices = allDetails.some((detail, index) => {
        if (detail.price <= 0 || detail.price % 500 !== 0) {
          validatePrice(detail.price, index);
          return true;
        }
        return false;
      });

      if (hasErrors || hasInvalidPrices) {
        showError(
          "Vui lòng kiểm tra lại giá sản phẩm. Tất cả giá phải là bội số của 500 và lớn hơn 0."
        );
        return;
      }

      // Validate images for new details
      const missingImages = newProductDetails.some(
        (detail) => !detail.image?.url || detail.image.url === ""
      );
      if (missingImages) {
        showError("Vui lòng tải ảnh cho tất cả các chi tiết sản phẩm mới.");
        return;
      }

      const tempProduct: ProductInput = {
        ...product,
        productDetails: listProductDetail.concat(newProductDetails),
      };

      const response = await axiosClient.put("api/Product", tempProduct);
      if (response.status === 200) {
        showSuccess("Cập nhật sản phẩm thành công!");
        navigate(`/store/${storeId}/productPage`);
      }
    } catch (error: any) {
      console.error("Error updating product:", error);
      showError(`Lỗi khi cập nhật sản phẩm: ${error.response.data.message}. Vui lòng thử lại!`);
    } finally {
      setUpdating(false);
    }
  };

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

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="outlined"
          onClick={() => navigate(`/store/${storeId}/productPage`)}
          sx={{ mt: 2 }}
        >
          Quay lại
        </Button>
      </Box>
    );
  }

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
              {productId ? "Cập nhật sản phẩm" : "Tạo sản phẩm mới"}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {productId
                ? "Chỉnh sửa thông tin chi tiết sản phẩm của bạn"
                : "Tạo sản phẩm mới cho cửa hàng"}
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
                    required
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
                                value={classifyValue.text}
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
                                  removeClassifyValue(
                                    classifiesIndex,
                                    valueIndex
                                  )
                                }
                                disabled={!classifyValue.isEdit}
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

          {/* Existing Product Details */}
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
                    Chi tiết sản phẩm hiện tại
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
                            onChange={(e) => {
                              const newList = [...listProductDetail];
                              newList[index].weight = Number(e.target.value);
                              setListProductDetail(newList);
                            }}
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
                            onChange={(e) => {
                              const newList = [...listProductDetail];
                              newList[index].quantity = Number(e.target.value);
                              setListProductDetail(newList);
                            }}
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
                                      uploadImg(file, index, false);
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

          {/* New Product Details Table */}
          {newProductDetails.length > 0 && (
            <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
              <Box
                sx={{
                  p: 3,
                  background:
                    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                  color: "white",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                    <PhotoCamera />
                  </Avatar>
                  <Typography variant="h6" fontWeight="bold">
                    Chi tiết sản phẩm mới
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
                    {newProductDetails.map((productDetail, index) => {
                      const globalIndex = listProductDetail.length + index;
                      return (
                        <TableRow
                          key={index}
                          hover
                          sx={{ bgcolor: "success.lighter" }}
                        >
                          <TableCell>
                            <Chip
                              label={classifyText(productDetail)}
                              variant="outlined"
                              size="small"
                              color="success"
                              sx={{ maxWidth: 200 }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={productDetail.price}
                              error={!!priceErrors[globalIndex]}
                              helperText={priceErrors[globalIndex]}
                              onChange={(e) => {
                                const newList = [...newProductDetails];
                                const newPrice = Number(e.target.value);
                                newList[index].price = newPrice;
                                setNewProductDetails(newList);
                              }}
                              onBlur={() =>
                                validatePrice(productDetail.price, globalIndex)
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
                              onChange={(e) => {
                                const newList = [...newProductDetails];
                                newList[index].weight = Number(e.target.value);
                                setNewProductDetails(newList);
                              }}
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
                              onChange={(e) => {
                                const newList = [...newProductDetails];
                                newList[index].quantity = Number(
                                  e.target.value
                                );
                                setNewProductDetails(newList);
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Checkbox
                              checked={productDetail.isOutOfStock}
                              onChange={(e) => {
                                const newList = [...newProductDetails];
                                newList[index].isOutOfStock = e.target.checked;
                                setNewProductDetails(newList);
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
                              {uploadingImages[globalIndex] ? (
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
                                        uploadImg(file, index, true);
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
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            </Paper>
          )}

          {/* Action Buttons */}
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
              {updating ? "Đang cập nhật..." : "Cập nhật sản phẩm"}
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
