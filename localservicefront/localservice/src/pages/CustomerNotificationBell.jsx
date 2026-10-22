import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";
import {
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaTimes,
} from "react-icons/fa";
import "../Css/CustomerNotificationBell.css";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://servitrust-baxkend.onrender.com"
).replace(/\/+$/, "");

export default function CustomerNotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const wrapperRef = useRef(null);
  const mountedRef = useRef(false);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  // Always read the latest token instead of relying on a token
  // captured during the initial component render.
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error(
        "Your login session was not found. Please log in again."
      );
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // Fetch customer notifications.
  const fetchNotifications = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      const headers = getAuthHeaders();

      const response = await axios.get(
        `${API_URL}/notifications`,
        { headers }
      );

      const responseData = response.data;

      const notificationList = Array.isArray(responseData)
        ? responseData
        : responseData?.notifications || [];

      setNotifications(
        [...notificationList].sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        )
      );

      setErrorMessage("");
    } catch (error) {
      const status = error.response?.status;
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.error;

      if (status === 401) {
        setErrorMessage(
          "Your login session is invalid or expired. Please log out and log in again."
        );

        console.error(
          "Notifications returned 401:",
          backendMessage || error.message
        );
      } else if (error.response) {
        setErrorMessage(
          backendMessage ||
          "Unable to load notifications. Please try again."
        );

        console.error(
          "Unable to load notifications:",
          status,
          error.response.data
        );
      } else {
        setErrorMessage(
          "Unable to connect to the server. Please try again."
        );

        console.error(
          "Notification request failed:",
          error.message
        );
      }
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  // Initial fetch and automatic refresh.
  useEffect(() => {
    mountedRef.current = true;

    fetchNotifications();

    const intervalId = window.setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => {
      mountedRef.current = false;
      window.clearInterval(intervalId);
    };
  }, [fetchNotifications]);

  // Close dropdown when clicking outside or pressing Escape.
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // Format notification timestamps.
  const relativeTime = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const seconds = Math.max(
      0,
      Math.floor((Date.now() - date.getTime()) / 1000)
    );

    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `${hours} hr ago`;

    const days = Math.floor(hours / 24);

    if (days === 1) return "Yesterday";

    if (days < 7) return `${days} days ago`;

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year:
        date.getFullYear() !== new Date().getFullYear()
          ? "numeric"
          : undefined,
    });
  };

  // Mark an individual notification as read.
  const markOneRead = async (notification) => {
    if (
      !notification?._id ||
      notification.isRead ||
      actionLoading
    ) {
      return;
    }

    setActionLoading(true);

    try {
      const response = await axios.patch(
        `${API_URL}/notifications/${notification._id}/read`,
        {},
        { headers: getAuthHeaders() }
      );

      const updatedNotification = response.data?.notification;

      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id
            ? updatedNotification ||
              {
                ...item,
                isRead: true,
                readAt: new Date().toISOString(),
              }
            : item
        )
      );

      setErrorMessage("");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;

      console.error("Unable to mark notification as read:", message);

      setErrorMessage(
        error.response?.status === 401
          ? "Your login session has expired. Please log in again."
          : "Could not mark the notification as read."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Mark all notifications as read.
  const markAllRead = async () => {
    if (!unreadCount || actionLoading) return;

    setActionLoading(true);

    try {
      await axios.patch(
        `${API_URL}/notifications/read-all`,
        {},
        { headers: getAuthHeaders() }
      );

      const readAt = new Date().toISOString();

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt || readAt,
        }))
      );

      setErrorMessage("");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;

      console.error("Unable to mark all notifications as read:", message);

      setErrorMessage(
        error.response?.status === 401
          ? "Your login session has expired. Please log in again."
          : "Could not mark notifications as read."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Choose an icon color based on notification type.
  const typeClass = (type = "") => {
    const value = type.toLowerCase();

    if (value.includes("complete")) {
      return "customer-notification-icon-success";
    }

    if (
      value.includes("reject") ||
      value.includes("cancel")
    ) {
      return "customer-notification-icon-danger";
    }

    if (
      value.includes("accept") ||
      value.includes("progress")
    ) {
      return "customer-notification-icon-info";
    }

    return "customer-notification-icon-default";
  };

  return (
    <div
      className="customer-notification-wrapper"
      ref={wrapperRef}
    >
      <button
        type="button"
        className={`customer-notification-bell ${
          showDropdown ? "is-open" : ""
        }`}
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={showDropdown}
        onClick={() => {
          const next = !showDropdown;

          setShowDropdown(next);

          if (next) {
            fetchNotifications(true);
          }
        }}
      >
        <FaBell />

        {unreadCount > 0 && (
          <span className="customer-notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <section
          className="customer-notification-dropdown"
          aria-label="Notifications"
        >
          <header className="customer-notification-header">
            <div>
              <h2>Notifications</h2>

              <p>
                {unreadCount
                  ? `${unreadCount} unread notification${
                      unreadCount === 1 ? "" : "s"
                    }`
                  : "You're all caught up"}
              </p>
            </div>

            <button
              type="button"
              className="customer-notification-close"
              aria-label="Close notifications"
              onClick={() => setShowDropdown(false)}
            >
              <FaTimes />
            </button>
          </header>

          <div className="customer-notification-toolbar">
            <button
              type="button"
              onClick={() => fetchNotifications(true)}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                disabled={actionLoading}
              >
                <FaCheckDouble /> Mark all as read
              </button>
            )}
          </div>

          {errorMessage && (
            <div
              className="customer-notification-error"
              role="alert"
            >
              <p>{errorMessage}</p>

              <button
                type="button"
                onClick={() => fetchNotifications(true)}
                disabled={loading}
              >
                Try again
              </button>
            </div>
          )}

          <div
            className="customer-notification-list"
            aria-live="polite"
          >
            {loading && notifications.length === 0 ? (
              <div className="customer-notification-empty">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="customer-notification-empty">
                <span className="customer-notification-empty-icon">
                  <FaBell />
                </span>

                <strong>
                  {errorMessage
                    ? "Notifications unavailable"
                    : "No notifications yet"}
                </strong>

                <p>
                  {errorMessage
                    ? "Please check your connection or login session."
                    : "Updates about your service requests will appear here."}
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <article
                  key={notification._id}
                  className={`customer-notification-item ${
                    notification.isRead ? "is-read" : "is-unread"
                  }`}
                >
                  <span
                    className={`customer-notification-type-icon ${typeClass(
                      notification.type
                    )}`}
                  >
                    {notification.type?.toLowerCase().includes("reject") ||
                    notification.type?.toLowerCase().includes("cancel") ? (
                      <FaTimes />
                    ) : (
                      <FaBell />
                    )}
                  </span>

                  <div className="customer-notification-content">
                    <div className="customer-notification-title-row">
                      <h3>
                        {notification.title || "Service update"}
                      </h3>

                      {!notification.isRead && (
                        <span className="customer-notification-unread-dot" />
                      )}
                    </div>

                    <p>
                      {notification.message ||
                        "There is an update to your service request."}
                    </p>

                    <div className="customer-notification-footer">
                      <time>
                        {relativeTime(notification.createdAt)}
                      </time>

                      {!notification.isRead && (
                        <button
                          type="button"
                          onClick={() => markOneRead(notification)}
                          disabled={actionLoading}
                        >
                          <FaCheck /> Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          <footer className="customer-notification-bottom">
            Notifications refresh automatically every 30 seconds.
          </footer>
        </section>
      )}
    </div>
  );
}
