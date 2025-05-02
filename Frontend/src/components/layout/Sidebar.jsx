import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import bluelogo from "../..//assets/images/login_page/bluelogo.svg";
import {
  FaChalkboardTeacher,
  FaGraduationCap,
  FaHome,
  FaUsers,
  FaTimes,
  FaChevronDown,
  FaUniversity,
  FaUserTie,
  FaUserShield,
  FaIdBadge,
} from "react-icons/fa";
import { FaFilePen } from "react-icons/fa6";
import "../../assets/styles/Sidebar.css";

/**
 * Sidebar component that auto-detects user role from localStorage
 */
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const [userRole, setUserRole] = useState("admin");
  const [openDropdown, setOpenDropdown] = useState("");
  const location = useLocation();
  const { t } = useTranslation();

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
        name: t("common.dashboard"),
        icon: <FaHome className="menu-icon" />,
        path: `/dashboard/${getDashboardPath()}`,
        exact: true,
      },
      {
        id: "courses",
        name: t("courses.allCourses"),
        icon: <FaGraduationCap className="menu-icon" />,
        path: `/dashboard/${getDashboardPath()}/courses`,
      },
      {
        id: "blogs",
        name: t("blog.blogs"),
        icon: <FaFilePen className="menu-icon" />,
        path: `/dashboard/${getDashboardPath()}/blogs`,
      },
    ];

    // Add role-specific items
    if (userRole === "admin" || userRole === "staff") {
      // Insert after courses but before blogs
      items.splice(2, 0, {
        id: "users",
        name: t("common.users"),
        icon: <FaUsers className="menu-icon" />,
        isDropdown: true,
        submenu: [
          {
            id: "universities",
            name: t("schools.schools"),
            path: `/dashboard/admin/schools`,
            icon: <FaUniversity />,
          },
          {
            id: "educators",
            name: t("educators.educators"),
            path: `/dashboard/admin/educators`,
            icon: <FaUserTie />,
          },
          {
            id: "staffs",
            name: t("staff.staff"),
            path: `/dashboard/admin/staffs`,
            icon: <FaIdBadge />,
          },
        ],
      });

      // Add Role/Permission tab for admin only (not for staff)
      if (userRole === "admin") {
        items.push({
          id: "role-permission",
          name: t("common.roleAndPermission"),
          icon: <FaUserShield className="menu-icon" />,
          path: `/dashboard/admin/role-permission`,
        });
      }
    } else if (userRole === "university") {
      // Insert after courses but before blogs
      items.splice(2, 0, {
        id: "educators",
        name: t("educators.educators"),
        icon: <FaChalkboardTeacher className="menu-icon" />,
        path: `/dashboard/school/educators`,
      });
    }

    return items;
  };

  // Get the correct dashboard path based on role
  const getDashboardPath = () => {
    if (userRole === "admin") {
      return "admin"; // Super Admin -> admin
    } else if (userRole === "staff") {
      return "admin"; // IIM Staff -> admin (same dashboard as Super Admin)
    } else if (userRole === "university") {
      return "school"; // School Admin -> university
    } else if (userRole === "educator") {
      return "tutor"; // Educator -> educator
    } else {
      return "tutor"; // Default fallback
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
            <h1 className="sidebar-logo">{t("common.iimAhmedabad")}</h1>
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
                              {subItem.icon && (
                                <span className="submenu-icon">
                                  {subItem.icon}
                                </span>
                              )}
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
