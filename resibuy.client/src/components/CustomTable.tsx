

import React, { useState } from "react";
import { Search, Plus, Filter, Download, ChevronDown } from "lucide-react";

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
  headerTitle = "Data Table",
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
  const sortedData = React.useMemo(() => {
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header section */}
      <div className="p-6 border-b border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {headerTitle}
            </h2>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {showExport && onExport && (
              <button
                onClick={onExport}
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            )}
            {Object.keys(filters).length > 0 && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            )}
            {onAddItem && (
              <button
                onClick={onAddItem}
                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add New
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center  gap-4">
          {showSearch && (
            <div className="relative flex-1 max-w-md ">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border  bg-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          )}

          {showBulkActions && selectedItems.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedItems.length} selected
              </span>
              {onBulkDelete && (
                <button
                  onClick={() => onBulkDelete(selectedItems)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete Selected
                </button>
              )}
            </div>
          )}
        </div>

        {/* Filters */}
        {showFilters && Object.keys(filters).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            {Object.entries(filters).map(([key, options]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {key}
                </label>
                <select
                  value={activeFilters[key] || ""}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                  className="w-full px-3 py-2 border bg-white text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All {key}</option>
                  {options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Table section */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white shadow-sm border-b border-gray-200">
            <tr>
              {showBulkActions && (
                <th className="px-6 py-5 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-6 py-5 text-left text-sm font-medium text-gray-800 uppercase tracking-wider ${
                    col.sortable ? "cursor-pointer hover:bg-gray-50" : ""
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          sortConfig?.key === col.key &&
                          sortConfig.direction === "desc"
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    )}
                  </div>
                </th>
              ))}
              {(onDelete || onUpdate) && (
                <th className="px-6 py-5 text-left text-sm font-medium text-gray-800 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length > 0 ? (
              paginatedData.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {showBulkActions && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.some(
                          (selected) => selected.id === item.id
                        )}
                        onChange={(e) =>
                          handleSelectItem(item, e.target.checked)
                        }
                        className="rounded border-gray-300"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-6 py-4">
                      {col.render ? col.render(item) : String(item[col.key])}
                    </td>
                  ))}
                  {(onDelete || onUpdate) && (
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {onUpdate && (
                          <button
                            onClick={() => onUpdate(item)}
                            className=" text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded transition-colors"
                          >
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(item)}
                            className= "text-red-600  hover:text-red-800 p-1 hover:bg-red-50 rounded transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={
                    columns.length +
                    (showBulkActions ? 1 : 0) +
                    (onDelete || onUpdate ? 1 : 0)
                  }
                  className="px-6 py-8 text-center text-gray-500"
                >
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, sortedData.length)} of{" "}
            {sortedData.length} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded-md text-sm ${
                  currentPage === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTable;
