import { useState, useCallback, useEffect } from "react";
import orderApi from "../../../../api/order.api";
import { useToastify } from "../../../../hooks/useToastify";


// Định nghĩa interface Order dựa trên dữ liệu API
interface Order {
  id: string;
  userId: string;
  user: {
    id: string;
    fullName: string;
    phoneNumber: string;
  };
  shipper?: {
    id: string;
    phoneNumber: string;
  };
  createAt: string;
  updateAt: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalPrice: number;
  shippingFee: number;
  note: string;
  roomQueryResult: {
    id: string;
    name: string;
    buildingName: string;
    areaName: string;
    areaId: string;
  };
  store: {
    id: string;
    name: string;
    phoneNumber: string;
  };
  orderItems: {
    id: string;
    productId: number;
    productDetailId: number;
    productName: string;
    quantity: number;
    price: number;
    image: {
      id: string;
      url: string;
      thumbUrl: string;
      name: string;
    };
    addtionalData: {
      id: number;
      key: string;
      value: string;
    }[];
  }[];
}

// Hàm định dạng tiền tệ (VNĐ)
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount == null || isNaN(amount)) {
    return "0 ₫";
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Hàm định dạng ngày giờ
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

// Hàm định dạng trạng thái đơn hàng
export const formatOrderStatus = (status: string): string => {
  switch (status) {
    case "Pending":
      return "Chờ Xử Lý";
    case "Processing":
      return "Đang Xử Lý";
    case "Shipped":
      return "Đang Giao";
    case "Delivered":
      return "Đã Giao";
    case "Cancelled":
      return "Đã Hủy";
    case "CustomerNotAvailable":
      return "Khách Không Có Mặt";
    case "Reported":
      return "Bị Tố Cáo";
    default:
      return status;
  }
};

// Hàm lấy màu trạng thái đơn hàng
export const getOrderStatusColor = (status: string): { bgcolor: string; color: string } => {
  switch (status) {
    case "Pending":
      return { bgcolor: "#FFF3E0", color: "#F97316" };
    case "Processing":
      return { bgcolor: "#E0F7FA", color: "#0891B2" };
    case "Shipped":
      return { bgcolor: "#DBEAFE", color: "#3B82F6" };
    case "Delivered":
      return { bgcolor: "#DCFCE7", color: "#22C55E" };
    case "Cancelled":
      return { bgcolor: "#FEE2E2", color: "#EF4444" };
    case "CustomerNotAvailable":
      return { bgcolor: "#FEE2E2", color: "#EF4444" };
    case "Reported":
      return { bgcolor: "#FEE2E2", color: "#EF4444" };
    default:
      return { bgcolor: "#F3F4F6", color: "#6B7280" };
  }
};

// Hàm tính thống kê đơn hàng
export const calculateOrderStats = async () => {
  const { toast } = useToastify();
  try {
    const response = await orderApi.stats();
    if (response.code !== 0) {
      throw new Error(response.message || "Lỗi khi lấy thống kê đơn hàng");
    }
    return {
      totalOrders: response.data.totalOrders || 0,
      totalDelivered: response.data.totalDelivered || 0,
      totalCancelled: response.data.totalCancelled || 0,
      totalReported: response.data.totalReported || 0,
    };
  } catch (error: any) {
    console.error("Error in calculateOrderStats:", error);
    toast.error(error.message || "Lỗi khi tính thống kê đơn hàng");
    return {
      totalOrders: 0,
      totalDelivered: 0,
      totalCancelled: 0,
      totalReported: 0,
    };
  }
};

// Hook useOrdersLogic
export const useOrdersLogic = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10); // Đồng bộ với API mẫu
  const [totalPages, setTotalPages] = useState(1);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchParams, setSearchParams] = useState<{
    orderStatus?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    startDate?: string;
    endDate?: string;
  }>({});
  const toast = useToastify();

  // Lấy danh sách đơn hàng
  const fetchOrders = useCallback(async (
    page: number = 1,
    size: number = 10,
    orderStatus?: string,
    paymentMethod?: string,
    paymentStatus?: string,
    startDate?: string,
    endDate?: string
  ) => {
    try {
      const response = await orderApi.getAll(
        orderStatus || "None",
        paymentMethod || "None",
        paymentStatus || "None",
        undefined,
        undefined,
        undefined,
        page,
        size,
        startDate,
        endDate
      );
      console.log("Fetch orders response:", response.items);
      if ( Array.isArray(response.items)) {
        setOrders(response.items);
        setTotalCount(response.totalCount || 0);
        setPageNumber(response.pageNumber || 1);
        setTotalPages(response.totalPages || 1);
      } else {
        throw new Error(response.message || "Dữ liệu đơn hàng không hợp lệ");
      }
    } catch (error: any) {
      console.error("Fetch orders error:", error);
      toast.error(error.message || "Lỗi khi lấy danh sách đơn hàng");
      setOrders([]);
      setTotalCount(0);
      setTotalPages(1);
    }
  }, [toast]);

  // Xem chi tiết đơn hàng
  const handleViewOrder = async (id: string) => {
    try {
      const response = await orderApi.getById(id);
      console.log("Get order by ID response:", response);
      setSelectedOrder(response);
      setIsDetailModalOpen(true);
    } catch (error: any) {
      console.error("Get order by ID error:", error);
      toast.error(error.message || "Lỗi khi lấy chi tiết đơn hàng");
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
  };

  // Xử lý xuất danh sách đơn hàng
  const handleExportOrders = async () => {
    try {
      const response = await orderApi.getAll("None", "None", "None", undefined, undefined, undefined, 1, 1000);
      console.log("Export orders response:", response);
     
      const csvData = response.items.map((order: Order) => ({
        id: order.id,
        userName: order.user.fullName || "",
        storeName: order.store.name || "",
        status: formatOrderStatus(order.status),
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        totalPrice: formatCurrency(order.totalPrice),
        createAt: formatDate(order.createAt),
      }));
      const csv = [
        ["ID", "Khách Hàng", "Cửa Hàng", "Trạng Thái", "Trạng Thái Thanh Toán", "Phương Thức Thanh Toán", "Tổng Tiền", "Ngày Tạo"],
        ...csvData.map((row) => [
          row.id,
          `"${row.userName}"`,
          `"${row.storeName}"`,
          row.status,
          row.paymentStatus,
          row.paymentMethod,
          row.totalPrice,
          row.createAt,
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      console.log("Export orders success, showing toast: Xuất danh sách đơn hàng thành công!");
      toast.success("Xuất danh sách đơn hàng thành công!");
    } catch (error: any) {
      console.error("Export orders error:", error);
      toast.error(error.message || "Lỗi khi xuất danh sách đơn hàng");
    }
  };

  useEffect(() => {
    console.log("useEffect triggered with:", { pageNumber, searchParams });
    fetchOrders(
      pageNumber,
      pageSize,
      searchParams.orderStatus,
      searchParams.paymentMethod,
      searchParams.paymentStatus,
      searchParams.startDate,
      searchParams.endDate
    );
  }, [ pageNumber, pageSize, searchParams]);

  return {
    orders,
    totalCount,
    pageNumber,
    setPageNumber,
    pageSize,
    totalPages,
    selectedOrder,
    isDetailModalOpen,
    searchParams,
    setSearchParams,
    handleViewOrder,
    handleCloseDetailModal,
    handleExportOrders,
    formatCurrency,
    formatDate,
    formatOrderStatus,
    getOrderStatusColor,
    calculateOrderStats,
  };
};