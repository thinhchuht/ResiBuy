import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
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
} from "@mui/material";
import { v4 } from "uuid";
import axiosClient from "../../api/base.api";
import type { Category } from "../../types/storeData";
import { useNavigate, useParams } from "react-router-dom";
import { Add, Delete } from "@mui/icons-material";

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
  isOutOfStock: boolean;
  image: Image;
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
// Interface dòng sản phẩm được sinh ra

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

// Main component
export default function CreateProduct() {
  const { id } = useParams<{ id: string }>();
  const { storeId } = useParams<{ storeId: string }>();
  useEffect(() => {
    // lấy category
    axiosClient
      .get("api/Category/categories")
      .then((res) => {
        setListCategory(res.data.data || []);
      })
      .catch((err) => console.error(err));
  }, []); // chỉ chạy 1 lần

  useEffect(() => {
    if (!id) return;

    // set mặc định storeId
    setProduct((prev) => ({
      ...prev,
      storeId: storeId || "",
    }));

    // lấy product
    axiosClient
      .get(`api/Product/${id}`)
      .then((res) => {
        if (res.status === 200) {
          const productData = res.data.data;
          setProduct(productData);

          const tempProductDetails: ProductDetailInput[] =
            productData.productDetails || [];
          setListProductDetail(tempProductDetails);
          // Chuyển đổi classify từ productDetails
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
      })
      .catch((err) => console.error(err));
  }, [id]); // chạy lại khi id thay đổi

  const navigate = useNavigate();

  const [listCategory, setListCategory] = useState<Category[]>([]);

  const [newProductDetails, setNewProductDetails] = useState<
    ProductDetailInput[]
  >([]);

  const [product, setProduct] = useState<ProductInput>({
    name: "",
    describe: "",
    discount: 0,
    storeId: "",
    categoryId: "",
    productDetails: [],
  });
  const [listProductDetail, setListProductDetail] = useState<
    ProductDetailInput[]
  >([]);

  const updateProductAsync = async () => {
    const tempProduct: ProductInput = {
      ...product,
      productDetails: listProductDetail.concat(newProductDetails),
    };
    await axiosClient.put("api/Product", tempProduct).then((res) => {
      if (res.status === 200) {
        navigate(`/store/${storeId}/productPage`);
      }
    });
  };

  const [classifies, setClassifies] = useState<Classify[]>([]);

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
                vi === valueIndex ? { ...val, text: newValue } : val
              ),
            }
          : item
      )
    );

  const addClassifyValue = (classifyIndex: number) =>
    setClassifies((prev) =>
      prev.map((item, i) =>
        i === classifyIndex
          ? { ...item, value: [...item.value, { text: "", isEdit: true }] }
          : item
      )
    );

  // HÀM sinh tổ hợp các thuộc tính
  const generateProductDetail = () => {
    if (classifies.length === 0) {
      alert("Vui lòng nhập thông tin phân loại");
      return;
    }

    // Bước 1: Sinh tổ hợp tất cả TempAdditionalData (không lọc isEdit)
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

    // Bước 2: Lọc bỏ tổ hợp mà tất cả value đều có isEdit = false
    const filteredCombinations = combinations.filter((combo) =>
      combo.some((item) => item.value.isEdit)
    );

    // Bước 3: Chuyển sang AdditionalDataInput[][]
    const finalList: AdditionalDataInput[][] = filteredCombinations.map(
      (combo) =>
        combo.map((item) => ({
          key: item.key,
          value: item.value.text,
        }))
    );

    console.log("Tổ hợp cuối cùng:", finalList);
    addToProductDetail(finalList);
  };

  const addToProductDetail = (listAdditionalData: AdditionalDataInput[][]) => {
    const newDetails: ProductDetailInput[] = listAdditionalData.map((data) => ({
      price: 0,
      weight: 0,
      isOutOfStock: false,
      image: { id: "", url: "", thumbUrl: "", name: "" },
      additionalData: data,
    }));
    setNewProductDetails(newDetails);
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
    const formData = new FormData();
    const id = v4();
    formData.append("id", id);
    // Append file:
    formData.append("file", file); // file binary
    // Gửi API:
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
  }

  return (
    <Box p={2} display="flex" flexDirection="column" gap={2}>
      <Card>
        <CardContent>
          <Typography variant="h6">Thông tin sản phẩm</Typography>
          <Box mt={1} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Tên sản phẩm"
              fullWidth
              required
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
            />
            <TextField
              label="Mô tả"
              fullWidth
              multiline
              value={product.describe}
              onChange={(e) =>
                setProduct({ ...product, describe: e.target.value })
              }
            />
            <TextField
              label="Discount (%)"
              type="number"
              value={product.discount}
              onChange={(e) =>
                setProduct({ ...product, discount: Number(e.target.value) })
              }
            />
            <TextField
              select
              label="Category"
              fullWidth
              value={product.categoryId || ""}
              onChange={(e) =>
                setProduct({ ...product, categoryId: e.target.value })
              }
            >
              {listCategory.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Phân loại sản phẩm</Typography>
          {classifies.map((data, classifiesIndex) => (
            <Box
              key={classifiesIndex}
              mt={2}
              p={2}
              border="1px solid #ccc"
              borderRadius={2}
              display="flex"
              flexDirection="column"
              gap={2}
            >
              <Box display="flex" gap={2} alignItems="center">
                <TextField
                  label={`Phân loại ${classifiesIndex + 1}`}
                  value={data.key}
                  required
                  onChange={(e) => {
                    const oldKey = data.key;
                    const newKey = e.target.value;
                    updateClassifyKey(classifiesIndex, newKey);
                    // Update additionalData keys in listProductDetail
                    if (!data.isEdit) {
                      setListProductDetail((prev) =>
                        prev.map((detail) => ({
                          ...detail,
                          additionalData: detail.additionalData.map(
                            (additionalData) =>
                              additionalData.key === oldKey
                                ? { ...additionalData, key: newKey }
                                : additionalData
                          ),
                        }))
                      );
                    }
                  }}
                />
                <IconButton
                  color="error"
                  onClick={() => removeClassify(classifiesIndex)}
                  disabled={!data.isEdit}
                >
                  <Delete />
                </IconButton>
              </Box>
              <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
                {data.value.map((classifyValue, valueIndex) => (
                  <Box
                    key={valueIndex}
                    display="flex"
                    gap={2}
                    alignItems="center"
                  >
                    <TextField
                      label="Thuộc tính"
                      value={classifyValue.text}
                      required
                      onChange={(e) => {
                        updateClassifyValue(
                          classifiesIndex,
                          valueIndex,
                          e.target.value
                        );
                        if (!data.isEdit) {
                          setListProductDetail((prev) =>
                            prev.map((detail) => ({
                              ...detail,
                              additionalData: detail.additionalData.map(
                                (additionalData) =>
                                  additionalData.key === data.key
                                    ? {
                                        ...additionalData,
                                        value:
                                          additionalData.value ===
                                          classifyValue.text
                                            ? e.target.value
                                            : additionalData.value,
                                      }
                                    : additionalData
                              ),
                            }))
                          );
                        }
                      }}
                    />
                    <IconButton
                      color="error"
                      onClick={() =>
                        removeclassifyValue(classifiesIndex, valueIndex)
                      }
                      disabled={!data.isEdit}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
                <Box flexBasis="25%">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    onClick={() => addClassifyValue(classifiesIndex)}
                  >
                    Thêm thuộc tính
                  </Button>
                </Box>
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
      <Button
        variant="contained"
        color="primary"
        onClick={generateProductDetail}
        sx={{ alignSelf: "flex-end" }}
      >
        Xác nhận
      </Button>

      {/* Render bảng */}
      {listProductDetail.length > 0 && (
        <Card>
          <Table sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                <TableCell>Phân loại</TableCell>
                <TableCell>Giá</TableCell>
                <TableCell>Cân nặng</TableCell>
                <TableCell>Hết hàng</TableCell>
                <TableCell>Ảnh sản phẩm</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listProductDetail.map((productDetail, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {productDetail.additionalData.map((data) => {
                      if (data.key && data.value) {
                        return (
                          <Typography key={data.key}>
                            {data.key}: {data.value}
                          </Typography>
                        );
                      }
                      return null;
                    })}
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={productDetail.price}
                      onChange={(e) => {
                        const newList = [...listProductDetail];
                        newList[index].price = Number(e.target.value);
                        setListProductDetail(newList);
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
                    {/* Nút tải ảnh */}
                    <Button variant="outlined" component="label" size="small">
                      Tải ảnh
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

                    {/* Hiển thị ảnh nếu có */}
                    {productDetail.image?.thumbUrl ? (
                      <Box mt={1}>
                        <img
                          src={productDetail.image.thumbUrl}
                          alt="Ảnh sản phẩm"
                          style={{
                            width: 64,
                            height: 64,
                            objectFit: "cover",
                            borderRadius: 4,
                          }}
                        />
                      </Box>
                    ) : (
                      <Typography mt={1} variant="body2" color="textSecondary">
                        Chưa có ảnh
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {newProductDetails.map((productDetail, index) => (
                <TableRow key={index}>
                  <TableCell>{classyfyText(productDetail)}</TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={productDetail.price}
                      onChange={(e) => {
                        const newList = [...listProductDetail];
                        newList[index].price = Number(e.target.value);
                        setListProductDetail(newList);
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
                    {/* Nút tải ảnh */}
                    <Button variant="outlined" component="label" size="small">
                      Tải ảnh
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

                    {/* Hiển thị ảnh nếu có */}
                    {productDetail.image?.thumbUrl ? (
                      <Box mt={1}>
                        <img
                          src={productDetail.image.thumbUrl}
                          alt="Ảnh sản phẩm"
                          style={{
                            width: 64,
                            height: 64,
                            objectFit: "cover",
                            borderRadius: 4,
                          }}
                        />
                      </Box>
                    ) : (
                      <Typography mt={1} variant="body2" color="textSecondary">
                        Chưa có ảnh
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={updateProductAsync}
        sx={{ alignSelf: "flex-end" }}
      >
        Update
      </Button>
    </Box>
  );
}
