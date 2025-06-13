import {
  X,
  Store as StoreIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Package,
  ShoppingCart,
  Edit2,
  Trash2,
  ToggleLeft,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { Area, RText, Yard, Core, Container } from "../../../lib/by/Div";
import {
  formatCurrency,
  formatDate,
  useStoresLogic,
} from "../../../components/admin/Store/seg/utlis";
import { type Store, type Order } from "../../../types/models";

interface StoreDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store | null;
  onEdit?: (store: Store) => void;
  onDelete?: (storeId: string) => void;
  onToggleStatus?: (storeId: string) => void;
}

export function StoreDetailModal({
  isOpen,
  onClose,
  store,
  onEdit,
  onDelete,
  onToggleStatus,
}: StoreDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders">("overview");
  const {
    countProductsByStoreId,
    countSoldProductsByStoreId,
    countOrdersByStoreId,
    getStoreOrders,
    calculateStoreRevenue,
    getOrderStatusCounts,
    formatOrderStatus,
    getOrderStatusColor,
    handleViewOrderDetails,
    selectedOrder,
    getUserById,
  } = useStoresLogic();

  if (!isOpen || !store) return null;

  const totalProducts = countProductsByStoreId(store.id);
  const totalSoldProducts = countSoldProductsByStoreId(store.id);
  const totalOrders = countOrdersByStoreId(store.id);
  const totalRevenue = calculateStoreRevenue(store.id);
  const orders = getStoreOrders(store.id);
  const orderStatusCounts = getOrderStatusCounts(store.id);

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <ToggleLeft className="w-5 h-5 text-red-600" />
    );
  };

  return (
    <>
      {/* Backdrop */}
      <Core
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-[9998] ${
          isOpen ? "bg-opacity-60" : "bg-opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <Core
        className={`fixed top-0 right-0 h-full w-full max-w-5xl bg-white shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <Container className="h-full overflow-y-auto">
          {/* Header */}
          <Area className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
            <Yard>
              <RText className="text-xl font-semibold text-gray-900">
                Store Details
              </RText>
              <RText className="text-sm text-gray-500">
                Store ID: {store.id}
              </RText>
            </Yard>
            <Area className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(store)}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              )}
              {onToggleStatus && (
                <button
                  onClick={() => onToggleStatus(store.id)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                    store.isActive
                      ? "bg-yellow-600 text-white hover:bg-yellow-700"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {store.isActive ? (
                    <ToggleLeft className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {store.isActive ? "Deactivate" : "Activate"}
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(store.id)}
                  className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 bg-white hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </Area>
          </Area>

          {/* Store Summary */}
          <Container className="p-6 border-b border-gray-200 bg-gray-50">
            <Area className="flex items-start gap-6">
             <Yard className="w-20 h-20">
      {store.imageUrl ? (
        <img
          src={store.imageUrl}
          alt={store.name}
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            e.currentTarget.src = "/images/default-store.png"; // Hình ảnh mặc định
          }}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {store.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()}
        </div>
      )}
    </Yard>
              <Yard className="flex-1">
                <Area className="flex items-center gap-3 mb-2">
                  <RText className="text-2xl font-bold text-gray-900">
                    {store.name}
                  </RText>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${store.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {getStatusIcon(store.isActive)}
                    {store.isActive ? "Active" : "Inactive"}
                  </span>
                </Area>
                <Area className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <Yard className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <RText className="text-gray-600">{store.email}</RText>
                  </Yard>
                  <Yard className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <RText className="text-gray-600">{store.phoneNumber}</RText>
                  </Yard>
                  <Yard className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <RText className="text-gray-600">{store.address}</RText>
                  </Yard>
                  <Yard className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <RText className="text-gray-600">
                      Created {formatDate(store.createdAt)}
                    </RText>
                  </Yard>
                </Area>
              </Yard>
              <Area className="grid grid-cols-3 gap-4 text-center">
                <Yard>
                  <RText className="text-2xl font-bold text-blue-600">
                    {totalProducts}
                  </RText>
                  <RText className="text-xs text-gray-500">Total Products</RText>
                </Yard>
                <Yard>
                  <RText className="text-2xl font-bold text-green-600">
                    {formatCurrency(totalRevenue)}
                  </RText>
                  <RText className="text-xs text-gray-500">Total Revenue</RText>
                </Yard>
                <Yard>
                  <RText className="text-2xl font-bold text-purple-600">
                    {totalOrders}
                  </RText>
                  <RText className="text-xs text-gray-500">Total Orders</RText>
                </Yard>
              </Area>
            </Area>
          </Container>

          {/* Tabs */}
          <Container className="border-b border-gray-200">
            <Area className="flex">
              {[
                { id: "overview", label: "Overview", icon: StoreIcon },
                { id: "products", label: "Products", icon: Package },
                { id: "orders", label: "Orders", icon: ShoppingCart },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-4  bg-white border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </Area>
          </Container>

          {/* Tab Content */}
          <Container className="p-6 ">
            {activeTab === "overview" && (
              <Area className="space-y-6">
                <Yard>
                  <RText className="text-lg font-medium text-gray-900 mb-4">
                    Store Information
                  </RText>
                  <Area className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Yard>
                      <RText className="text-sm font-medium text-gray-500">
                        Description
                      </RText>
                      <RText className="text-gray-900">
                        {store.description || "No description available"}
                      </RText>
                    </Yard>
                    <Yard>
                      <RText className="text-sm font-medium text-gray-500">
                        Active Status
                      </RText>
                      <RText className="text-gray-900 capitalize">
                        {store.isActive ? "Active" : "Inactive"}
                      </RText>
                    </Yard>
                    <Yard>
                      <RText className="text-sm font-medium text-gray-500">
                        Total Sold Products
                      </RText>
                      <RText className="text-gray-900">
                        {totalSoldProducts}
                      </RText>
                    </Yard>
                    <Yard>
                      <RText className="text-sm font-medium text-gray-500">
                        Average Order Value
                      </RText>
                      <RText className="text-gray-900">
                        {totalOrders > 0
                          ? formatCurrency(totalRevenue / totalOrders)
                          : "$0.00"}
                      </RText>
                    </Yard>
                  </Area>
                </Yard>

                {orderStatusCounts && (
                  <Yard>
                    <RText className="text-lg font-medium text-gray-900 mb-4">
                      Order Status Summary
                    </RText>
                    <Area className="bg-gray-50 rounded-lg p-4">
                      <Area className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <Yard>
                          <RText className="text-sm font-medium text-gray-500">
                            Pending
                          </RText>
                          <RText className="text-gray-900">{orderStatusCounts.pending}</RText>
                        </Yard>
                        <Yard>
                          <RText className="text-sm font-medium text-gray-500">
                            Processing
                          </RText>
                          <RText className="text-gray-900">{orderStatusCounts.processing}</RText>
                        </Yard>
                        <Yard>
                          <RText className="text-sm font-medium text-gray-500">
                            Shipped
                          </RText>
                          <RText className="text-gray-900">{orderStatusCounts.shipped}</RText>
                        </Yard>
                        <Yard>
                          <RText className="text-sm font-medium text-gray-500">
                            Delivered
                          </RText>
                          <RText className="text-gray-900">{orderStatusCounts.delivered}</RText>
                        </Yard>
                        <Yard>
                          <RText className="text-sm font-medium text-gray-500">
                            Cancelled
                          </RText>
                          <RText className="text-gray-900">{orderStatusCounts.cancelled}</RText>
                        </Yard>
                      </Area>
                    </Area>
                  </Yard>
                )}
              </Area>
            )}

            {activeTab === "products" && (
              <Area>
                <RText className="text-lg font-medium text-gray-900 mb-4">
                  Products ({totalProducts} products)
                </RText>
                {store.products.length > 0 ? (
                  <Area className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Product ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Price
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Sold
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {store.products.map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-mono text-sm text-blue-600">
                              {product.id}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {product.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {formatCurrency(product.price)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {product.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {product.sold}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Area>
                ) : (
                  <Area className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <RText>No products found for this store</RText>
                  </Area>
                )}
              </Area>
            )}

            {activeTab === "orders" && (
              <Area>
                <RText className="text-lg font-medium text-gray-900 mb-4">
                  Order History ({orders.length} orders)
                </RText>
                {orders.length > 0 ? (
                  <Area className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Order ID
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Total
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-mono text-sm text-blue-600">
                              {order.id}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {formatDate(order.createdAt)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOrderStatusColor(order.status)}`}
                              >
                                {formatOrderStatus(order.status)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {formatCurrency(order.totalAmount)}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => handleViewOrderDetails(order.id)}
                                className="text-blue-600 hover:underline text-sm  bg-white"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Area>
                ) : (
                  <Area className="text-center py-8 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <RText>No orders found for this store</RText>
                  </Area>
                )}
              </Area>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
              <Core
                className="fixed inset-0 bg-black bg-opacity-50 z-[10000]"
                onClick={() => handleViewOrderDetails("")} // Reset selectedOrder
              >
                <Core
                  className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-[10001] w-full max-w-lg p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <RText className="text-lg font-semibold text-gray-900 mb-4">
                    Order Details #{selectedOrder.id}
                  </RText>
                  <Area className="space-y-4">
                    <Yard>
                      <RText className="text-sm font-medium text-gray-500">
                        Người đặt hàng
                      </RText>
                      <RText className="text-gray-900">
                        {getUserById(selectedOrder.userId)?.fullName || "Không xác định"}
                      </RText>
                      <RText className="text-sm font-medium text-gray-500">
                        Total Amount
                      </RText>
                      <RText className="text-gray-900">{formatCurrency(selectedOrder.totalAmount)}</RText>
                    </Yard>
                    <Yard>
                      <RText className="text-sm font-medium text-gray-500">
                        Status
                      </RText>
                      <RText className="text-gray-900">{formatOrderStatus(selectedOrder.status)}</RText>
                    </Yard>
                    <Yard>
                      <RText className="text-sm font-medium text-gray-500">
                        Shipping Address
                      </RText>
                      <RText className="text-gray-900">{selectedOrder.shippingAddress}</RText>
                    </Yard>
                    <Yard>
                      <RText className="text-sm font-medium text-gray-500">
                        Created At
                      </RText>
                      <RText className="text-gray-900">{formatDate(selectedOrder.createdAt)}</RText>
                    </Yard>
                    <Yard>
                      <RText className="text-sm font-medium text-gray-500">
                        Đơn hàng sản phẩm
                      </RText>
                      {selectedOrder.orderItems.length > 0 ? (
                        <ul className="list-disc pl-5">
                          {selectedOrder.orderItems.map((item) => {
                            const product = store.products.find((p) => p.id === item.productId);
                            return (
                              <li key={item.id} className="text-gray-900">
                                {product ? product.name : "Unknown Product"} - Quantity: {item.quantity} - Price: {formatCurrency(item.price)}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <RText className="text-gray-500">No items found</RText>
                      )}
                    </Yard>
                  </Area>
                  <Area className="flex justify-end mt-6">
                    <button
                      onClick={() => handleViewOrderDetails("")} // Reset selectedOrder
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                  </Area>
                </Core>
              </Core>
            )}
          </Container>
        </Container>
      </Core>
    </>
  );
}