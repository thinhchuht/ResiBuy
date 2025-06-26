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
} from "@mui/material";
import { v4 } from "uuid";
import axiosClient from "../../api/base.api";
import type { Category } from "../../types/storeData";
import { useNavigate, useParams } from "react-router-dom";

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

// Main component
export default function CreateProduct() {
  const { id } = useParams<{ id: string }>();
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
      storeId: "b73f0821-21d6-4fa7-b61c-9b476977466c",
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

          // lấy danh sách key classify
          const tempKeys =
            tempProductDetails[0]?.additionalData?.map((data) => data.key) ||
            [];
          setClassify(tempKeys);
        }
      })
      .catch((err) => console.error(err));
  }, [id]); // chạy lại khi id thay đổi

  const navigate = useNavigate();

  const [classify, setClassify] = useState<string[]>([]);

  const [listCategory, setListCategory] = useState<Category[]>([]);

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

  const updateProductAsync = async () => {
    const tempProduct: ProductInput = {
      ...product,
      productDetails: listProductDetail,
    };
    await axiosClient.put("api/Product", tempProduct).then((res) => {
      if (res.status === 200) {
        navigate("/store/products");
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
      {/* Render bảng */}
      {listProductDetail.length > 0 && (
        <Card>
          <Table sx={{ mt: 2 }}>
            <TableHead>
              <TableRow>
                {classify.map((key) => (
                  <TableCell>{key}</TableCell>
                ))}
                <TableCell>Giá</TableCell>
                <TableCell>Cân nặng</TableCell>
                <TableCell>Hết hàng</TableCell>
                <TableCell>Ảnh sản phẩm</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listProductDetail.map((productDetail, index) => (
                <TableRow key={index}>
                  {classify.map((keyName) => {
                    // tìm giá trị value hiện tại
                    const additionalDataItem =
                      productDetail.additionalData.find(
                        (d) => d.key === keyName
                      );

                    return (
                      <TableCell key={keyName}>
                        <TextField
                          size="small"
                          type="text"
                          value={additionalDataItem?.value || ""}
                          onChange={(e) => {
                            const newList = [...listProductDetail];
                            newList[index].additionalData = newList[
                              index
                            ].additionalData.map((d) =>
                              d.key === keyName
                                ? { ...d, value: e.target.value }
                                : d
                            );

                            setListProductDetail(newList); // cập nhật state
                          }}
                        />
                      </TableCell>
                    );
                  })}
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
