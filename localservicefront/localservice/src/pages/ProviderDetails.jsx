import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const ProviderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);

  const role = localStorage.getItem("role");
  const getProvider = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/providers/${id}`
      );

      setProvider(response.data);
    } catch (error) {
      console.log("GET PROVIDER ERROR:", error);
    }
  };

  useEffect(() => {
    getProvider();
  }, [id]);

  if (!provider) {
    return (
      <div className="provider-details-loading">
        Loading provider...
      </div>
    );
  }

  return (
    <div className="provider-details-page">

      {/* Back */}

      <button
        className="provider-back-btn"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {/* Header */}

      <section className="provider-profile-header">

        <div className="provider-profile-avatar">
          {provider.name?.charAt(0).toUpperCase()}
        </div>

        <div className="provider-profile-main">

          <div className="provider-title-row">

            <div>
              <p>VERIFIED PROVIDER</p>

              <h1>{provider.name}</h1>

              <span>{provider.service}</span>
            </div>

            <div className="provider-verified-badge">
              ✓ Verified
            </div>

          </div>

          <p className="provider-description">
            {provider.description}
          </p>

        </div>

      </section>


      {/* Main information */}

      <section className="provider-information">

        <div className="provider-info-heading">
          <span>PROFILE</span>
          <h2>Provider Information</h2>
        </div>

        <div className="provider-information-grid">

          <div className="provider-information-item">
            <span>Service</span>
            <strong>{provider.service}</strong>
          </div>

          <div className="provider-information-item">
            <span>Location</span>
            <strong>{provider.location}</strong>
          </div>

          <div className="provider-information-item">
            <span>Experience</span>
            <strong>{provider.experience}</strong>
          </div>

          <div className="provider-information-item">
            <span>Availability</span>
            <strong>{provider.availability}</strong>
          </div>

          <div className="provider-information-item">
            <span>Reliability Score</span>
            <strong>
              {provider.reliabilityScore || 0}%
            </strong>
          </div>

          <div className="provider-information-item">
            <span>Average Rating</span>
            <strong>
              {provider.averageRating || 0} / 5
            </strong>
          </div>

        </div>

      </section>


      {/* Performance */}

      <section className="provider-performance">

        <div className="provider-info-heading">
          <span>PERFORMANCE</span>
          <h2>Service Record</h2>
        </div>

        <div className="provider-performance-grid">

          <div>
            <strong>
              {provider.completedServices || 0}
            </strong>
            <span>Completed Services</span>
          </div>

          <div>
            <strong>
              {provider.cancelledServices || 0}
            </strong>
            <span>Cancelled Services</span>
          </div>

          <div>
            <strong>
              {provider.complaints || 0}
            </strong>
            <span>Complaints</span>
          </div>

        </div>

      </section>


      {/* CTA */}

      {role !== "provider" && (
  <section className="provider-profile-cta">

    <div>
      <span>NEED THIS SERVICE?</span>

      <h2>
        Request this provider for your service.
      </h2>
    </div>

    <button
      className="request-service-btn"
      onClick={() =>
        navigate(`/service-request/${provider._id}`)
      }
    >
      Request Service →
    </button>

  </section>
)}
    </div>
  );
};

export default ProviderDetails;