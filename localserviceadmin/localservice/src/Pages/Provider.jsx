import React, { useEffect, useState } from "react";
import axios from "axios";

const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [service, setService] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [description, setDescription] = useState("");
  const [availability, setAvailability] = useState("Available");

  const getProviders = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/providers"
      );

      setProviders(response.data);
    } catch (error) {
      console.log("GET PROVIDERS ERROR:", error);
    }
  };

  // NEW: GET SERVICES FROM ADMIN SERVICES
  const getServices = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/services"
      );

      setServices(response.data);
    } catch (error) {
      console.log("GET SERVICES ERROR:", error);
    }
  };

  useEffect(() => {
    getProviders();
    getServices(); // NEW
  }, []);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setService("");
    setLocation("");
    setExperience("");
    setDescription("");
    setAvailability("Available");
  };

  const handleAddProvider = async (e) => {
    e.preventDefault();

    try {
      const data = {
        name,
        email,
        phone,
        password,
        service,
        location,
        experience,
        description,
        availability
      };

      const response = await axios.post(
        "http://localhost:5000/admin/providers",
        data
      );

      alert(
        `Provider created successfully!\n\nEmail: ${email}\nPassword: ${password}`
      );

      getProviders();

      resetForm();
      setShowForm(false);

    } catch (error) {
      console.log("ADD PROVIDER ERROR:", error);

      alert(
        error.response?.data?.message ||
        "Failed to create provider"
      );
    }
  };

  return (
    <div className="providers-page">

      {/* HEADER */}

      <div className="providers-header">

        <div>
          <p>PROVIDER MANAGEMENT</p>

          <h1>Providers</h1>

          <span>
            Manage registered service providers on ServiTrust.
          </span>
        </div>

        <div className="providers-header-right">

          <div className="providers-count">
            <strong>{providers.length}</strong>
            <span>Total Providers</span>
          </div>

          <button
            className="add-provider-btn"
            onClick={() => setShowForm(!showForm)}
          >
            + Add Provider
          </button>

        </div>

      </div>


      {/* ADD PROVIDER FORM */}

      {showForm && (
        <div className="provider-form-container">

          <div className="provider-form-heading">

            <p>NEW PROVIDER</p>

            <h2>Create Provider</h2>

            <span>
              Create the provider account and profile directly.
            </span>

          </div>

          <form onSubmit={handleAddProvider}>

            <div className="provider-form-grid">

              <div className="provider-input">
                <label>Full Name</label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Provider name"
                  required
                />
              </div>


              <div className="provider-input">
                <label>Email</label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Provider email"
                  required
                />
              </div>


              <div className="provider-input">
                <label>Phone</label>

                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  required
                />
              </div>


              <div className="provider-input">
                <label>Login Password</label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set login password"
                  required
                />
              </div>


              {/* ONLY CHANGED PART */}
              <div className="provider-input">
                <label>Service</label>

                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  required
                >
                  <option value="">
                    Select Service
                  </option>

                  {services.map((item) => (
                    <option
                      key={item._id}
                      value={item.name}
                    >
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>


              <div className="provider-input">
                <label>Location</label>

                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Example: Calicut"
                  required
                />
              </div>


              <div className="provider-input">
                <label>Experience</label>

                <input
                  type="text"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Example: 5 Years"
                  required
                />
              </div>


              <div className="provider-input">
                <label>Availability</label>

                <select
                  value={availability}
                  onChange={(e) =>
                    setAvailability(e.target.value)
                  }
                >
                  <option value="Available">
                    Available
                  </option>

                  <option value="Busy">
                    Busy
                  </option>

                  <option value="Unavailable">
                    Unavailable
                  </option>
                </select>
              </div>


              <div className="provider-input full">
                <label>Description</label>

                <textarea
                  rows="4"
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Describe the provider's service..."
                  required
                />
              </div>

            </div>


            <div className="provider-form-actions">

              <button
                type="submit"
                className="save-provider-btn"
              >
                Create Provider
              </button>

              <button
                type="button"
                className="cancel-provider-btn"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
              >
                Cancel
              </button>

            </div>

          </form>

        </div>
      )}


      {/* PROVIDER TABLE */}

      <div className="providers-table-container">

        <table className="providers-table">

          <thead>
            <tr>
              <th>#</th>
              <th>Provider</th>
              <th>Service</th>
              <th>Location</th>
              <th>Experience</th>
              <th>Availability</th>
              <th>Verification</th>
              <th>Reliability</th>
            </tr>
          </thead>

          <tbody>

            {providers.length > 0 ? (

              providers.map((provider, index) => (

                <tr key={provider._id}>

                  <td>{index + 1}</td>

                  <td>
                    <div className="provider-name-cell">

                      <div className="provider-avatar">
                        {provider.name
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {provider.name}
                        </strong>

                        <span>
                          {provider.phone}
                        </span>
                      </div>

                    </div>
                  </td>

                  <td>{provider.service}</td>

                  <td>{provider.location}</td>

                  <td>{provider.experience}</td>

                  <td>
                    <span className="provider-status">
                      {provider.availability}
                    </span>
                  </td>

                  <td>
                    <span
                      className={
                        provider.verificationStatus === "Verified"
                          ? "verified-badge"
                          : "pending-badge"
                      }
                    >
                      {provider.verificationStatus}
                    </span>
                  </td>

                  <td>
                    {provider.reliabilityScore || 0}%
                  </td>

                </tr>

              ))

            ) : (

              <tr>
                <td
                  colSpan="8"
                  className="no-providers"
                >
                  No providers found.
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default Providers;