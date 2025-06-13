

import { Filter, ChevronDown } from "lucide-react";
import {
  formatCurrency,
  getStatusBadgeConfig,
  getPaymentMethodIcon,
  getRecentTransactions,
} from "../../../components/admin/Dashboard/seg/utils";
import map from "lodash/map";
import {
  Area,
  Yard,
  Section,
  Anchor,
  RText,
  Core,
  Container,
} from "../../../lib/by/Div/index";

export function TransactionsTable() {
  const transactions = getRecentTransactions();

  return (
    <Core className="bg-white rounded-lg shadow-sm border">
      <Container className="p-6 border-b">
        <Area className="flex items-center justify-between">
          <Yard>
            <RText className="text-lg font-semibold">Transactions</RText>
            <RText className="text-sm text-gray-600">
              This is a list of latest transactions
            </RText>
          </Yard>
          <Anchor className="flex items-center space-x-2">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filter by status
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
            <input
              placeholder="From"
              className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              placeholder="To"
              className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </Anchor>
        </Area>
      </Container>
      <Container className="p-6 text-black">
        <Area className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-500 uppercase tracking-wider text-xs">
                  TRANSACTION
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 uppercase tracking-wider text-xs">
                  DATE & TIME
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 uppercase tracking-wider text-xs">
                  AMOUNT
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 uppercase tracking-wider text-xs">
                  REFERENCE NUMBER
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 uppercase tracking-wider text-xs">
                  PAYMENT METHOD
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 uppercase tracking-wider text-xs">
                  STATUS
                </th>
              </tr>
            </thead>
            <tbody>
              {map(transactions, (order) => {
                const statusConfig = getStatusBadgeConfig(order.status);
                const paymentIcon = getPaymentMethodIcon(order.paymentMethod);

                return (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <Yard className="font-medium">
                        {order.isRefund
                          ? `Payment refund to ${order.id}`
                          : `Payment from ${order.customer}`}
                      </Yard>
                    </td>
                    <td className="py-4 px-4 text-gray-500">{order.date}</td>
                    <td
                      className={`py-4 px-4 ${order.amount < 0 ? "text-red-500" : ""}`}
                    >
                      {order.amount < 0 ? "-" : ""}
                      {formatCurrency(order.amount)}
                    </td>
                    <td className="py-4 px-4 text-gray-500">
                      {order.reference}
                    </td>
                    <td className="py-4 px-4">
                      <Yard className="flex items-center space-x-2">
                        <Section className={paymentIcon.className}>
                          {paymentIcon.text}
                        </Section>
                        <span className="text-gray-500">
                          •••{" "}
                          {order.paymentMethod === "mastercard" ? "475" : "924"}
                        </span>
                      </Yard>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.className}`}
                      >
                        {statusConfig.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Area>
      </Container>
    </Core>
  );
}
