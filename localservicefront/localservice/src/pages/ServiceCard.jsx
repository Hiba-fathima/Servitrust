import React from "react";
import { useNavigate } from "react-router-dom";

const ServiceCard = ({ image, title, description, id }) => {
  const navigate = useNavigate();

  return (
    <div className="service-card">

      <div className="service-image">
        {image ? (
          <img src={image} alt={title} />
        ) : (
          <div className="no-image">No Image</div>
        )}
      </div>

      <h3>{title}</h3>

      <p>{description}</p>

      <button
        className="view-details-btn"
        onClick={() => navigate(`/service/${id}`)}
      >
        View Details <span>→</span>
      </button>

    </div>
  );
};

export default ServiceCard;