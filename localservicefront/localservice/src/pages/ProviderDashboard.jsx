import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProviderDashboard = () => {

  const [provider, setProvider] = useState(null);

  const userId = localStorage.getItem("userId");

  const navigate = useNavigate();


  // =========================
  // GET PROVIDER PROFILE
  // =========================

  useEffect(() => {

    const getProvider = async () => {

      try {

        const response = await axios.get(
          "http://localhost:5000/providers"
        );

        const myProvider = response.data.find(
          (item) =>
            String(item.userId) === String(userId)
        );

        setProvider(myProvider);

      } catch (error) {

        console.log(
          "GET PROVIDER ERROR:",
          error
        );

      }

    };

    getProvider();

  }, [userId]);


  if (!provider) {

    return (
      <div className="provider-dashboard-loading">
        Loading dashboard...
      </div>
    );

  }


  return (

    <div className="provider-dashboard">

      {/* =========================
          WELCOME
      ========================= */}

      <section className="provider-welcome">

        <div>

          <p>
            PROVIDER OVERVIEW
          </p>

          <h1>
            Welcome back
          </h1>

          <span>
            Manage your services and monitor your performance.
          </span>

        </div>

        <div className="provider-status-pill">

          <span className="status-dot"></span>

          {provider.availability || "Available"}

        </div>

      </section>


      {/* =========================
          TOP STAT CARDS
      ========================= */}

      <section className="provider-overview-stats">

        <div className="overview-stat-card">

          <div className="overview-stat-top">
            <span>RELIABILITY SCORE</span>
            <span className="stat-symbol">%</span>
          </div>

          <strong>
            {provider.reliabilityScore || 0}%
          </strong>

          <small>
            Overall provider reliability
          </small>

        </div>


        <div className="overview-stat-card">

          <div className="overview-stat-top">
            <span>COMPLETED SERVICES</span>
            <span className="stat-symbol">✓</span>
          </div>

          <strong>
            {provider.completedServices || 0}
          </strong>

          <small>
            Successfully completed
          </small>

        </div>


        <div className="overview-stat-card">

          <div className="overview-stat-top">
            <span>CANCELLATIONS</span>
            <span className="stat-symbol">−</span>
          </div>

          <strong>
            {provider.cancelledServices || 0}
          </strong>

          <small>
            Cancelled service requests
          </small>

        </div>


        <div className="overview-stat-card">

          <div className="overview-stat-top">
            <span>AVERAGE RATING</span>
            <span className="stat-symbol">★</span>
          </div>

          <strong>
            {provider.averageRating || 0}
            <small className="rating-out-of">
              / 5
            </small>
          </strong>

          <small>
            Customer rating
          </small>

        </div>

      </section>


      {/* =========================
          MAIN GRID
      ========================= */}

      <section className="provider-dashboard-grid">


        {/* SERVICE OVERVIEW */}

        <div className="dashboard-panel service-overview-panel">

          <div className="dashboard-panel-header">

            <div>

              <span>
                PROFILE
              </span>

              <h2>
                Service Overview
              </h2>

            </div>

            <button
              onClick={() =>
                navigate("/profile")
              }
            >
              View Profile
            </button>

          </div>


          <div className="service-overview-content">

            <div className="provider-avatar-large">

              {provider.name
                ?.charAt(0)
                .toUpperCase() || "P"}

            </div>


            <div className="provider-overview-name">

              <h3>
                {provider.name || "Provider"}
              </h3>

              <p>
                {provider.service}
              </p>

            </div>

          </div>


          <div className="service-details-grid">

            <div>

              <span>
                SERVICE
              </span>

              <strong>
                {provider.service || "—"}
              </strong>

            </div>


            <div>

              <span>
                LOCATION
              </span>

              <strong>
                {provider.location || "—"}
              </strong>

            </div>


            <div>

              <span>
                EXPERIENCE
              </span>

              <strong>
                {provider.experience || "—"}
              </strong>

            </div>


            <div>

              <span>
                AVAILABILITY
              </span>

              <strong className="availability-text">
                {provider.availability || "—"}
              </strong>

            </div>

          </div>

        </div>


        {/* PERFORMANCE */}

        <div className="dashboard-panel performance-panel">

          <div className="dashboard-panel-header">

            <div>

              <span>
                PERFORMANCE
              </span>

              <h2>
                Reliability
              </h2>

            </div>

          </div>


          <div className="reliability-score">

            <div className="reliability-number">

              <strong>
                {provider.reliabilityScore || 0}
              </strong>

              <span>
                / 100
              </span>

            </div>

            <p>
              Reliability Score
            </p>

          </div>


          <div className="reliability-progress">

            <div
              className="reliability-progress-bar"
              style={{
                width: `${provider.reliabilityScore || 0}%`
              }}
            ></div>

          </div>


          <div className="performance-items">

            <div>

              <span>
                Completed Services
              </span>

              <strong>
                {provider.completedServices || 0}
              </strong>

            </div>


            <div>

              <span>
                Cancelled Services
              </span>

              <strong>
                {provider.cancelledServices || 0}
              </strong>

            </div>


            <div>

              <span>
                Complaints
              </span>

              <strong>
                {provider.complaints || 0}
              </strong>

            </div>

          </div>

        </div>


        {/* DESCRIPTION */}

        <div className="dashboard-panel description-panel">

          <div className="dashboard-panel-header">

            <div>

              <span>
                ABOUT
              </span>

              <h2>
                Service Description
              </h2>

            </div>

          </div>


          <p className="provider-dashboard-description">
            {provider.description ||
              "No service description has been added yet."}
          </p>

        </div>


        {/* QUICK ACCESS */}

        <div className="dashboard-panel quick-access-panel">

          <div className="dashboard-panel-header">

            <div>

              <span>
                QUICK ACCESS
              </span>

              <h2>
                Manage
              </h2>

            </div>

          </div>


          <div className="quick-access-buttons">

            <button
              onClick={() =>
                navigate("/provider/requests")
              }
            >
              <strong>
                Service Requests
              </strong>

              <span>
                View customer requests →
              </span>

            </button>


            <button
              onClick={() =>
                navigate("/profile")
              }
            >
              <strong>
                My Profile
              </strong>

              <span>
                View and update profile →
              </span>

            </button>

          </div>

        </div>

      </section>

    </div>

  );
};

export default ProviderDashboard;