import React, { useState, useEffect } from 'react';
import { FaBars, FaBell, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../assets/styles/TopBar.css';

/**
 * TopBar component for the dashboard
 */
const TopBar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userName, setUserName] = useState('User');
  const [userRole, setUserRole] = useState('');
  const [dashboardType, setDashboardType] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Get user info from localStorage
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserName(userData.name || 'User');

        // Set user role and dashboard type
        const role = userData.role || '';
        setUserRole(role);

        // Set formatted role title
        if (role === 'admin') {
          setDashboardType('Admin');
        } else if (role === 'educator') {
          setDashboardType('School');
        } else {
          setDashboardType('Tutor');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Update page title based on current route
  useEffect(() => {
    const path = location.pathname;
    setPageTitle(getPageTitle(path));
  }, [location, dashboardType]);

  // Function to get page title based on route
  const getPageTitle = (path) => {
    // Extract the path segments
    const pathSegments = path.split('/');

    // Filter out empty segments
    const filteredSegments = pathSegments.filter(segment => segment);

    // If we have at least 2 segments (dashboard/something)
    if (filteredSegments.length >= 2) {
      const lastSegment = filteredSegments[filteredSegments.length - 1];

      // Map of route segments to page titles
      const titleMap = {
        'admin': 'Admin Dashboard',
        'school': 'School Dashboard',
        'tutor': 'Tutor Dashboard',
        'courses': 'Courses',
        'organizers': 'Organizers',
        'professors': 'Professors',
        'notification': 'Notifications',
        'settings': 'Settings'
      };

      return titleMap[lastSegment] || `${dashboardType} Dashboard`;
    }

    // Default to dashboard type if no specific page is found
    return `${dashboardType} Dashboard`;
  };

  // Handle profile dropdown toggle
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  // Get profile picture or initials
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="topbar">
      {/* Mobile menu toggle */}
      <button className="menu-toggle" onClick={toggleSidebar}>
        <FaBars />
      </button>

      {/* Dashboard title */}
      <div className="dashboard-title">
        <h1>{pageTitle}</h1>
      </div>

      {/* Right side actions */}
      <div className="topbar-actions">
        {/* Search box */}
        <div className="search-box">
          <input type="text" placeholder="Search..." />
        </div>

        {/* Notification button */}
        {/* <button className="notification-btn">
          <FaBell />
          <span className="notification-badge">3</span>
        </button> */}

        {/* User profile */}
        <div className="user-profile" onClick={toggleDropdown}>
          <div className="avatar">
            {getInitials(userName)}
          </div>
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <span className="user-role">
              {userRole === 'admin' ? 'Administrator' :
               userRole === 'educator' ? 'School Admin' : 'Tutor'}
            </span>
          </div>

          {/* Dropdown menu */}
          {showDropdown && (
            <div className="profile-dropdown">
              <ul>
                <li>
                  <a href="#">
                    <FaCog /> Settings
                  </a>
                </li>
                <li>
                  <button onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;