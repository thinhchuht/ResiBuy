import React, { useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
} from "@mui/material";
import { ArrowDropDown } from "@mui/icons-material";

interface ColumnDef<T> {
  key: keyof T;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface TableProps<T> {
  data: T[];
  totalCount: number;
  columns: ColumnDef<T>[];
  onPageChange: (pageNumber: number) => void;
  itemsPerPage: number;
  page: number; // Trang hiện tại (0-based từ parent)
  headerTitle?: string;
  description?: string;
}

const CustomTableV2 = <T extends { id?: number | string }>({
  data,
  totalCount,
  columns,
  onPageChange,
  itemsPerPage,
  page,
  headerTitle = "Bảng Dữ Liệu",
  description = "",
}: TableProps<T>) => {
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof T;
    direction: "asc" | "desc";
  } | null>(null);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Handle sort
  const handleSort = (key: keyof T) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // Handle page change
  const handleChangePage = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    onPageChange(newPage); // Truyền pageNumber (1-based) trực tiếp lên parent
  };

  // Tính tổng số trang từ totalCount và itemsPerPage
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 1,
        border: "1px solid",
        borderColor: "grey.200",
        bgcolor: "background.paper",
      }}
    >
      {/* Header section */}
      <Box
        sx={{
          p: 3,
          borderBottom: 1,
          borderColor: "grey.200",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ color: "text.primary", fontWeight: "medium" }}
          >
            {headerTitle}
          </Typography>
          {description && (
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 0.5 }}
            >
              {description}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Table section */}
      <Box sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead sx={{ bgcolor: "background.paper", borderBottom: 1, borderColor: "grey.200" }}>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={String(col.key)}
                  sx={{
                    px: 3,
                    py: 2.5,
                    textAlign: "left",
                    fontSize: "0.875rem",
                    fontWeight: "medium",
                    color: "text.primary",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    ...(col.sortable && {
                      cursor: "pointer",
                      "&:hover": { bgcolor: "grey.50" },
                    }),
                  }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography variant="body2">{col.label}</Typography>
                    {col.sortable && (
                      <ArrowDropDown
                        sx={{
                          fontSize: 16,
                          transform:
                            sortConfig?.key === col.key &&
                            sortConfig.direction === "desc"
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }}
                      />
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody sx={{ bgcolor: "background.paper" }}>
            {sortedData.length > 0 ? (
              sortedData.map((item, idx) => (
                <TableRow
                  key={item.id || idx}
                  sx={{
                    "&:hover": { bgcolor: "grey.50" },
                    transition: "background-color 0.2s",
                  }}
                >
                  {columns.map((col) => (
                    <TableCell key={String(col.key)} sx={{ px: 3, py: 2 }}>
                      {col.render ? col.render(item) : String(item[col.key])}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  sx={{ px: 3, py: 4, textAlign: "center", color: "text.secondary" }}
                >
                  Không tìm thấy dữ liệu
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Pagination */}
      {totalCount > 0 && (
        <Box
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: "grey.200",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Pagination
            count={totalPages}
            page={page + 1} // Chuyển page từ 0-based sang 1-based cho Pagination
            onChange={handleChangePage}
            color="primary"
            sx={{
              ".MuiPagination-ul": {
                justifyContent: "flex-end",
              },
            }}
          />
        </Box>
      )}
    </Paper>
  );
};

export default CustomTableV2;