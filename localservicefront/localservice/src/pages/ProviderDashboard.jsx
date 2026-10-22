import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProviderNotificationBell from "../pages/ProvideNotificationBell";
import "../Css/ProvideDashboard.css";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://servitrust-baxkend.onrender.com"
).replace(/\/+$/, "");

const ProviderDashboard = () => {
  const [provider, setProvider] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");

  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  // Get the logged-in provider's profile.
  useEffect(() => {
    let cancelled = false;

    const getProvider = async () => {
      setProfileLoading(true);
      setProfileError("");

      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please log in to access your dashboard.");
        }

        const response = await axios.get(
          `${API_URL}/providers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const providers = Array.isArray(response.data)
          ? response.data
          : response.data?.providers || [];

        const myProvider = providers.find(
          (item) => String(item.userId?._id || item.userId) === String(userId)
        );

        if (!cancelled) {
          setProvider(myProvider || null);

          if (!myProvider) {
            setProfileError(
              "We couldn't find a provider profile linked to your account."
            );
          }
        }
      } catch (error) {
        console.error("GET PROVIDER ERROR:", error);

        if (!cancelled) {
          setProfileError(
            error.response?.data?.message ||
              error.message ||
              "Unable to load your provider profile."
          );
        }
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    };

    getProvider();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (profileLoading) {
    return (
      <div className="provider-dashboard-loading">
        Loading dashboard...
      </div>
    );
  }

  if (profileError || !provider) {
    return (
      <div className="provider-dashboard-error">
        <h2>Provider Dashboard</h2>
        <p>{profileError || "Provider profile not found."}</p>

        <button type="button" onClick={() => navigate("/profile")}>
          View Profile
        </button>
      </div>
    );
  }

  const reliabilityScore = Number(provider.reliabilityScore) || 0;

  return (
    <div className="provider-dashboard">
      {/* WELCOME */}
      <section className="provider-welcome">
        <div className="provider-welcome-content">
          <p>PROVIDER OVERVIEW</p>

          <h1>Welcome back, {provider.name || "Provider"}</h1>

          <span>
            Manage your services and monitor your performance.
          </span>
        </div>

        <div className="provider-welcome-actions">
          <ProviderNotificationBell />

          <div className="provider-status-pill">
            <span className="status-dot"></span>
            {provider.availability || "Available"}
          </div>
        </div>
      </section>

      {/* TOP STAT CARDS */}
      <section className="provider-overview-stats">
        <div className="overview-stat-card">
          <div className="overview-stat-top">
            <span>RELIABILITY SCORE</span>
            <span className="stat-symbol">%</span>
          </div>

          <strong>{reliabilityScore}%</strong>

          <small>Overall provider reliability</small>
        </div>

        <div className="overview-stat-card">
          <div className="overview-stat-top">
            <span>COMPLETED SERVICES</span>
            <span className="stat-symbol">✓</span>
          </div>

          <strong>{provider.completedServices || 0}</strong>

          <small>Successfully completed</small>
        </div>

        <div className="overview-stat-card">
          <div className="overview-stat-top">
            <span>CANCELLATIONS</span>
            <span className="stat-symbol">−</span>
          </div>

          <strong>{provider.cancelledServices || 0}</strong>

          <small>Cancelled service requests</small>
        </div>

        <div className="overview-stat-card">
          <div className="overview-stat-top">
            <span>AVERAGE RATING</span>
            <span className="stat-symbol">★</span>
          </div>

          <strong>
            {provider.averageRating || 0}
            <small className="rating-out-of"> / 5</small>
          </strong>

          <small>Customer rating</small>
        </div>
      </section>

      {/* MAIN GRID */}
      <section className="provider-dashboard-grid">
        {/* SERVICE OVERVIEW */}
        <div className="dashboard-panel service-overview-panel">
          <div className="dashboard-panel-header">
            <div>
              <span>PROFILE</span>
              <h2>Service Overview</h2>
            </div>

            <button
              type="button"
              onClick={() => navigate("/profile")}
            >
              View Profile
            </button>
          </div>

          <div className="service-overview-content">
            <div className="provider-avatar-large">
              {provider.name?.charAt(0).toUpperCase() || "P"}
            </div>

            <div className="provider-overview-name">
              <h3>{provider.name || "Provider"}</h3>
              <p>{provider.service || "Service provider"}</p>
            </div>
          </div>

          <div className="service-details-grid">
            <div>
              <span>SERVICE</span>
              <strong>{provider.service || "—"}</strong>
            </div>

            <div>
              <span>LOCATION</span>
              <strong>{provider.location || "—"}</strong>
            </div>

            <div>
              <span>EXPERIENCE</span>
              <strong>{provider.experience || "—"}</strong>
            </div>

            <div>
              <span>AVAILABILITY</span>
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
              <span>PERFORMANCE</span>
              <h2>Reliability</h2>
            </div>
          </div>

          <div className="reliability-score">
            <div className="reliability-number">
              <strong>{reliabilityScore}</strong>
              <span>/ 100</span>
            </div>

            <p>Reliability Score</p>
          </div>

          <div className="reliability-progress">
            <div
              className="reliability-progress-bar"
              style={{
                width: `${Math.min(100, Math.max(0, reliabilityScore))}%`,
              }}
            ></div>
          </div>

          <div className="performance-items">
            <div>
              <span>Completed Services</span>
              <strong>{provider.completedServices || 0}</strong>
            </div>

            <div>
              <span>Cancelled Services</span>
              <strong>{provider.cancelledServices || 0}</strong>
            </div>

            <div>
              <span>Complaints</span>
              <strong>{provider.complaints || 0}</strong>
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="dashboard-panel description-panel">
          <div className="dashboard-panel-header">
            <div>
              <span>ABOUT</span>
              <h2>Service Description</h2>
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
              <span>QUICK ACCESS</span>
              <h2>Manage</h2>
            </div>
          </div>

          <div className="quick-access-buttons">
            <button
              type="button"
              onClick={() => navigate("/provider/requests")}
            >
              <strong>Service Requests</strong>
              <span>View customer requests →</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/profile")}
            >
              <strong>My Profile</strong>
              <span>View and update profile →</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProviderDashboard;
