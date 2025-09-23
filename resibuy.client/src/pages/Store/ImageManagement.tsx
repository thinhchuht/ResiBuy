import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  IconButton,
  Typography,
} from "@mui/material";
import { Delete, Upload } from "@mui/icons-material";
import cloudinaryApi from "../../api/cloudinary.api";
import imageApi from "../../api/image.api";
import { useToastify } from "../../hooks/useToastify";

interface Image {
  id: string;
  url: string;
  thumbUrl: string;
  name: string;
  productDetail?: {
    id: number;
    productId: number;
    productName: string;
  } | null;
}

const ImageManagement: React.FC = () => {
  const toast = useToastify();
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tải danh sách ảnh khi component được mount
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await imageApi.getAll(); // Giả định API trả về dữ liệu như mẫu
        setImages(response.data || []);
      } catch (err) {
        console.error("Lỗi khi tải danh sách ảnh:", err);
        toast.error("Lỗi khi tải danh sách ảnh!");
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  // Xử lý upload ảnh
  const handleUpload = async (files: File[]) => {
    if (!files.length) {
      toast.error("Vui lòng chọn ít nhất một ảnh");
      return;
    }

    setUploading(true);
    try {
      let uploadedImages: Image[] = [];
      if (files.length === 1) {
        // Upload một ảnh
        console.log("Uploading image to Cloudinary...");
        const response = await cloudinaryApi.upload(files[0]);
        console.log("cloudinaryApi.upload response:", response.data);
        const uploadedImage = {
          id: response.data.id,
          url: response.data.url,
          thumbUrl: response.data.thumbnailUrl || "",
          name: response.data.name || "",
        };
        if (!uploadedImage.id || !uploadedImage.url) {
          throw new Error("Upload hình ảnh thất bại");
        }
        uploadedImages = [uploadedImage];
      } else {
        // Upload nhiều ảnh
        console.log("Uploading multiple images to Cloudinary...");
        const response = await cloudinaryApi.uploadBatch(files);
        console.log("cloudinaryApi.uploadBatch response:", response.data);
        uploadedImages = response.data.map((item: any) => ({
          id: item.id,
          url: item.url,
          thumbUrl: item.thumbnailUrl || "",
          name: item.name || "",
        }));
      }

      // Lưu các ảnh vào cơ sở dữ liệu qua imageApi
      const createPromises = uploadedImages.map((image) =>
        imageApi.create({
          id: image.id,
          url: image.url,
          thumbUrl: image.thumbUrl,
          name: image.name,
        })
      );
      await Promise.all(createPromises);
      toast.success(`Tải lên ${files.length} ảnh thành công`);

      // Cập nhật danh sách ảnh
      const response = await imageApi.getAll();
      setImages(response.data || []);
    } catch (err: any) {
      console.error("Lỗi khi tải lên ảnh:", err);
      toast.error(err.message || "Tải lên ảnh thất bại");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset input file
      }
    }
  };

  // Xử lý xóa ảnh
  const handleDelete = async (image: Image) => {
    if (image.productDetail) {
      toast.error("Không thể xóa ảnh đang liên kết với sản phẩm");
      return;
    }

    try {
      // Xóa ảnh trên Cloudinary
     
      // Xóa ảnh khỏi cơ sở dữ liệu
      await imageApi.delete(image.id);
      // Cập nhật danh sách ảnh
      setImages((prev) => prev.filter((img) => img.id !== image.id));
      toast.success("Xóa ảnh thành công");
    } catch (err: any) {
      console.error("Lỗi khi xóa ảnh:", err);
      toast.error(err.message || "Xóa ảnh thất bại");
    }
  };

  return (
    <Box p={3} bgcolor="#f5f6fa" minHeight="100vh">
      <Typography variant="h5" gutterBottom fontWeight={700}>
        Quản lý ảnh
      </Typography>

      <Box mb={3}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Upload />}
          component="label"
          disabled={uploading}
          sx={{ mb: 2 }}
        >
          {uploading ? <CircularProgress size={20} /> : "Tải lên ảnh"}
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            ref={fileInputRef}
            onChange={(e) => handleUpload(Array.from(e.target.files || []))}
          />
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : images.length === 0 ? (
        <Typography>Không có ảnh nào</Typography>
      ) : (
        <Box display="flex" flexWrap="wrap" gap={2}>
          {images.map((image) => (
            <Box
              key={image.id}
              sx={{
                width: "16.666%",
                minWidth: 200,
                flexGrow: 0,
                flexShrink: 0,
              }}
            >
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <Box
                  component="img"
                  src={image.thumbUrl}
                  alt={image.name}
                  sx={{
                    width: "100%",
                    height: 150,
                    objectFit: "cover",
                    borderRadius: "4px 4px 0 0",
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight="bold">
                    {image.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID: {image.id}
                  </Typography>
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                    sx={{ wordBreak: "break-all" }}
                  >
                    URL: {image.url}

                  </Typography>
                  <Typography
                    variant="caption"
                    display="block"
                    color="text.secondary"
                    sx={{ wordBreak: "break-all" }}
                  >
                    Thumb URL: {image.thumbUrl}
                  </Typography>
                  {image.productDetail ? (
                    <Typography variant="caption" color="text.secondary">
                      Sản phẩm: {image.productDetail.productName} (ID: {image.productDetail.productId})
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="error">
                      Không liên kết sản phẩm
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  {!image.productDetail && (
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(image)}
                      disabled={uploading}
                    >
                      <Delete />
                    </IconButton>
                  )}
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ImageManagement;