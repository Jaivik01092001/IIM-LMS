import React from 'react';
import DataTableComponent from '../components/DataTable';

const TableExample = () => {
  // Example 1: Simple User Table
  const userColumns = [
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
    {
      name: 'Email',
      selector: row => row.email,
      sortable: true,
    },
    {
      name: 'Role',
      selector: row => row.role,
      sortable: true,
    },
  ];

  const userData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Teacher' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Student' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Student' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'Teacher' },
  ];

  // Example 2: Course Table with custom formatting
  const courseColumns = [
    {
      name: 'Course ID',
      selector: row => row.id,
      sortable: true,
      width: '100px',
    },
    {
      name: 'Course Name',
      selector: row => row.name,
      sortable: true,
    },
    {
      name: 'Instructor',
      selector: row => row.instructor,
      sortable: true,
    },
    {
      name: 'Duration',
      selector: row => row.duration,
      sortable: true,
    },
    {
      name: 'Price',
      cell: row => <span>${row.price.toFixed(2)}</span>,
      sortable: true,
      right: true,
    },
    {
      name: 'Enrollment Status',
      cell: row => (
        <span className={`status-badge ${row.enrollmentOpen ? 'open' : 'closed'}`}>
          {row.enrollmentOpen ? 'Open' : 'Closed'}
        </span>
      ),
      sortable: true,
    },
  ];

  const courseData = [
    { id: 'CS101', name: 'Introduction to Computer Science', instructor: 'Dr. Smith', duration: '12 weeks', price: 199.99, enrollmentOpen: true },
    { id: 'MATH201', name: 'Advanced Mathematics', instructor: 'Prof. Johnson', duration: '8 weeks', price: 149.99, enrollmentOpen: true },
    { id: 'ENG104', name: 'Creative Writing', instructor: 'Ms. Williams', duration: '10 weeks', price: 129.99, enrollmentOpen: false },
    { id: 'BIO303', name: 'Human Anatomy', instructor: 'Dr. Brown', duration: '16 weeks', price: 299.99, enrollmentOpen: true },
    { id: 'HIST105', name: 'World History', instructor: 'Prof. Davis', duration: '14 weeks', price: 179.99, enrollmentOpen: false },
  ];

  return (
    <div className="tables-example-container">
      <h1>DataTable Component Examples</h1>

      <div className="example-table">
        <h2>Example 1: User Table</h2>
        <p>A simple table with basic text data and built-in search functionality.</p>
        <DataTableComponent
          columns={userColumns}
          data={userData}
          title="Users"
          searchPlaceholder="Search users..."
        />
      </div>

      <div className="example-table">
        <h2>Example 2: Course Table</h2>
        <p>A table with custom formatted cells (price and enrollment status).</p>
        <DataTableComponent
          columns={courseColumns}
          data={courseData}
          title="Available Courses"
          searchPlaceholder="Search courses..."
        />
      </div>

      <style jsx>{`
        .tables-example-container {
          padding: 2rem;
          margin: 0 auto;
        }
        
        h1 {
          margin-bottom: 2rem;
          color: #1e293b;
        }
        
        .example-table {
          margin-bottom: 3rem;
        }
        
        h2 {
          color: #334155;
          margin-bottom: 0.5rem;
        }
        
        p {
          color: #64748b;
          margin-bottom: 1.5rem;
        }
        
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .status-badge.open {
          background-color: #dcfce7;
          color: #166534;
        }
        
        .status-badge.closed {
          background-color: #fee2e2;
          color: #b91c1c;
        }
      `}</style>
    </div>
  );
};

export default TableExample; 