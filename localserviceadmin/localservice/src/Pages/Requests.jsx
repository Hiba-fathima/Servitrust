import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Css/Request.css";

const API = "https://servitrust-baxkend.onrender.com/service-requests";

const Requests = () => {
const [requests, setRequests] = useState([]);
const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("");
const [providerFilter, setProviderFilter] = useState("");
const [serviceFilter, setServiceFilter] = useState("");
const [currentPage, setCurrentPage] = useState(1);
const [selectedRequest, setSelectedRequest] = useState(null);
const [newStatus, setNewStatus] = useState("");
const [loading, setLoading] = useState(true);
const [updating, setUpdating] = useState(false);
const [error, setError] = useState("");

const requestsPerPage = 5;

const statuses = [
"Pending",
"Accepted",
"In Progress",
"Completed",
"Cancelled",
];




const getRequests = async () => {
try {
setLoading(true);
const response = await axios.get(API);

  setRequests(
    Array.isArray(response.data)
      ? response.data
      : response.data.requests || []
  );
} catch (err) {
  console.error("GET REQUESTS ERROR:", err);
  setError("Unable to load service requests.");
} finally {
  setLoading(false);
}

};

useEffect(() => {
getRequests();
}, []);

const formatDateTime = (value) => {
if (!value) return "Not available";

const date = new Date(value);

if (Number.isNaN(date.getTime())) return value;

return date.toLocaleString("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

};

const formatDate = (value) => {
if (!value) return "Not available";

const date = new Date(value);

if (Number.isNaN(date.getTime())) return value;

return date.toLocaleDateString("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

};

const formatTime = (value) => {
if (!value) return "";

const match = String(value).match(
  /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i
);

if (!match) return value;

let hour = Number(match[1]);
const minute = match[2];
let period = match[3]?.toUpperCase();

if (!period) {
  period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
}

return `${String(hour).padStart(2, "0")}:${minute} ${period}`;

};

const getProvider = (request) => {
if (typeof request.providerName === "string") {
return request.providerName;
}

if (request.provider && typeof request.provider === "object") {
  return request.provider.name || request.provider.fullName || "Not assigned";
}

return request.providerName || "Not assigned";

};

const getService = (request) => {
if (typeof request.serviceName === "string") {
return request.serviceName;
}

if (request.service && typeof request.service === "object") {
  return request.service.name || request.service.title || "Not available";
}

return request.serviceName || "Not available";

};

const getRequestDate = (request) =>
formatDateTime(
request.createdAt || request.requestDate || request.created_on
);

const getServiceDateTime = (request) => {
const date = formatDate(request.preferredDate);
const start = formatTime(request.preferredTime);
const end = formatTime(
request.preferredEndTime || request.endTime
);

if (date === "Not available" && !start && !end) {
  return "Not available";
}

const time = [start, end].filter(Boolean).join(" - ");

return time ? `${date}, ${time}` : date;

};

const getStatusClass = (status) =>
(status || "Pending").toLowerCase().replace(/\s+/g, "-");

const filteredRequests = requests.filter((request) => {
const text = search.toLowerCase();

const matchesSearch = [
  request.customerName,
  request.customerEmail,
  request.customerPhone,
  getProvider(request),
  getService(request),
  request.location,
].some((value) =>
  String(value || "").toLowerCase().includes(text)
);

const matchesStatus =
  !statusFilter ||
  (request.status || "Pending").toLowerCase() ===
    statusFilter.toLowerCase();

const matchesProvider =
  !providerFilter || getProvider(request) === providerFilter;

const matchesService =
  !serviceFilter || getService(request) === serviceFilter;

return (
  matchesSearch &&
  matchesStatus &&
  matchesProvider &&
  matchesService
);

});

const providers = [
...new Set(
requests.map(getProvider).filter((name) => name !== "Not assigned")
),
];

const services = [
...new Set(
requests.map(getService).filter((name) => name !== "Not available")
),
];

const totalPages = Math.ceil(
filteredRequests.length / requestsPerPage
);

const startIndex = (currentPage - 1) * requestsPerPage;

const currentRequests = filteredRequests.slice(
startIndex,
startIndex + requestsPerPage
);

const openModal = (request) => {
setSelectedRequest(request);
setNewStatus(request.status || "Pending");
setError("");
};

const closeModal = () => {
if (updating) return;
setSelectedRequest(null);
setError("");
};

const updateStatus = async () => {
if (!selectedRequest || !newStatus) return;

try {
  setUpdating(true);
  setError("");

  await axios.patch(
    `${API}/${selectedRequest._id}/status`,
    { status: newStatus }
  );

  await getRequests();

  setSelectedRequest((previous) =>
    previous ? { ...previous, status: newStatus } : null
  );
} catch (err) {
  console.error("STATUS UPDATE ERROR:", err);
  setError(
    err.response?.data?.message ||
      "Status update failed. Check your backend API."
  );
} finally {
  setUpdating(false);
}

};




return ( <div className="requests-page"> <div className="requests-header"> <div> <p>SERVICE MANAGEMENT</p> <h1>Service Requests</h1> <span>Monitor customer requests and provider assignments.</span> </div>

    <div className="requests-count">
      <strong>{requests.length}</strong>
      <span>Total Requests</span>
    </div>
  </div>

  <div className="requests-toolbar">
    <input
      type="text"
      placeholder="Search customer, provider, service or location..."
      value={search}
      onChange={(e) => {
        setSearch(e.target.value);
        setCurrentPage(1);
      }}
    />

    <select
      value={statusFilter}
      onChange={(e) => {
        setStatusFilter(e.target.value);
        setCurrentPage(1);
      }}
    >
      <option value="">All Statuses</option>
      {statuses.map((status) => (
        <option key={status} value={status}>{status}</option>
      ))}
    </select>

    <select
      value={providerFilter}
      onChange={(e) => {
        setProviderFilter(e.target.value);
        setCurrentPage(1);
      }}
    >
      <option value="">All Providers</option>
      {providers.map((provider) => (
        <option key={provider} value={provider}>{provider}</option>
      ))}
    </select>

    <select
      value={serviceFilter}
      onChange={(e) => {
        setServiceFilter(e.target.value);
        setCurrentPage(1);
      }}
    >
      <option value="">All Services</option>
      {services.map((service) => (
        <option key={service} value={service}>{service}</option>
      ))}
    </select>

    <button
      className="reset-filters-btn"
      onClick={() => {
        setSearch("");
        setStatusFilter("");
        setProviderFilter("");
        setServiceFilter("");
        setCurrentPage(1);
      }}
    >
      Reset
    </button>
  </div>

  {error && <div className="requests-error">{error}</div>}

  <div className="requests-table-container">
    <table className="requests-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Customer</th>
          <th>Provider</th>
          <th>Service</th>
          <th>Request Date</th>
          <th>Service Date & Time</th>
          <th>Location</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {loading ? (
          <tr>
            <td colSpan="9" className="no-requests">Loading requests...</td>
          </tr>
        ) : currentRequests.length > 0 ? (
          currentRequests.map((request, index) => (
            <tr key={request._id}>
              <td>{startIndex + index + 1}</td>

              <td>
                <div className="customer-cell">
                  <div className="customer-avatar">
                    {(request.customerName || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong>{request.customerName || "Not available"}</strong>
                    <span>{request.customerEmail || "No email"}</span>
                  </div>
                </div>
              </td>

              <td>{getProvider(request)}</td>
              <td>{getService(request)}</td>
              <td className="date-cell">{getRequestDate(request)}</td>
              <td className="date-cell">{getServiceDateTime(request)}</td>
              <td>{request.location || "Not available"}</td>

              <td>
                <span className={`request-status ${getStatusClass(request.status)}`}>
                  {request.status || "Pending"}
                </span>
              </td>

              <td>
                <button
                  className="view-request-btn"
                  onClick={() => openModal(request)}
                >
                  View
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="9" className="no-requests">
              No service requests found.
            </td>
          </tr>
        )}
      </tbody>
    </table>

    {!loading && filteredRequests.length > 0 && (
      <div className="pagination">
        <span className="pagination-info">
          Showing {startIndex + 1}–
          {Math.min(startIndex + requestsPerPage, filteredRequests.length)}
          {" "}of {filteredRequests.length}
        </span>

        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
        >
          Previous
        </button>

        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (page) => (
            <button
              key={page}
              className={currentPage === page ? "active-page" : ""}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          )
        )}

        <button
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((page) => Math.min(totalPages, page + 1))
          }
        >
          Next
        </button>
      </div>
    )}
  </div>

  {selectedRequest && (
    <div className="request-modal-overlay" onClick={closeModal}>
      <div
        className="request-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="request-modal-header">
          <div>
            <p>REQUEST DETAILS</p>
            <h2>Service Request</h2>
            <span>ID: {selectedRequest._id}</span>
          </div>

          <button className="modal-close-btn" onClick={closeModal}>
            &times;
          </button>
        </div>

        <div className="request-modal-body">
          <div className="request-detail-grid">
            <div className="request-detail">
              <span>Customer Name</span>
              <strong>{selectedRequest.customerName || "Not available"}</strong>
            </div>

            <div className="request-detail">
              <span>Email</span>
              <strong>{selectedRequest.customerEmail || "Not available"}</strong>
            </div>

            <div className="request-detail">
              <span>Phone</span>
              <strong>
                {selectedRequest.customerPhone ||
                  selectedRequest.phone ||
                  "Not available"}
              </strong>
            </div>

            <div className="request-detail">
              <span>Provider</span>
              <strong>{getProvider(selectedRequest)}</strong>
            </div>

            <div className="request-detail">
              <span>Service</span>
              <strong>{getService(selectedRequest)}</strong>
            </div>

            <div className="request-detail">
              <span>Location</span>
              <strong>{selectedRequest.location || "Not available"}</strong>
            </div>

            <div className="request-detail">
              <span>Request Date</span>
              <strong>{getRequestDate(selectedRequest)}</strong>
            </div>

            <div className="request-detail">
              <span>Service Date & Time</span>
              <strong>{getServiceDateTime(selectedRequest)}</strong>
            </div>

            <div className="request-detail">
              <span>Status</span>
              <strong>
                <span className={`request-status ${getStatusClass(selectedRequest.status)}`}>
                  {selectedRequest.status || "Pending"}
                </span>
              </strong>
            </div>

            <div className="request-detail full-width">
              <span>Description / Notes</span>
              <strong>
                {selectedRequest.description ||
                  selectedRequest.message ||
                  selectedRequest.notes ||
                  "No additional details provided."}
              </strong>
            </div>
          </div>

          <div className="status-update-section">
            <label htmlFor="request-status">Update Status</label>

            <div className="status-update-controls">
              <select
                id="request-status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                disabled={updating}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <button
                className="save-status-btn"
                onClick={updateStatus}
                disabled={
                  updating ||
                  newStatus === (selectedRequest.status || "Pending")
                }
              >
                {updating ? "Updating..." : "Save Status"}
              </button>
            </div>
          </div>
        </div>

        <div className="request-modal-footer">
          <button className="modal-cancel-btn" onClick={closeModal}>
            Close
          </button>
        </div>
      </div>
    </div>
  )}
</div>

);
};

export default Requests;
