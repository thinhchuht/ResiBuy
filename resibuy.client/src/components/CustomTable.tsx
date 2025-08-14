import React, { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  Button,
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
  Pagination,
} from "@mui/material";
import {
  Search,
  Add,
  FilterList,
  FileDownload,
  ArrowDropDown,
  Upload,
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
    totalCount?: number; // api sẽ trả về tổng số bản ghi, không phải độ dài của mảng data
  columns: ColumnDef<T>[];
  onDelete?: (item: T) => void;
  onUpdate?: (item: T) => void;
  onAddItem?: () => void;
  onBulkDelete?: (items: T[]) => void;
  onExport?: () => void;
  onPageChange?: (pageNumber: number) => void; 
  headerTitle?: string;
  showSearch?: boolean;
  description?: string;
  filters?: { [key: string]: FilterOption[] };
  onFilterChange?: (filters: { [key: string]: string }) => void;
  showBulkActions?: boolean;
  showExport?: boolean;
  itemsPerPage?: number; // pageSize mặc định
  showImport?: boolean;
  onImport?: () => void;
}

const CustomTable = <T extends { id?: number | string }>({
  data,
  totalCount = data.length,
  columns,
  onDelete,
  onUpdate,
  onAddItem,
  onBulkDelete,
  onExport,
  onPageChange,
  headerTitle = "Bảng Dữ Liệu",
  showSearch = true,
  description = "",
  filters = {},
  onFilterChange,
  showBulkActions = false,
  showExport = false,
  itemsPerPage = 10,
  showImport = false,
  onImport,
}: TableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<T[]>([]);
  const [page, setPage] = useState(1); // pageNumber, bắt đầu từ 1
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: "asc" | "desc";
  } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{ [key: string]: string }>({});

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

  // Handle sort
  const handleSort = (key: keyof T) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
    setPage(1); // Reset to first page on sort
    onPageChange?.(1); // Notify parent
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? sortedData : []);
  };

  // Handle select item
  const handleSelectItem = (item: T, checked: boolean) => {
    setSelectedItems((prev) =>
      checked ? [...prev, item] : prev.filter((i) => i.id !== item.id)
    );
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
    setPage(1); // Reset to first page
    onPageChange?.(1); // Notify parent
  };

  // Handle page change
  const handleChangePage = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
    onPageChange?.(newPage); // Truyền pageNumber (bắt đầu từ 1)
  };

  const isAllSelected =
    sortedData.length > 0 && selectedItems.length === sortedData.length;
  const isIndeterminate =
    selectedItems.length > 0 && selectedItems.length < sortedData.length;

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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {showImport && onImport && (
              <Button
                onClick={onImport}
                startIcon={<Upload />}
                sx={{
                  bgcolor: "success.light",
                  color: "success.contrastText",
                  px: 1.5,
                  py: 1,
                  fontSize: "0.875rem",
                  fontWeight: "medium",
                  borderRadius: 1,
                  "&:hover": { bgcolor: "success.main" },
                }}
              >
                Nhập Excel
              </Button>
            )}
            {showExport && onExport && (
              <Button
                onClick={onExport}
                startIcon={<FileDownload />}
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
                  px: 2,
                  py: 1,
                  fontSize: "0.875rem",
                  fontWeight: "medium",
                  borderRadius: 1,
                  "&:hover": { bgcolor: "primary.dark" },
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
              sx={{ maxWidth: 300, flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "grey.400" }} />
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
              },
              gap: 2,
              p: 2,
              bgcolor: "grey.50",
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
            {sortedData.length > 0 ? (
              sortedData.map((item, idx) => (
                <TableRow
                  key={item.id || idx}
                  sx={{
                    "&:hover": { bgcolor: "grey.50" },
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
            page={page}
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

export default CustomTable;