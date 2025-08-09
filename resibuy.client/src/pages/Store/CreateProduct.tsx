import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
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
  Chip,
  Avatar,
  Divider,
  Container,
  Paper,
  Fade,
  Tooltip,
  Alert,
  LinearProgress,
} from "@mui/material";
import {
  Add,
  Delete,
  PhotoCamera,
  CheckCircle,
  Warning,
  Category,
  Inventory,
  LocalOffer,
  Description,
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
  const [isLoading, setIsLoading] = useState(false);

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
      setPriceErrors({});
      addToProductDetail(listAdditionalData);
    }
  };

  function classyfyText(productDetail: ProductDetailInput) {
    return productDetail.additionalData
      .map((data) => `${data.key}: ${data.value}`)
      .join(", ");
  }

  async function uploadImg(file: File, index: number) {
    setIsLoading(true);
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
        const newList = [...listProductDetail];
        newList[index].image = {
          id: data.id,
          thumbUrl: data.thumbnailUrl,
          url: data.url,
          name: data.name,
        };
        setListProductDetail(newList);
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const CreateProductAsync = async () => {
    if (listProductDetail.length === 0) {
      alert(
        "Vui lòng tạo ít nhất một chi tiết sản phẩm trước khi tạo sản phẩm."
      );
      return;
    }

    const missingImages = listProductDetail.some(
      (detail) => !detail.image?.url || detail.image.url === ""
    );
    if (missingImages) {
      alert("Vui lòng tải ảnh cho tất cả các chi tiết sản phẩm.");
      return;
    }

    const hasErrors = Object.keys(priceErrors).length > 0;
    const hasInvalidPrices = listProductDetail.some((detail, index) => {
      if (detail.price <= 0 || detail.price % 500 !== 0) {
        validatePrice(detail.price, index);
        return true;
      }
      return false;
    });

    if (hasErrors || hasInvalidPrices) {
      alert(
        "Vui lòng kiểm tra lại giá sản phẩm. Tất cả giá phải là bội số của 500 và lớn hơn 0."
      );
      return;
    }

    setIsLoading(true);
    try {
      const tempProduct: ProductInput = {
        ...product,
        productDetails: listProductDetail,
      };
      const res = await axiosClient.post("api/Product", tempProduct);
      if (res.status === 200) {
        navigate(`/store/${storeId}/productPage`);
      }
    } catch (error) {
      console.error("Create product failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      <Box display="flex" flexDirection="column" gap={4}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            borderRadius: 3,
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Tạo sản phẩm mới
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Điền thông tin chi tiết để tạo sản phẩm mới cho cửa hàng
          </Typography>
        </Paper>

        {/* Product Information */}
        <Fade in timeout={300}>
          <Card elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <Inventory />
                </Avatar>
                <Typography variant="h6" fontWeight="600">
                  Thông tin sản phẩm
                </Typography>
              </Box>

              <Box display="flex" flexDirection="column" gap={3}>
                {/* First Row - Name and Category */}
                <Box display="flex" gap={3} flexWrap="wrap">
                  <Box flex="1" minWidth="300px">
                    <TextField
                      label="Tên sản phẩm"
                      fullWidth
                      required
                      variant="outlined"
                      value={product.name}
                      onChange={(e) =>
                        setProduct({ ...product, name: e.target.value })
                      }
                      InputProps={{
                        startAdornment: (
                          <Description
                            sx={{ mr: 1, color: "text.secondary" }}
                          />
                        ),
                      }}
                    />
                  </Box>

                  <Box flex="1" minWidth="300px">
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
                      InputProps={{
                        startAdornment: (
                          <Category sx={{ mr: 1, color: "text.secondary" }} />
                        ),
                      }}
                    >
                      {listCategory.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Box>

                {/* Second Row - Description */}
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
                />

                {/* Third Row - Discount */}
                <Box display="flex" gap={3}>
                  <Box flex="0 0 300px">
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
                      InputProps={{
                        startAdornment: (
                          <LocalOffer sx={{ mr: 1, color: "text.secondary" }} />
                        ),
                      }}
                    />
                  </Box>
                  <Box flex="1"></Box> {/* Spacer */}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Fade>

        {/* Product Classification */}
        <Fade in timeout={600}>
          <Card elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
            <CardContent sx={{ p: 4 }}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                mb={3}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: "secondary.main" }}>
                    <Category />
                  </Avatar>
                  <Typography variant="h6" fontWeight="600">
                    Phân loại sản phẩm
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={addClassifies}
                  sx={{ borderRadius: 2 }}
                >
                  Thêm phân loại
                </Button>
              </Box>

              {classifies.length === 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Thêm phân loại để tạo các biến thể sản phẩm (ví dụ: Màu sắc,
                  Kích thước)
                </Alert>
              )}

              {classifies.map((data, classifiesIndex) => (
                <Paper
                  key={classifiesIndex}
                  elevation={1}
                  sx={{
                    p: 3,
                    mb: 2,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: 2,
                    },
                  }}
                >
                  <Box display="flex" gap={2} alignItems="center" mb={2}>
                    <TextField
                      label={`Tên phân loại ${classifiesIndex + 1}`}
                      value={data.key}
                      required
                      variant="outlined"
                      sx={{ flexGrow: 1 }}
                      onChange={(e) =>
                        updateClassifyKey(classifiesIndex, e.target.value)
                      }
                    />
                    <Tooltip title="Xóa phân loại">
                      <IconButton
                        color="error"
                        onClick={() => removeClassify(classifiesIndex)}
                        sx={{
                          bgcolor: "error.light",
                          color: "white",
                          "&:hover": { bgcolor: "error.main" },
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box
                    display="flex"
                    flexWrap="wrap"
                    gap={2}
                    alignItems="center"
                  >
                    {data.value.map((classifyValue, valueIndex) => (
                      <Paper
                        key={valueIndex}
                        elevation={0}
                        sx={{
                          p: 2,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                        }}
                      >
                        <TextField
                          label="Giá trị"
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
                        />
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() =>
                            removeclassifyValue(classifiesIndex, valueIndex)
                          }
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Paper>
                    ))}

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => addClassifyValue(classifiesIndex)}
                      sx={{ borderRadius: 2 }}
                    >
                      Thêm giá trị
                    </Button>
                  </Box>
                </Paper>
              ))}

              {classifies.length > 0 && (
                <Box display="flex" justifyContent="center" mt={3}>
                  <Button
                    variant="contained"
                    color="success"
                    size="large"
                    onClick={generateProductDetail}
                    startIcon={<CheckCircle />}
                    sx={{ borderRadius: 3, px: 4, py: 1.5 }}
                  >
                    Tạo biến thể sản phẩm
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Fade>

        {/* Product Details Table */}
        {listProductDetail.length > 0 && (
          <Fade in timeout={900}>
            <Card elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
              <CardContent sx={{ p: 0 }}>
                <Box p={3} pb={0}>
                  <Typography variant="h6" fontWeight="600" gutterBottom>
                    Chi tiết sản phẩm ({listProductDetail.length} biến thể)
                  </Typography>
                  <Divider />
                </Box>

                <Box sx={{ overflowX: "auto" }}>
                  <Table>
                    <TableHead sx={{ bgcolor: "grey.50" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Phân loại
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Giá (VNĐ)
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>
                          Cân nặng (g)
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Số lượng</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Hết hàng</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Hình ảnh</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {listProductDetail.map((productDetail, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            "&:hover": { bgcolor: "grey.50" },
                            "&:nth-of-type(odd)": { bgcolor: "grey.25" },
                          }}
                        >
                          <TableCell>
                            <Box display="flex" flexWrap="wrap" gap={0.5}>
                              {productDetail.additionalData.map((data, i) => (
                                <Chip
                                  key={i}
                                  label={`${data.key}: ${data.value}`}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              ))}
                            </Box>
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
                              inputProps={{ min: 0, step: 500 }}
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
                              inputProps={{ min: 0 }}
                            />
                          </TableCell>

                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={productDetail.quantity}
                              onChange={(e) => {
                                const newList = [...listProductDetail];
                                newList[index].quantity = Number(
                                  e.target.value
                                );
                                setListProductDetail(newList);
                              }}
                              inputProps={{ min: 0 }}
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
                              color={
                                productDetail.isOutOfStock ? "error" : "primary"
                              }
                            />
                          </TableCell>

                          <TableCell>
                            <Box
                              display="flex"
                              flexDirection="column"
                              alignItems="center"
                              gap={1}
                            >
                              <Button
                                variant={
                                  productDetail.image?.thumbUrl
                                    ? "outlined"
                                    : "contained"
                                }
                                component="label"
                                size="small"
                                startIcon={<PhotoCamera />}
                                sx={{ borderRadius: 2 }}
                                color={
                                  productDetail.image?.thumbUrl
                                    ? "primary"
                                    : "warning"
                                }
                              >
                                {productDetail.image?.thumbUrl
                                  ? "Đổi ảnh"
                                  : "Tải ảnh"}
                                <input
                                  hidden
                                  accept="image/*"
                                  type="file"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) uploadImg(file, index);
                                  }}
                                />
                              </Button>

                              {productDetail.image?.thumbUrl ? (
                                <Box
                                  component="img"
                                  src={productDetail.image.thumbUrl}
                                  alt="Ảnh sản phẩm"
                                  sx={{
                                    width: 64,
                                    height: 64,
                                    objectFit: "cover",
                                    borderRadius: 2,
                                    border: "2px solid",
                                    borderColor: "success.main",
                                  }}
                                />
                              ) : (
                                <Box
                                  sx={{
                                    width: 64,
                                    height: 64,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    bgcolor: "grey.100",
                                    borderRadius: 2,
                                    border: "2px dashed",
                                    borderColor: "grey.300",
                                  }}
                                >
                                  <PhotoCamera color="disabled" />
                                </Box>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        )}

        {/* Create Product Button */}
        {listProductDetail.length > 0 && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={CreateProductAsync}
              disabled={isLoading}
              startIcon={<CheckCircle />}
              sx={{
                borderRadius: 3,
                px: 6,
                py: 2,
                fontSize: "1.1rem",
                fontWeight: 600,
                boxShadow: 3,
                "&:hover": {
                  boxShadow: 6,
                  transform: "translateY(-2px)",
                },
              }}
            >
              {isLoading ? "Đang tạo sản phẩm..." : "Tạo sản phẩm"}
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}
