

import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Trophy,
  Star,
  Plus,
  Edit2,
  Trash2,
  Ban,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { Area, RText, Yard, Core, Container } from "../../../lib/by/Div";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  getStatusColor,
  getLoyaltyTierColor,
  getCustomerOrders,
  getGameScoreTransactions,
} from "../../../components/admin/Customer/seg/utils";
import { type Customer } from "../../../constants/manage-customers/index";
import type { GameScoreTransaction } from "../../../constants/manage-customers/index";

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  onEdit?: (customer: Customer) => void;
  onDelete?: (customerId: string) => void;
  onDeactivate?: (customerId: string) => void;
  onUpdateGameScore?: (
    customerId: string,
    amount: number,
    description: string,
    type: GameScoreTransaction["type"]
  ) => void;
}

export function CustomerDetailModal({
  isOpen,
  onClose,
  customer,
  onEdit,
  onDelete,
  onDeactivate,
  onUpdateGameScore,
}: CustomerDetailModalProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "orders" | "gameScore"
  >("overview");
  const [isGameScoreModalOpen, setIsGameScoreModalOpen] = useState(false);
  const [gameScoreAmount, setGameScoreAmount] = useState("");
  const [gameScoreDescription, setGameScoreDescription] = useState("");
  const [gameScoreType, setGameScoreType] =
    useState<GameScoreTransaction["type"]>("manual_add");

  if (!isOpen || !customer) return null;

  const customerOrders = getCustomerOrders(customer.id);
  const gameScoreTransactions = getGameScoreTransactions(customer.id);

  const handleGameScoreSubmit = () => {
    if (!gameScoreAmount || !gameScoreDescription.trim()) return;

    const amount =
      gameScoreType === "manual_subtract"
        ? -Math.abs(Number.parseInt(gameScoreAmount))
        : Number.parseInt(gameScoreAmount);
    onUpdateGameScore?.(
      customer.id,
      amount,
      gameScoreDescription,
      gameScoreType
    );

    setGameScoreAmount("");
    setGameScoreDescription("");
    setIsGameScoreModalOpen(false);
  };

  const getStatusIcon = (status: Customer["status"]) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "inactive":
        return <Ban className="w-5 h-5 text-yellow-600" />;
      case "blocked":
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return <User className="w-5 h-5" />;
    }
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
                Customer Details
              </RText>
              <RText className="text-sm text-gray-500">
                Customer ID: {customer.id}
              </RText>
            </Yard>
            <Area className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(customer)}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              )}
              {onDeactivate && (
                <button
                  onClick={() => onDeactivate(customer.id)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                    customer.status === "active"
                      ? "bg-yellow-600 text-white hover:bg-yellow-700"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {customer.status === "active" ? (
                    <Ban className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {customer.status === "active" ? "Deactivate" : "Activate"}
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(customer.id)}
                  className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </Area>
          </Area>

          {/* Customer Summary */}
          <Container className="p-6 border-b border-gray-200 bg-gray-50">
            <Area className="flex items-start gap-6">
              <Yard className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {customer.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </Yard>
              <Yard className="flex-1">
                <Area className="flex items-center gap-3 mb-2">
                  <RText className="text-2xl font-bold text-gray-900">
                    {customer.name}
                  </RText>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}
                  >
                    {getStatusIcon(customer.status)}
                    {customer.status.charAt(0).toUpperCase() +
                      customer.status.slice(1)}
                  </span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLoyaltyTierColor(customer.loyaltyTier)}`}
                  >
                    <Star className="w-3 h-3 mr-1" />
                    {customer.loyaltyTier.charAt(0).toUpperCase() +
                      customer.loyaltyTier.slice(1)}
                  </span>
                </Area>
                <Area className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <Yard className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <RText className="text-gray-600">{customer.email}</RText>
                  </Yard>
                  <Yard className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <RText className="text-gray-600">{customer.phone}</RText>
                  </Yard>
                  <Yard className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <RText className="text-gray-600">{customer.address}</RText>
                  </Yard>
                  <Yard className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <RText className="text-gray-600">
                      Joined {formatDate(customer.dateJoined)}
                    </RText>
                  </Yard>
                </Area>
              </Yard>
              <Area className="grid grid-cols-3 gap-4 text-center">
                <Yard>
                  <RText className="text-2xl font-bold text-blue-600">
                    {customer.totalOrders}
                  </RText>
                  <RText className="text-xs text-gray-500">Total Orders</RText>
                </Yard>
                <Yard>
                  <RText className="text-2xl font-bold text-green-600">
                    {formatCurrency(customer.totalSpent)}
                  </RText>
                  <RText className="text-xs text-gray-500">Total Spent</RText>
                </Yard>
                <Yard>
                  <RText className="text-2xl font-bold text-purple-600">
                    {customer.gameScore}
                  </RText>
                  <RText className="text-xs text-gray-500">Game Score</RText>
                </Yard>
              </Area>
            </Area>
          </Container>

          {/* Tabs */}
          <Container className="border-b border-gray-200">
            <Area className="flex">
              {[
                { id: "overview", label: "Overview", icon: User },
                { id: "orders", label: "Order History", icon: CreditCard },
                { id: "gameScore", label: "Game Score", icon: Trophy },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center  gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
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
          <Container className="p-6">
            {activeTab === "overview" && (
              <Area className="space-y-6">
                <Yard>
                  <RText className="text-lg font-medium text-gray-900 mb-4">
                    Customer Information
                  </RText>
                  <Area className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Yard>
                      <RText className="text-sm font-medium text-gray-500">
                        Last Login
                      </RText>
                      <RText className="text-gray-900">
                        {formatDateTime(customer.lastLogin)}
                      </RText>
                    </Yard>
                    <Yard>
                      <RText className="text-sm font-medium text-gray-500">
                        Account Status
                      </RText>
                      <RText className="text-gray-900 capitalize">
                        {customer.status}
                      </RText>
                    </Yard>
                    <Yard>
                      <RText className="text-sm font-medium text-gray-500">
                        Loyalty Tier
                      </RText>
                      <RText className="text-gray-900 capitalize">
                        {customer.loyaltyTier}
                      </RText>
                    </Yard>
                    <Yard>
                      <RText className="text-sm font-medium text-gray-500">
                        Average Order Value
                      </RText>
                      <RText className="text-gray-900">
                        {customer.totalOrders > 0
                          ? formatCurrency(
                              customer.totalSpent / customer.totalOrders
                            )
                          : "$0.00"}
                      </RText>
                    </Yard>
                  </Area>
                </Yard>

                {customer.notes && (
                  <Yard>
                    <RText className="text-lg font-medium text-gray-900 mb-4">
                      Notes
                    </RText>
                    <Area className="bg-gray-50 rounded-lg p-4">
                      <RText className="text-gray-700">{customer.notes}</RText>
                    </Area>
                  </Yard>
                )}
              </Area>
            )}

            {activeTab === "orders" && (
              <Area>
                <RText className="text-lg font-medium text-gray-900 mb-4">
                  Order History ({customerOrders.length} orders)
                </RText>
                {customerOrders.length > 0 ? (
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
                            Items
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {customerOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-mono text-sm text-blue-600">
                              {order.id}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {formatDate(order.date)}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {order.items}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {formatCurrency(order.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Area>
                ) : (
                  <Area className="text-center py-8 text-gray-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <RText>No orders found for this customer</RText>
                  </Area>
                )}
              </Area>
            )}

            {activeTab === "gameScore" && (
              <Area className="space-y-6">
                <Area className="flex items-center justify-between">
                  <RText className="text-lg font-medium text-gray-900">
                    Game Score Management
                  </RText>
                  {onUpdateGameScore && (
                    <button
                      onClick={() => setIsGameScoreModalOpen(true)}
                      className="flex items-center gap-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Adjust Score
                    </button>
                  )}
                </Area>

                <Area className="bg-purple-50 rounded-lg p-6">
                  <Area className="flex items-center gap-4">
                    <Yard className="p-4 bg-purple-600 rounded-full">
                      <Trophy className="w-8 h-8 text-white" />
                    </Yard>
                    <Yard>
                      <RText className="text-3xl font-bold text-purple-600">
                        {customer.gameScore}
                      </RText>
                      <RText className="text-sm text-gray-600">
                        Current Game Score
                      </RText>
                    </Yard>
                  </Area>
                </Area>

                <Yard>
                  <RText className="text-lg font-medium text-gray-900 mb-4">
                    Transaction History
                  </RText>
                  {gameScoreTransactions.length > 0 ? (
                    <Area className="space-y-3">
                      {gameScoreTransactions.map((transaction) => (
                        <Area
                          key={transaction.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <Yard>
                            <RText className="font-medium text-gray-900">
                              {transaction.description}
                            </RText>
                            <RText className="text-sm text-gray-500">
                              {formatDateTime(transaction.date)}
                            </RText>
                          </Yard>
                          <Yard className="text-right">
                            <RText
                              className={`font-bold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}
                            >
                              {transaction.amount > 0 ? "+" : ""}
                              {transaction.amount}
                            </RText>
                            <RText className="text-xs text-gray-500 capitalize">
                              {transaction.type.replace("_", " ")}
                            </RText>
                          </Yard>
                        </Area>
                      ))}
                    </Area>
                  ) : (
                    <Area className="text-center py-8 text-gray-500">
                      <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <RText>No game score transactions found</RText>
                    </Area>
                  )}
                </Yard>
              </Area>
            )}
          </Container>
        </Container>
      </Core>

      {/* Game Score Adjustment Modal */}
      {isGameScoreModalOpen && (
        <>
          <Core
            className="fixed inset-0 bg-black bg-opacity-50 z-[10000]"
            onClick={() => setIsGameScoreModalOpen(false)}
          />
          <Core className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-[10001] w-full max-w-md">
            <Container className="p-6">
              <RText className="text-lg font-semibold text-gray-900 mb-4">
                Adjust Game Score
              </RText>

              <Area className="space-y-4">
                <Yard>
                  <RText className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </RText>
                  <select
                    value={gameScoreType}
                    onChange={(e) =>
                      setGameScoreType(
                        e.target.value as GameScoreTransaction["type"]
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="manual_add">Add Points</option>
                    <option value="manual_subtract">Subtract Points</option>
                  </select>
                </Yard>

                <Yard>
                  <RText className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </RText>
                  <input
                    type="number"
                    value={gameScoreAmount}
                    onChange={(e) => setGameScoreAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </Yard>

                <Yard>
                  <RText className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </RText>
                  <input
                    type="text"
                    value={gameScoreDescription}
                    onChange={(e) => setGameScoreDescription(e.target.value)}
                    placeholder="Enter description"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </Yard>
              </Area>

              <Area className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsGameScoreModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGameScoreSubmit}
                  disabled={!gameScoreAmount || !gameScoreDescription.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Apply
                </button>
              </Area>
            </Container>
          </Core>
        </>
      )}
    </>
  );
}
