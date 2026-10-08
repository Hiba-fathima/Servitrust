import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../Css/ServiceProvider.css"

const ServiceProviders = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [providers, setProviders] = useState([]);

  const getData = async () => {
    try {
      // Get service
      const serviceResponse = await axios.get(
        `https://servitrust-baxkend.onrender.com/services/${id}`
      );

      setService(serviceResponse.data);

      // Get verified providers for this service
      const providerResponse = await axios.get(
        `https://servitrust-baxkend.onrender.com/providers/service/${encodeURIComponent(
          serviceResponse.data.name
        )}`
      );

      setProviders(providerResponse.data);

    } catch (error) {
      console.log(
        "GET SERVICE PROVIDERS ERROR:",
        error
      );
    }
  };

  useEffect(() => {
    getData();
  }, [id]);

  if (!service) {
    return (
      <div className="providers-loading">
        Loading providers...
      </div>
    );
  }

  return (
    <div className="providers-page">

      {/* PAGE HEADER */}

      <div className="providers-header">

        <button
          className="back-button"
          onClick={() =>
            navigate(`/service/${id}`)
          }
        >
          ← Back to Service
        </button>

        <span className="page-label">
          VERIFIED PROFESSIONALS
        </span>

        <h1>
          Find the right provider
        </h1>

        <p>
          Trusted professionals available for{" "}
          <strong>{service.name}</strong>
        </p>

      </div>


      {/* PROVIDERS */}

      <div className="provider-list">

        {providers.length > 0 ? (

          providers.map((provider) => (

            <div
              className="provider-card"
              key={provider._id}
            >

              {/* PROVIDER NAME FIRST */}

              <div className="provider-header">

                <div className="provider-avatar">
                  {provider.name
                    ?.charAt(0)
                    .toUpperCase() || "P"}
                </div>

                <div className="provider-heading">

                  <div className="provider-name-row">

                    <h2>
                      {provider.name ||
                        "Service Provider"}
                    </h2>

                    <span className="verified-badge">
                      ✓ Verified
                    </span>

                  </div>

                  <p>
                    {Array.isArray(
                      provider.services
                    )
                      ? provider.services.join(
                          " • "
                        )
                      : provider.services ||
                        service.name}
                  </p>

                </div>

              </div>


              {/* PROVIDER INFORMATION */}

              <div className="provider-information">

                <div className="info-item">

                  <span>
                    Location
                  </span>

                  <strong>
                    {provider.location ||
                      "Not specified"}
                  </strong>

                </div>


                <div className="info-item">

                  <span>
                    Experience
                  </span>

                  <strong>
                    {provider.experience ||
                      "Not specified"}
                  </strong>

                </div>


                <div className="info-item">

                  <span>
                    Availability
                  </span>

                  <strong
                    className={
                      provider.availability ===
                      "Available"
                        ? "available"
                        : ""
                    }
                  >
                    {provider.availability ||
                      "Not specified"}
                  </strong>

                </div>


                <div className="info-item">

                  <span>
                    Reliability Score
                  </span>

                  <strong>
                    {provider.reliabilityScore ||
                      0}%
                  </strong>

                </div>

              </div>


              {/* BOTTOM */}

              <div className="provider-footer">

                <div className="reliability">

                  <div className="reliability-top">

                    <span>
                      Reliability
                    </span>

                    <strong>
                      {provider.reliabilityScore ||
                        0}%
                    </strong>

                  </div>

                  <div className="reliability-bar">

                    <div
                      className="reliability-fill"
                      style={{
                        width: `${Math.min(
                          provider.reliabilityScore ||
                            0,
                          100
                        )}%`
                      }}
                    />

                  </div>

                </div>


                <button
                  className="profile-button"
                  onClick={() =>
                    navigate(
                      `/provider/${provider._id}`
                    )
                  }
                >
                  View Provider Profile
                  <span>→</span>
                </button>

              </div>

            </div>

          ))

        ) : (

          <div className="no-providers">

            <div className="no-provider-symbol">
              —
            </div>

            <h2>
              No verified providers found
            </h2>

            <p>
              There are currently no verified
              professionals available for{" "}
              <strong>{service.name}</strong>.
            </p>

            <button
              onClick={() =>
                navigate(`/service/${id}`)
              }
            >
              ← Back to Service
            </button>

          </div>

        )}

      </div>

    </div>
  );
};

export default ServiceProviders;
