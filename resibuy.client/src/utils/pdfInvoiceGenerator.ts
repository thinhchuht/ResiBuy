import jsPDF from "jspdf";

interface OrderItem {
  id: string;
  productDetailId: number;
  quantity: number;
  price: number;
  discount: number;
  product: {
    id: number;
    name: string;
    stock: number;
    image?: string;
  };
  productDetail?: {
    barcodes?: { id: number; code: string; productDetailId: number }[];
    additionalData?: { key: string; value: string }[];
  };
}

interface Customer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}

interface DeliveryAddress {
  areaName?: string;
  buildingName?: string;
  roomName?: string;
}

interface OrderData {
  orderId: string;
  items: OrderItem[];
  customer: Customer;
  storeName: string;
  deliveryAddress?: DeliveryAddress | null;
  deliveryMethod: "PICKUP" | "DELIVERY";
  paymentMethod: "COD" | "BankTransfer";
  total: number;
  discount: number;
  voucherDiscount?: number;
  shippingFee?: number;
  customerPaid?: number;
  change?: number;
  orderDate: Date;
  note?: string;
}

export const generateInvoicePDF = (orderData: OrderData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Set document properties for better UTF-8 support
  doc.setProperties({
    title: "Hoa Don Ban Hang",
    subject: "Invoice",
    author: "ResiBuy",
    creator: "ResiBuy System",
  });

  // Helper function to convert Vietnamese characters to ASCII-safe equivalents
  const toSafeText = (text: string): string => {
    const vietnameseMap: Record<string, string> = {
      à: "a",
      á: "a",
      ạ: "a",
      ả: "a",
      ã: "a",
      â: "a",
      ầ: "a",
      ấ: "a",
      ậ: "a",
      ẩ: "a",
      ẫ: "a",
      ă: "a",
      ằ: "a",
      ắ: "a",
      ặ: "a",
      ẳ: "a",
      ẵ: "a",
      è: "e",
      é: "e",
      ẹ: "e",
      ẻ: "e",
      ẽ: "e",
      ê: "e",
      ề: "e",
      ế: "e",
      ệ: "e",
      ể: "e",
      ễ: "e",
      ì: "i",
      í: "i",
      ị: "i",
      ỉ: "i",
      ĩ: "i",
      ò: "o",
      ó: "o",
      ọ: "o",
      ỏ: "o",
      õ: "o",
      ô: "o",
      ồ: "o",
      ố: "o",
      ộ: "o",
      ổ: "o",
      ỗ: "o",
      ơ: "o",
      ờ: "o",
      ớ: "o",
      ợ: "o",
      ở: "o",
      ỡ: "o",
      ù: "u",
      ú: "u",
      ụ: "u",
      ủ: "u",
      ũ: "u",
      ư: "u",
      ừ: "u",
      ứ: "u",
      ự: "u",
      ử: "u",
      ữ: "u",
      ỳ: "y",
      ý: "y",
      ỵ: "y",
      ỷ: "y",
      ỹ: "y",
      đ: "d",
      À: "A",
      Á: "A",
      Ạ: "A",
      Ả: "A",
      Ã: "A",
      Â: "A",
      Ầ: "A",
      Ấ: "A",
      Ậ: "A",
      Ẩ: "A",
      Ẫ: "A",
      Ă: "A",
      Ằ: "A",
      Ắ: "A",
      Ặ: "A",
      Ẳ: "A",
      Ẵ: "A",
      È: "E",
      É: "E",
      Ẹ: "E",
      Ẻ: "E",
      Ẽ: "E",
      Ê: "E",
      Ề: "E",
      Ế: "E",
      Ệ: "E",
      Ể: "E",
      Ễ: "E",
      Ì: "I",
      Í: "I",
      Ị: "I",
      Ỉ: "I",
      Ĩ: "I",
      Ò: "O",
      Ó: "O",
      Ọ: "O",
      Ỏ: "O",
      Õ: "O",
      Ô: "O",
      Ồ: "O",
      Ố: "O",
      Ộ: "O",
      Ổ: "O",
      Ỗ: "O",
      Ơ: "O",
      Ờ: "O",
      Ớ: "O",
      Ợ: "O",
      Ở: "O",
      Ỡ: "O",
      Ù: "U",
      Ú: "U",
      Ụ: "U",
      Ủ: "U",
      Ũ: "U",
      Ư: "U",
      Ừ: "U",
      Ứ: "U",
      Ự: "U",
      Ử: "U",
      Ữ: "U",
      Ỳ: "Y",
      Ý: "Y",
      Ỵ: "Y",
      Ỷ: "Y",
      Ỹ: "Y",
      Đ: "D",
    };

    return text
      .split("")
      .map((char) => vietnameseMap[char] || char)
      .join("");
  };

  // Helper function to handle Vietnamese text with better UTF-8 support
  const addText = (text: string, x: number, y: number, options: { fontSize?: number; fontStyle?: string; color?: number | number[]; align?: "left" | "right" | "center" } = {}) => {
    doc.setFontSize(options.fontSize || 10);
    doc.setFont("helvetica", options.fontStyle || "normal");
    const color = options.color || 0;
    if (Array.isArray(color)) {
      doc.setTextColor(color[0], color[1], color[2]);
    } else {
      doc.setTextColor(color);
    }

    // Convert Vietnamese text to ASCII-safe version
    const safeText = toSafeText(text);
    if (options.align && options.align !== "left") {
      doc.text(safeText, x, y, { align: options.align });
    } else {
      doc.text(safeText, x, y);
    }
  };

  // Helper function to add line
  const addLine = (x1: number, y1: number, x2: number, y2: number) => {
    doc.line(x1, y1, x2, y2);
  };

  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + " VNĐ";
  };

  // Helper function to format date
  const formatDate = (date: Date) => {
    return (
      date.toLocaleDateString("vi-VN") +
      " " +
      date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  // Header - Company Logo and Title
  addText("RESIBUY", 20, yPosition, { fontSize: 22, fontStyle: "bold", color: [102, 126, 234] });
  addText("HÓA ĐƠN BÁN HÀNG", pageWidth - 20, yPosition, { fontSize: 16, fontStyle: "bold", align: "right" });
  yPosition += 10;
  doc.setDrawColor(230, 230, 230);
  addLine(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 15;

  // Order info section
  addText("Thông tin đơn hàng", 20, yPosition, { fontSize: 14, fontStyle: "bold", color: [73, 80, 87] });
  yPosition += 10;

  addText(`Ngày đặt hàng: ${formatDate(orderData.orderDate)}`, 20, yPosition);
  addText(`Mã đơn hàng: ${orderData.orderId.toUpperCase()}`, pageWidth - 20, yPosition, { align: "right" });
  yPosition += 8;

  addText(`Tổng sản phẩm: ${orderData.items.reduce((sum, item) => sum + item.quantity, 0)}`, 20, yPosition);
  yPosition += 15;

  // Customer info section
  addText("Thông tin khách hàng", 20, yPosition, { fontSize: 14, fontStyle: "bold", color: [73, 80, 87] });
  yPosition += 10;

  addText(`Họ tên: ${orderData.customer.fullName || "Không có thông tin"}`, 20, yPosition);
  addText(`Email: ${orderData.customer.email}`, pageWidth - 20, yPosition, { align: "right" });
  yPosition += 8;

  addText(`Số điện thoại: ${orderData.customer.phoneNumber || "Không có thông tin"}`, 20, yPosition);
  yPosition += 8;

  if (orderData.deliveryAddress) {
    const addressText =
      orderData.deliveryMethod === "PICKUP"
        ? "Tại cửa hàng"
        : `${orderData.deliveryAddress.areaName}, ${orderData.deliveryAddress.buildingName}, ${orderData.deliveryAddress.roomName}`;
    addText(`Địa chỉ giao hàng: ${addressText}`, 20, yPosition);
  }
  yPosition += 15;

  // Order details section
  addText("Chi tiết đơn hàng", 20, yPosition, { fontSize: 16, fontStyle: "bold", color: [73, 80, 87] });
  yPosition += 10;

  // Store info
  addText(`${orderData.storeName}`, 20, yPosition, { fontSize: 12, fontStyle: "bold" });
  yPosition += 8;

  // Table header
  const colX = [25, 105, 145, pageWidth - 25]; // vị trí các cột: tên SP, SL, Đơn giá, Thành tiền (căn phải số)
  const tableStartY = yPosition;

  // Header background
  doc.setFillColor(102, 126, 234);
  doc.rect(20, yPosition - 3, pageWidth - 40, 12, "F");

  // Header text
  doc.setTextColor(255, 255, 255);
  addText("Sản phẩm", colX[0], yPosition + 3, { fontSize: 10, fontStyle: "bold" });
  addText("SL", colX[1], yPosition + 3, { fontSize: 10, fontStyle: "bold", align: "right" });
  addText("Đơn giá", colX[2], yPosition + 3, { fontSize: 10, fontStyle: "bold", align: "right" });
  addText("Thành tiền", colX[3], yPosition + 3, { fontSize: 10, fontStyle: "bold", align: "right" });

  doc.setTextColor(0, 0, 0);
  yPosition += 12;

  // Table rows
  orderData.items.forEach((item, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 60) {
      doc.addPage();
      yPosition = 20;
    }

    // Alternate row background
    if (index % 2 === 0) {
      doc.setFillColor(248, 249, 250);
      doc.rect(20, yPosition - 3, pageWidth - 40, 10, "F");
    }

    // Đảm bảo luôn là string và không rỗng
    let productName = String(item.product?.name || "Không rõ tên");
    if (productName.length > 42) {
      productName = productName.substring(0, 39) + "...";
    }
    addText(productName, colX[0], yPosition + 3, { fontSize: 9 });

    // Thêm thuộc tính sản phẩm (additionalData) nếu có, hiển thị dưới tên sản phẩm
    if (item.productDetail?.additionalData && item.productDetail.additionalData.length > 0) {
      const attrs = item.productDetail.additionalData.map((ad) => `${ad.key}: ${ad.value}`).join(" | ");
      const attrsText = attrs.length > 60 ? attrs.substring(0, 57) + "..." : attrs;
      addText(attrsText, colX[0], yPosition + 7, { fontSize: 8, color: [108, 117, 125] });
    }

    addText(item.quantity.toString(), colX[1], yPosition + 3, { fontSize: 9, align: "right" });
    addText(formatCurrency(item.price), colX[2], yPosition + 3, { fontSize: 9, align: "right" });

    const discountPerItem = Number(item.discount || 0);
    const totalRow = item.price * item.quantity - discountPerItem * item.quantity;
    addText(formatCurrency(totalRow), colX[3], yPosition + 3, { fontSize: 9, align: "right" });

    yPosition += item.productDetail?.additionalData && item.productDetail.additionalData.length > 0 ? 12 : 10;
  });

  // Table border
  addLine(20, tableStartY - 3, pageWidth - 20, tableStartY - 3);
  addLine(20, tableStartY - 3, 20, yPosition - 3);
  addLine(pageWidth - 20, tableStartY - 3, pageWidth - 20, yPosition - 3);
  addLine(20, yPosition - 3, pageWidth - 20, yPosition - 3);

  yPosition += 10;

  // Order summary section

  // Background for summary
  doc.setFillColor(248, 249, 250);
  doc.rect(20, yPosition, pageWidth - 40, 64, "F");

  // Border for summary
  addLine(20, yPosition, pageWidth - 20, yPosition);
  addLine(20, yPosition, 20, yPosition + 64);
  addLine(pageWidth - 20, yPosition, pageWidth - 20, yPosition + 64);
  addLine(20, yPosition + 64, pageWidth - 20, yPosition + 64);

  yPosition += 8;

  if (orderData.shippingFee && orderData.shippingFee > 0) {
    addText("Phí giao hàng:", 30, yPosition, { fontSize: 10 });
    addText(formatCurrency(orderData.shippingFee), pageWidth - 30, yPosition, { fontSize: 10, fontStyle: "bold", color: [40, 167, 69], align: "right" });
    yPosition += 8;
  }

  if (orderData.discount > 0) {
    addText("Giảm tiền đơn hàng:", 30, yPosition, { fontSize: 10 });
    addText(`-${formatCurrency(orderData.discount)}`, pageWidth - 30, yPosition, { fontSize: 10, fontStyle: "bold", color: [40, 167, 69], align: "right" });
    yPosition += 8;
  }

  if (orderData.voucherDiscount && orderData.voucherDiscount > 0) {
    addText("Voucher:", 30, yPosition, { fontSize: 10 });
    addText(`-${formatCurrency(orderData.voucherDiscount)}`, pageWidth - 30, yPosition, { fontSize: 10, fontStyle: "bold", color: [40, 167, 69], align: "right" });
    yPosition += 8;
  }

  // Total amount (use provided total directly, no auto + / -)
  addLine(30, yPosition, pageWidth - 30, yPosition);
  yPosition += 8;

  const finalTotal = orderData.total;
  addText("TỔNG CỘNG:", 30, yPosition, { fontSize: 14, fontStyle: "bold", color: [220, 53, 69] });
  addText(formatCurrency(finalTotal), pageWidth - 30, yPosition, { fontSize: 14, fontStyle: "bold", color: [220, 53, 69], align: "right" });

  yPosition += 20;

  // Payment info (no customer cash/change lines)
  if (orderData.paymentMethod === "COD") {
    addText("Phương thức thanh toán: Tiền mặt", 20, yPosition, { fontSize: 10 });
  } else {
    addText("Phương thức thanh toán: Chuyển khoản", 20, yPosition, { fontSize: 10 });
  }

  yPosition += 20;

  // Footer
  addText("Cảm ơn quý khách đã sử dụng dịch vụ của ResiBuy!", pageWidth / 2, yPosition, { fontSize: 12, fontStyle: "bold", color: [40, 167, 69] });

  // Add note if exists
  if (orderData.note) {
    yPosition += 15;
    addText(`Ghi chú: ${orderData.note}`, 20, yPosition, { fontSize: 10, fontStyle: "italic" });
  }

  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
  const filename = `HoaDon_${orderData.orderId}_${timestamp}.pdf`;

  // Save the PDF
  doc.save(filename);
};

export default generateInvoicePDF;

// ----- Optional: Accept raw order object (same shape used in OrderCard.tsx) -----
// Minimal interfaces to match fields used for PDF generation. This avoids importing from a page file.
export interface ImageResult {
  id: string;
  name: string;
  url: string;
  thumbUrl: string;
}

export interface OrderItemQueryResult {
  id: string;
  productId: number;
  productDetailId: number;
  productName: string;
  quantity: number;
  price: number;
  image?: ImageResult;
  addtionalData?: { id: string; key: string; value: string }[];
  barcode?: string;
}

export interface OrderApiResultForPDF {
  id: string;
  userId: string;
  user?: { id: string; fullName: string; phoneNumber: string };
  shipper?: { id: string; fullName: string; phoneNumber: string };
  createAt: string;
  updateAt: string;
  paymentMethod: number; // 1: COD, others: BankTransfer
  totalPrice: number;
  shippingFee: number;
  note: string;
  store?: { id: string; name: string };
  voucher?: { discountAmount?: number } | null;
  orderItems: OrderItemQueryResult[];
  roomQueryResult?: { id: string; name: string; buildingName: string; areaName: string };
}

// Generate invoice directly from order object - hiển thị y hệt Order Card
export const generateInvoicePDFFromOrder = (order: OrderApiResultForPDF): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Helper functions
  const addText = (text: string, x: number, y: number, options: any = {}) => {
    const safeText = toSafeText(text);
    doc.setFont("helvetica", options.fontStyle || "normal");
    doc.setFontSize(options.fontSize || 12);
    if (options.color) {
      if (Array.isArray(options.color)) {
        doc.setTextColor(options.color[0], options.color[1], options.color[2]);
      } else {
        doc.setTextColor(options.color);
      }
    }

    if (options.align === "right") {
      const textWidth = doc.getTextWidth(safeText);
      doc.text(safeText, x - textWidth, y);
    } else if (options.align === "center") {
      const textWidth = doc.getTextWidth(safeText);
      doc.text(safeText, x - textWidth / 2, y);
    } else {
      doc.text(safeText, x, y);
    }
  };

  const addLine = (x1: number, y1: number, x2: number, y2: number) => {
    doc.line(x1, y1, x2, y2);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toSafeText = (text: string): string => {
    return text
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
      .replace(/[èéẹẻẽêềếệểễ]/g, "e")
      .replace(/[ìíịỉĩ]/g, "i")
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
      .replace(/[ùúụủũưừứựửữ]/g, "u")
      .replace(/[ỳýỵỷỹ]/g, "y")
      .replace(/[đ]/g, "d")
      .replace(/[ÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/g, "A")
      .replace(/[ÈÉẸẺẼÊỀẾỆỂỄ]/g, "E")
      .replace(/[ÌÍỊỈĨ]/g, "I")
      .replace(/[ÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]/g, "O")
      .replace(/[ÙÚỤỦŨƯỪỨỰỬỮ]/g, "U")
      .replace(/[ỲÝỴỶỸ]/g, "Y")
      .replace(/[Đ]/g, "D");
  };

  // Header
  addText("HOÁ ĐƠN BÁN HÀNG", pageWidth / 2, yPosition, { fontSize: 18, fontStyle: "bold", align: "center" });
  yPosition += 15;
  addText("ResiBuy Store", pageWidth / 2, yPosition, { fontSize: 14, align: "center" });
  yPosition += 20;

  // Order info
  addText("Thông tin đơn hàng:", 20, yPosition, { fontSize: 12, fontStyle: "bold" });
  yPosition += 8;
  addText(`Ngày đặt hàng: ${formatDate(new Date(order.createAt))}`, 20, yPosition, { fontSize: 10 });
  yPosition += 6;
  addText(`Mã đơn hàng: ${order.id}`, 20, yPosition, { fontSize: 10 });
  yPosition += 6;
  addText(`Tổng sản phẩm: ${order.orderItems.length}`, 20, yPosition, { fontSize: 10 });
  yPosition += 15;

  // Customer info
  addText("Thông tin khách hàng:", 20, yPosition, { fontSize: 12, fontStyle: "bold" });
  yPosition += 8;
  addText(`Họ tên: ${order.user?.fullName || ""}`, 20, yPosition, { fontSize: 10 });
  yPosition += 6;
  addText(`Số điện thoại: ${order.user?.phoneNumber || ""}`, 20, yPosition, { fontSize: 10 });
  yPosition += 6;
  if (order.roomQueryResult) {
    addText(`Địa chỉ giao hàng: ${order.roomQueryResult.areaName || ""}, ${order.roomQueryResult.buildingName || ""}, ${order.roomQueryResult.name || ""}`, 20, yPosition, {
      fontSize: 10,
    });
    yPosition += 6;
  }
  yPosition += 15;

  // Store info
  addText("Thông tin cửa hàng:", 20, yPosition, { fontSize: 12, fontStyle: "bold" });
  yPosition += 8;
  addText(`Tên cửa hàng: ${order.store?.name || ""}`, 20, yPosition, { fontSize: 10 });
  yPosition += 15;

  // Order details table
  addText("Chi tiết đơn hàng:", 20, yPosition, { fontSize: 12, fontStyle: "bold" });
  yPosition += 10;

  // Table header
  const colX = [25, 100, 130, 170];
  const tableStartY = yPosition;

  addText("Sản phẩm", colX[0], yPosition, { fontSize: 10, fontStyle: "bold" });
  addText("SL", colX[1], yPosition, { fontSize: 10, fontStyle: "bold" });
  addText("Đơn giá", colX[2], yPosition, { fontSize: 10, fontStyle: "bold" });
  addText("Thành tiền", colX[3], yPosition, { fontSize: 10, fontStyle: "bold" });
  yPosition += 8;

  // Table rows - hiển thị y hệt như Order Card
  order.orderItems.forEach((item) => {
    addText(item.productName || "Không rõ tên", colX[0], yPosition, { fontSize: 9 });
    addText(item.quantity.toString(), colX[1], yPosition, { fontSize: 9 });
    addText(formatCurrency(item.price), colX[2], yPosition, { fontSize: 9 });
    addText(formatCurrency(item.price * item.quantity), colX[3], yPosition, { fontSize: 9 });
    yPosition += 6;

    // Additional data if exists - giống như Order Card
    if (item.addtionalData && item.addtionalData.length > 0) {
      item.addtionalData.forEach((data) => {
        addText(`  ${data.key}: ${data.value}`, colX[0] + 5, yPosition, { fontSize: 8 });
        yPosition += 4;
      });
    }
  });

  // Summary - giống như Order Card
  yPosition += 10;
  addLine(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;

  addText("Phí vận chuyển:", 30, yPosition, { fontSize: 10 });
  addText(formatCurrency(order.shippingFee || 0), pageWidth - 30, yPosition, { fontSize: 10, align: "right" });
  yPosition += 8;

  addText("TỔNG CỘNG:", 30, yPosition, { fontSize: 12, fontStyle: "bold" });
  addText(formatCurrency(order.totalPrice), pageWidth - 30, yPosition, { fontSize: 12, fontStyle: "bold", color: [255, 0, 0], align: "right" });
  yPosition += 15;

  // Payment info
  addText(`Phương thức thanh toán: ${order.paymentMethod === 1 ? "COD" : "Chuyển khoản"}`, 20, yPosition, { fontSize: 10 });
  yPosition += 8;

  if (order.note) {
    addText(`Ghi chú: ${order.note}`, 20, yPosition, { fontSize: 10 });
    yPosition += 8;
  }

  // Footer
  yPosition += 20;
  addText("Cảm ơn quý khách đã sử dụng dịch vụ của ResiBuy!", pageWidth / 2, yPosition, { fontSize: 10, align: "center", color: [40, 167, 69] });

  // Download
  doc.save(`hoa-don-${order.id}.pdf`);
};
