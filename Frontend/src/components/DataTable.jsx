import React, { useState, useMemo } from 'react';
import DataTable from 'react-data-table-component';
import '../assets/styles/DataTable.css';

const DataTableComponent = ({ 
  columns, 
  data, 
  title = "", 
  searchPlaceholder = "Search...",
  showSearch = true,
  pagination = true
}) => {
  const [filterText, setFilterText] = useState('');
  
  const filteredItems = useMemo(() => {
    if (!filterText) return data;
    
    return data.filter(item => {
      return Object.keys(item).some(key => {
        const value = item[key];
        if (value !== null && value !== undefined) {
          return String(value).toLowerCase().includes(filterText.toLowerCase());
        }
        return false;
      });
    });
  }, [data, filterText]);

  const subHeaderComponent = showSearch ? (
    <div className="search-container">
      <input
        type="text"
        placeholder={searchPlaceholder}
        value={filterText}
        onChange={e => setFilterText(e.target.value)}
        className="search-input"
      />
    </div>
  ) : null;

  return (
    <div className="data-table-container">
      <DataTable
        title={title}
        columns={columns}
        data={filteredItems}
        pagination={pagination}
        subHeader={showSearch}
        subHeaderComponent={subHeaderComponent}
        persistTableHead
        highlightOnHover
        pointerOnHover
        responsive
      />
    </div>
  );
};

export default DataTableComponent; 