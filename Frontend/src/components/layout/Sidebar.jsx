import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { 
  FaChalkboardTeacher, 
  FaGraduationCap, 
  FaHome, 
  FaUsers, 
  FaCog, 
  FaBell, 
  FaTimes 
} from "react-icons/fa";
import '../../assets/styles/Sidebar.css';

/**
 * Sidebar component that auto-detects user role from localStorage
 */
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [userRole, setUserRole] = useState("admin");
  
  // Get user role from localStorage
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserRole(userData.role || "admin");
      } catch (error) {
        console.error("Error parsing user data", error);
      }
    }
  }, []);
  
  // Generate menu items based on user role
  const getMenuItems = () => {
    // Common menu items for all roles
    const items = [
      {
        id: "dashboard",
        name: "Dashboard",
        icon: <FaHome className="menu-icon" />,
        path: `/dashboard/${getDashboardPath()}`,
        exact: true
      },
      {
        id: "courses",
        name: "All Courses",
        icon: <FaGraduationCap className="menu-icon" />,
        path: `/dashboard/${getDashboardPath()}/courses`,
      },
      {
        id: "notification",
        name: "Notifications",
        icon: <FaBell className="menu-icon" />,
        path: `/dashboard/${getDashboardPath()}/notification`,
      },
      {
        id: "settings",
        name: "Settings",
        icon: <FaCog className="menu-icon" />,
        path: `/dashboard/${getDashboardPath()}/settings`,
      },
    ];

    // Add role-specific items
    if (userRole === "admin") {
      // Insert after courses
      items.splice(2, 0, 
        {
          id: "organizers",
          name: "Organizers",
          icon: <FaUsers className="menu-icon" />,
          path: `/dashboard/admin/organizers`,
        },
        {
          id: "professors",
          name: "Professors",
          icon: <FaChalkboardTeacher className="menu-icon" />,
          path: `/dashboard/admin/professors`,
        }
      );
    } else if (userRole === "educator") {
      // Insert after courses
      items.splice(2, 0, 
        {
          id: "professors",
          name: "Professors",
          icon: <FaChalkboardTeacher className="menu-icon" />,
          path: `/dashboard/school/professors`,
        }
      );
    }

    return items;
  };

  // Get the correct dashboard path based on role
  const getDashboardPath = () => {
    if (userRole === "admin") {
      return "admin";
    } else if (userRole === "educator") {
      return "school";
    } else {
      return "tutor";
    }
  };

  return (
    <>
    <div className="sidebar-layout-parent">
      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
      
      {/* Sidebar container */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Logo & close button container for mobile */}
        <div className="sidebar-header">
          <h2 className="sidebar-logo">IIM AHMEDABAD</h2>
          <button className="close-sidebar-btn" onClick={toggleSidebar}>
            <FaTimes />
          </button>
        </div>

        {/* Navigation menu */}
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            {getMenuItems().map((item) => (
              <li key={item.id} className="menu-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `menu-link ${isActive ? "active" : ""}`
                  }
                  end={item.exact}
                >
                  {item.icon}
                  <span className="menu-text">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      </div>
    </>
  );
};

export default Sidebar; 