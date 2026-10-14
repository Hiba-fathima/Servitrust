import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "../Css/Notifications.css"
import {
FaBell,
FaCheck,
FaCheckDouble,
FaSyncAlt,
FaUser,
FaTools,
FaClipboardList,
FaExclamationCircle,
FaInfoCircle,
} from "react-icons/fa";
import "../Css/Notifications.css";

const API_URL =
import.meta.env.VITE_API_URL ||
"https://servitrust-baxkend.onrender.com";

function Notifications() {
const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);
const [filter, setFilter] = useState("all");
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [error, setError] = useState("");

const getToken = () => localStorage.getItem("token");

const fetchNotifications = useCallback(async (showLoader = true) => {
const token = getToken();

if (!token) {
  setError("Your session has expired. Please log in again.");
  setLoading(false);
  setRefreshing(false);
  return;
}

if (showLoader) {
  setLoading(true);
}

setError("");

try {
  const response = await axios.get(`${API_URL}/notifications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  setNotifications(response.data.notifications || []);
  setUnreadCount(response.data.unreadCount || 0);
} catch (err) {
  console.error("Failed to load notifications:", err);

  setError(
    err.response?.data?.message ||
      "Unable to load notifications. Please try again."
  );
} finally {
  setLoading(false);
  setRefreshing(false);
}

}, []);

useEffect(() => {
fetchNotifications();
}, [fetchNotifications]);

const markAsRead = async (notificationId) => {
const token = getToken();

if (!token) {
  setError("Please log in again.");
  return;
}

const selectedNotification = notifications.find(
  (item) => item._id === notificationId
);

if (!selectedNotification || selectedNotification.isRead) {
  return;
}

try {
  await axios.patch(
    `${API_URL}/notifications/${notificationId}/read`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  setNotifications((previous) =>
    previous.map((item) =>
      item._id === notificationId
        ? { ...item, isRead: true, readAt: new Date().toISOString() }
        : item
    )
  );

  setUnreadCount((count) => Math.max(0, count - 1));
} catch (err) {
  console.error("Failed to mark notification as read:", err);

  setError(
    err.response?.data?.message ||
      "Unable to update notification. Please try again."
  );
}

};

const markAllAsRead = async () => {
const token = getToken();

if (!token) {
  setError("Please log in again.");
  return;
}

if (unreadCount === 0) {
  return;
}

try {
  await axios.patch(
    `${API_URL}/notifications/read-all`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const readTime = new Date().toISOString();

  setNotifications((previous) =>
    previous.map((item) =>
      item.isRead
        ? item
        : { ...item, isRead: true, readAt: readTime }
    )
  );

  setUnreadCount(0);
  setError("");
} catch (err) {
  console.error("Failed to mark all notifications as read:", err);

  setError(
    err.response?.data?.message ||
      "Unable to mark notifications as read. Please try again."
  );
}

};

const handleRefresh = () => {
setRefreshing(true);
fetchNotifications(false);
};

const getNotificationIcon = (type) => {
const normalizedType = String(type || "").toLowerCase();

if (normalizedType.includes("provider")) {
  return <FaUser />;
}

if (
  normalizedType.includes("service") ||
  normalizedType.includes("request")
) {
  return <FaTools />;
}

if (
  normalizedType.includes("complaint") ||
  normalizedType.includes("error")
) {
  return <FaExclamationCircle />;
}

if (
  normalizedType.includes("verification") ||
  normalizedType.includes("status")
) {
  return <FaClipboardList />;
}

return <FaInfoCircle />;

};

const formatDate = (dateValue) => {
if (!dateValue) return "Date unavailable";

const date = new Date(dateValue);

if (Number.isNaN(date.getTime())) {
  return "Date unavailable";
}

return date.toLocaleString("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

};

const filteredNotifications = notifications.filter((notification) => {
if (filter === "unread") return !notification.isRead;
if (filter === "read") return notification.isRead;
return true;
});

return ( <div className="notifications-page">
{/* Page header */} <div className="notifications-header"> <div className="notifications-heading"> <div className="notifications-heading-icon"> <FaBell /> </div>

      <div>
        <h1>Notifications</h1>
        <p>
          Stay updated with the latest activity on your ServiTrust platform.
        </p>
      </div>
    </div>

    <div className="notifications-header-actions">
      <button
        type="button"
        className="notification-refresh-btn"
        onClick={handleRefresh}
        disabled={refreshing}
      >
        <FaSyncAlt className={refreshing ? "notification-spinning" : ""} />
        <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
      </button>

      <button
        type="button"
        className="notification-mark-all-btn"
        onClick={markAllAsRead}
        disabled={unreadCount === 0}
      >
        <FaCheckDouble />
        <span>Mark all as read</span>
      </button>
    </div>
  </div>

  {/* Summary */}
  <div className="notification-summary">
    <div className="notification-summary-card">
      <div className="notification-summary-icon total">
        <FaBell />
      </div>

      <div>
        <span>Total notifications</span>
        <h3>{notifications.length}</h3>
      </div>
    </div>

    <div className="notification-summary-card">
      <div className="notification-summary-icon unread">
        <FaExclamationCircle />
      </div>

      <div>
        <span>Unread notifications</span>
        <h3>{unreadCount}</h3>
      </div>
    </div>

    <div className="notification-summary-card">
      <div className="notification-summary-icon read">
        <FaCheckDouble />
      </div>

      <div>
        <span>Read notifications</span>
        <h3>{notifications.length - unreadCount}</h3>
      </div>
    </div>
  </div>

  {/* Notification list */}
  <section className="notifications-container">
    <div className="notifications-list-header">
      <div>
        <h2>Recent Activity</h2>
        <p>Review your latest platform updates.</p>
      </div>

      <div className="notification-filters">
        <button
          type="button"
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All
          <span>{notifications.length}</span>
        </button>

        <button
          type="button"
          className={filter === "unread" ? "active" : ""}
          onClick={() => setFilter("unread")}
        >
          Unread
          <span>{unreadCount}</span>
        </button>

        <button
          type="button"
          className={filter === "read" ? "active" : ""}
          onClick={() => setFilter("read")}
        >
          Read
          <span>{notifications.length - unreadCount}</span>
        </button>
      </div>
    </div>

    {error && (
      <div className="notifications-error" role="alert">
        {error}
        <button
          type="button"
          onClick={() => fetchNotifications()}
        >
          Try again
        </button>
      </div>
    )}

    {loading ? (
      <div className="notifications-state">
        <div className="notification-loader" />
        <p>Loading notifications...</p>
      </div>
    ) : filteredNotifications.length === 0 ? (
      <div className="notifications-state">
        <div className="notifications-empty-icon">
          <FaBell />
        </div>

        <h3>
          {filter === "unread"
            ? "You're all caught up!"
            : filter === "read"
              ? "No read notifications"
              : "No notifications yet"}
        </h3>

        <p>
          {filter === "unread"
            ? "You don't have any unread notifications."
            : "New platform activity will appear here."}
        </p>
      </div>
    ) : (
      <div className="notifications-list">
        {filteredNotifications.map((notification) => (
          <article
            key={notification._id}
            className={`notification-item ${
              notification.isRead ? "is-read" : "is-unread"
            }`}
          >
            <div className="notification-item-icon">
              {getNotificationIcon(notification.type)}
            </div>

            <div className="notification-item-content">
              <div className="notification-item-title-row">
                <h3>{notification.title}</h3>

                {!notification.isRead && (
                  <span className="notification-unread-label">
                    New
                  </span>
                )}
              </div>

              <p>{notification.message}</p>

              <div className="notification-item-meta">
                <span className="notification-type">
                  {String(notification.type || "general")
                    .replace(/[-_]/g, " ")}
                </span>

                <span className="notification-date">
                  {formatDate(notification.createdAt)}
                </span>
              </div>
            </div>

            <div className="notification-item-actions">
              {notification.isRead ? (
                <span className="notification-read-status">
                  <FaCheck />
                  Read
                </span>
              ) : (
                <button
                  type="button"
                  className="notification-mark-read-btn"
                  onClick={() => markAsRead(notification._id)}
                >
                  <FaCheck />
                  <span>Mark as read</span>
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    )}

    {!loading && notifications.length > 0 && (
      <div className="notifications-footer">
        Showing {filteredNotifications.length} of {notifications.length}{" "}
        notifications
      </div>
    )}
  </section>
</div>

);
}

export default Notifications;
