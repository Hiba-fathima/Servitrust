import React, { useEffect, useState } from "react";
import axios from "axios";

const ProviderServices = () => {

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");


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

      } finally {

        setLoading(false);

      }

    };

    getProvider();

  }, [userId]);


  if (loading) {

    return (
      <div className="provider-services-loading">
        Loading services...
      </div>
    );

  }


  if (!provider) {

    return (
      <div className="provider-services-empty">
        <h3>
          Provider profile not found
        </h3>
      </div>
    );

  }


  // Supports both old and new provider records
  const myServices =
    provider.services?.length > 0
      ? provider.services
      : provider.service
      ? [provider.service]
      : [];


  return (

    <div className="provider-services-page">

      {/* HEADER */}

      <div className="provider-services-header">

        <div>

          <p>PROVIDER PROFILE</p>

          <h1>
            My Services
          </h1>

          <span>
            Services you provide through ServiTrust.
          </span>

        </div>


        <div className="provider-services-count">

          <strong>
            {myServices.length}
          </strong>

          <span>
            {myServices.length === 1
              ? "Service"
              : "Services"}
          </span>

        </div>

      </div>


      {/* SERVICES */}

      {myServices.length === 0 ? (

        <div className="no-provider-services">

          <h3>
            No services assigned
          </h3>

          <p>
            Your services will appear here.
          </p>

        </div>

      ) : (

        <div className="provider-services-grid">

          {myServices.map(
            (serviceName, index) => (

              <div
                className="provider-service-card"
                key={index}
              >

                <div className="provider-service-number">
                  {String(index + 1).padStart(2, "0")}
                </div>


                <div className="provider-service-content">

                  <span>
                    SERVICE
                  </span>

                  <h2>
                    {serviceName}
                  </h2>

                  <p>
                    Professional service provided
                    by your ServiTrust profile.
                  </p>

                </div>


                <div className="provider-service-status">
                  Active
                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>

  );
};

export default ProviderServices;