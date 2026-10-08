
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Css/Provider.css";

const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // MULTIPLE CATEGORIES
  const [selectedCategories, setSelectedCategories] = useState([]);

  // MULTIPLE SERVICES
  const [selectedServices, setSelectedServices] = useState([]);

  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [description, setDescription] = useState("");
  const [availability, setAvailability] = useState("Available");

  const [currentPage, setCurrentPage] = useState(1);
  const providersPerPage = 4;

  const [search, setSearch] = useState("");

  const getProviders = async () => {
    try {
      const response = await axios.get(
        "https://servitrust-baxkend.onrender.com/providers"
      );

      console.log("PROVIDERS API RESPONSE:", response.data);

      setProviders(response.data);
      setCurrentPage(1);
    } catch (error) {
      console.log("GET PROVIDERS ERROR:", error);
    }
  };

  // GET SERVICES FROM ADMIN SERVICES
  const getServices = async () => {
    try {
      const response = await axios.get(
        "https://servitrust-baxkend.onrender.com/services"
      );

      setServices(response.data);
    } catch (error) {
      console.log("GET SERVICES ERROR:", error);
    }
  };

  // GET CATEGORIES FROM ADMIN CATEGORIES
  const getCategories = async () => {
    try {
      const response = await axios.get(
        "https://servitrust-baxkend.onrender.com/categories"
      );

      const activeCategories = response.data.filter(
        (category) => category.status === "Active"
      );

      setCategories(activeCategories);
    } catch (error) {
      console.log("GET CATEGORIES ERROR:", error);
    }
  };

  useEffect(() => {
    getProviders();
    getServices();
    getCategories();
  }, []);

  // CATEGORY CHECKBOX CHANGE
  const handleCategoryChange = (categoryName) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryName)) {
        return prev.filter(
          (category) => category !== categoryName
        );
      }

      return [...prev, categoryName];
    });

    // Remove services that no longer belong to selected categories
    setSelectedServices((prevServices) => {
      return prevServices.filter((serviceName) => {
        const serviceItem = services.find(
          (item) => item.name === serviceName
        );

        return (
          serviceItem &&
          selectedCategories.includes(serviceItem.category)
        );
      });
    });
  };

  // SERVICE CHECKBOX CHANGE
  const handleServiceChange = (serviceName) => {
    setSelectedServices((prev) => {
      if (prev.includes(serviceName)) {
        return prev.filter(
          (service) => service !== serviceName
        );
      }

      return [...prev, serviceName];
    });
  };

  // SERVICES THAT BELONG TO SELECTED CATEGORIES
  const getServicesForCategory = (categoryName) => {
    return services.filter(
      (item) => item.category === categoryName
    );
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setSelectedCategories([]);
    setSelectedServices([]);
    setLocation("");
    setExperience("");
    setDescription("");
    setAvailability("Available");
  };

  const handleAddProvider = async (e) => {
    e.preventDefault();

    if (selectedCategories.length === 0) {
      alert("Please select at least one category.");
      return;
    }

    if (selectedServices.length === 0) {
      alert("Please select at least one service.");
      return;
    }

    try {
      const data = {
        name,
        email,
        phone,
        password,
        category: selectedCategories,
        services: selectedServices,
        location,
        experience,
        description,
        availability
      };

      console.log("PROVIDER DATA:", data);

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

  const filteredProviders = providers.filter((provider) => {
    const searchText = search.toLowerCase();

    return (
      provider.name?.toLowerCase().includes(searchText) ||
      provider.location?.toLowerCase().includes(searchText)
    );
  });

  const totalPages = Math.ceil(
    filteredProviders.length / providersPerPage
  );

  const startIndex =
    (currentPage - 1) * providersPerPage;

  const currentProviders =
    filteredProviders.slice(
      startIndex,
      startIndex + providersPerPage
    );

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

              {/* NAME */}

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


              {/* EMAIL */}

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


              {/* PHONE */}

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


              {/* PASSWORD */}

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


              {/* CATEGORY CHECKBOXES */}

              <div className="provider-input full">

                <label>Categories</label>

                <div className="provider-checkbox-group">

                  {categories.length > 0 ? (

                    categories.map((item) => (

                      <label
                        key={item._id}
                        className="provider-checkbox"
                      >

                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(
                            item.name
                          )}
                          onChange={() =>
                            handleCategoryChange(item.name)
                          }
                        />

                        <span>
                          {item.name}
                        </span>

                      </label>

                    ))

                  ) : (

                    <p>
                      No active categories available.
                    </p>

                  )}

                </div>

              </div>


              {/* SELECTED CATEGORY SERVICES */}

              {selectedCategories.length > 0 && (

                <div className="provider-input full">

                  <label>Services</label>

                  <div className="provider-services-container">

                    {selectedCategories.map((categoryName) => {

                      const categoryServices =
                        getServicesForCategory(categoryName);

                      return (

                        <div
                          key={categoryName}
                          className="provider-service-category"
                        >

                          <h4>
                            {categoryName}
                          </h4>


                          {categoryServices.length > 0 ? (

                            <div className="provider-checkbox-group">

                              {categoryServices.map(
                                (item) => (

                                  <label
                                    key={item._id}
                                    className="provider-checkbox"
                                  >

                                    <input
                                      type="checkbox"
                                      checked={selectedServices.includes(
                                        item.name
                                      )}
                                      onChange={() =>
                                        handleServiceChange(
                                          item.name
                                        )
                                      }
                                    />

                                    <span>
                                      {item.name}
                                    </span>

                                  </label>

                                )
                              )}

                            </div>

                          ) : (

                            <p>
                              No services available
                              under this category.
                            </p>

                          )}

                        </div>

                      );

                    })}

                  </div>

                </div>

              )}


              {/* LOCATION */}

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


              {/* EXPERIENCE */}

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


              {/* AVAILABILITY */}

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


              {/* DESCRIPTION */}

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


            {/* FORM BUTTONS */}

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


      {/* PROVIDER SEARCH */}

      <div className="providers-search">

        <input
          type="text"
          placeholder="Search by provider name or location..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

      </div>


      {/* PROVIDER TABLE */}

      <div className="providers-table-container">

        <table className="providers-table">

          <thead>

            <tr>
              <th>#</th>
              <th>Provider</th>
              <th>Category</th>
              <th>Location</th>
              <th>Availability</th>
              <th>Verification</th>
              <th>Reliability</th>
            </tr>

          </thead>


          <tbody>

            {filteredProviders.length > 0 ? (

              currentProviders.map((provider, index) => (

                <tr key={provider._id}>

                  <td>
                    {startIndex + index + 1}
                  </td>


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


                  <td>

                    {Array.isArray(provider.category)
                      ? provider.category.join(", ")
                      : provider.category}

                  </td>


                  <td>
                    {provider.location}
                  </td>


                  <td>

                    <span className="provider-status">
                      {provider.availability}
                    </span>

                  </td>


                  <td>

                    <span
                      className={`verification-badge ${
                        provider.verificationStatus === "Verified"
                          ? "verification-verified"
                          : provider.verificationStatus === "Pending"
                          ? "verification-pending"
                          : provider.verificationStatus === "Rejected"
                          ? "verification-rejected"
                          : ""
                      }`}
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


        {/* PAGINATION */}

        {providers.length > 0 && totalPages > 1 && (

          <div className="providers-pagination">

            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage(currentPage - 1)
              }
            >
              ← Previous
            </button>


            <div className="pagination-pages">

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (

                <button
                  type="button"
                  key={page}
                  className={
                    currentPage === page
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setCurrentPage(page)
                  }
                >
                  {page}
                </button>

              ))}

            </div>


            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage(currentPage + 1)
              }
            >
              Next →
            </button>

          </div>

        )}

      </div>

    </div>
  );
};

export default Providers;
