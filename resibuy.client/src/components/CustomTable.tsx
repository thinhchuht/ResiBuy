import React, { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Search,
  Add,
  FilterList,
  FileDownload,
  ArrowDropDown,
} from "@mui/icons-material";

interface ColumnDef<T> {
  key: keyof T;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  
}

interface FilterOption {
  label: string;
  value: string;
}

interface TableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onDelete?: (item: T) => void;
  onUpdate?: (item: T) => void;
  onAddItem?: () => void;
  onBulkDelete?: (items: T[]) => void;
  onExport?: () => void;
  headerTitle?: string;
  showSearch?: boolean;
  description?: string;
  filters?: { [key: string]: FilterOption[] };
  onFilterChange?: (filters: { [key: string]: string }) => void;
  showBulkActions?: boolean;
  showExport?: boolean;
  itemsPerPage?: number;
}

const CustomTable = <T extends { id?: number | string }>({
  data,
  columns,
  onDelete,
  onUpdate,
  onAddItem,
  onBulkDelete,
  onExport,
  headerTitle = "Bảng Dữ Liệu",
  showSearch = true,
  description = "",
  filters = {},
  onFilterChange,
  showBulkActions = false,
  showExport = false,
  itemsPerPage = 10,
}: TableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: "asc" | "desc";
  } | null>(null);
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string }>(
    {}
  );
  const [showFilters, setShowFilters] = useState(false);

  // Filter data based on search and filters
  const filteredData = data.filter((row) => {
    const matchesSearch = columns.some((col) =>
      String(row[col.key] ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    const matchesFilters = Object.entries(activeFilters).every(
      ([key, value]) => {
        if (!value) return true;
        return String(row[key as keyof T]) === value;
      }
    );

    return matchesSearch && matchesFilters;
  });

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: keyof T) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? paginatedData : []);
  };

  const handleSelectItem = (item: T, checked: boolean) => {
    setSelectedItems((prev) =>
      checked ? [...prev, item] : prev.filter((i) => i.id !== item.id)
    );
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
    setCurrentPage(1);
  };

  const isAllSelected =
    paginatedData.length > 0 && selectedItems.length === paginatedData.length;
  const isIndeterminate =
    selectedItems.length > 0 && selectedItems.length < paginatedData.length;

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
          p: 3, // Thay p-6
          borderBottom: 1,
          borderColor: "grey.200",
          display: "flex",
          flexDirection: "column",
          gap: 2, // Thay space-y-4
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ color: "text.primary", fontWeight: "medium" }} // Thay text-lg font-semibold text-gray-800
            >
              {headerTitle}
            </Typography>
            {description && (
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mt: 0.5 }} // Thay text-sm text-gray-500 mt-1
              >
                {description}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {showExport && onExport && (
              <Button
                onClick={onExport}
                startIcon={<FileDownload />}
                sx={{
                  bgcolor: "grey.100",
                  color: "grey.700",
                  px: 1.5, // Thay px-3
                  py: 1, // Thay py-2
                  fontSize: "0.875rem",
                  fontWeight: "medium",
                  borderRadius: 1,
                  "&:hover": { bgcolor: "grey.200" }, // Thay hover:bg-gray-200
                }}
              >
                Xuất
              </Button>
            )}
            {Object.keys(filters).length > 0 && (
              <Button
                onClick={() => setShowFilters(!showFilters)}
                startIcon={<FilterList />}
                sx={{
                  bgcolor: "grey.100",
                  color: "grey.700",
                  px: 1.5,
                  py: 1,
                  fontSize: "0.875rem",
                  fontWeight: "medium",
                  borderRadius: 1,
                  "&:hover": { bgcolor: "grey.200" },
                }}
              >
                Bộ Lọc
              </Button>
            )}
            {onAddItem && (
              <Button
                onClick={onAddItem}
                startIcon={<Add />}
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  px: 2, // Thay px-4
                  py: 1, // Thay py-2
                  fontSize: "0.875rem",
                  fontWeight: "medium",
                  borderRadius: 1,
                  "&:hover": { bgcolor: "primary.dark" }, // Thay hover:bg-blue-700
                }}
              >
                Thêm Mới
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {showSearch && (
            <TextField
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{ maxWidth: 300, flex: 1 }} // Thay max-w-md
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "grey.400" }} /> {/* Thay text-gray-400 */}
                  </InputAdornment>
                ),
              }}
            />
          )}

          {showBulkActions && selectedItems.length > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" sx={{ color: "grey.600" }}>
                Đã chọn {selectedItems.length}
              </Typography>
              {onBulkDelete && (
                <Button
                  onClick={() => onBulkDelete(selectedItems)}
                  color="error"
                  sx={{ fontSize: "0.875rem", fontWeight: "medium" }}
                >
                  Xóa Đã Chọn
                </Button>
              )}
            </Box>
          )}
        </Box>

        {/* Filters */}
        {showFilters && Object.keys(filters).length > 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, 1fr)",
              }, // Thay grid-cols-1 md:grid-cols-3
              gap: 2, // Thay gap-4
              p: 2, // Thay p-4
              bgcolor: "grey.50", // Thay bg-gray-50
              borderRadius: 1,
            }}
          >
            {Object.entries(filters).map(([key, options]) => (
              <FormControl key={key} size="small">
                <InputLabel sx={{ textTransform: "capitalize" }}>{key}</InputLabel>
                <Select
                  value={activeFilters[key] || ""}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                  label={key}
                >
                  <MenuItem value="">Tất cả {key}</MenuItem>
                  {options.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ))}
          </Box>
        )}
      </Box>

      {/* Table section */}
      <Box sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead sx={{ bgcolor: "background.paper", borderBottom: 1, borderColor: "grey.200" }}>
            <TableRow>
              {showBulkActions && (
                <TableCell sx={{ px: 3, py: 2.5 }}>
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableCell>
              )}
              {columns.map((col) => (
                <TableCell
                  key={String(col.key)}
                  sx={{
                    px: 3, // Thay px-6
                    py: 2.5, // Thay py-5
                    textAlign: "left",
                    fontSize: "0.875rem",
                    fontWeight: "medium",
                    color: "text.primary",
                    textTransform: "uppercase",
                    letterSpacing: 0.5, // Thay tracking-wider
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
                          fontSize: 16, // Thay w-4 h-4
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
              {(onDelete || onUpdate) && (
                <TableCell
                  sx={{
                    px: 3,
                    py: 2.5,
                    textAlign: "left",
                    fontSize: "0.875rem",
                    fontWeight: "medium",
                    color: "text.primary",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Hành Động
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody sx={{ bgcolor: "background.paper" }}>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, idx) => (
                <TableRow
                  key={item.id || idx}
                  sx={{
                    "&:hover": { bgcolor: "grey.50" }, // Thay hover:bg-gray-50
                    transition: "background-color 0.2s",
                  }}
                >
                  {showBulkActions && (
                    <TableCell sx={{ px: 3, py: 2 }}>
                      <Checkbox
                        checked={selectedItems.some(
                          (selected) => selected.id === item.id
                        )}
                        onChange={(e) => handleSelectItem(item, e.target.checked)}
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => (
                    <TableCell key={String(col.key)} sx={{ px: 3, py: 2 }}>
                      {col.render ? col.render(item) : String(item[col.key])}
                    </TableCell>
                  ))}
                  {(onDelete || onUpdate) && (
                    <TableCell sx={{ px: 3, py: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {onUpdate && (
                          <Button
                            onClick={() => onUpdate(item)}
                            color="primary"
                            sx={{
                              p: 0.5,
                              minWidth: 0,
                              "&:hover": { bgcolor: "primary.light" },
                            }}
                          >
                            Sửa
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            onClick={() => onDelete(item)}
                            color="error"
                            sx={{
                              p: 0.5,
                              minWidth: 0,
                              "&:hover": { bgcolor: "error.light" },
                            }}
                          >
                            Xóa
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length +
                    (showBulkActions ? 1 : 0) +
                    (onDelete || onUpdate ? 1 : 0)
                  }
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
      {totalPages > 1 && (
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: 1,
            borderColor: "grey.200",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="body2" sx={{ color: "grey.700" }}>
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến{" "}
            {Math.min(currentPage * itemsPerPage, sortedData.length)} của{" "}
            {sortedData.length} kết quả
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              sx={{
                px: 1.5,
                py: 0.5,
                border: 1,
                borderColor: "grey.300",
                borderRadius: 1,
                fontSize: "0.875rem",
                "&:hover": { bgcolor: "grey.50" },
                "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
              }}
            >
              Trước
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                onClick={() => setCurrentPage(page)}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  border: 1,
                  borderColor: currentPage === page ? "primary.main" : "grey.300",
                  borderRadius: 1,
                  fontSize: "0.875rem",
                  bgcolor: currentPage === page ? "primary.main" : "transparent",
                  color: currentPage === page ? "white" : "text.primary",
                  "&:hover": {
                    bgcolor: currentPage === page ? "primary.main" : "grey.50",
                  },
                }}
              >
                {page}
              </Button>
            ))}
            <Button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              sx={{
                px: 1.5,
                py: 0.5,
                border: 1,
                borderColor: "grey.300",
                borderRadius: 1,
                fontSize: "0.875rem",
                "&:hover": { bgcolor: "grey.50" },
                "&:disabled": { opacity: 0.5, cursor: "not-allowed" },
              }}
            >
              Tiếp
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default CustomTable;