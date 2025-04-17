# Reusable Table Components

This directory contains reusable table components that can be used across the application.

## DataTable Component

A flexible and reusable table component with built-in searching, pagination, and sorting capabilities.

### Usage

```jsx
import DataTableComponent from '../components/DataTable';

// Define columns
const columns = [
  {
    name: 'ID',
    selector: row => row.id,
    sortable: true,
    width: '70px',
  },
  {
    name: 'Name',
    selector: row => row.name,
    sortable: true,
  },
  // Add more columns as needed
];

// Define data
const data = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Jane Smith' },
  // Add more rows as needed
];

// Use the component
<DataTableComponent 
  columns={columns} 
  data={data}
  title="Users"                       // Optional: Table title
  searchPlaceholder="Search users..." // Optional: Custom search placeholder
  showSearch={true}                   // Optional: Show/hide search box (default: true)
  pagination={true}                   // Optional: Enable/disable pagination (default: true)
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| columns | Array | Required | Array of column definition objects |
| data | Array | Required | Array of data objects |
| title | String | "" | Table title |
| searchPlaceholder | String | "Search..." | Placeholder text for the search input |
| showSearch | Boolean | true | Whether to display the search input |
| pagination | Boolean | true | Whether to enable pagination |

### Column Definition

Each column object can have the following properties:

```js
{
  name: 'Column Name',            // Required: Display name for the column
  selector: row => row.property,  // Required: Function to select the value from the row data
  sortable: true,                 // Optional: Whether the column is sortable
  width: '100px',                 // Optional: Fixed width for the column
  center: true,                   // Optional: Center align the content
  right: true,                    // Optional: Right align the content
  cell: row => (                  // Optional: Custom cell renderer
    <CustomComponent data={row.property} />
  ),
}
```

## Pagination Component

A standalone pagination component that can be used independently of the DataTable.

### Usage

```jsx
import Pagination from '../components/Pagination';

const MyComponent = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      maxVisiblePages={5} // Optional
    />
  );
};
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| currentPage | Number | Required | Current active page |
| totalPages | Number | Required | Total number of pages |
| onPageChange | Function | Required | Callback function when page changes |
| maxVisiblePages | Number | 5 | Maximum number of page buttons to display |

## Examples

See `TableExample.jsx` page for complete examples of how to use these components with different data and customizations. 