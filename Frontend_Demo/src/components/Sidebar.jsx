import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { hasPermission } from "../utils/permissions";
import {
  FaHome,
  FaBook,
  FaUniversity,
  FaChalkboardTeacher,
  FaQuestionCircle,
  FaFileAlt,
  FaCog,
  FaTimes,
  FaUserShield,
  FaUserGraduate,
  FaUserTie,
  FaCertificate,
  FaUsers,
} from "react-icons/fa";

function Sidebar({ isOpen, toggleSidebar }) {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const { t } = useTranslation();

  // Get navigation links based on user role and permissions
  const getNavLinks = () => {
    const links = [];

    // Role-specific links - using DB role values
    if (user?.role === "educator") {
      // Educator
      // Basic educator links
      links.push(
        {
          to: "/dashboard",
          icon: <FaHome className="w-5 h-5" />,
          text: t("common.dashboard"),
        },
        {
          to: "/my-learning",
          icon: <FaBook className="w-5 h-5" />,
          text: t("educator.myLearning"),
        },
        {
          to: "/content",
          icon: <FaFileAlt className="w-5 h-5" />,
          text: t("educator.content"),
        },
        {
          to: "/my-content",
          icon: <FaChalkboardTeacher className="w-5 h-5" />,
          text: t("educator.myContent"),
        },
        {
          to: "/my-certificates",
          icon: <FaCertificate className="w-5 h-5" />,
          text: t("educator.myCertificate"),
        }
      );

      // Add course management link if educator has the permission
      console.log("Checking course management permissions for educator");

      // Explicitly check for null permissions - if null, don't show course management
      if (user.permissions === null) {
        console.log("User has null permissions, not showing management tabs");
      } else {
        // Course Management
        const canCreateCourse = hasPermission(user, "create_course");
        const canEditCourse = hasPermission(user, "edit_course");
        const canDeleteCourse = hasPermission(user, "delete_course");
        console.log("Course permission results:", {
          canCreateCourse,
          canEditCourse,
          canDeleteCourse,
        });

        if (canCreateCourse || canEditCourse || canDeleteCourse) {
          links.push({
            to: "/educator/courses",
            icon: <FaBook className="w-5 h-5" />,
            text: t("admin.courseManagement") || "Course Management",
          });
        }

        // Quiz Management
        const canViewQuizzes = hasPermission(user, "view_quizzes");
        const canCreateQuiz = hasPermission(user, "create_quiz");
        const canEditQuiz = hasPermission(user, "edit_quiz");
        const canDeleteQuiz = hasPermission(user, "delete_quiz");
        console.log("Quiz permission results:", {
          canViewQuizzes,
          canCreateQuiz,
          canEditQuiz,
          canDeleteQuiz,
        });

        if (canViewQuizzes || canCreateQuiz || canEditQuiz || canDeleteQuiz) {
          links.push({
            to: "/educator/quizzes",
            icon: <FaQuestionCircle className="w-5 h-5" />,
            text: t("admin.quizManagement") || "Quiz Management",
          });
        }

        // User Management
        const canViewUsers = hasPermission(user, "view_users");
        const canCreateUser = hasPermission(user, "create_user");
        const canEditUser = hasPermission(user, "edit_user");
        const canDeleteUser = hasPermission(user, "delete_user");
        console.log("User permission results:", {
          canViewUsers,
          canCreateUser,
          canEditUser,
          canDeleteUser,
        });

        if (canViewUsers || canCreateUser || canEditUser || canDeleteUser) {
          links.push({
            to: "/educator/users",
            icon: <FaUsers className="w-5 h-5" />,
            text: t("admin.userManagement") || "User Management",
          });
        }

        // Content Management
        const canViewContent = hasPermission(user, "view_content");
        const canCreateContent = hasPermission(user, "create_content");
        const canEditContent = hasPermission(user, "edit_content");
        const canDeleteContent = hasPermission(user, "delete_content");
        console.log("Content permission results:", {
          canViewContent,
          canCreateContent,
          canEditContent,
          canDeleteContent,
        });

        if (
          canViewContent ||
          canCreateContent ||
          canEditContent ||
          canDeleteContent
        ) {
          links.push({
            to: "/educator/content",
            icon: <FaFileAlt className="w-5 h-5" />,
            text: t("admin.contentManagement") || "Content Management",
          });
        }
      }
    } else if (user?.role === "university") {
      // School Admin
      // Basic university links
      links.push(
        {
          to: "/dashboard",
          icon: <FaHome className="w-5 h-5" />,
          text: t("common.dashboard"),
        },
        {
          to: "/university/educators",
          icon: <FaUserGraduate className="w-5 h-5" />,
          text: t("university.educators"),
        }
      );

      // Check permissions for university role
      if (user.permissions === null) {
        console.log(
          "University user has null permissions, not showing management tabs"
        );
      } else {
        // Course Management
        const canCreateCourse = hasPermission(user, "create_course");
        const canEditCourse = hasPermission(user, "edit_course");
        const canDeleteCourse = hasPermission(user, "delete_course");
        console.log("University course permission results:", {
          canCreateCourse,
          canEditCourse,
          canDeleteCourse,
        });

        if (canCreateCourse || canEditCourse || canDeleteCourse) {
          links.push({
            to: "/university/courses",
            icon: <FaBook className="w-5 h-5" />,
            text: t("admin.courseManagement") || "Course Management",
          });
        }

        // Quiz Management
        const canViewQuizzes = hasPermission(user, "view_quizzes");
        const canCreateQuiz = hasPermission(user, "create_quiz");
        const canEditQuiz = hasPermission(user, "edit_quiz");
        const canDeleteQuiz = hasPermission(user, "delete_quiz");
        console.log("University quiz permission results:", {
          canViewQuizzes,
          canCreateQuiz,
          canEditQuiz,
          canDeleteQuiz,
        });

        if (canViewQuizzes || canCreateQuiz || canEditQuiz || canDeleteQuiz) {
          links.push({
            to: "/university/quizzes",
            icon: <FaQuestionCircle className="w-5 h-5" />,
            text: t("admin.quizManagement") || "Quiz Management",
          });
        }

        // User Management
        const canViewUsers = hasPermission(user, "view_users");
        const canCreateUser = hasPermission(user, "create_user");
        const canEditUser = hasPermission(user, "edit_user");
        const canDeleteUser = hasPermission(user, "delete_user");
        console.log("University user permission results:", {
          canViewUsers,
          canCreateUser,
          canEditUser,
          canDeleteUser,
        });

        if (canViewUsers || canCreateUser || canEditUser || canDeleteUser) {
          links.push({
            to: "/university/users",
            icon: <FaUsers className="w-5 h-5" />,
            text: t("admin.userManagement") || "User Management",
          });
        }

        // Content Management
        const canViewContent = hasPermission(user, "view_content");
        const canCreateContent = hasPermission(user, "create_content");
        const canEditContent = hasPermission(user, "edit_content");
        const canDeleteContent = hasPermission(user, "delete_content");
        console.log("University content permission results:", {
          canViewContent,
          canCreateContent,
          canEditContent,
          canDeleteContent,
        });

        if (
          canViewContent ||
          canCreateContent ||
          canEditContent ||
          canDeleteContent
        ) {
          links.push({
            to: "/university/content",
            icon: <FaFileAlt className="w-5 h-5" />,
            text: t("admin.contentManagement") || "Content Management",
          });
        }
      }
    } else if (user?.role === "admin" || user?.role === "staff") {
      // Super Admin or IIM Staff
      links.push(
        {
          to: "/admin/dashboard",
          icon: <FaHome className="w-5 h-5" />,
          text: t("common.dashboard"),
        },
        {
          to: "/admin/universities",
          icon: <FaUniversity className="w-5 h-5" />,
          text: t("admin.universities"),
        },
        {
          to: "/admin/content",
          icon: <FaFileAlt className="w-5 h-5" />,
          text: t("educator.content"),
        },
        {
          to: "/admin/courses",
          icon: <FaBook className="w-5 h-5" />,
          text: t("admin.courseManagement"),
        },
        {
          to: "/admin/quizzes",
          icon: <FaQuestionCircle className="w-5 h-5" />,
          text: t("admin.quizManagement"),
        },
        {
          to: "/admin/roles",
          icon: <FaUserShield className="w-5 h-5" />,
          text: t("admin.roleManagement") || "Roles & Permissions",
        },
        {
          to: "/admin/staff",
          icon: <FaUsers className="w-5 h-5" />,
          text: t("admin.staffManagement") || "Staff Management",
        },
        {
          to: "/admin/pages",
          icon: <FaFileAlt className="w-5 h-5" />,
          text: t("admin.cmsBuilder") || "CMS Builder",
        }
      );
    }

    // Common links at the end
    links.push({
      to: "/settings",
      icon: <FaCog className="w-5 h-5" />,
      text: t("common.settings") || "Settings",
    });

    return links;
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gradient-to-b from-blue-600 to-indigo-800 text-white w-64 z-30 transform sidebar-transition shadow-xl ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-500">
          <Link to="/dashboard" className="flex items-center">
            <img className="h-8 w-8" src="/logo.svg" alt="IIM-LMS Logo" />
            <span className="ml-2 text-xl font-bold">IIM-LMS</span>
          </Link>
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={toggleSidebar}
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-blue-500">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold shadow-md">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="ml-3">
              <p className="font-medium truncate">{user?.name || "User"}</p>
              <p className="text-xs text-blue-200 capitalize">
                {user?.role === "admin"
                  ? "Super Admin"
                  : user?.role === "staff"
                  ? "IIM Staff"
                  : user?.role === "university"
                  ? "School Admin"
                  : user?.role === "educator"
                  ? "Educator"
                  : user?.role || "User"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav
          className="mt-4 px-2 overflow-y-auto sidebar-scrollbar"
          style={{ maxHeight: "calc(100vh - 240px)" }}
        >
          <ul className="space-y-1">
            {navLinks.map((link, index) => (
              <li key={index}>
                <Link
                  to={link.to}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    location.pathname === link.to
                      ? "bg-blue-700 text-white"
                      : "text-blue-100 hover:bg-blue-700"
                  }`}
                >
                  {link.icon}
                  <span className="ml-3">{link.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-500">
          <div className="text-center text-sm text-blue-200">
            <p>© {new Date().getFullYear()} IIM-LMS</p>
            <p className="mt-1">v1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
