import React, { useEffect, useState } from "react";
import axios from "axios";
import NotificationBell from "./NotificationBell";
import "../Css/Dashboard.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://servitrust-baxkend.onrender.com";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const getDashboardData = async () => {
      const endpoints = [
        { path: "/users", setter: setUsers },
        { path: "/providers", setter: setProviders },
        { path: "/services", setter: setServices },
        { path: "/service-requests", setter: setRequests },
        { path: "/complaints", setter: setComplaints },
        { path: "/reviews", setter: setReviews },
      ];

      const results = await Promise.allSettled(
        endpoints.map(({ path }) => axios.get(`${API_URL}${path}`))
      );

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          const data = result.value.data;
          endpoints[index].setter(Array.isArray(data) ? data : []);
        } else {
          console.error(
            `Dashboard request failed: ${endpoints[index].path}`,
            result.reason
          );
        }
      });
    };

    getDashboardData();
  }, []);

  const activeServices = services.filter(
    (service) => service.status === "Active"
  );

  const availableProviders = providers.filter(
    (provider) => provider.availability === "Available"
  );

  return (
    <div className="dashboard-page">
      {/* Dashboard header and notification bell */}
      <div className="admin-topbar">
        <div>
          <p className="dashboard-label">ADMIN DASHBOARD</p>
          <h1>Dashboard</h1>
          <p className="dashboard-description">
            Monitor your ServiTrust platform from one place.
          </p>
        </div>

        <div className="admin-topbar-actions">
          <NotificationBell />
        </div>
      </div>

      <div className="dashboard-header">
        <div>

        </div>

        <div className="dashboard-date">
          {new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Main statistics */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-top">
            <span>Total Users</span>
            <div className="stat-icon">U</div>
          </div>
          <h2>{users.length}</h2>
          <p>Registered customers</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Total Providers</span>
            <div className="stat-icon">P</div>
          </div>
          <h2>{providers.length}</h2>
          <p>Service providers</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Total Services</span>
            <div className="stat-icon">S</div>
          </div>
          <h2>{services.length}</h2>
          <p>Services listed</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Service Requests</span>
            <div className="stat-icon">R</div>
          </div>
          <h2>{requests.length}</h2>
          <p>Total requests</p>
        </div>
      </div>

      {/* Secondary statistics */}
      <div className="dashboard-secondary">
        <div className="secondary-card">
          <span>Active Services</span>
          <strong>{activeServices.length}</strong>
        </div>

        <div className="secondary-card">
          <span>Available Providers</span>
          <strong>{availableProviders.length}</strong>
        </div>

        <div className="secondary-card">
          <span>Complaints</span>
          <strong>{complaints.length}</strong>
        </div>

        <div className="secondary-card">
          <span>Reviews</span>
          <strong>{reviews.length}</strong>
        </div>
      </div>

      {/* Recent users and services */}
      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-heading-dashboard">
            <div>
              <p>RECENT</p>
              <h2>Users</h2>
            </div>
          </div>

          {users.length > 0 ? (
            <div className="dashboard-user-list">
              {users.slice(-5).reverse().map((user) => (
                <div className="dashboard-user" key={user._id}>
                  <div className="dashboard-user-left">
                    <div className="dashboard-avatar">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <div>
                      <strong>{user.name || "Unnamed User"}</strong>
                      <span>{user.email}</span>
                    </div>
                  </div>

                  <span className="dashboard-role">
                    {user.role || "Customer"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-dashboard">No users available.</p>
          )}
        </div>

        <div className="dashboard-section">
          <div className="section-heading-dashboard">
            <div>
              <p>OVERVIEW</p>
              <h2>Services</h2>
            </div>
          </div>

          {services.length > 0 ? (
            <div className="service-overview">
              {services.slice(0, 5).map((service) => (
                <div className="service-overview-item" key={service._id}>
                  <div className="service-overview-image">
                    {service.image ? (
                      <img src={service.image} alt={service.name} />
                    ) : (
                      <span>No Image</span>
                    )}
                  </div>

                  <div className="service-overview-info">
                    <strong>{service.name}</strong>
                    <span>{service.category}</span>
                  </div>

                  <span
                    className={
                      service.status === "Active"
                        ? "service-status active"
                        : "service-status"
                    }
                  >
                    {service.status || "Unknown"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-dashboard">No services available.</p>
          )}
        </div>
      </div>

      {/* Platform summary */}
      <div className="dashboard-summary">
        <div>
          <p>PLATFORM SUMMARY</p>
          <h2>
            ServiTrust is currently managing{" "}
            <strong>{services.length}</strong> services for{" "}
            <strong>{users.length}</strong> registered users.
          </h2>
        </div>

        <div className="summary-number">
          <strong>{providers.length}</strong>
          <span>Providers</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
