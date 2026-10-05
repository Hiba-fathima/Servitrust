import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ServiceProviders = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [providers, setProviders] = useState([]);

  const getData = async () => {
    try {
      // Get service
      const serviceResponse = await axios.get(
        `http://localhost:5000/services/${id}`
      );

      setService(serviceResponse.data);

      // Get verified providers for this service
      const providerResponse = await axios.get(
        `http://localhost:5000/providers/service/${encodeURIComponent(
          serviceResponse.data.name
        )}`
      );

      setProviders(providerResponse.data);

    } catch (error) {
      console.log("GET SERVICE PROVIDERS ERROR:", error);
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
    <div className="service-providers-page">

      <div className="providers-page-header">

        <button
          className="providers-back-btn"
          onClick={() => navigate(`/service/${id}`)}
        >
          ← Back to Service
        </button>

        <p>VERIFIED PROVIDERS</p>

        <h1>{service.name}</h1>

        <span>
          Find trusted and verified professionals for this service.
        </span>

      </div>


      <div className="providers-page-list">

        {providers.length > 0 ? (

          providers.map((provider) => (

            <div
              className="service-provider-card"
              key={provider._id}
            >

              <div className="provider-main">

                <div className="provider-avatar">
                  {provider.name?.charAt(0).toUpperCase()}
                </div>

                <div className="provider-details">

                  <h2>{provider.name}</h2>

                  <p>{provider.service}</p>

                </div>

                <span className="verified-badge">
                  ✓ Verified
                </span>

              </div>


              <div className="provider-info">

                <div>
                  <span>Location</span>
                  <strong>{provider.location}</strong>
                </div>

                <div>
                  <span>Experience</span>
                  <strong>{provider.experience}</strong>
                </div>

                <div>
                  <span>Availability</span>
                  <strong>{provider.availability}</strong>
                </div>

                <div>
                  <span>Reliability Score</span>
                  <strong>
                    {provider.reliabilityScore || 0}%
                  </strong>
                </div>

              </div>


              <div className="provider-actions">

                <button
                  className="view-provider-btn"
                  onClick={() =>
                    navigate(`/provider/${provider._id}`)
                  }
                >
                  View Profile →
                </button>

              </div>

            </div>

          ))

        ) : (

          <div className="no-provider-result">
            <h3>No verified providers found</h3>

            <p>
              There are currently no verified providers available
              for {service.name}.
            </p>
          </div>

        )}

      </div>

    </div>
  );
};

export default ServiceProviders;