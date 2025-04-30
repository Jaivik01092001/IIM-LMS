import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import DataTable from "react-data-table-component";
import "../assets/styles/DataTable.css";

const DataTableComponent = ({
  columns,
  data,
  title = "",
  searchPlaceholder = "Search...",
  showSearch = true,
  pagination = true,
}) => {
  const { t } = useTranslation();
  const [filterText, setFilterText] = useState("");

  // Process columns to convert boolean attributes to strings
  const processedColumns = useMemo(() => {
    return columns.map((column) => {
      const newColumn = { ...column };

      // Convert boolean 'center' attribute to string
      if (newColumn.center === true) {
        newColumn.center = "true";
      }

      // Convert boolean 'right' attribute to string
      if (newColumn.right === true) {
        newColumn.right = "true";
      }

      return newColumn;
    });
  }, [columns]);

  const filteredItems = useMemo(() => {
    if (!filterText) return data;

    return data.filter((item) => {
      return Object.keys(item).some((key) => {
        const value = item[key];
        if (value !== null && value !== undefined) {
          return String(value).toLowerCase().includes(filterText.toLowerCase());
        }
        return false;
      });
    });
  }, [data, filterText]);

  // Use the custom search placeholder or default to translated 'Search...'
  const translatedSearchPlaceholder =
    searchPlaceholder === "Search..."
      ? t("common.search") + "..."
      : searchPlaceholder;

  const subHeaderComponent = showSearch ? (
    <div className="search-container">
      <input
        type="text"
        placeholder={translatedSearchPlaceholder}
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        className="search-input"
      />
    </div>
  ) : null;

  return (
    <div className="data-table-container">
      <DataTable
        title={title}
        columns={processedColumns}
        data={filteredItems}
        pagination={pagination}
        subHeader={showSearch}
        subHeaderComponent={subHeaderComponent}
        persistTableHead
        highlightOnHover
        pointerOnHover
        responsive
        noDataComponent={t("common.noResults")}
      />
    </div>
  );
};

export default DataTableComponent;
