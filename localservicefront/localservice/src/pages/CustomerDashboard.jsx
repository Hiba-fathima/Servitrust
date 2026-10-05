import React, { useEffect, useState } from "react";
import axios from "axios";

const CustomerDashboard = () => {

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");

  // =========================
  // GET CUSTOMER REQUESTS
  // =========================

  const getCustomerRequests = async () => {
    try {

      setLoading(true);

      const response = await axios.get(
        `http://localhost:5000/service-requests/customer/${userId}`
      );

      setRequests(response.data);

    } catch (error) {

      console.log(
        "CUSTOMER DASHBOARD ERROR:",
        error.response?.data || error
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    getCustomerRequests();

  }, []);


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
      <div className="customer-dashboard-loading">
        Loading dashboard...
      </div>
    );

  }


  return (

    <div className="customer-dashboard">

      {/* =========================
          HEADER
      ========================= */}

      <div className="customer-dashboard-header">

        <div>

          <p>CUSTOMER DASHBOARD</p>

          <h1>My Dashboard</h1>

          <span>
            Track your service requests and bookings.
          </span>

        </div>

      </div>


      {/* =========================
          STAT CARDS
      ========================= */}

      <div className="customer-stats">

        <div className="customer-stat-card">

          <span>
            Total Requests
          </span>

          <strong>
            {requests.length}
          </strong>

        </div>


        <div className="customer-stat-card pending">

          <span>
            Pending
          </span>

          <strong>
            {pendingRequests.length}
          </strong>

        </div>


        <div className="customer-stat-card accepted">

          <span>
            Accepted
          </span>

          <strong>
            {acceptedRequests.length}
          </strong>

        </div>


        <div className="customer-stat-card rejected">

          <span>
            Rejected
          </span>

          <strong>
            {rejectedRequests.length}
          </strong>

        </div>

      </div>


      {/* =========================
          MY REQUESTS
      ========================= */}

      <div className="customer-requests-section">

        <div className="customer-section-heading">

          <div>

            <p>REQUEST HISTORY</p>

            <h2>
              My Service Requests
            </h2>

          </div>

          <span>

            {requests.length} request
            {requests.length !== 1 ? "s" : ""}

          </span>

        </div>


        {requests.length === 0 ? (

          <div className="no-customer-requests">

            <h3>
              No service requests yet
            </h3>

            <p>
              Your service requests will appear here.
            </p>

          </div>

        ) : (

          <div className="customer-request-list">

            {requests.map((request) => (

              <div
                className="customer-request-card"
                key={request._id}
              >

                {/* =========================
                    TOP
                ========================= */}

                <div className="customer-request-top">

                  <div>

                    <span className="request-label">
                      SERVICE REQUEST
                    </span>

                    <h3>
                      {request.serviceName}
                    </h3>

                  </div>


                  <span
                    className={`customer-request-status ${request.status?.toLowerCase()}`}
                  >
                    {request.status}
                  </span>

                </div>


                {/* =========================
                    PROVIDER + DETAILS
                ========================= */}

                <div className="customer-request-info">

                  <div>

                    <span>
                      Provider
                    </span>

                    <strong>
                      {request.providerName || "—"}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Date
                    </span>

                    <strong>
                      {request.preferredDate}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Time
                    </span>

                    <strong>
                      {request.preferredTime}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Location
                    </span>

                    <strong>
                      {request.location}
                    </strong>

                  </div>

                </div>


                {/* =========================
                    DESCRIPTION
                ========================= */}

                <div className="customer-request-description">

                  <span>
                    Description
                  </span>

                  <p>
                    {request.description}
                  </p>

                </div>


                {/* =========================
                    NOTES
                ========================= */}

                {request.notes && (

                  <div className="customer-request-description">

                    <span>
                      Additional Notes
                    </span>

                    <p>
                      {request.notes}
                    </p>

                  </div>

                )}


                {/* =========================
                    STATUS MESSAGE
                ========================= */}

                <div className="customer-request-message">

                  {request.status === "Pending" && (
                    <p>
                      Waiting for the provider to respond
                      to your request.
                    </p>
                  )}

                  {request.status === "Accepted" && (
                    <p>
                      Your service request has been
                      accepted by the provider.
                    </p>
                  )}

                  {request.status === "Rejected" && (
                    <p>
                      The provider has rejected this
                      service request.
                    </p>
                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );
};

export default CustomerDashboard;