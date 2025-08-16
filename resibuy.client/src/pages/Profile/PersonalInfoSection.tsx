import { Avatar, Box, Button, Typography, CircularProgress } from "@mui/material";
import { Person } from "@mui/icons-material";
import { useState } from "react";
import userApi from "../../api/user.api";
import { useAuth } from "../../contexts/AuthContext";
import { useToastify } from "../../hooks/useToastify";
import cloudinaryApi from "../../api/cloudinary.api";
import type { Image } from "../../types/models";
import ConfirmCodeModal from "../../components/ConfirmCodeModal";

interface PersonalInfoSectionProps {
  isAdmin: boolean;
  formatDate: (dateStr: string | undefined) => string;
  maskMiddle: (str: string | undefined) => string;
}


const PersonalInfoSection = ({ isAdmin, formatDate, maskMiddle }: PersonalInfoSectionProps) => {
  const { user, setUser } = useAuth();
  console.log(user);
  const [avatar, setAvatar] = useState<Image | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToastify();
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [confirmCode, setConfirmCode] = useState("");
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (file.size > 2 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 2MB!");
        return;
      }

      if (!["image/jpeg", "image/png"].includes(file.type)) {
        toast.error("Chỉ chấp nhận file ảnh định dạng JPEG hoặc PNG!");
        return;
      }

      setIsUploading(true);
      try {
        const uploadRes = await cloudinaryApi.upload(file);
        const ava = uploadRes.data;
        if (ava) {
          setAvatar({ id: ava.id, url: ava.url, thumbUrl: ava.thumbnailUrl, name: ava.name });
        } else {
          toast.error("Không lấy được đường dẫn ảnh!");
        }
      } catch {
        // toast.error("Upload ảnh thất bại!");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!user || !avatar) return;

    const updatePayload = {
      avatar: avatar,
    };

    try {
      const response = await userApi.sendUpdateConfirmCode(user.id, updatePayload);
      if (response.data) {
        setOpenConfirmModal(true);
        toast.success("Mã xác nhận sẽ được gửi về mail của bạn!");
      }
    } catch {
      toast.error("Cập nhật thông tin thất bại!");
    }
  };

  const handleConfirmCodeSubmit = async () => {
    if (!user) return;
    if (confirmCode.length !== 6) {
      toast.error("Mã xác nhận phải gồm 6 ký tự!");
      return;
    }
    setIsSubmittingCode(true);
    try {
      const response = await userApi.updateUser(user.id, confirmCode.toUpperCase());
      if (response.data) {
        setUser(response.data);
        toast.success("Cập nhật thông tin thành công!");
        setOpenConfirmModal(false);
        setConfirmCode("");
      }
    } catch {
      toast.error("Mã xác nhận không đúng hoặc đã hết hạn!");
    } finally {
      setIsSubmittingCode(false);
    }
  };

  return (
    <Box>
      <Box sx={{ borderBottom: "1px solid #f8bbd0", mb: 3, pb: 1 }}>
        <Typography variant="h6" fontWeight={700} color="#e91e63" sx={{ textAlign: "left" }}>
          Thông tin cá nhân
        </Typography>
      </Box>
      <Box sx={{ display: { xs: "block", md: "flex" }, gap: 4 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
                    ID
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {user?.id || "-"}
                  </Typography>
                </Box>
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
                    Họ và tên
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {user?.fullName || "-"}
                  </Typography>
                </Box>
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
                    Email
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {user?.email || "-"}
                  </Typography>
                </Box>
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
                    Số điện thoại
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {maskMiddle(user?.phoneNumber) || "-"}
                  </Typography>
                </Box>
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
                    CCCD/CMND
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {maskMiddle(user?.identityNumber) || "-"}
                  </Typography>
                </Box>
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
                    Ngày sinh
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formatDate(user?.dateOfBirth) || "-"}
                  </Typography>
                </Box>
                {user?.rooms && user.rooms.length > 0 && (
                  <Box mb={3}>
                    <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
                      Địa chỉ
                    </Typography>
                    {user.rooms.map((room, index) => (
                      <Typography key={room.id} variant="body1" fontWeight={500}>
                        Phòng {index + 1} : {`${room.name} - ${room.buildingName} - ${room.areaName}`}
                      </Typography>
                    ))}
                  </Box>
                )}
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
                    Ngày tạo tài khoản
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formatDate(user?.createdAt)}
                  </Typography>
                </Box>
                <Box mb={3}>
                  <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
                    Ngày cập nhật
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formatDate(user?.updatedAt)}
                  </Typography>
                </Box>
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={isAdmin || !avatar}
                  sx={{
                    mt: 2,
                    px: 5,
                    py: 1.5,
                    fontWeight: 600,
                    borderRadius: 2,
                    backgroundColor: "#FF6B6B",
                    boxShadow: "0 3px 12px rgba(233, 30, 99, 0.3)",
                    "&:hover": {
                      backgroundColor: "#FF5C5C",
                      boxShadow: "0 6px 20px rgba(233, 30, 99, 0.4)",
                    },
                  }}>
                  Cập nhật ảnh đại diện
                </Button>
        </Box>
        <Box
          sx={{
            minWidth: 180,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            mt: { xs: 4, md: 0 },
          }}>
          <Avatar
            src={!isUploading ? avatar?.url ?? user?.avatar?.url ?? undefined : undefined}
            sx={{
              width: 140,
              height: 140,
              mb: 2,
              bgcolor: "#fce4ec",
              color: "#e91e63",
              fontSize: 64,
              border: "4px solid #fce4ec",
              boxShadow: "0 4px 12px rgba(233, 30, 99, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}>
            {isUploading ? <CircularProgress size={48} color="secondary" /> : !user?.avatar && <Person fontSize="inherit" />}
          </Avatar>
          <Button
            variant="outlined"
            component="label"
            disabled={isAdmin}
            sx={{
              mb: 1,
              borderRadius: 2,
              borderColor: "#e91e63",
              color: "#e91e63",
              "&:hover": {
                borderColor: "#c2185b",
                backgroundColor: "rgba(233, 30, 99, 0.04)",
              },
            }}>
            Chọn Ảnh
            <input hidden accept="image/jpeg,image/png" type="file" onChange={handleAvatarChange} />
          </Button>
          <Typography variant="caption" color="text.secondary" align="center">
            Dung lượng file tối đa 2 MB
            <br />
            Định dạng: JPEG, PNG
          </Typography>
        </Box>
        <ConfirmCodeModal
          open={openConfirmModal}
          onClose={() => setOpenConfirmModal(false)}
          onSubmit={handleConfirmCodeSubmit}
          isSubmitting={isSubmittingCode}
          code={confirmCode}
          setCode={setConfirmCode}
        />
      </Box>
    </Box>
  );
};

export default PersonalInfoSection;
