import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../Css/Complaints.css";

const API = "https://servitrust-baxkend.onrender.com/complaints";

const CATEGORIES = [
"Service Quality",
"Provider Behaviour",
"Incomplete Service",
"Payment Issue",
"Booking Issue",
"Other",
];

function RaiseComplaint() {
const navigate = useNavigate();

const [form, setForm] = useState({
provider: "",
bookingId: "",
category: "",
subject: "",
description: "",
});

const [submitting, setSubmitting] = useState(false);

const handleChange = (event) => {
setForm({
...form,
[event.target.name]: event.target.value,
});
};

const handleSubmit = async (event) => {
event.preventDefault();

const userId = localStorage.getItem("userId");

if (!userId) {
  Swal.fire(
    "Login Required",
    "Please log in before submitting a complaint.",
    "warning"
  );
  return;
}

if (!form.category || !form.subject.trim() || !form.description.trim()) {
  Swal.fire(
    "Missing Information",
    "Please complete all required fields.",
    "warning"
  );
  return;
}

try {
  setSubmitting(true);

  const payload = {
    customer: userId,
    category: form.category,
    subject: form.subject.trim(),
    description: form.description.trim(),
  };

  if (form.provider.trim()) {
    payload.provider = form.provider.trim();
  }

  if (form.bookingId.trim()) {
    payload.bookingId = form.bookingId.trim();
  }

  await axios.post(API, payload);

  await Swal.fire(
    "Complaint Submitted",
    "Your complaint has been submitted successfully.",
    "success"
  );

  navigate("/my-complaints");
} catch (error) {
  Swal.fire(
    "Submission Failed",
    error.response?.data?.message ||
      "Unable to submit your complaint. Please try again.",
    "error"
  );
} finally {
  setSubmitting(false);
}

};

return ( <main className="customer-complaint-page"> <div className="customer-complaint-container"> <p className="cc-eyebrow">CUSTOMER SUPPORT</p>

    <h1>Raise a Complaint</h1>

    <p className="cc-intro">
      Tell us about the issue you experienced. Our support team
      will review your complaint.
    </p>

    <form className="cc-form" onSubmit={handleSubmit}>
      <label htmlFor="cc-category">Complaint Category *</label>

      <select
        id="cc-category"
        name="category"
        value={form.category}
        onChange={handleChange}
        required
      >
        <option value="">Select a category</option>
        {CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <label htmlFor="cc-subject">Subject *</label>

      <input
        id="cc-subject"
        name="subject"
        value={form.subject}
        onChange={handleChange}
        placeholder="Briefly describe the issue"
        maxLength={150}
        required
      />

      <label htmlFor="cc-booking">Booking ID (optional)</label>

      <input
        id="cc-booking"
        name="bookingId"
        value={form.bookingId}
        onChange={handleChange}
        placeholder="Enter your booking MongoDB ID"
      />

      <label htmlFor="cc-provider">Provider ID (optional)</label>

      <input
        id="cc-provider"
        name="provider"
        value={form.provider}
        onChange={handleChange}
        placeholder="Enter the provider MongoDB ID"
      />

      <label htmlFor="cc-description">Description *</label>

      <textarea
        id="cc-description"
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Explain what happened..."
        rows="6"
        maxLength={5000}
        required
      />

      <p className="cc-help">
        Please do not include passwords or sensitive payment information.
      </p>

      <button type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Complaint"}
      </button>
    </form>
  </div>
</main>

);
}

export default RaiseComplaint;
