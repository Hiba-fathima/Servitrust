import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaTimes,
  FaExclamationCircle,
  FaStar,
} from "react-icons/fa";

import "../Css/CustomerDashboard.css";
import "../Css/CustomerRequest.css";
import CustomerNotificationBell from "./CustomerNotificationBell";

const API = "https://servitrust-baxkend.onrender.com";

function CustomerRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("All");

  // Complaint modal states
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [complaintCategory, setComplaintCategory] =
    useState("Service Quality");
  const [complaintSubject, setComplaintSubject] = useState("");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [complaintLoading, setComplaintLoading] = useState(false);

  // Review modal states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedReviewRequest, setSelectedReviewRequest] =
    useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  // IDs of requests already reviewed during this session
  const [reviewedRequestIds, setReviewedRequestIds] = useState([]);

  const navigate = useNavigate();
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

  // Load requests for the logged-in customer
  const fetchRequests = useCallback(async () => {
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
      setError("");

      const response = await axios.get(
        `${API}/service-requests/customer/${customerId}`,
        { headers: authHeaders }
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.requests ||
          response.data?.serviceRequests ||
          [];

      setRequests(data);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load your requests. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [token, customerId, authHeaders]);

  useEffect(() => {
    fetchRequests();

    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const getRequestId = (request) =>
    request?._id || request?.id;

  const getServiceName = (request) =>
    request?.serviceName ||
    request?.service?.name ||
    request?.service?.serviceName ||
    (typeof request?.service === "string"
      ? request.service
      : null) ||
    "Service Request";

  const getProviderName = (request) =>
    request?.providerName ||
    request?.provider?.name ||
    request?.provider?.fullName ||
    request?.provider?.businessName ||
    "Not assigned";

  const getStatus = (request) =>
    request?.status ||
    request?.requestStatus ||
    request?.bookingStatus ||
    "Pending";

  const normalizeStatus = (status) =>
    String(status || "Pending").trim().toLowerCase();

  const getStatusClass = (status) => {
    switch (normalizeStatus(status)) {
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

  const formatDate = (date) => {
    if (!date) return "Not specified";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const canCancel = (request) =>
    ["pending", "accepted", "in progress"].includes(
      normalizeStatus(getStatus(request))
    );

  // Cancel request
  const handleCancelRequest = async (request) => {
    const requestId = getRequestId(request);

    if (!requestId || cancellingId) return;

    if (
      !window.confirm(
        `Are you sure you want to cancel your ${getServiceName(
          request
        )} request?`
      )
    ) {
      return;
    }

    setCancellingId(requestId);
    setError("");
    setSuccess("");

    try {
      const response = await axios.patch(
        `${API}/service-requests/${requestId}/status`,
        { status: "Cancelled" },
        { headers: authHeaders }
      );

      const updatedRequest =
        response.data?.request || response.data;

      setRequests((previous) =>
        previous.map((item) =>
          getRequestId(item) === requestId
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
    } catch (err) {
      console.error("Error cancelling request:", err);
      setError(
        err.response?.data?.message ||
          "Unable to cancel this request. Please try again."
      );
    } finally {
      setCancellingId(null);
    }
  };

  // Open complaint modal
  const openComplaintForm = (request) => {
    setSelectedRequest(request);
    setComplaintCategory("Service Quality");
    setComplaintSubject("");
    setComplaintDescription("");
    setError("");
    setSuccess("");
    setShowComplaintForm(true);
  };

  const closeComplaintForm = () => {
    if (complaintLoading) return;

    setShowComplaintForm(false);
    setSelectedRequest(null);
    setComplaintCategory("Service Quality");
    setComplaintSubject("");
    setComplaintDescription("");
  };

  // Submit complaint separately from review
  const submitComplaint = async (event) => {
    event.preventDefault();

    const requestId = getRequestId(selectedRequest);

    if (!token || !requestId) {
      setError("Please log in and select a valid service request.");
      return;
    }

    if (
      !complaintSubject.trim() ||
      !complaintDescription.trim()
    ) {
      setError("Please enter a subject and complaint description.");
      return;
    }

    setComplaintLoading(true);
    setError("");
    setSuccess("");

    try {
      const provider =
        selectedRequest?.provider?._id ||
        selectedRequest?.provider ||
        undefined;

      await axios.post(
        `${API}/complaints`,
        {
          bookingId: requestId,
          provider,
          category: complaintCategory,
          subject: complaintSubject.trim(),
          description: complaintDescription.trim(),
        },
        { headers: authHeaders }
      );

      setShowComplaintForm(false);
      setSelectedRequest(null);
      setSuccess("Your complaint has been submitted successfully.");
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

  // Open review modal
  const openReviewForm = (request) => {
    const requestId = getRequestId(request);

    if (reviewedRequestIds.includes(requestId)) {
      setError("You have already submitted a review for this request.");
      return;
    }

    setSelectedReviewRequest(request);
    setRating(0);
    setReviewText("");
    setError("");
    setSuccess("");
    setShowReviewForm(true);
  };

  const closeReviewForm = () => {
    if (reviewLoading) return;

    setShowReviewForm(false);
    setSelectedReviewRequest(null);
    setRating(0);
    setReviewText("");
  };

  // Submit review to the separate reviews API
  const submitReview = async (event) => {
    event.preventDefault();

    const requestId = getRequestId(selectedReviewRequest);

    if (!token || !requestId) {
      setError("Please log in and select a valid service request.");
      return;
    }

    if (rating < 1 || rating > 5) {
      setError("Please select a rating from 1 to 5 stars.");
      return;
    }

    if (reviewText.trim().length < 5) {
      setError("Please write a review of at least 5 characters.");
      return;
    }

    setReviewLoading(true);
    setError("");
    setSuccess("");

    try {
      const request = selectedReviewRequest;

      const providerId =
        request?.provider?._id ||
        request?.provider?.id ||
        request?.providerId ||
        request?.provider ||
        undefined;

      const serviceId =
        request?.service?._id ||
        request?.service?.id ||
        request?.serviceId ||
        undefined;

      // This endpoint must be implemented in the backend.
      await axios.post(
        `${API}/reviews`,
        {
          serviceRequestId: requestId,
          bookingId: requestId,
          provider: providerId,
          service: serviceId,
          rating,
          comment: reviewText.trim(),
          review: reviewText.trim(),
        },
        { headers: authHeaders }
      );

      setReviewedRequestIds((previous) => [
        ...previous,
        requestId,
      ]);

      setShowReviewForm(false);
      setSelectedReviewRequest(null);
      setRating(0);
      setReviewText("");

      setSuccess(
        `Your review for ${getServiceName(
          request
        )} has been submitted successfully.`
      );
    } catch (err) {
      console.error("Review submission error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to submit your review. Please check that the backend reviews API is configured."
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const handleReview = (request) => openReviewForm(request);

  const filteredRequests = useMemo(() => {
    const sorted = [...requests].sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    );

    if (filter === "All") return sorted;

    return sorted.filter(
      (request) =>
        normalizeStatus(getStatus(request)) ===
        normalizeStatus(filter)
    );
  }, [requests, filter]);

  return (
    <div className="customer-dashboard customer-my-requests">
      <header className="customer-dashboard-header">
        <div className="customer-dashboard-heading">
          <span className="customer-eyebrow">CUSTOMER PORTAL</span>
          <h1>My Requests</h1>
          <p>Manage your service bookings and stay updated.</p>
        </div>

        <div className="customer-dashboard-notification">
          <CustomerNotificationBell />
        </div>
      </header>

      {error && (
        <div
          className="dashboard-alert dashboard-alert-error"
          role="alert"
        >
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
        <div
          className="dashboard-alert dashboard-alert-success"
          role="status"
        >
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

      <section className="customer-summary">
        <div className="summary-item">
          <span className="summary-label">Total Requests</span>
          <strong>{requests.length}</strong>
        </div>

        <div className="summary-item">
          <span className="summary-label">Pending</span>
          <strong>
            {
              requests.filter(
                (item) =>
                  normalizeStatus(getStatus(item)) === "pending"
              ).length
            }
          </strong>
        </div>

        <div className="summary-item">
          <span className="summary-label">In Progress</span>
          <strong>
            {
              requests.filter(
                (item) =>
                  normalizeStatus(getStatus(item)) === "in progress"
              ).length
            }
          </strong>
        </div>

        <div className="summary-item">
          <span className="summary-label">Completed</span>
          <strong>
            {
              requests.filter(
                (item) =>
                  normalizeStatus(getStatus(item)) === "completed"
              ).length
            }
          </strong>
        </div>
      </section>

      <section className="customer-requests-section">
        <div className="requests-section-heading">
          <div>
            <span className="customer-eyebrow">YOUR BOOKINGS</span>
            <h2>My Service Requests</h2>
            <p>Track your service bookings and check their latest status.</p>
          </div>

          <div className="my-requests-controls">
            <select
              className="my-requests-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              aria-label="Filter requests by status"
            >
              <option value="All">All Requests</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rejected">Rejected</option>
            </select>

            <button
              type="button"
              className="refresh-requests-button"
              onClick={fetchRequests}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="dashboard-state">
            <span className="dashboard-loader" />
            <p>Loading your service requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="dashboard-state">
            <h3>
              {requests.length === 0
                ? "No service requests yet"
                : "No requests found"}
            </h3>
            <p>
              {requests.length === 0
                ? "Your service bookings will appear here."
                : "Try choosing a different status filter."}
            </p>
          </div>
        ) : (
          <div className="customer-requests-list">
            {filteredRequests.map((request, index) => {
              const requestId = getRequestId(request);
              const status = getStatus(request);

              const price =
                request.price ??
                request.amount ??
                request.totalAmount ??
                request.service?.price;

              const alreadyReviewed =
                reviewedRequestIds.includes(requestId);

              return (
                <article
                  className="customer-request-card"
                  key={requestId || index}
                >
                  <div className="request-card-top">
                    <div className="request-service-icon">ST</div>

                    <div className="request-main-info">
                      <h3>{getServiceName(request)}</h3>
                      <span className="request-id">
                        Request ID:{" "}
                        {String(requestId || "N/A").slice(-8)}
                      </span>
                    </div>

                    <span
                      className={`request-status ${getStatusClass(status)}`}
                    >
                      {status}
                    </span>
                  </div>

                  <div className="request-details-grid">
                    <div className="request-detail">
                      <span>Provider</span>
                      <strong>{getProviderName(request)}</strong>
                    </div>

                    <div className="request-detail">
                      <span>Preferred date</span>
                      <strong>
                        {formatDate(
                          request.preferredDate ||
                            request.bookingDate ||
                            request.serviceDate
                        )}
                      </strong>
                    </div>

                    <div className="request-detail">
                      <span>Preferred time</span>
                      <strong>
                        {request.preferredTime ||
                          request.bookingTime ||
                          "Not specified"}
                      </strong>
                    </div>

                    <div className="request-detail">
                      <span>Location</span>
                      <strong>
                        {request.location ||
                          request.address ||
                          request.serviceAddress ||
                          request.customerAddress ||
                          "Not specified"}
                      </strong>
                    </div>

                    <div className="request-detail">
                      <span>Estimated price</span>
                      <strong>
                        {price !== undefined &&
                        price !== null &&
                        price !== ""
                          ? `₹${price}`
                          : "To be confirmed"}
                      </strong>
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
                      Requested {formatDate(request.createdAt)}
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

                      {canCancel(request) && (
                        <button
                          type="button"
                          className="cancel-request-button"
                          disabled={cancellingId === requestId}
                          onClick={() => handleCancelRequest(request)}
                        >
                          {cancellingId === requestId
                            ? "Cancelling..."
                            : "Cancel Request"}
                        </button>
                      )}

                      {/* Review button is now visible for every status */}
                      <button
                        type="button"
                        className="review-request-button"
                        onClick={() => handleReview(request)}
                        disabled={alreadyReviewed}
                      >
                        <FaStar />
                        {alreadyReviewed
                          ? "Review Submitted"
                          : "Write Review"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Complaint modal */}
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
                  Service: <strong>{getServiceName(selectedRequest)}</strong>
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
              <label htmlFor="complaint-category">Complaint Category</label>
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
                placeholder="Explain what happened..."
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
                  {complaintLoading ? "Submitting..." : "Submit Complaint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review modal */}
      {showReviewForm && selectedReviewRequest && (
        <div
          className="review-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeReviewForm();
            }
          }}
        >
          <div
            className="review-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
          >
            <div className="review-modal-header">
              <div>
                <span className="customer-eyebrow">YOUR FEEDBACK</span>
                <h2 id="review-modal-title">Write a Review</h2>
                <p>
                  Service:{" "}
                  <strong>
                    {getServiceName(selectedReviewRequest)}
                  </strong>
                </p>
                <p>
                  Provider:{" "}
                  <strong>
                    {getProviderName(selectedReviewRequest)}
                  </strong>
                </p>
              </div>

              <button
                type="button"
                className="review-modal-close"
                onClick={closeReviewForm}
                disabled={reviewLoading}
                aria-label="Close review form"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={submitReview}>
              <label className="review-rating-label">
                Rate Your Service
              </label>

              <div
                className="review-star-rating"
                role="group"
                aria-label="Select a rating from one to five stars"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={star <= rating ? "star-active" : ""}
                    onClick={() => setRating(star)}
                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                    aria-pressed={rating === star}
                  >
                    ★
                  </button>
                ))}
              </div>

              <small className="review-rating-hint">
                {rating === 0
                  ? "Select your rating from 1 to 5 stars."
                  : `You selected ${rating} out of 5 stars.`}
              </small>

              <label htmlFor="review-description">
                Your Review
              </label>

              <textarea
                id="review-description"
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                placeholder="Share your experience with this service..."
                rows={5}
                minLength={5}
                maxLength={2000}
                required
              />

              <div className="review-modal-actions">
                <button
                  type="button"
                  className="review-cancel-button"
                  onClick={closeReviewForm}
                  disabled={reviewLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="review-submit-button"
                  disabled={reviewLoading}
                >
                  <FaStar />
                  {reviewLoading ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerRequests;