import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useHub } from "../../contexts/HubContext";
import { useEventHub, HubEventType } from "../../hooks/useEventHub";
import type { UserCreatedData, OrderData, PaymentData } from "../../types/hubData";
import axios from "axios";
import { Box, Container, Typography, Paper, TextField, Button, Stack, Card, CardContent, CardMedia, Divider, CircularProgress, Alert, Link } from "@mui/material";
import { styled } from "@mui/material/styles";

type EventData = UserCreatedData | OrderData | PaymentData;

interface EventWithType {
  data: EventData;
  type: HubEventType;
  timestamp: string;
}

interface CloudinaryResult {
  url: string;
  id: string;
  thumbnailUrl: string;
  name: string;
}

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const TestHub: React.FC = () => {
  const { user } = useAuth();
  const { isConnected } = useHub();
  const [events, setEvents] = useState<EventWithType[]>([]);
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    orderId: "",
    orderInfo: "",
  });
  const [cloudinaryFile, setCloudinaryFile] = useState<File | null>(null);
  const [cloudinaryPreview, setCloudinaryPreview] = useState<string | null>(null);
  const [cloudinaryResult, setCloudinaryResult] = useState<CloudinaryResult | null>(null);
  const [isCloudinaryUploading, setIsCloudinaryUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [cloudinaryBatchFiles, setCloudinaryBatchFiles] = useState<File[]>([]);
  const [cloudinaryBatchResults, setCloudinaryBatchResults] = useState<CloudinaryResult[] | null>(null);
  const [isBatchUploading, setIsBatchUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Đăng ký lắng nghe tất cả các events
  useEventHub({
    [HubEventType.UserCreated]: (data) => {
      console.log("UserCreated event received:", data);
      setEvents((prev) => [
        {
          data,
          type: HubEventType.UserCreated,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    [HubEventType.OrderStatusChanged]: (data) => {
      console.log("OrderStatusChanged event received:", data);
      setEvents((prev) => [
        {
          data,
          type: HubEventType.OrderStatusChanged,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    [HubEventType.PaymentReceived]: (data) => {
      console.log("PaymentReceived event received:", data);
      setEvents((prev) => [
        {
          data,
          type: HubEventType.PaymentReceived,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
  });

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/vnpay/create-payment", {
        amount: parseFloat(paymentForm.amount),
        orderId: paymentForm.orderId,
        orderInfo: paymentForm.orderInfo,
      });
      setPaymentUrl(response.data.paymentUrl);
    } catch (error) {
      console.error("Error creating payment:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCloudinaryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCloudinaryFile(file);
      const preview = URL.createObjectURL(file);
      setCloudinaryPreview(preview);
    }
  };

  const handleCloudinaryUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloudinaryFile) return;

    setIsCloudinaryUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", cloudinaryFile);

      const response = await axios.post<CloudinaryResult>("http://localhost:5000/api/cloudinary/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setCloudinaryResult(response.data);
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
    } finally {
      setIsCloudinaryUploading(false);
    }
  };

  const handleCloudinaryUpdate = async () => {
    if (!cloudinaryFile || !cloudinaryResult?.id) return;

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("file", cloudinaryFile);
      formData.append("id", cloudinaryResult.id);
      const response = await axios.post<CloudinaryResult>(`http://localhost:5000/api/cloudinary/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setCloudinaryResult(response.data);
    } catch (error) {
      console.error("Error updating Cloudinary image:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBatchFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setCloudinaryBatchFiles(files);
    }
  };

  const handleUpdateImage = async (id: string, file: File) => {
    if (!id || !file) return;
    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("id", id);

      const response = await axios.post<CloudinaryResult>(`http://localhost:5000/api/cloudinary/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Update the image in the results with new URLs and cache-busting for thumbnail
      setCloudinaryBatchResults(
        (prev) =>
          prev?.map((img) => {
            if (img.id === id) {
              return {
                ...response.data,
                id: id, // Giữ nguyên ID cũ
                name: file.name, // Cập nhật tên file mới
                thumbnailUrl: response.data.thumbnailUrl + "?v=" + Date.now(), // cache bust
              };
            }
            return img;
          }) || null
      );
    } catch (error) {
      console.error("Error updating image:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await axios.delete(`http://localhost:5000/api/cloudinary/${id}`);
      setCloudinaryBatchResults((prev) => prev?.filter((img) => img.id !== id) || null);
    } catch (error) {
      console.error("Error deleting image:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBatchUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cloudinaryBatchFiles.length === 0) return;
    setIsBatchUploading(true);
    setCloudinaryBatchResults(null);
    try {
      const formData = new FormData();
      cloudinaryBatchFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await axios.post<CloudinaryResult[]>("http://localhost:5000/api/cloudinary/upload-batch", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCloudinaryBatchResults(response.data);
    } catch (error) {
      console.error("Batch upload error:", error);
      setCloudinaryBatchResults(null);
    } finally {
      setIsBatchUploading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Test Hub Events
      </Typography>

      {/* Connection Status */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Connection Status
        </Typography>
        <Alert severity={isConnected ? "success" : "error"}>{isConnected ? "Connected" : "Disconnected"}</Alert>
      </Paper>

      {/* Current User */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current User
        </Typography>
        <Card>
          <CardContent>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(user, null, 2)}</pre>
          </CardContent>
        </Card>
      </Paper>
      {/* VNPay Test Form */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test VNPay Payment
        </Typography>
        <Stack spacing={2} component="form" onSubmit={handlePaymentSubmit}>
          <TextField label="Amount (VND)" type="number" name="amount" value={paymentForm.amount} onChange={handleInputChange} required fullWidth />
          <TextField label="Order ID" name="orderId" value={paymentForm.orderId} onChange={handleInputChange} required fullWidth />
          <TextField label="Order Info" name="orderInfo" value={paymentForm.orderInfo} onChange={handleInputChange} required fullWidth />
          <Button type="submit" variant="contained" color="primary">
            Create Payment
          </Button>
        </Stack>

        {paymentUrl && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Payment URL
            </Typography>
            <Link href={paymentUrl} target="_blank" rel="noopener noreferrer">
              {paymentUrl}
            </Link>
          </Box>
        )}
      </Paper>

      {/* Cloudinary Test Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Cloudinary Upload
        </Typography>
        <Stack spacing={2}>
          <Button component="label" variant="contained" startIcon={<span>☁️</span>}>
            Select File for Cloudinary
            <VisuallyHiddenInput type="file" accept="image/*" onChange={handleCloudinaryFileChange} />
          </Button>

          {cloudinaryPreview && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                File Preview
              </Typography>
              <Card>
                <CardMedia component="img" image={cloudinaryPreview} alt="Preview" sx={{ maxHeight: 300, objectFit: "contain" }} />
              </Card>
            </Box>
          )}

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCloudinaryUpload}
              disabled={!cloudinaryFile || isCloudinaryUploading}
              startIcon={isCloudinaryUploading ? <CircularProgress size={20} /> : null}>
              {isCloudinaryUploading ? "Uploading..." : "Upload to Cloudinary"}
            </Button>

            {cloudinaryResult && (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleCloudinaryUpdate}
                disabled={!cloudinaryFile || isUpdating}
                startIcon={isUpdating ? <CircularProgress size={20} /> : null}>
                {isUpdating ? "Updating..." : "Update Image"}
              </Button>
            )}
          </Stack>

          {cloudinaryResult && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Upload Result
              </Typography>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Original Filename: {cloudinaryResult.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Public ID: {cloudinaryResult.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Thumbnail URL: {cloudinaryResult.thumbnailUrl}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    URL: {cloudinaryResult.url}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Thumbnail
                      </Typography>
                      <CardMedia component="img" image={cloudinaryResult.thumbnailUrl} alt="Thumbnail" sx={{ maxHeight: 200, objectFit: "contain" }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Full Size
                      </Typography>
                      <CardMedia component="img" image={cloudinaryResult.url} alt="Full size" sx={{ maxHeight: 200, objectFit: "contain" }} />
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Link href={cloudinaryResult.url} target="_blank" rel="noopener noreferrer">
                      View Full Size
                    </Link>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </Stack>
      </Paper>

      {/* Cloudinary Batch Upload Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Cloudinary Batch Upload
        </Typography>
        <Stack spacing={2} component="form" onSubmit={handleBatchUpload}>
          <Button component="label" variant="contained" startIcon={<span>☁️</span>}>
            Select Files for Batch Upload
            <VisuallyHiddenInput type="file" accept="image/*" multiple onChange={handleBatchFileChange} />
          </Button>

          {cloudinaryBatchFiles.length > 0 && (
            <Box>
              <Typography variant="subtitle1">New Files</Typography>
              <Stack spacing={1}>
                {cloudinaryBatchFiles.map((file) => (
                  <Paper key={file.name} sx={{ p: 1, mb: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography variant="body2" sx={{ minWidth: 120 }}>
                        {file.name}
                      </Typography>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Box>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={cloudinaryBatchFiles.length === 0 || isBatchUploading}
            startIcon={isBatchUploading ? <CircularProgress size={20} /> : null}>
            {isBatchUploading ? "Uploading..." : "Upload"}
          </Button>

          {cloudinaryBatchResults && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1">Upload Results</Typography>
              <Stack spacing={2}>
                {cloudinaryBatchResults.map((result) => (
                  <Card key={result.id}>
                    <CardContent>
                      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                        <Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Original Filename: {result.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Public ID: {result.id}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Button component="label" variant="outlined" color="primary" size="small" disabled={isUpdating || isDeleting}>
                            Update
                            <VisuallyHiddenInput
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  handleUpdateImage(result.id, e.target.files[0]);
                                }
                              }}
                            />
                          </Button>
                          <Button variant="outlined" color="error" size="small" onClick={() => handleDeleteImage(result.id)} disabled={isDeleting || isUpdating}>
                            {isDeleting ? "Deleting..." : "Delete"}
                          </Button>
                        </Stack>
                      </Stack>
                      <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Thumbnail
                          </Typography>
                          <CardMedia component="img" image={result.thumbnailUrl} alt="Thumbnail" sx={{ maxHeight: 100, objectFit: "contain" }} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Full Size
                          </Typography>
                          <CardMedia component="img" image={result.url} alt="Full size" sx={{ maxHeight: 100, objectFit: "contain" }} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </Paper>

      {/* Events Section */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Events
        </Typography>
        <Stack spacing={2}>
          {events.map((event, index) => (
            <Card key={index}>
              <CardContent>
                <Typography variant="subtitle1" color="primary">
                  Event Type: {event.type}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(event.timestamp).toLocaleString()}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(event.data, null, 2)}</pre>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Paper>
    </Container>
  );
};

export default TestHub;
