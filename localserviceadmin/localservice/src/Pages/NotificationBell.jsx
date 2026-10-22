import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaBell, FaCheck, FaTimes } from "react-icons/fa";
import "../Css/NotificationBell.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://servitrust-baxkend.onrender.com";

const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [readIds, setReadIds] = useState([]);

  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(
    (notification) => !readIds.includes(notification.id)
  ).length;

  // Load dashboard activity when the bell is clicked.
  const fetchNotifications = async () => {
    setLoading(true);
    setError("");

    const endpoints = [
      { path: "/service-requests", type: "Service Request" },
      { path: "/complaints", type: "Complaint" },
      { path: "/reviews", type: "Review" },
      { path: "/users", type: "New User" },
    ];

    try {
      const results = await Promise.allSettled(
        endpoints.map(({ path }) => axios.get(`${API_URL}${path}`))
      );

      const activity = [];

      results.forEach((result, index) => {
        if (result.status !== "fulfilled") {
          console.error(
            `Unable to load ${endpoints[index].type} notifications`,
            result.reason
          );
          return;
        }

        const data = result.value.data;
        const records = Array.isArray(data)
          ? data
          : data?.requests ||
            data?.complaints ||
            data?.reviews ||
            data?.users ||
            [];

        if (!Array.isArray(records)) return;

        records.forEach((item) => {
          const id = item._id || item.id;
          if (!id) return;

          const createdAt =
            item.createdAt || item.updatedAt || item.date || null;

          let title = endpoints[index].type;
          let message = "";

          switch (endpoints[index].type) {
            case "Service Request":
              title = "New service request";
              message =
                item.serviceName ||
                item.service?.name ||
                item.description ||
                "A customer submitted a service request.";
              break;

            case "Complaint":
              title = "New complaint";
              message =
                item.subject ||
                item.category ||
                "A customer submitted a complaint.";
              break;

            case "Review":
              title = "New review";
              message = item.comment || item.review || "A customer submitted a review.";
              break;

            case "New User":
              title = "New user registered";
              message =
                item.name || item.email || "A new user registered.";
              break;

            default:
              break;
          }

          activity.push({
            id: `${endpoints[index].type}-${id}`,
            title,
            message,
            createdAt,
            type: endpoints[index].type,
          });
        });
      });

      // Most recent activity first.
      activity.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });

      setNotifications(activity.slice(0, 30));
    } catch (err) {
      console.error("Notification loading error:", err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close the dropdown when clicking outside.
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

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const markAsRead = (id) => {
    setReadIds((previous) =>
      previous.includes(id) ? previous : [...previous, id]
    );
  };

  const markAllAsRead = () => {
    setReadIds((previous) => [
      ...new Set([
        ...previous,
        ...notifications.map((notification) => notification.id),
      ]),
    ]);
  };

  const formatTime = (date) => {
    if (!date) return "Recent activity";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "Recent activity";

    return parsed.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="notification-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className={`notification-bell ${isOpen ? "bell-active" : ""}`}
        onClick={() => setIsOpen((previous) => !previous)}
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={isOpen}
      >
        <FaBell />

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <div>
              <h3>Notifications</h3>
              <p>
                {unreadCount > 0
                  ? `${unreadCount} unread notifications`
                  : "You're all caught up"}
              </p>
            </div>

            <button
              type="button"
              className="notification-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close notifications"
            >
              <FaTimes />
            </button>
          </div>

          {notifications.length > 0 && (
            <div className="notification-toolbar">
              <button type="button" onClick={markAllAsRead}>
                <FaCheck /> Mark all as read
              </button>

              <button
                type="button"
                onClick={fetchNotifications}
                disabled={loading}
              >
                Refresh
              </button>
            </div>
          )}

          <div className="notification-list">
            {loading ? (
              <div className="notification-state">
                <span className="notification-loader" />
                <p>Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="notification-state">
                <p>{error}</p>
                <button type="button" onClick={fetchNotifications}>
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-state">
                <div className="notification-empty-icon">
                  <FaBell />
                </div>
                <h4>No notifications yet</h4>
                <p>New requests and customer activity will appear here.</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const isRead = readIds.includes(notification.id);

                return (
                  <button
                    type="button"
                    className={`notification-item ${
                      isRead ? "notification-read" : "notification-unread"
                    }`}
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <span
                      className={`notification-type-icon notification-type-${notification.type
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {notification.type === "Complaint"
                        ? "C"
                        : notification.type === "Review"
                        ? "R"
                        : notification.type === "New User"
                        ? "U"
                        : "S"}
                    </span>

                    <span className="notification-item-content">
                      <strong>{notification.title}</strong>
                      <span className="notification-message">
                        {notification.message}
                      </span>
                      <span className="notification-time">
                        {formatTime(notification.createdAt)}
                      </span>
                    </span>

                    {!isRead && (
                      <span className="notification-unread-dot" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="notification-footer">
            <span>Showing the latest 30 activities</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
