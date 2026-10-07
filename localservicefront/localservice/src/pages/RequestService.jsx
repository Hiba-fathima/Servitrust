import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const RequestService = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);

  const [formData, setFormData] = useState({
    preferredDate: "",
    preferredTime: "",
    location: "",
    description: "",
    notes: ""
  });

  const getProvider = async () => {
    try {
      const response = await axios.get(
        `https://servitrust-baxkend.onrender.com/providers/${providerId}`
      );

      setProvider(response.data);
    } catch (error) {
      console.log("GET PROVIDER ERROR:", error);
    }
  };

  useEffect(() => {
    getProvider();
  }, [providerId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const customerId = localStorage.getItem("userId");

    console.log("CUSTOMER ID:", customerId);
    console.log("PROVIDER ID:", provider?._id);
    console.log("PROVIDER NAME:", provider?.name);
    console.log("SERVICE NAME:", provider?.service);
    console.log("FORM DATA:", formData);

    if (!customerId) {
      alert("Please login first");
      navigate("/login");
      return;
    }
console.log("FULL PROVIDER:", provider);

    const data = {
      customerId: customerId,
      providerId: provider?._id,
providerName: provider.name,
      serviceName: provider?.service,
      preferredDate: formData.preferredDate,
      preferredTime: formData.preferredTime,
      location: formData.location,
      description: formData.description,
      notes: formData.notes
    };

    console.log("FINAL REQUEST DATA:", data);

    const response = await axios.post(
      "https://servitrust-baxkend.onrender.com/service-requests",
      data
    );

    console.log("REQUEST SUCCESS:", response.data);

    alert(response.data.message);

    navigate("/");

  } catch (error) {
    console.log("REQUEST ERROR:", error);
    console.log("STATUS:", error.response?.status);
    console.log("BACKEND RESPONSE:", error.response?.data);

    alert(
      error.response?.data?.message ||
      "Failed to send service request"
    );
  }
};

  if (!provider) {
    return (
      <div className="request-loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="request-service-page">

      <button
        className="request-back-btn"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <div className="request-header">
        <p>SERVICE REQUEST</p>

        <h1>Request {provider.service}</h1>

        <span>
          Send a service request to {provider.name}.
        </span>
      </div>

      <form
        className="request-form"
        onSubmit={handleSubmit}
      >

        <div className="request-summary">

          <div className="request-avatar">
            {provider.name?.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3>{provider.name}</h3>
            <p>
              {provider.service} · {provider.location}
            </p>
          </div>

          <span className="request-verified">
            ✓ Verified
          </span>

        </div>

        <div className="request-fields">

          <div className="request-row">

            <div className="request-group">
              <label>Preferred Date</label>

              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="request-group">
              <label>Preferred Time</label>

              <input
                type="time"
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleChange}
                required
              />
            </div>

          </div>

          <div className="request-group">
            <label>Service Location</label>

            <input
              type="text"
              name="location"
              placeholder="Enter where the service is needed"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="request-group">
            <label>Describe Your Requirement</label>

            <textarea
              name="description"
              placeholder="Describe the work you need..."
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
            />
          </div>

          <div className="request-group">
            <label>Additional Notes</label>

            <textarea
              name="notes"
              placeholder="Optional"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
            />
          </div>

        </div>

        <div className="request-footer">

          <p>
            Your request will be sent to the provider for confirmation.
          </p>

          <button
            type="submit"
            className="send-request-btn"
          >
            Send Request →
          </button>

        </div>

      </form>

    </div>
  );
};

export default RequestService;