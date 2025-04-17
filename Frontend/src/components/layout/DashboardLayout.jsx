import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ScrollToTopButton from '../common/ScrollToTopButton';
import '../../assets/styles/DashboardLayout.css';

/**
 * Dashboard layout component with sidebar and content area
 */
const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/');
    }
  }, [navigate]);

  // Toggle sidebar for mobile view
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking outside on mobile
  const closeSidebar = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />

      <div className="dashboard-content">
        <TopBar
          toggleSidebar={toggleSidebar}
        />

        <main className="main-content" onClick={closeSidebar}>
          <Outlet />
          <ScrollToTopButton />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;