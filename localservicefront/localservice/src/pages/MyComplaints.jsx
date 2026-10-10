import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import "../Css/CustomerComplaints.css";

const API = "https://servitrust-baxkend.onrender.com/complaints";

function MyComplaints() {
const [complaints, setComplaints] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
const fetchMyComplaints = async () => {
const userId = localStorage.getItem("userId");

  if (!userId) {
    setLoading(false);
    return;
  }

  try {
    const response = await axios.get(API, {
      params: { customer: userId },
    });

    setComplaints(
      Array.isArray(response.data) ? response.data : []
    );
  } catch (error) {
    console.error(error);

    Swal.fire(
      "Error",
      "Unable to load your complaints.",
      "error"
    );
  } finally {
    setLoading(false);
  }
};

fetchMyComplaints();

}, []);

const formatDate = (dateValue) => {
if (!dateValue) return "—";

const date = new Date(dateValue);

return Number.isNaN(date.getTime())
  ? "—"
  : date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

};

return ( <main className="customer-complaint-page"> <div className="customer-complaint-container cc-my-page"> <div className="cc-my-header"> <div> <p className="cc-eyebrow">CUSTOMER SUPPORT</p> <h1>My Complaints</h1> <p className="cc-intro">
Track your complaints and check their latest status. </p> </div>

      <Link to="/raise-complaint" className="cc-new-button">
        + Raise Complaint
      </Link>
    </div>

    {loading ? (
      <div className="cc-message">Loading complaints...</div>
    ) : !localStorage.getItem("userId") ? (
      <div className="cc-message">
        Please log in to view your complaints.
      </div>
    ) : complaints.length === 0 ? (
      <div className="cc-message">
        <h3>No complaints yet</h3>
        <p>Your submitted complaints will appear here.</p>
        <Link to="/raise-complaint" className="cc-new-button">
          Raise Your First Complaint
        </Link>
      </div>
    ) : (
      <div className="cc-list">
        {complaints.map((complaint) => (
          <article className="cc-complaint-card" key={complaint._id}>
            <div className="cc-card-header">
              <div>
                <span className="cc-complaint-id">
                  {complaint.complaintId || "Complaint"}
                </span>

                <h3>{complaint.subject}</h3>
              </div>

              <span
                className={`cc-status cc-${(
                  complaint.status || "Pending"
                ).toLowerCase().replace(/\s+/g, "-")}`}
              >
                {complaint.status || "Pending"}
              </span>
            </div>

            <p className="cc-category">
              {complaint.category}
            </p>

            <p className="cc-description">
              {complaint.description}
            </p>

            <div className="cc-card-footer">
              <span>
                Submitted: {formatDate(complaint.createdAt)}
              </span>

              {complaint.status === "Resolved" &&
                complaint.resolution && (
                  <div className="cc-resolution">
                    <strong>Resolution</strong>
                    <p>{complaint.resolution}</p>
                  </div>
                )}
            </div>
          </article>
        ))}
      </div>
    )}
  </div>
</main>

);
}

export default MyComplaints;
