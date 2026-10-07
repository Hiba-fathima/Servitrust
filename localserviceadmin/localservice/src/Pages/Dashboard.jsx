import React, { useEffect, useState } from "react";
import axios from "axios";

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [reviews, setReviews] = useState([]);

  const getDashboardData = async () => {
    try {
      const results = await Promise.allSettled([
        axios.get("https://servitrust-baxkend.onrender.com/users"),
        axios.get("https://servitrust-baxkend.onrender.com/providers"),
        axios.get("https://servitrust-baxkend.onrender.com/services"),
        axios.get("https://servitrust-baxkend.onrender.com/service-requests"),
        axios.get("https://servitrust-baxkend.onrender.com/complaints"),
        axios.get("https://servitrust-baxkend.onrender.com/reviews"),
      ]);

      if (results[0].status === "fulfilled") {
        setUsers(results[0].value.data);
      }

      if (results[1].status === "fulfilled") {
        setProviders(results[1].value.data);
      }

      if (results[2].status === "fulfilled") {
        setServices(results[2].value.data);
      }

      if (results[3].status === "fulfilled") {
        setRequests(results[3].value.data);
      }

      if (results[4].status === "fulfilled") {
        setComplaints(results[4].value.data);
      }

      if (results[5].status === "fulfilled") {
        setReviews(results[5].value.data);
      }
    } catch (error) {
      console.log("DASHBOARD ERROR:", error);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  const activeServices = services.filter(
    (service) => service.status === "Active"
  );

  const availableProviders = providers.filter(
    (provider) => provider.availability === "Available"
  );

  const pendingProviders = providers.filter(
    (provider) =>
      provider.verificationStatus === "Pending" ||
      provider.verificationStatus === "pending"
  );

  return (
    <div className="dashboard-page">

      {/* Header */}

      <div className="dashboard-header">
        <div>
          <p className="dashboard-label">ADMIN DASHBOARD</p>

          <h1>Dashboard</h1>

          <p className="dashboard-description">
            Monitor your ServiTrust platform from one place.
          </p>
        </div>

        <div className="dashboard-date">
          {new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>


      {/* Statistics */}

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


      {/* Second row */}

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


      {/* Main dashboard content */}

      <div className="dashboard-content">

        {/* Recent Users */}

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
                      {user.name?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <strong>{user.name}</strong>
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
            <p className="empty-dashboard">
              No users available.
            </p>
          )}

        </div>


        {/* Service Overview */}

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
                      <img
                        src={service.image}
                        alt={service.name}
                      />
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
                    {service.status}
                  </span>

                </div>

              ))}

            </div>

          ) : (
            <p className="empty-dashboard">
              No services available.
            </p>
          )}

        </div>

      </div>


      {/* Platform Summary */}

      <div className="dashboard-summary">

        <div>
          <p>PLATFORM SUMMARY</p>

          <h2>
            ServiTrust is currently managing{" "}
            <strong>{services.length}</strong> services
            for <strong>{users.length}</strong> registered users.
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