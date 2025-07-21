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
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { v4 } from "uuid";
import axiosClient from "../../api/base.api";
import type { Category } from "../../types/storeData";
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

// Interface dòng sản phẩm được sinh ra

// Main component
export default function CreateProduct() {
  useEffect(() => {
    axiosClient
      .get("api/Category/categories")
      .then((res) => {
        const templist: Category[] = res.data.data || [];
        setListCategory(templist);
      })
      .catch((err) => console.error(err));
  }, []);

  const { storeId } = useParams<{ storeId: string }>();

  const navigate = useNavigate();

  const [listCategory, setListCategory] = useState<Category[]>([]);

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

  const CreateProductAsync = async () => {
    const tempProduct: ProductInput = {
      ...product,
      productDetails: listProductDetail,
    };
    await axiosClient.post("api/Product", tempProduct).then((res) => {
      if (res.status === 200) {
        navigate("productPage");
      }
    });
  };

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
              error={product.discount > 99}
              helperText={
                product.discount > 99 ? "Giảm giá không được vượt quá 99%" : ""
              }
              inputProps={{ min: 0, max: 100 }}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= 0 && value <= 100) {
                  setProduct({ ...product, discount: value });
                }
              }}
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
                  onChange={(e) =>
                    updateClassifyKey(classifiesIndex, e.target.value)
                  }
                />
                <IconButton
                  color="error"
                  onClick={() => removeClassify(classifiesIndex)}
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
                      value={classifyValue}
                      required
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
                      onClick={() =>
                        removeclassifyValue(classifiesIndex, valueIndex)
                      }
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

          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={addClassifies}
          >
            Thêm thông tin phân loại
          </Button>
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
                <TableCell>Số lượng</TableCell>
                <TableCell>Hết hàng</TableCell>
                <TableCell>Ảnh sản phẩm</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listProductDetail.map((productDetail, index) => (
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
                    <TextField
                      size="small"
                      type="number"
                      value={productDetail.quantity}
                      onChange={(e) => {
                        const newList = [...listProductDetail];
                        newList[index].quantity = Number(e.target.value);
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
        onClick={CreateProductAsync}
        sx={{ alignSelf: "flex-end" }}
      >
        Tạo sản phẩm
      </Button>
    </Box>
  );
}
