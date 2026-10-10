import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../Css/Complaints.css";

const API = "https://servitrust-baxkend.onrender.com/complaints";

const STATUSES = ["Pending", "Under Review", "Resolved", "Closed"];

const CATEGORIES = [
"Service Quality",
"Provider Behaviour",
"Incomplete Service",
"Payment Issue",
"Booking Issue",
"Other",
];

function Complaints() {
const [complaints, setComplaints] = useState([]);
const [loading, setLoading] = useState(true);
const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("All");
const [categoryFilter, setCategoryFilter] = useState("All");
const [selected, setSelected] = useState(null);
const [saving, setSaving] = useState(false);

const [status, setStatus] = useState("Pending");
const [adminNotes, setAdminNotes] = useState("");
const [resolution, setResolution] = useState("");

const fetchComplaints = async () => {
try {
setLoading(true);

  const response = await axios.get(API);

  setComplaints(
    Array.isArray(response.data) ? response.data : []
  );
} catch (error) {
  console.error(error);

  Swal.fire(
    "Error",
    "Unable to load complaints. Check your backend connection.",
    "error"
  );
} finally {
  setLoading(false);
}

};

useEffect(() => {
fetchComplaints();
}, []);

const filtered = complaints.filter((item) => {
const keyword = search.toLowerCase().trim();

const matchesSearch =
  !keyword ||
  [
    item.complaintId,
    item.subject,
    item.description,
    item.category,
    item.customer?.name,
    item.customer?.email,
    item.provider?.name,
  ].some((value) =>
    String(value || "").toLowerCase().includes(keyword)
  );

return (
  matchesSearch &&
  (statusFilter === "All" || item.status === statusFilter) &&
  (categoryFilter === "All" || item.category === categoryFilter)
);

});

const openComplaint = (item) => {
setSelected(item);
setStatus(item.status || "Pending");
setAdminNotes(item.adminNotes || "");
setResolution(item.resolution || "");
};

const updateComplaint = async (event) => {
event.preventDefault();

if (!selected?._id) return;

try {
  setSaving(true);

  const response = await axios.put(`${API}/${selected._id}`, {
    status,
    adminNotes,
    resolution,
  });

  const updated = response.data.complaint;

  setComplaints((previous) =>
    previous.map((item) =>
      item._id === updated._id ? updated : item
    )
  );

  setSelected(null);

  Swal.fire(
    "Updated",
    "Complaint updated successfully.",
    "success"
  );
} catch (error) {
  Swal.fire(
    "Error",
    error.response?.data?.message || "Unable to update complaint.",
    "error"
  );
} finally {
  setSaving(false);
}

};

const deleteComplaint = async (item) => {
const result = await Swal.fire({
title: "Delete complaint?",
text: "This permanently deletes the complaint.",
icon: "warning",
showCancelButton: true,
confirmButtonText: "Delete",
confirmButtonColor: "#b42318",
});

if (!result.isConfirmed) return;

try {
  await axios.delete(`${API}/${item._id}`);

  setComplaints((previous) =>
    previous.filter((complaint) => complaint._id !== item._id)
  );

  Swal.fire("Deleted", "Complaint deleted.", "success");
} catch (error) {
  Swal.fire(
    "Error",
    error.response?.data?.message || "Unable to delete complaint.",
    "error"
  );
}

};

const count = (value) =>
complaints.filter((item) => item.status === value).length;

const formatDate = (value) => {
if (!value) return "—";

const date = new Date(value);

return Number.isNaN(date.getTime())
  ? "—"
  : date.toLocaleDateString("en-IN");

};

return ( <div className="admin-complaints"> <header className="ac-header"> <div> <p className="ac-eyebrow">CUSTOMER SUPPORT</p> <h1>Complaints</h1> <p>Review complaints and manage customer resolutions.</p> </div>

    <button onClick={fetchComplaints} disabled={loading}>
      {loading ? "Loading..." : "↻ Refresh"}
    </button>
  </header>

  <section className="ac-summary">
    <div>
      <span>Total Complaints</span>
      <strong>{complaints.length}</strong>
    </div>
    <div>
      <span>Pending</span>
      <strong>{count("Pending")}</strong>
    </div>
    <div>
      <span>Under Review</span>
      <strong>{count("Under Review")}</strong>
    </div>
    <div>
      <span>Resolved</span>
      <strong>{count("Resolved")}</strong>
    </div>
  </section>

  <section className="ac-filters">
    <input
      type="search"
      placeholder="Search complaint, customer, provider..."
      value={search}
      onChange={(event) => setSearch(event.target.value)}
    />

    <select
      value={statusFilter}
      onChange={(event) => setStatusFilter(event.target.value)}
    >
      <option value="All">All Statuses</option>
      {STATUSES.map((value) => (
        <option key={value}>{value}</option>
      ))}
    </select>

    <select
      value={categoryFilter}
      onChange={(event) => setCategoryFilter(event.target.value)}
    >
      <option value="All">All Categories</option>
      {CATEGORIES.map((value) => (
        <option key={value}>{value}</option>
      ))}
    </select>
  </section>

  <section className="ac-table-card">
    <div className="ac-table-title">
      <h2>All Complaints</h2>
      <span>{filtered.length} records</span>
    </div>

    <div className="ac-table-scroll">
      <table>
        <thead>
          <tr>
            <th>Complaint ID</th>
            <th>Customer</th>
            <th>Provider</th>
            <th>Category</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7" className="ac-empty">
                Loading complaints...
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan="7" className="ac-empty">
                No complaints found.
              </td>
            </tr>
          ) : (
            filtered.map((item) => (
              <tr key={item._id}>
                <td className="ac-id">
                  {item.complaintId || "—"}
                </td>

                <td>
                  <strong>{item.customer?.name || "Unknown"}</strong>
                  <small>{item.customer?.email || ""}</small>
                </td>

                <td>{item.provider?.name || "—"}</td>
                <td>{item.category}</td>
                <td>{formatDate(item.createdAt)}</td>

                <td>
                  <span
                    className={`ac-status ac-${(
                      item.status || "Pending"
                    ).toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {item.status || "Pending"}
                  </span>
                </td>

                <td>
                  <div className="ac-actions">
                    <button onClick={() => openComplaint(item)}>
                      View / Edit
                    </button>

                    <button
                      className="ac-delete"
                      onClick={() => deleteComplaint(item)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </section>

  {selected && (
    <div className="ac-overlay">
      <div className="ac-modal">
        <div className="ac-modal-header">
          <div>
            <p className="ac-eyebrow">
              {selected.complaintId || "COMPLAINT"}
            </p>
            <h2>Complaint Details</h2>
          </div>

          <button
            type="button"
            className="ac-close"
            onClick={() => setSelected(null)}
          >
            ×
          </button>
        </div>

        <div className="ac-details">
          <p><strong>Customer:</strong> {selected.customer?.name || "Unknown"}</p>
          <p><strong>Email:</strong> {selected.customer?.email || "—"}</p>
          <p><strong>Provider:</strong> {selected.provider?.name || "—"}</p>
          <p><strong>Category:</strong> {selected.category}</p>
          <p><strong>Subject:</strong> {selected.subject}</p>
          <p><strong>Description:</strong> {selected.description}</p>
          <p><strong>Date:</strong> {formatDate(selected.createdAt)}</p>
        </div>

        <form onSubmit={updateComplaint} className="ac-form">
          <label htmlFor="ac-status">Status</label>
          <select
            id="ac-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {STATUSES.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>

          <label htmlFor="ac-notes">Admin Notes</label>
          <textarea
            id="ac-notes"
            rows="3"
            value={adminNotes}
            onChange={(event) => setAdminNotes(event.target.value)}
            placeholder="Internal investigation notes..."
          />

          <label htmlFor="ac-resolution">Resolution</label>
          <textarea
            id="ac-resolution"
            rows="3"
            value={resolution}
            onChange={(event) => setResolution(event.target.value)}
            placeholder="Describe the resolution..."
          />

          <div className="ac-modal-actions">
            <button
              type="button"
              onClick={() => setSelected(null)}
              disabled={saving}
            >
              Cancel
            </button>

            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
</div>

);
}

export default Complaints;
