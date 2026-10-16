import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import {
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaTimes,
  FaExclamationCircle,
} from "react-icons/fa";
import "../Css/CustomerDashboard.css";

const API = "https://servitrust-baxkend.onrender.com";

const CustomerDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  // Complaint states
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [complaintCategory, setComplaintCategory] =
    useState("Service Quality");
  const [complaintSubject, setComplaintSubject] = useState("");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [complaintLoading, setComplaintLoading] = useState(false);

  const notificationRef = useRef(null);
  const token = localStorage.getItem("token");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const customerId =
    user?._id ||
    user?.id ||
    localStorage.getItem("userId") ||
    "";

  const authHeaders = useMemo(
    () => ({
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  // Load customer service requests
  const getRequests = useCallback(async () => {
    if (!token) {
      setError("Please log in to view your service requests.");
      setLoading(false);
      return;
    }

    if (!customerId) {
      setError(
        "Customer ID was not found. Please log out and log in again."
      );
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${API}/service-requests/customer/${customerId}`,
        { headers: authHeaders }
      );

      setRequests(
        Array.isArray(response.data)
          ? response.data
          : response.data?.requests || []
      );

      setError("");
    } catch (err) {
      console.error("Error loading service requests:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your service requests."
      );
    } finally {
      setLoading(false);
    }
  }, [token, customerId, authHeaders]);

  // Load notifications
  const getNotifications = useCallback(
    async (showLoader = false) => {
      if (!token) return;

      if (showLoader) {
        setNotificationLoading(true);
      }

      try {
        const response = await axios.get(`${API}/notifications`, {
          headers: authHeaders,
        });

        const notificationList = Array.isArray(response.data)
          ? response.data
          : response.data?.notifications || [];

        setNotifications(notificationList);
      } catch (err) {
        console.error("Error loading notifications:", err);
      } finally {
        if (showLoader) {
          setNotificationLoading(false);
        }
      }
    },
    [token, authHeaders]
  );

  useEffect(() => {
    getRequests();
    getNotifications();

    const interval = setInterval(() => {
      getRequests();
      getNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [getRequests, getNotifications]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Display relative notification time
  const getRelativeTime = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    const difference = Math.max(0, Date.now() - date.getTime());
    const seconds = Math.floor(difference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "Just now";

    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    }

    if (hours < 24) {
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    }

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

  // Mark one notification as read
  const markNotificationAsRead = async (notification) => {
    if (!notification?._id || notification.isRead || actionLoading) {
      return;
    }

    setActionLoading(true);

    try {
      const response = await axios.patch(
        `${API}/notifications/${notification._id}/read`,
        {},
        { headers: authHeaders }
      );

      const updatedNotification = response.data?.notification;

      setNotifications((previous) =>
        previous.map((item) =>
          item._id === notification._id
            ? updatedNotification || {
                ...item,
                isRead: true,
                readAt: new Date().toISOString(),
              }
            : item
        )
      );
    } catch (err) {
      console.error("Unable to mark notification as read:", err);

      setError(
        err.response?.data?.message ||
          "Unable to mark the notification as read."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (unreadCount === 0 || actionLoading) return;

    setActionLoading(true);

    try {
      await axios.patch(
        `${API}/notifications/read-all`,
        {},
        { headers: authHeaders }
      );

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
          readAt: notification.readAt || new Date().toISOString(),
        }))
      );
    } catch (err) {
      console.error("Unable to mark all notifications as read:", err);

      setError(
        err.response?.data?.message ||
          "Unable to mark all notifications as read."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel a service request
  const cancelRequest = async (request) => {
    if (!request?._id || cancellingId) return;

    const confirmed = window.confirm(
      `Are you sure you want to cancel your ${
        request.serviceName || "service"
      } request?`
    );

    if (!confirmed) return;

    setCancellingId(request._id);
    setError("");
    setSuccess("");

    try {
      const response = await axios.patch(
        `${API}/service-requests/${request._id}/status`,
        { status: "Cancelled" },
        { headers: authHeaders }
      );

      const updatedRequest = response.data?.request || response.data;

      setRequests((previous) =>
        previous.map((item) =>
          item._id === request._id
            ? {
                ...item,
                ...(updatedRequest &&
                typeof updatedRequest === "object"
                  ? updatedRequest
                  : {}),
                status: "Cancelled",
              }
            : item
        )
      );

      setSuccess("Your service request has been cancelled.");

      await getNotifications();
    } catch (err) {
      console.error("Unable to cancel service request:", err);

      setError(
        err.response?.data?.message ||
          "Unable to cancel this request. Please try again."
      );
    } finally {
      setCancellingId(null);
    }
  };

  // Open complaint form for the selected request
  const openComplaintForm = (request) => {
    setSelectedRequest(request);
    setComplaintCategory("Service Quality");
    setComplaintSubject("");
    setComplaintDescription("");
    setError("");
    setSuccess("");
    setShowComplaintForm(true);
  };

  // Close complaint form
  const closeComplaintForm = () => {
    if (complaintLoading) return;

    setShowComplaintForm(false);
    setSelectedRequest(null);
    setComplaintSubject("");
    setComplaintDescription("");
  };

  // Submit complaint for the selected service request
  const submitComplaint = async (event) => {
    event.preventDefault();

    if (!token) {
      setError("Please log in to submit a complaint.");
      return;
    }

    if (!selectedRequest?._id) {
      setError("Please select a valid service request.");
      return;
    }

    if (!complaintSubject.trim() || !complaintDescription.trim()) {
      setError("Please enter a subject and complaint description.");
      return;
    }

    setComplaintLoading(true);
    setError("");
    setSuccess("");

    try {
      const requestProvider =
        selectedRequest.provider?._id ||
        selectedRequest.provider ||
        undefined;

      await axios.post(
        `${API}/complaints`,
        {
          bookingId: selectedRequest._id,
          provider: requestProvider,
          category: complaintCategory,
          subject: complaintSubject.trim(),
          description: complaintDescription.trim(),
        },
        {
          headers: authHeaders,
        }
      );

      setSuccess(
        `Your complaint for ${
          selectedRequest.serviceName || "this service"
        } has been submitted successfully.`
      );

      setShowComplaintForm(false);
      setSelectedRequest(null);
      setComplaintSubject("");
      setComplaintDescription("");
      setComplaintCategory("Service Quality");
    } catch (err) {
      console.error("Complaint submission error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to submit your complaint. Please try again."
      );
    } finally {
      setComplaintLoading(false);
    }
  };

  const canCancel = (status) =>
    ["Pending", "Accepted", "In Progress"].includes(status);

  const getStatusClass = (status) => {
    switch ((status || "Pending").toLowerCase()) {
      case "accepted":
        return "status-accepted";
      case "rejected":
        return "status-rejected";
      case "in progress":
        return "status-progress";
      case "completed":
        return "status-completed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-pending";
    }
  };

  const getNotificationIcon = (type = "") => {
    const normalizedType = type.toLowerCase();

    if (normalizedType.includes("completed")) return "✓";
    if (normalizedType.includes("accepted")) return "✓";
    if (normalizedType.includes("rejected")) return "✕";
    if (normalizedType.includes("cancelled")) return "!";
    if (normalizedType.includes("progress")) return "↻";

    return "•";
  };

  const formatStatus = (status) => status || "Pending";

  return (
    <div className="customer-dashboard">
      {/* Dashboard header */}
      <header className="customer-dashboard-header">
        <div className="customer-dashboard-heading">
          <span className="customer-eyebrow">CUSTOMER PORTAL</span>
          <h1>My Dashboard</h1>
          <p>Manage your service requests and stay updated.</p>
        </div>

        {/* Notification bell */}
        <div className="notification-container" ref={notificationRef}>
          <button
            type="button"
            className={`notification-bell ${
              showNotifications ? "notification-bell-active" : ""
            }`}
            aria-label={`Notifications, ${unreadCount} unread`}
            aria-expanded={showNotifications}
            onClick={() => {
              setShowNotifications((previous) => !previous);

              if (!showNotifications) {
                getNotifications(true);
              }
            }}
          >
            <FaBell />

            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-dropdown-header">
                <div>
                  <h2>Notifications</h2>
                  <p>
                    {unreadCount > 0
                      ? `${unreadCount} unread notification${
                          unreadCount !== 1 ? "s" : ""
                        }`
                      : "You're all caught up"}
                  </p>
                </div>

                <button
                  type="button"
                  className="notification-close"
                  aria-label="Close notifications"
                  onClick={() => setShowNotifications(false)}
                >
                  <FaTimes />
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  className="mark-all-read"
                  onClick={markAllAsRead}
                  disabled={actionLoading}
                >
                  <FaCheckDouble />
                  Mark all as read
                </button>
              )}

              <div className="notification-list">
                {notificationLoading && notifications.length === 0 ? (
                  <div className="notification-empty">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="notification-empty">
                    <span className="empty-bell">
                      <FaBell />
                    </span>
                    <strong>No notifications yet</strong>
                    <p>
                      Updates about your service requests will appear here.
                    </p>
                  </div>
                ) : (
                  [...notifications]
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt || 0) -
                        new Date(a.createdAt || 0)
                    )
                    .map((notification) => (
                      <div
                        className={`notification-item ${
                          notification.isRead
                            ? "notification-read"
                            : "notification-unread"
                        }`}
                        key={notification._id}
                      >
                        <span
                          className={`notification-type-icon ${
                            notification.isRead
                              ? ""
                              : "notification-type-icon-unread"
                          }`}
                          aria-hidden="true"
                        >
                          {getNotificationIcon(notification.type)}
                        </span>

                        <div className="notification-content">
                          <div className="notification-title-row">
                            <h3>{notification.title}</h3>

                            {!notification.isRead && (
                              <span className="unread-dot" />
                            )}
                          </div>

                          <p>{notification.message}</p>

                          <div className="notification-footer">
                            <span className="notification-time">
                              {getRelativeTime(notification.createdAt)}
                            </span>

                            {!notification.isRead && (
                              <button
                                type="button"
                                className="mark-read-button"
                                disabled={actionLoading}
                                onClick={() =>
                                  markNotificationAsRead(notification)
                                }
                              >
                                <FaCheck />
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>

              <div className="notification-dropdown-footer">
                Notifications refresh automatically.
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Feedback messages */}
      {error && (
        <div className="dashboard-alert dashboard-alert-error" role="alert">
          <span>{error}</span>

          <button
            type="button"
            aria-label="Dismiss error"
            onClick={() => setError("")}
          >
            <FaTimes />
          </button>
        </div>
      )}

      {success && (
        <div className="dashboard-alert dashboard-alert-success" role="status">
          <span>{success}</span>

          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setSuccess("")}
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Summary */}
      <section className="customer-summary">
        <div className="summary-item">
          <span className="summary-label">Total Requests</span>
          <strong>{requests.length}</strong>
        </div>

        <div className="summary-item">
          <span className="summary-label">Pending</span>
          <strong>
            {requests.filter((item) => item.status === "Pending").length}
          </strong>
        </div>

        <div className="summary-item">
          <span className="summary-label">In Progress</span>
          <strong>
            {requests.filter((item) => item.status === "In Progress").length}
          </strong>
        </div>

        <div className="summary-item">
          <span className="summary-label">Completed</span>
          <strong>
            {requests.filter((item) => item.status === "Completed").length}
          </strong>
        </div>
      </section>

      {/* Service requests */}
      <section className="customer-requests-section">
        <div className="requests-section-heading">
          <div>
            <span className="customer-eyebrow">YOUR BOOKINGS</span>
            <h2>My Service Requests</h2>
            <p>Track the latest status of your service bookings.</p>
          </div>

          <button
            type="button"
            className="refresh-requests-button"
            onClick={() => {
              getRequests();
              getNotifications();
            }}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="dashboard-state">
            <span className="dashboard-loader" />
            <p>Loading your service requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="dashboard-state">
            <div className="empty-request-icon">⌂</div>
            <h3>No service requests yet</h3>
            <p>
              Your service bookings will appear here after you request a
              service.
            </p>
          </div>
        ) : (
          <div className="customer-requests-list">
            {[...requests]
              .sort(
                (a, b) =>
                  new Date(b.createdAt || 0) -
                  new Date(a.createdAt || 0)
              )
              .map((request) => (
                <article className="customer-request-card" key={request._id}>
                  <div className="request-card-top">
                    <div className="request-service-icon">ST</div>

                    <div className="request-main-info">
                      <h3>{request.serviceName || "Service Request"}</h3>

                      <span className="request-id">
                        Request ID: {request._id}
                      </span>
                    </div>

                    <span
                      className={`request-status ${getStatusClass(
                        request.status
                      )}`}
                    >
                      {formatStatus(request.status)}
                    </span>
                  </div>

                  <div className="request-details-grid">
                    <div className="request-detail">
                      <span>Provider</span>
                      <strong>
                        {request.providerName || "Not assigned"}
                      </strong>
                    </div>

                    <div className="request-detail">
                      <span>Preferred date</span>
                      <strong>
                        {request.preferredDate
                          ? new Date(
                              request.preferredDate
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Not specified"}
                      </strong>
                    </div>

                    <div className="request-detail">
                      <span>Preferred time</span>
                      <strong>
                        {request.preferredTime || "Not specified"}
                      </strong>
                    </div>

                    <div className="request-detail">
                      <span>Location</span>
                      <strong>{request.location || "Not specified"}</strong>
                    </div>
                  </div>

                  {request.description && (
                    <div className="request-description">
                      <span>Description</span>
                      <p>{request.description}</p>
                    </div>
                  )}

                  <div className="request-card-bottom">
                    <span className="request-created">
                      Requested{" "}
                      {request.createdAt
                        ? new Date(request.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : ""}
                    </span>

                    <div className="request-action-buttons">
                      <button
                        type="button"
                        className="raise-complaint-button"
                        onClick={() => openComplaintForm(request)}
                      >
                        <FaExclamationCircle />
                        Raise Complaint
                      </button>

                      {canCancel(request.status) && (
                        <button
                          type="button"
                          className="cancel-request-button"
                          disabled={cancellingId === request._id}
                          onClick={() => cancelRequest(request)}
                        >
                          {cancellingId === request._id
                            ? "Cancelling..."
                            : "Cancel Request"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
          </div>
        )}
      </section>

      {/* Complaint form modal */}
      {showComplaintForm && selectedRequest && (
        <div
          className="complaint-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeComplaintForm();
            }
          }}
        >
          <div
            className="complaint-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="complaint-modal-title"
          >
            <div className="complaint-modal-header">
              <div>
                <span className="customer-eyebrow">CUSTOMER SUPPORT</span>
                <h2 id="complaint-modal-title">Raise a Complaint</h2>
                <p>
                  Service:{" "}
                  <strong>
                    {selectedRequest.serviceName || "Service Request"}
                  </strong>
                </p>
                <p className="complaint-request-id">
                  Request ID: {selectedRequest._id}
                </p>
              </div>

              <button
                type="button"
                className="complaint-modal-close"
                onClick={closeComplaintForm}
                disabled={complaintLoading}
                aria-label="Close complaint form"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={submitComplaint}>
              <label htmlFor="complaint-category">
                Complaint Category
              </label>

              <select
                id="complaint-category"
                value={complaintCategory}
                onChange={(event) =>
                  setComplaintCategory(event.target.value)
                }
                required
              >
                <option value="Service Quality">Service Quality</option>
                <option value="Provider Behaviour">Provider Behaviour</option>
                <option value="Payment Issue">Payment Issue</option>
                <option value="Incomplete Work">Incomplete Work</option>
                <option value="Delay in Service">Delay in Service</option>
                <option value="Other">Other</option>
              </select>

              <label htmlFor="complaint-subject">Subject</label>

              <input
                id="complaint-subject"
                type="text"
                value={complaintSubject}
                onChange={(event) =>
                  setComplaintSubject(event.target.value)
                }
                placeholder="Briefly describe the issue"
                minLength={3}
                maxLength={150}
                required
              />

              <label htmlFor="complaint-description">
                Complaint Description
              </label>

              <textarea
                id="complaint-description"
                value={complaintDescription}
                onChange={(event) =>
                  setComplaintDescription(event.target.value)
                }
                placeholder="Explain what happened with this service..."
                rows={5}
                minLength={5}
                maxLength={2000}
                required
              />

              <div className="complaint-modal-actions">
                <button
                  type="button"
                  className="complaint-cancel-button"
                  onClick={closeComplaintForm}
                  disabled={complaintLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="complaint-submit-button"
                  disabled={complaintLoading}
                >
                  {complaintLoading
                    ? "Submitting..."
                    : "Submit Complaint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
