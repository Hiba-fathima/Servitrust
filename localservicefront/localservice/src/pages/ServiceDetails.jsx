import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);

  const getService = async () => {
    try {
      const response = await axios.get(
        `https://servitrust-baxkend.onrender.com/services/${id}`
      );

      setService(response.data);
    } catch (error) {
      console.log("Error fetching service:", error);
    }
  };

  useEffect(() => {
    getService();
  }, [id]);

  if (!service) {
    return (
      <div className="service-loading">
        Loading service...
      </div>
    );
  }

  return (
    <div className="service-details-page">

      {/* Back Navigation */}
      <div className="service-details-header">

        <button
          className="service-back-btn"
          onClick={() => navigate("/")}
        >
          <span>←</span>
          Back to Services
        </button>

      </div>


      {/* Main Service Introduction */}
      <section className="service-intro">

        <div className="service-main-image">

          {service.image ? (
            <img
              src={service.image}
              alt={service.name}
            />
          ) : (
            <div className="service-no-image">
              No Image Available
            </div>
          )}

        </div>


        <div className="service-intro-content">

          <span className="service-category">
            {service.category}
          </span>

          <h1>{service.name}</h1>

          <p className="service-description">
            {service.description}
          </p>


          <div className="service-price">

            <span>Starting from</span>

            <strong>
              ₹{service.price}
            </strong>

            <small>
              {service.pricingType}
            </small>

          </div>


          <div className="service-quick-info">

            <div>
              <span>Duration</span>
              <strong>{service.duration}</strong>
            </div>

            <div>
              <span>Service Area</span>
              <strong>{service.serviceArea}</strong>
            </div>

            <div>
              <span>Availability</span>
              <strong>{service.availability}</strong>
            </div>

          </div>


         <button
  className="find-provider-btn"
  onClick={() => navigate(`/service/${service._id}/providers`)}
>
  Find Providers <span>→</span>
</button>

        </div>

      </section>


      {/* Service Information */}
      <section className="service-information">

        <div className="section-title">

          <span>OVERVIEW</span>

          <h2>Service Information</h2>

        </div>


        <div className="information-grid">

          <div className="information-item">

            <span>Pricing</span>

            <strong>
              {service.pricingType}
            </strong>

          </div>


          <div className="information-item">

            <span>Estimated Duration</span>

            <strong>
              {service.duration}
            </strong>

          </div>


          <div className="information-item">

            <span>Service Area</span>

            <strong>
              {service.serviceArea}
            </strong>

          </div>


          <div className="information-item">

            <span>Availability</span>

            <strong>
              {service.availability}
            </strong>

          </div>


          <div className="information-item">

            <span>Emergency Service</span>

            <strong>
              {service.emergencyService}
            </strong>

          </div>


          <div className="information-item">

            <span>Service Guarantee</span>

            <strong>
              {service.serviceGuarantee}
            </strong>

          </div>


          <div className="information-item">

            <span>Service Status</span>

            <strong>
              {service.status}
            </strong>

          </div>

        </div>

      </section>


      {/* Sub Services */}
      <section className="available-services">

        <div className="section-title">

          <span>WHAT'S INCLUDED</span>

          <h2>Available Services</h2>

        </div>


        {service.subServices &&
        service.subServices.length > 0 ? (

          <div className="subservices-list">

            {service.subServices.map(
              (item, index) => (
                <div
                  className="subservice-item"
                  key={index}
                >
                  <span className="check-icon">
                    ✓
                  </span>

                  {item}
                </div>
              )
            )}

          </div>

        ) : (

          <p className="no-subservices">
            No additional services available.
          </p>

        )}

      </section>


      {/* Bottom CTA */}
      <section className="service-cta">

        <div>

          <span>
            READY TO GET STARTED?
          </span>

          <h2>
            Find a reliable provider for this service.
          </h2>

        </div>

      <button
  className="find-provider-btn"
  onClick={() => navigate(`/service/${service._id}/providers`)}
>
  Find Providers <span>→</span>
</button>

      </section>

    </div>
  );
};

export default ServiceDetails;