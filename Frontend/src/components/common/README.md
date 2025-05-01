# Common Components

This directory contains reusable UI components that are used throughout the application.

## ActionButton

A permission-based action button component that only renders if the user has the required permission.

### Props

- `type`: Button type (view, edit, delete, add)
- `onClick`: Click handler function
- `permission`: Permission required to show this button
- `icon`: Icon to display in the button
- `title`: Button tooltip text
- `className`: Additional CSS classes

### Example

```jsx
<ActionButton
  type="view"
  onClick={() => handleView(item)}
  permission="view_courses"
  icon={<FaEye />}
  title="View Details"
/>
```

## ActionButtons

A container component for action buttons that renders multiple action buttons based on permissions.

### Props

- `row`: The data row for the current item
- `onView`: View handler function
- `onEdit`: Edit handler function
- `onDelete`: Delete handler function
- `onAdd`: Add handler function (optional)
- `viewPermission`: Permission required for view button
- `editPermission`: Permission required for edit button
- `deletePermission`: Permission required for delete button
- `addPermission`: Permission required for add button
- `className`: Additional CSS classes for the container

### Example

```jsx
<ActionButtons
  row={row}
  onView={handleView}
  onEdit={handleEdit}
  onDelete={handleDelete}
  viewPermission="view_courses"
  editPermission="edit_course"
  deletePermission="delete_course"
/>
```

## Usage in DataTable

```jsx
{
  name: "Action",
  cell: (row) => (
    <ActionButtons
      row={row}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      viewPermission="view_courses"
      editPermission="edit_course"
      deletePermission="delete_course"
    />
  ),
  width: "150px",
  center: true,
}
```
