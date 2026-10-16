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

// Get provider details
useEffect(() => {
const getProvider = async () => {
try {
setLoading(true);

    const response = await axios.get(
      `${API}/providers/${providerId}`
    );

    const providerData = response.data;
    console.log("PROVIDER DATA:", providerData);

    setProvider(providerData);

    // Select the first available service
    const providerServices = Array.isArray(providerData.services)
      ? providerData.services
      : [];

    const firstService = providerServices[0];

    if (typeof firstService === "string") {
      setSelectedService(firstService);
    } else if (firstService && typeof firstService === "object") {
      setSelectedService(
        firstService.name ||
        firstService.serviceName ||
        firstService.title ||
        ""
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

if (providerId) {
  getProvider();
}

}, [providerId]);

// Get provider name from available fields
const getProviderName = (providerData) => {
if (!providerData) return "";

const possibleNames = [
  providerData.name,
  providerData.providerName,
  providerData.businessName,
  providerData.fullName,
  providerData.username,
  providerData.user?.name,
  providerData.user?.fullName,
  providerData.user?.username
];

const name = possibleNames.find(
  (value) => typeof value === "string" && value.trim()
);

return name ? name.trim() : "";

};

// Convert a service item into a service name
const getServiceName = (service) => {
if (typeof service === "string") {
return service.trim();
}

if (service && typeof service === "object") {
  const name =
    service.name ||
    service.serviceName ||
    service.title ||
    service.label;

  return typeof name === "string" ? name.trim() : "";
}

return "";

};

const handleChange = (e) => {
const { name, value } = e.target;

setFormData((previous) => ({
  ...previous,
  [name]: value
}));

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
  alert("Provider details are unavailable.");
  return;
}

const providerName = getProviderName(provider);

if (!providerName) {
  console.error("Provider name fields:", provider);
  alert(
    "The provider name is missing from the provider data. Please check the provider profile."
  );
  return;
}

if (!selectedService.trim()) {
  alert("Please select a service.");
  return;
}

if (!formData.preferredDate || !formData.preferredTime) {
  alert("Please select a date and time.");
  return;
}

// Validate date format and prevent past dates
if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.preferredDate)) {
  alert("Please select a valid date.");
  return;
}

const [year, month, day] = formData.preferredDate
  .split("-")
  .map(Number);

const selectedDate = new Date(year, month - 1, day);
const validDate =
  selectedDate.getFullYear() === year &&
  selectedDate.getMonth() === month - 1 &&
  selectedDate.getDate() === day;

if (!validDate) {
  alert("Please select a valid date.");
  return;
}

const today = new Date();
today.setHours(0, 0, 0, 0);

if (selectedDate < today) {
  alert("Please select today or a future date.");
  return;
}

if (!formData.location.trim() || !formData.description.trim()) {
  alert("Please enter the service location and describe your requirement.");
  return;
}

const data = {
  customerId,
  providerId: provider._id,
  providerName,
  serviceName: selectedService.trim(),
  preferredDate: formData.preferredDate,
  preferredTime: formData.preferredTime,
  location: formData.location.trim(),
  description: formData.description.trim(),
  notes: formData.notes.trim()
};

console.log("FINAL REQUEST DATA:", data);

try {
  setSubmitting(true);

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

  if (Array.isArray(missingFields) && missingFields.length) {
    alert(
      `Missing required fields: ${missingFields.join(", ")}`
    );
  } else {
    alert(
      error.response?.data?.message ||
      "Failed to send service request."
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
<button type="button" onClick={() => navigate(-1)}>
Go Back </button> </div>
);
}

const providerName = getProviderName(provider);

const services = Array.isArray(provider.services)
? provider.services.map(getServiceName).filter(Boolean)
: [];

if (services.length === 0 && typeof provider.service === "string") {
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
      Send a service request to {providerName || "this provider"}.
    </span>
  </div>

  <form className="request-form" onSubmit={handleSubmit}>
    <div className="request-summary">
      <div className="request-avatar">
        {providerName.charAt(0).toUpperCase()}
      </div>

      <div>
        <h3>{providerName || "Provider"}</h3>
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
        <label htmlFor="selectedService">Select Service</label>

        <select
          id="selectedService"
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
            min={(() => {
              const now = new Date();
              const year = now.getFullYear();
              const month = String(now.getMonth() + 1).padStart(2, "0");
              const day = String(now.getDate()).padStart(2, "0");
              return `${year}-${month}-${day}`;
            })()}
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
