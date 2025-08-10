import _ from "lodash";
import type { SxProps, Theme } from "@mui/material";

// #region formatCurrency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Math.abs(amount));
};
// #endregion

// #region formatCurrencyShort
export const formatCurrencyShort = (amount: number): string => {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(0)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return amount.toString();
};
// #endregion

// #region getCurrentDate
export const getCurrentDate = (): string => {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
// #endregion

// #region getStatusBadgeConfig
export const getStatusBadgeConfig = (
  status: string
): { label: string; sx: SxProps<Theme> } => {
  const statusConfig: Record<
    string,
    { label: string; sx: SxProps<Theme> }
  > = {
    completed: {
      label: "Completed",
      sx: {
        bgcolor: "success.light",
        color: "success.dark",
        border: "1px solid",
        borderColor: "success.main",
        borderRadius: 1,
        px: 1,
        py: 0.5,
        fontSize: "0.75rem",
        fontWeight: "medium",
      },
    },
    cancelled: {
      label: "Cancelled",
      sx: {
        bgcolor: "error.light",
        color: "error.dark",
        border: "1px solid",
        borderColor: "error.main",
        borderRadius: 1,
        px: 1,
        py: 0.5,
        fontSize: "0.75rem",
        fontWeight: "medium",
      },
    },
    in_progress: {
      label: "In progress",
      sx: {
        bgcolor: "info.light",
        color: "info.dark",
        border: "1px solid",
        borderColor: "info.main",
        borderRadius: 1,
        px: 1,
        py: 0.5,
        fontSize: "0.75rem",
        fontWeight: "medium",
      },
    },
    in_review: {
      label: "In review",
      sx: {
        bgcolor: "warning.light",
        color: "warning.dark",
        border: "1px solid",
        borderColor: "warning.main",
        borderRadius: 1,
        px: 1,
        py: 0.5,
        fontSize: "0.75rem",
        fontWeight: "medium",
      },
    },
  };

  return (
    statusConfig[status as keyof typeof statusConfig] || {
      label: status,
      sx: {
        bgcolor: "grey.100",
        color: "grey.800",
        border: "1px solid",
        borderColor: "grey.200",
        borderRadius: 1,
        px: 1,
        py: 0.5,
        fontSize: "0.75rem",
        fontWeight: "medium",
      },
    }
  );
};
// #endregion

// #region getPaymentMethodIcon
export const getPaymentMethodIcon = (
  method: string
): { text: string; sx: SxProps<Theme> } => {
  if (method.toLowerCase() === "mastercard") {
    return {
      text: "MC",
      sx: {
        width: 32,
        height: 20,
        bgcolor: "linear-gradient(to right, #ef4444, #f59e0b)",
        color: "white",
        borderRadius: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.75rem",
        fontWeight: "bold",
      },
    };
  }
  return {
    text: "VISA",
    sx: {
      width: 32,
      height: 20,
      bgcolor: "linear-gradient(to right, #2563eb, #1e40af)",
      color: "white",
      borderRadius: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.75rem",
      fontWeight: "bold",
    },
  };
};
// #endregion

// #region calculateStatsFromApi
export const calculateStatsFromApi = (apiData: any) => {
  const data = apiData?.data || [];
  const comparison = apiData?.comparison || {};

  const totalOrderAmount = _.sumBy(data, "totalOrderAmount") || 0;
  const orderCount = _.sumBy(data, "orderCount") || 0;
  const productQuantity = _.sumBy(data, "productQuantity") || 0;
  const uniqueBuyers = _.sumBy(data, "uniqueBuyers") || 0;

  return {
    totalOrderAmount,
    orderCount,
    productQuantity,
    uniqueBuyers,
    comparison,
  };
};
// #endregion