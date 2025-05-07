import React, { useState, useEffect, useCallback } from "react";
import { FaBars, FaCog, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NotificationDropdown from "../NotificationDropdown";
import "../../assets/styles/TopBar.css";

const VITE_IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

/**
 * TopBar component for the dashboard
 */
const TopBar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("");
  const [dashboardType, setDashboardType] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [profile, setProfile] = useState("");
  const [imageError, setImageError] = useState(false);

  // Function to load user data from localStorage
  const loadUserData = useCallback(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserName(userData.name || "User");
        setProfile(userData?.profile?.avatar || ""); // Set profile picture
        setImageError(false); // Reset image error state when profile changes
        // Set user role and dashboard type
        const role = userData.role || "";
        setUserRole(role);

        // Set formatted dashboard type based on standardized role mapping
        if (role === "admin") {
          setDashboardType("Admin"); // Super Admin -> Admin Dashboard
        } else if (role === "staff") {
          setDashboardType("Admin"); // IIM Staff -> Admin Dashboard (same as Super Admin)
        } else if (role === "university") {
          setDashboardType("School"); // School Admin -> School Dashboard
        } else if (role === "educator") {
          setDashboardType("Educator"); // Educator -> Educator Dashboard (was "Tutor")
        } else {
          setDashboardType("User"); // Default fallback
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Initial load of user data
  useEffect(() => {
    loadUserData();

    // Set up storage event listener to detect changes to localStorage from other tabs
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        loadUserData();
      }
    };

    // Set up custom event listener for profile updates within the same tab
    const handleProfileUpdate = () => {
      loadUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('profileUpdated', handleProfileUpdate);

    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [loadUserData]);

  // Function to get page title based on route
  const getPageTitle = useCallback(
    (path) => {
      // Extract the path segments
      const pathSegments = path.split("/");

      // Filter out empty segments
      const filteredSegments = pathSegments.filter((segment) => segment);

      // If we have at least 2 segments (dashboard/something)
      if (filteredSegments.length >= 2) {
        // Create a more comprehensive title map
        const titleMap = {
          // Dashboard paths - always show "Dashboard" for main dashboard pages
          "dashboard/admin": "Dashboard",
          "dashboard/school": "Dashboard",
          "dashboard/tutor": "Dashboard",
          admin: "Dashboard",
          school: "Dashboard",
          tutor: "Dashboard",

          // Course paths
          courses: "All Courses",
          "courses/add": "Add Course",
          "courses/create": "Create Course",
          "courses/edit": "Edit Course",

          // User management paths - match exactly with Sidebar names
          schools: "Universities/Schools",
          "school-details": "School Details",
          "school-account-form": "School Account Form",
          educators: "Educators",
          "educator-details": "Educator Details",
          "educator-account-form": "Educator Account Form",
          staffs: "IIM Staff",
          "staff-details": "Staff Details",
          "staff-account-form": "Staff Account Form",

          // Other paths
          "role-permission": "Role & Permission",
          notification: "Notifications",
          settings: "Settings",
          blogs: "Blogs",

          // User management parent menu
          users: "Users",
        };

        // Try different matching strategies in order of specificity

        // 1. Check for exact path match first (excluding the first segment 'dashboard')
        const routePath = filteredSegments.slice(1).join("/");
        if (titleMap[routePath]) {
          return titleMap[routePath];
        }

        // 2. Check for partial path matches (for nested routes)
        // Try with 3 segments (e.g., admin/courses/add)
        if (filteredSegments.length >= 4) {
          const threeSegmentPath = filteredSegments.slice(1, 4).join("/");
          if (titleMap[threeSegmentPath]) {
            return titleMap[threeSegmentPath];
          }
        }

        // Try with 2 segments (e.g., admin/courses)
        if (filteredSegments.length >= 3) {
          const twoSegmentPath = filteredSegments.slice(1, 3).join("/");
          if (titleMap[twoSegmentPath]) {
            return titleMap[twoSegmentPath];
          }
        }

        // 3. If no exact match, check for the last segment
        const lastSegment = filteredSegments[filteredSegments.length - 1];
        if (titleMap[lastSegment]) {
          return titleMap[lastSegment];
        }

        // 4. If still no match, check if it's a detail page (has an ID at the end)
        if (filteredSegments.length >= 3) {
          const secondLastSegment =
            filteredSegments[filteredSegments.length - 2];
          if (titleMap[secondLastSegment]) {
            return titleMap[secondLastSegment];
          }
        }

        // 5. For edit pages with IDs
        if (
          lastSegment.match(/^[a-f0-9]{24}$/i) &&
          filteredSegments.length >= 4
        ) {
          const editSegment = filteredSegments[filteredSegments.length - 3];
          const itemType = filteredSegments[filteredSegments.length - 2];
          if (editSegment === "edit" && titleMap[itemType]) {
            return `Edit ${titleMap[itemType].replace(/s$/, "")}`;
          }
        }
      }

      // Default to dashboard type if no specific page is found
      return `${dashboardType} Dashboard`;
    },
    [dashboardType]
  );

  // Update page title based on current route
  useEffect(() => {
    const path = location.pathname;
    const newTitle = getPageTitle(path);
    setPageTitle(newTitle);

    // Update document title as well for better UX
    document.title = `IIM LMS - ${newTitle}`;
  }, [location, getPageTitle]);

  // Handle profile dropdown toggle
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  // Handle image loading error
  const handleImageError = () => {
    setImageError(true);
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
          <input type="text" placeholder={t("common.search") + "..."} />
        </div>

        {/* Language Selector */}
        {/* <LanguageSelector /> */}

        {/* Notification Dropdown */}
        <NotificationDropdown />

        {/* User profile */}
        <div className="user-profile" onClick={toggleDropdown}>
          <div className="avatar">
            {profile && !imageError ? (
              <img
                src={VITE_IMAGE_URL + profile}
                alt="profile"
                onError={handleImageError}
              />
            ) : (
              <FaUserCircle className="avatar-fallback" />
            )}
          </div>
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <span className="user-role">
              {userRole === "admin"
                ? t("dashboard.superAdmin")
                : userRole === "staff"
                  ? t("dashboard.iimStaff")
                  : userRole === "university"
                    ? t("dashboard.schoolAdmin")
                    : userRole === "educator"
                      ? t("dashboard.educator")
                      : t("dashboard.user")}
            </span>
          </div>

          {/* Dropdown menu */}
          {showDropdown && (
            <div className="profile-dropdown">
              <ul>
                <li>
                  <a
                    onClick={() => {
                      // Navigate to profile page based on current dashboard type
                      const currentPath = location.pathname;
                      const basePath = currentPath
                        .split("/")
                        .slice(0, 2)
                        .join("/");
                      navigate(`${basePath}/profile`);
                      setShowDropdown(false);
                    }}
                  >
                    <FaCog /> {t("common.settings")}
                  </a>
                </li>
                <li>
                  <button onClick={handleLogout}>
                    <FaSignOutAlt /> {t("common.logout")}
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
