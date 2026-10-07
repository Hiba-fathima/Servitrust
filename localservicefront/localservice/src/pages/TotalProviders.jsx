import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const TotalProviders = () => {

  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const getProviders = async () => {

    try {

      const response = await axios.get(
        "https://servitrust-baxkend.onrender.com/providers"
      );

      // Only show verified providers
      const verifiedProviders = response.data.filter(
        (provider) =>
          provider.verificationStatus === "Verified"
      );

      setProviders(verifiedProviders);

    } catch (error) {

      console.log(
        "GET PROVIDERS ERROR:",
        error
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    getProviders();

  }, []);


  if (loading) {

    return (
      <div className="providers-loading">
        Loading providers...
      </div>
    );

  }


  return (

    <div className="public-providers-page">

      {/* HEADER */}

      <section className="providers-page-header">

        <p>TRUSTED PROFESSIONALS</p>

        <h1>
          Find Reliable Service Providers
        </h1>

        <span>
          Connect with verified professionals
          for your local service needs.
        </span>

      </section>


      {/* PROVIDERS */}

      {providers.length === 0 ? (

        <div className="no-public-providers">

          <h3>
            No verified providers available
          </h3>

          <p>
            Verified service providers will appear here.
          </p>

        </div>

      ) : (

        <div className="public-providers-grid">

          {providers.map((provider) => (

            <div
              className="public-provider-card"
              key={provider._id}
            >

              {/* AVATAR */}

              <div className="public-provider-avatar">

                {provider.name
                  ?.charAt(0)
                  .toUpperCase()}

              </div>


              {/* NAME */}

              <h2>
                {provider.name}
              </h2>


              {/* SERVICE */}

              <p className="public-provider-service">
                {provider.service}
              </p>


              {/* LOCATION */}

              <p className="public-provider-location">
                📍 {provider.location}
              </p>


              {/* VERIFIED */}

              <div className="public-provider-verified">
                ✓ Verified Provider
              </div>


              {/* DETAILS */}

              <div className="public-provider-details">

                <div>

                  <span>
                    Experience
                  </span>

                  <strong>
                    {provider.experience}
                  </strong>

                </div>


                <div>

                  <span>
                    Reliability
                  </span>

                  <strong>
                    {provider.reliabilityScore || 0}%
                  </strong>

                </div>

              </div>


              {/* VIEW PROFILE */}

              <button
                className="view-provider-btn"
                onClick={() =>
                  navigate(
                    `/provider/${provider._id}`
                  )
                }
              >
                View Profile →
              </button>

            </div>

          ))}

        </div>

      )}

    </div>

  );

};

export default TotalProviders;