import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaBell } from 'react-icons/fa';
import {
  getUserNotificationsThunk,
  markNotificationAsReadThunk,
  markAllNotificationsAsReadThunk
} from '../redux/notification/notificationSlice';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/NotificationDropdown.css';

const VITE_IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

const NotificationDropdown = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount, loading } = useSelector(state => state.notification);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    dispatch(getUserNotificationsThunk());
  }, [dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsReadThunk(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsReadThunk());
  };

  // Get user role from localStorage
  const getUserRole = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        return userData.role || 'educator'; // Default to educator if role not found
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return 'educator'; // Default fallback
  };

  // Get dashboard path based on user role
  const getDashboardPath = (role) => {
    if (role === 'admin' || role === 'staff') {
      return 'admin'; // Super Admin or IIM Staff -> admin
    } else if (role === 'university') {
      return 'school'; // School Admin -> school
    } else {
      return 'tutor'; // Educator -> tutor (default)
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read (all notifications are unread now)
    dispatch(markNotificationAsReadThunk(notification._id));

    // Navigate based on notification type
    if (notification.courseId) {
      // Handle different courseId formats
      let courseId;

      if (typeof notification.courseId === 'object') {
        // If it's an object with _id property (populated mongoose object)
        if (notification.courseId._id) {
          courseId = notification.courseId._id;
        } else {
          // If it's a MongoDB ObjectId
          courseId = notification.courseId.toString();
        }
      } else {
        // If it's already a string
        courseId = notification.courseId;
      }

      // Get user role and corresponding dashboard path
      const userRole = getUserRole();
      const dashboardPath = getDashboardPath(userRole);

      // Navigate to dynamic course detail URL with reviews tab active
      navigate(`/dashboard/${dashboardPath}/courses/${courseId}?tab=reviews`);
    }

    setIsOpen(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffDay < 7) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <button
        className="notification-btn"
        onClick={handleToggleDropdown}
        aria-label="Notifications"
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-menu">
          <div className="notification-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">Loading...</div>
            ) : notifications.length > 0 ? (
              notifications.map(notification => (
                <div
                  key={notification._id}
                  className="notification-item unread"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-avatar">
                    <img
                      src={notification.sender?.profile?.avatar
                        ? `${VITE_IMAGE_URL}${notification.sender.profile.avatar}`
                        : 'https://via.placeholder.com/40?text=User'}
                      alt={notification.sender?.name || 'User'}
                    />
                  </div>
                  <div className="notification-content">
                    <p>{notification.content}</p>
                    <span className="notification-time">{formatDate(notification.createdAt)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-notifications">No notifications</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
