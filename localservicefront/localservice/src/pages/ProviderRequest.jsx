import React, { useEffect, useState } from "react";
import axios from "axios";

const ProviderRequests = () => {

  const [provider, setProvider] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const userId = localStorage.getItem("userId");

  // =========================
  // GET PROVIDER REQUESTS
  // =========================

  const getProviderRequests = async () => {
    try {

      setLoading(true);

      // Get provider list
      const providerResponse = await axios.get(
        "http://localhost:5000/providers"
      );

      const myProvider = providerResponse.data.find(
        (item) =>
          String(item.userId) === String(userId)
      );

      if (!myProvider) {
        console.log("Provider profile not found");
        return;
      }

      setProvider(myProvider);

      // Get ONLY this provider's requests
      const requestResponse = await axios.get(
        `http://localhost:5000/service-requests/provider/${myProvider._id}`
      );

      setRequests(requestResponse.data);

    } catch (error) {

      console.log(
        "GET PROVIDER REQUESTS ERROR:",
        error.response?.data || error
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    getProviderRequests();
  }, []);


  // =========================
  // UPDATE STATUS
  // =========================

  const updateRequestStatus = async (
    requestId,
    status
  ) => {

    try {

      setUpdatingId(requestId);

      await axios.put(
        `http://localhost:5000/service-requests/${requestId}/status`,
        {
          status: status,
          providerId: provider._id
        }
      );

      // Refresh requests
      await getProviderRequests();

    } catch (error) {

      console.log(
        "UPDATE REQUEST ERROR:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
        "Failed to update request"
      );

    } finally {

      setUpdatingId(null);

    }
  };


  // =========================
  // COUNTS
  // =========================

  const pendingRequests = requests.filter(
    (request) =>
      request.status === "Pending"
  );

  const acceptedRequests = requests.filter(
    (request) =>
      request.status === "Accepted"
  );

  const rejectedRequests = requests.filter(
    (request) =>
      request.status === "Rejected"
  );


  if (loading) {

    return (
      <div className="provider-requests-loading">
        Loading service requests...
      </div>
    );

  }


  return (

    <div className="provider-requests-page">

      {/* =========================
          HEADER
      ========================= */}

      <div className="provider-requests-header">

        <div>

          <p>REQUEST MANAGEMENT</p>

          <h1>Service Requests</h1>

          <span>
            Review customer requests and manage your bookings.
          </span>

        </div>


        {provider && (

          <div className="provider-request-service">

            <small>YOUR SERVICE</small>

            <strong>
              {provider.service}
            </strong>

            <span>
              {provider.location}
            </span>

          </div>

        )}

      </div>


      {/* =========================
          SUMMARY
      ========================= */}

      <div className="request-summary">

        <div className="request-summary-card">

          <span>Total Requests</span>

          <strong>
            {requests.length}
          </strong>

        </div>


        <div className="request-summary-card pending">

          <span>Pending</span>

          <strong>
            {pendingRequests.length}
          </strong>

        </div>


        <div className="request-summary-card accepted">

          <span>Accepted</span>

          <strong>
            {acceptedRequests.length}
          </strong>

        </div>


        <div className="request-summary-card rejected">

          <span>Rejected</span>

          <strong>
            {rejectedRequests.length}
          </strong>

        </div>

      </div>


      {/* =========================
          REQUESTS
      ========================= */}

      <section className="requests-container">

        <div className="requests-section-header">

          <div>

            <span>INCOMING REQUESTS</span>

            <h2>
              Customer Requests
            </h2>

          </div>

          <span className="request-count">
            {requests.length} total
          </span>

        </div>


        {requests.length === 0 ? (

          <div className="empty-request-state">

            <div className="empty-request-icon">
              ✓
            </div>

            <h3>
              No service requests
            </h3>

            <p>
              New customer requests will appear here.
            </p>

          </div>

        ) : (

          <div className="request-list">

            {requests.map((request) => (

              <div
                className="request-card"
                key={request._id}
              >

                {/* CARD HEADER */}

                <div className="request-card-header">

                  <div className="request-card-title">

                    <span>
                      SERVICE REQUEST
                    </span>

                    <h3>
                      {request.serviceName}
                    </h3>

                  </div>


                  <span
                    className={`request-status ${request.status?.toLowerCase()}`}
                  >
                    {request.status}
                  </span>

                </div>


                {/* CUSTOMER */}

                <div className="customer-section">

                  <div className="customer-avatar">

                    {(request.customerName ||
                      "C")
                      .charAt(0)
                      .toUpperCase()}

                  </div>


                  <div className="customer-details">

                    <span>CUSTOMER</span>

                    <strong>
                      {request.customerName ||
                        "Customer"}
                    </strong>

                    {request.customerPhone && (

                      <small>
                        {request.customerPhone}
                      </small>

                    )}

                  </div>

                </div>


                {/* REQUEST DETAILS */}

                <div className="request-details-grid">

                  <div className="request-detail">

                    <span>
                      Preferred Date
                    </span>

                    <strong>
                      {request.preferredDate || "—"}
                    </strong>

                  </div>


                  <div className="request-detail">

                    <span>
                      Preferred Time
                    </span>

                    <strong>
                      {request.preferredTime || "—"}
                    </strong>

                  </div>


                  <div className="request-detail">

                    <span>
                      Location
                    </span>

                    <strong>
                      {request.location || "—"}
                    </strong>

                  </div>

                </div>


                {/* DESCRIPTION */}

                <div className="request-description-box">

                  <span>
                    SERVICE DETAILS
                  </span>

                  <p>
                    {request.description ||
                      "No description provided."}
                  </p>

                </div>


                {/* NOTES */}

                {request.notes && (

                  <div className="request-notes-box">

                    <span>
                      CUSTOMER NOTES
                    </span>

                    <p>
                      {request.notes}
                    </p>

                  </div>

                )}


                {/* ACTIONS */}

                {request.status === "Pending" && (

                  <div className="request-actions">

                    <button
                      type="button"
                      className="reject-btn"
                      disabled={
                        updatingId === request._id
                      }
                      onClick={() =>
                        updateRequestStatus(
                          request._id,
                          "Rejected"
                        )
                      }
                    >

                      {updatingId === request._id
                        ? "Updating..."
                        : "Reject"}

                    </button>


                    <button
                      type="button"
                      className="accept-btn"
                      disabled={
                        updatingId === request._id
                      }
                      onClick={() =>
                        updateRequestStatus(
                          request._id,
                          "Accepted"
                        )
                      }
                    >

                      {updatingId === request._id
                        ? "Updating..."
                        : "Accept Request"}

                    </button>

                  </div>

                )}


                {/* PROCESSED MESSAGE */}

                {request.status === "Accepted" && (

                  <div className="processed-message accepted-message">
                    This request has been accepted.
                  </div>

                )}


                {request.status === "Rejected" && (

                  <div className="processed-message rejected-message">
                    This request has been rejected.
                  </div>

                )}

              </div>

            ))}

          </div>

        )}

      </section>

    </div>

  );
};

export default ProviderRequests;