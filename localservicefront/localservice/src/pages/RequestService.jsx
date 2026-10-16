import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const API = "https://servitrust-baxkend.onrender.com";

const RequestService = () => {
const { providerId } = useParams();
const navigate = useNavigate();

const [provider, setProvider] = useState(null);
const [loading, setLoading] = useState(true);
const [submitting, setSubmitting] = useState(false);

const [selectedService, setSelectedService] = useState("");

const [formData, setFormData] = useState({
preferredDate: "",
preferredTime: "",
location: "",
description: "",
notes: ""
});

const getProvider = async () => {
try {
setLoading(true);

  const response = await axios.get(
    `${API}/providers/${providerId}`
  );

  const providerData = response.data;
  setProvider(providerData);

  // Handle services stored as strings or objects.
  const services = Array.isArray(providerData.services)
    ? providerData.services
    : [];

  if (services.length > 0) {
    const firstService = services[0];
    setSelectedService(
      typeof firstService === "string"
        ? firstService
        : firstService?.name || firstService?.serviceName || ""
    );
  } else if (typeof providerData.service === "string") {
    setSelectedService(providerData.service);
  }
} catch (error) {
  console.error("GET PROVIDER ERROR:", error);
  alert("Unable to load provider details.");
} finally {
  setLoading(false);
}

};

useEffect(() => {
getProvider();
}, [providerId]);

const handleChange = (e) => {
const { name, value } = e.target;

setFormData((previous) => ({
  ...previous,
  [name]: value
}));

};

const getServiceName = (service) => {
if (typeof service === "string") {
return service;
}

return service?.name || service?.serviceName || "";

};

const handleSubmit = async (e) => {
e.preventDefault();

if (submitting) return;

const customerId = localStorage.getItem("userId");

if (!customerId) {
  alert("Please login first.");
  navigate("/login");
  return;
}

if (!provider?._id) {
  alert("Provider details are unavailable. Please try again.");
  return;
}

if (!selectedService.trim()) {
  alert("Please select a service.");
  return;
}

// Validate the date without allowing an invalid date.
const selectedDate = new Date(
  `${formData.preferredDate}T00:00:00`
);

if (
  !formData.preferredDate ||
  Number.isNaN(selectedDate.getTime()) ||
  !/^\d{4}-\d{2}-\d{2}$/.test(formData.preferredDate)
) {
  alert("Please select a valid service date.");
  return;
}

const today = new Date();
today.setHours(0, 0, 0, 0);

if (selectedDate < today) {
  alert("Please select today or a future date.");
  return;
}

if (!formData.preferredTime) {
  alert("Please select a preferred time.");
  return;
}

if (
  !formData.location.trim() ||
  !formData.description.trim()
) {
  alert("Please fill in the service location and requirement.");
  return;
}

const data = {
  customerId,
  providerId: provider._id,
  providerName: provider.name,
  serviceName: selectedService,
  preferredDate: formData.preferredDate,
  preferredTime: formData.preferredTime,
  location: formData.location.trim(),
  description: formData.description.trim(),
  notes: formData.notes.trim()
};

try {
  setSubmitting(true);

  console.log("FINAL REQUEST DATA:", data);

  const response = await axios.post(
    `${API}/service-requests`,
    data
  );

  console.log("REQUEST SUCCESS:", response.data);

  alert(response.data.message || "Service request sent successfully.");

  navigate("/");
} catch (error) {
  console.error("REQUEST ERROR:", error);
  console.error("STATUS:", error.response?.status);
  console.error("BACKEND RESPONSE:", error.response?.data);

  const missingFields = error.response?.data?.missingFields;

  if (Array.isArray(missingFields) && missingFields.length > 0) {
    alert(
      `Please fill in the required fields: ${missingFields.join(", ")}`
    );
  } else {
    alert(
      error.response?.data?.message ||
      "Failed to send service request. Please try again."
    );
  }
} finally {
  setSubmitting(false);
}

};

if (loading) {
return <div className="request-loading">Loading...</div>;
}

if (!provider) {
return ( <div className="request-loading">
Provider details could not be loaded.
<button onClick={() => navigate(-1)}>Go Back</button> </div>
);
}

const services = Array.isArray(provider.services)
? provider.services
.map(getServiceName)
.filter(Boolean)
: [];

if (services.length === 0 && provider.service) {
services.push(provider.service);
}

return ( <div className="request-service-page">
<button
type="button"
className="request-back-btn"
onClick={() => navigate(-1)}
>
← Back </button>

  <div className="request-header">
    <p>SERVICE REQUEST</p>
    <h1>Request {selectedService || "a Service"}</h1>
    <span>
      Send a service request to {provider.name}.
    </span>
  </div>

  <form className="request-form" onSubmit={handleSubmit}>
    <div className="request-summary">
      <div className="request-avatar">
        {provider.name?.charAt(0).toUpperCase()}
      </div>

      <div>
        <h3>{provider.name}</h3>
        <p>
          {selectedService || "Select a service"} · {provider.location}
        </p>
      </div>

      <span className="request-verified">
        ✓ Verified
      </span>
    </div>

    <div className="request-fields">
      <div className="request-group">
        <label htmlFor="serviceName">Select Service</label>

        <select
          id="serviceName"
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          required
        >
          <option value="">Select a service</option>

          {services.map((service, index) => (
            <option key={`${service}-${index}`} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      <div className="request-row">
        <div className="request-group">
          <label htmlFor="preferredDate">Preferred Date</label>

          <input
            id="preferredDate"
            type="date"
            name="preferredDate"
            value={formData.preferredDate}
            min={new Date().toLocaleDateString("en-CA")}
            onChange={handleChange}
            required
          />
        </div>

        <div className="request-group">
          <label htmlFor="preferredTime">Preferred Time</label>

          <input
            id="preferredTime"
            type="time"
            name="preferredTime"
            value={formData.preferredTime}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="request-group">
        <label htmlFor="location">Service Location</label>

        <input
          id="location"
          type="text"
          name="location"
          placeholder="Enter where the service is needed"
          value={formData.location}
          onChange={handleChange}
          required
        />
      </div>

      <div className="request-group">
        <label htmlFor="description">Describe Your Requirement</label>

        <textarea
          id="description"
          name="description"
          placeholder="Describe the work you need..."
          value={formData.description}
          onChange={handleChange}
          rows="5"
          required
        />
      </div>

      <div className="request-group">
        <label htmlFor="notes">Additional Notes</label>

        <textarea
          id="notes"
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
        disabled={submitting}
      >
        {submitting ? "Sending..." : "Send Request →"}
      </button>
    </div>
  </form>
</div>

);
};

export default RequestService;
