import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import bluelogo from "../..//assets/images/login_page/bluelogo.svg";
import {
  FaChalkboardTeacher,
  FaGraduationCap,
  FaHome,
  FaUsers,
  FaCog,
  FaBell,
  FaTimes,
  FaChevronDown,
  FaUniversity,
  FaUserTie,
} from "react-icons/fa";
import "../../assets/styles/Sidebar.css";

/**
 * Sidebar component that auto-detects user role from localStorage
 */
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [userRole, setUserRole] = useState("admin");
  const [openDropdown, setOpenDropdown] = useState("");
  const location = useLocation();

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
        exact: true,
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
      items.splice(2, 0, {
        id: "users",
        name: "Users",
        icon: <FaUsers className="menu-icon" />,
        isDropdown: true,
        submenu: [
          {
            id: "universities",
            name: "Universities/Schools",
            path: `/dashboard/admin/schools`,
            icon: <FaUniversity />,
          },
          {
            id: "educators",
            name: "Educators",
            path: `/dashboard/admin/educators`,
            icon: <FaUserTie />,
          },
        ],
      });
    } else if (userRole === "educator") {
      // Insert after courses
      items.splice(2, 0, {
        id: "educators",
        name: "Educators",
        icon: <FaChalkboardTeacher className="menu-icon" />,
        path: `/dashboard/school/educators`,
      });
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

  // Toggle dropdown menu
  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? "" : id);
  };

  // Check if a submenu item is active
  const isSubmenuActive = (submenuItems) => {
    return submenuItems.some(
      (item) =>
        location.pathname === item.path ||
        location.pathname.startsWith(item.path + "/")
    );
  };

  // Auto-open dropdown if a submenu item is active
  useEffect(() => {
    const menuItems = getMenuItems();
    const activeDropdown = menuItems.find(
      (item) => item.isDropdown && isSubmenuActive(item.submenu)
    );

    if (activeDropdown) {
      setOpenDropdown(activeDropdown.id);
    }
  }, [location.pathname, userRole]); // userRole is included because getMenuItems depends on it

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
            <img src={bluelogo} alt="" />
            <h1 className="sidebar-logo">IIM Ahmedabad</h1>
            <button className="close-sidebar-btn" onClick={toggleSidebar}>
              <FaTimes />
            </button>
          </div>

          {/* Navigation menu */}
          <nav className="sidebar-nav">
            <ul className="sidebar-menu">
              {getMenuItems().map((item) => (
                <li
                  key={item.id}
                  className={`menu-item ${
                    item.isDropdown ? "dropdown-menu" : ""
                  }`}
                >
                  {item.isDropdown ? (
                    <>
                      <button
                        className={`dropdown-toggle ${
                          openDropdown === item.id ? "open" : ""
                        } ${isSubmenuActive(item.submenu) ? "active" : ""}`}
                        onClick={() => toggleDropdown(item.id)}
                      >
                        <div className="menu-icon-wrapper">
                          {item.icon}
                          <span className="menu-text">{item.name}</span>
                        </div>
                        <FaChevronDown className="dropdown-arrow" size={12} />
                      </button>
                      <div
                        className={`dropdown-content ${
                          openDropdown === item.id ? "open" : ""
                        }`}
                      >
                        {item.submenu.map((subItem) => (
                          <div key={subItem.id} className="submenu-item">
                            <NavLink
                              to={subItem.path}
                              className={({ isActive }) =>
                                `submenu-link ${isActive ? "active" : ""}`
                              }
                              onClick={toggleSidebar}
                            >
                              <span className="submenu-text">
                                {subItem.name}
                              </span>
                            </NavLink>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `menu-link ${isActive ? "active" : ""}`
                      }
                      end={item.exact}
                      onClick={toggleSidebar}
                    >
                      {item.icon}
                      <span className="menu-text">{item.name}</span>
                    </NavLink>
                  )}
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
