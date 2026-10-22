import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../Css/ProviderComplaint.css";

const API = "https://servitrust-baxkend.onrender.com";

function ProviderComplaints() {
  const [providerId, setProviderId] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingId, setSubmittingId] = useState("");

  const token = localStorage.getItem("token");

  const authHeaders = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  const loadComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const userId = localStorage.getItem("userId");

      if (!userId) {
        throw new Error("Please log in again to view complaints.");
      }

      // Find this provider's profile using the existing userId relationship.
      const providersResponse = await axios.get(
        `${API}/providers`,
        { headers: authHeaders }
      );

      const providers = Array.isArray(providersResponse.data)
        ? providersResponse.data
        : [];

      const provider = providers.find(
        (item) =>
          String(item.userId?._id || item.userId) === String(userId)
      );

      if (!provider) {
        throw new Error("Your provider profile could not be found.");
      }

      setProviderId(provider._id);

      // This endpoint returns only complaints assigned to this provider.
      const response = await axios.get(
        `${API}/providers/${provider._id}/complaints`,
        { headers: authHeaders }
      );

      const list = Array.isArray(response.data) ? response.data : [];

      setComplaints(list);

      const responseValues = {};

      list.forEach((item) => {
        responseValues[item._id] = item.providerResponse || "";
      });

      setResponses(responseValues);
    } catch (err) {
      console.error("LOAD PROVIDER COMPLAINTS ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load complaints."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
    // Initial page load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitResponse = async (complaint) => {
    const providerResponse = (responses[complaint._id] || "").trim();

    if (!providerResponse) {
      Swal.fire(
        "Response Required",
        "Please enter your response.",
        "warning"
      );
      return;
    }

    try {
      setSubmittingId(complaint._id);

      const result = await axios.put(
        `${API}/providers/${providerId}/complaints/${complaint._id}/response`,
        { providerResponse },
        { headers: authHeaders }
      );

      const updated = result.data.complaint;

      setComplaints((previous) =>
        previous.map((item) =>
          item._id === updated._id ? { ...item, ...updated } : item
        )
      );

      Swal.fire(
        "Response Submitted",
        "Your response has been saved successfully.",
        "success"
      );
    } catch (err) {
      console.error("SUBMIT PROVIDER RESPONSE ERROR:", err);

      Swal.fire(
        "Error",
        err.response?.data?.message ||
          "Unable to submit your response.",
        "error"
      );
    } finally {
      setSubmittingId("");
    }
  };

  if (loading) {
    return (
      <main className="provider-complaints">
        <p className="pc-state">Loading complaints...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="provider-complaints">
        <header className="pc-header">
          <div>
            <span className="pc-eyebrow">CUSTOMER SUPPORT</span>
            <h1>Complaints</h1>
          </div>
        </header>

        <section className="pc-error">
          <p>{error}</p>
          <button type="button" onClick={loadComplaints}>
            Try Again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="provider-complaints">
      <header className="pc-header">
        <div>
          <span className="pc-eyebrow">CUSTOMER SUPPORT</span>
          <h1>Provider Complaints</h1>
          <p>
            View complaints sent to you by the ServiTrust admin and submit
            your response.
          </p>
        </div>

        <div className="pc-count">
          <strong>{complaints.length}</strong>
          <span>Assigned complaints</span>
        </div>
      </header>

      <div className="pc-toolbar">
        <span>
          {complaints.length} complaint
          {complaints.length === 1 ? "" : "s"} assigned to you
        </span>

        <button
          type="button"
          className="pc-refresh"
          onClick={loadComplaints}
        >
          ↻ Refresh
        </button>
      </div>

      {complaints.length === 0 ? (
        <section className="pc-empty">
          <div className="pc-empty-icon">✓</div>
          <h2>No complaints assigned</h2>
          <p>
            Complaints will appear here only after the admin sends them
            to you.
          </p>
        </section>
      ) : (
        <section className="pc-list">
          {complaints.map((complaint) => (
            <article className="pc-card" key={complaint._id}>
              <header className="pc-card-header">
                <div>
                  <span className="pc-complaint-id">
                    {complaint.complaintId || "COMPLAINT"}
                  </span>

                  <h2>{complaint.subject || "Customer Complaint"}</h2>
                </div>

                <span
                  className={`pc-status pc-status-${(
                    complaint.status || "Pending"
                  )
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {complaint.status || "Pending"}
                </span>
              </header>

              <div className="pc-details">
                <p>
                  <strong>Customer:</strong>{" "}
                  {complaint.customer?.name || "Customer"}
                </p>

                <p>
                  <strong>Category:</strong>{" "}
                  {complaint.category || "Other"}
                </p>

                <p>
                  <strong>Complaint date:</strong>{" "}
                  {complaint.createdAt
                    ? new Date(complaint.createdAt).toLocaleDateString(
                        "en-IN"
                      )
                    : "—"}
                </p>

                <p>
                  <strong>Sent by admin:</strong>{" "}
                  {complaint.sentToProviderAt
                    ? new Date(
                        complaint.sentToProviderAt
                      ).toLocaleDateString("en-IN")
                    : "—"}
                </p>
              </div>

              <section className="pc-description">
                <h3>Complaint Description</h3>
                <p>
                  {complaint.description || "No description provided."}
                </p>
              </section>

              <section className="pc-response">
                <label htmlFor={`pc-response-${complaint._id}`}>
                  Your Response
                </label>

                <textarea
                  id={`pc-response-${complaint._id}`}
                  rows="4"
                  value={responses[complaint._id] || ""}
                  onChange={(event) =>
                    setResponses((previous) => ({
                      ...previous,
                      [complaint._id]: event.target.value,
                    }))
                  }
                  placeholder="Write your response to the complaint..."
                />

                <button
                  type="button"
                  onClick={() => submitResponse(complaint)}
                  disabled={submittingId === complaint._id}
                >
                  {submittingId === complaint._id
                    ? "Submitting..."
                    : complaint.providerResponse
                    ? "Update Response"
                    : "Submit Response"}
                </button>
              </section>

              {complaint.providerResponse && (
                <section className="pc-saved-response">
                  <h3>Previously Submitted Response</h3>
                  <p>{complaint.providerResponse}</p>

                  {complaint.providerRespondedAt && (
                    <small>
                      Updated on{" "}
                      {new Date(
                        complaint.providerRespondedAt
                      ).toLocaleDateString("en-IN")}
                    </small>
                  )}
                </section>
              )}
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default ProviderComplaints;