import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaTimes,
  FaUser,
  FaTools,
  FaInfoCircle,
} from "react-icons/fa";
import "../Css/NotificationBell.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://servitrust-baxkend.onrender.com";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in to view notifications.");
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data;
      const list = Array.isArray(data.notifications)
        ? data.notifications
        : [];

      setNotifications(list);
      setUnreadCount(
        typeof data.unreadCount === "number"
          ? data.unreadCount
          : list.filter((item) => !item.isRead).length
      );
    } catch (err) {
      console.error("Unable to fetch notifications:", err);
      setError(
        err.response?.data?.message || "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () =>
      document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const toggleDropdown = () => {
    const open = !isOpen;
    setIsOpen(open);

    if (open) {
      fetchNotifications();
    }
  };

  const markAsRead = async (id) => {
    const token = localStorage.getItem("token");
    const selected = notifications.find((item) => item._id === id);

    if (!token || !selected || selected.isRead) return;

    try {
      await axios.patch(
        `${API_URL}/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((previous) =>
        previous.map((item) =>
          item._id === id
            ? { ...item, isRead: true, readAt: new Date().toISOString() }
            : item
        )
      );

      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      console.error("Unable to mark notification as read:", err);
      setError("Could not update notification. Please try again.");
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem("token");

    if (!token || unreadCount === 0) return;

    try {
      await axios.patch(
        `${API_URL}/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((previous) =>
        previous.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt || new Date().toISOString(),
        }))
      );

      setUnreadCount(0);
      setError("");
    } catch (err) {
      console.error("Unable to mark all notifications as read:", err);
      setError("Could not mark notifications as read. Please try again.");
    }
  };

  const getIcon = (type) => {
    const value = String(type || "").toLowerCase();

    if (value.includes("provider")) return <FaUser />;
    if (value.includes("service") || value.includes("request")) {
      return <FaTools />;
    }

    return <FaInfoCircle />;
  };

  const formatDate = (value) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className="admin-notification-bell"
        onClick={toggleDropdown}
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={isOpen}
        title="Notifications"
      >
        <FaBell />

        {unreadCount > 0 && (
          <span className="admin-notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <div>
              <h3>Notifications</h3>
              <p>
                {unreadCount > 0
                  ? `${unreadCount} unread`
                  : "You're all caught up"}
              </p>
            </div>

            <button
              type="button"
              className="notification-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close notifications"
            >
              <FaTimes />
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              className="notification-mark-all"
              onClick={markAllAsRead}
            >
              <FaCheckDouble /> Mark all as read
            </button>
          )}

          {error && (
            <div className="notification-error" role="alert">
              {error}
              <button type="button" onClick={fetchNotifications}>
                Retry
              </button>
            </div>
          )}

          <div className="notification-dropdown-list">
            {loading && notifications.length === 0 ? (
              <p className="notification-empty">Loading notifications...</p>
            ) : notifications.length === 0 ? (
              <div className="notification-empty">
                <FaBell />
                <p>No notifications yet</p>
                <span>New activity will appear here.</span>
              </div>
            ) : (
              notifications.slice(0, 8).map((item) => (
                <div
                  key={item._id}
                  className={`notification-dropdown-item ${
                    item.isRead ? "read" : "unread"
                  }`}
                >
                  <div className="notification-item-icon">
                    {getIcon(item.type)}
                  </div>

                  <div className="notification-item-details">
                    <strong>{item.title || "Notification"}</strong>
                    <p>{item.message}</p>
                    <span>{formatDate(item.createdAt)}</span>

                    {!item.isRead && (
                      <button
                        type="button"
                        className="notification-read-btn"
                        onClick={() => markAsRead(item._id)}
                      >
                        <FaCheck /> Mark as read
                      </button>
                    )}
                  </div>

                  {!item.isRead && (
                    <span
                      className="notification-unread-dot"
                      aria-label="Unread"
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 8 && (
            <div className="notification-dropdown-footer">
              Showing the 8 most recent notifications
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
