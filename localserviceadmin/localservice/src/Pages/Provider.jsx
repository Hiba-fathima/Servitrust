
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

  // FILTERS
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");

  // VIEW AND EDIT
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [editingProvider, setEditingProvider] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

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

  const getProviderCategories = (provider) => {
    if (Array.isArray(provider.category)) return provider.category;
    if (provider.category) return [provider.category];
    return [];
  };

  const getProviderServices = (provider) => {
    if (Array.isArray(provider.services)) return provider.services;
    if (provider.services) return [provider.services];
    return [];
  };

  const filteredProviders = providers.filter((provider) => {
    const searchText = search.trim().toLowerCase();
    const searchableText = [
      provider.name,
      provider.location,
      provider.phone,
      provider.email,
    ].filter(Boolean).join(" ").toLowerCase();

    const providerCategories = getProviderCategories(provider);
    const categoryMatches =
      categoryFilter === "all" ||
      providerCategories.some(
        (category) => String(category).toLowerCase() === categoryFilter.toLowerCase()
      );

    const availabilityMatches =
      availabilityFilter === "all" ||
      String(provider.availability || "").toLowerCase() === availabilityFilter.toLowerCase();

    const verificationMatches =
      verificationFilter === "all" ||
      String(provider.verificationStatus || "Pending").toLowerCase() === verificationFilter.toLowerCase();

    return (
      searchableText.includes(searchText) &&
      categoryMatches &&
      availabilityMatches &&
      verificationMatches
    );
  });

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setAvailabilityFilter("all");
    setVerificationFilter("all");
    setCurrentPage(1);
  };

  const openEditProvider = (provider) => {
    setEditingProvider({
      ...provider,
      category: getProviderCategories(provider),
      services: getProviderServices(provider),
      availability: provider.availability || "Available",
      verificationStatus: provider.verificationStatus || "Pending",
    });
  };

  const handleEditFieldChange = (field, value) => {
    setEditingProvider((previous) => ({ ...previous, [field]: value }));
  };

  // Add/remove a category while editing a provider.
  const handleEditCategoryChange = (categoryName) => {
    setEditingProvider((previous) => {
      const currentCategories = Array.isArray(previous.category)
        ? previous.category
        : previous.category
        ? [previous.category]
        : [];

      const isSelected = currentCategories.includes(categoryName);
      const nextCategories = isSelected
        ? currentCategories.filter((item) => item !== categoryName)
        : [...currentCategories, categoryName];

      const validServices = (Array.isArray(previous.services)
        ? previous.services
        : previous.services
        ? [previous.services]
        : []
      ).filter((serviceName) => {
        const serviceItem = services.find((item) => item.name === serviceName);
        return serviceItem && nextCategories.includes(serviceItem.category);
      });

      return {
        ...previous,
        category: nextCategories,
        services: validServices,
      };
    });
  };

  // Add/remove a service while editing a provider.
  const handleEditServiceChange = (serviceName) => {
    setEditingProvider((previous) => {
      const currentServices = Array.isArray(previous.services)
        ? previous.services
        : previous.services
        ? [previous.services]
        : [];

      return {
        ...previous,
        services: currentServices.includes(serviceName)
          ? currentServices.filter((item) => item !== serviceName)
          : [...currentServices, serviceName],
      };
    });
  };

  const handleUpdateProvider = async (e) => {
    e.preventDefault();
    if (!editingProvider?._id) return;

    if (!Array.isArray(editingProvider.category) || editingProvider.category.length === 0) {
      alert("Please select at least one category.");
      return;
    }

    if (!Array.isArray(editingProvider.services) || editingProvider.services.length === 0) {
      alert("Please select at least one service.");
      return;
    }

    try {
      setSavingEdit(true);
      const updateData = {
        name: editingProvider.name,
        email: editingProvider.email,
        phone: editingProvider.phone,
        category: editingProvider.category,
        services: editingProvider.services,
        location: editingProvider.location,
        experience: editingProvider.experience,
        description: editingProvider.description,
        availability: editingProvider.availability,
        verificationStatus: editingProvider.verificationStatus,
      };

      // This assumes the backend supports PUT /admin/providers/:id.
      // If your backend uses a different update route, change this URL to match it.
      await axios.put(
        `https://servitrust-baxkend.onrender.com/admin/providers/${editingProvider._id}`,
        updateData
      );

      alert("Provider updated successfully.");
      setEditingProvider(null);
      await getProviders();
    } catch (error) {
      console.error("UPDATE PROVIDER ERROR:", error);
      alert(
        error.response?.data?.message ||
        "Could not update provider. Check that your backend has a PUT /admin/providers/:id route."
      );
    } finally {
      setSavingEdit(false);
    }
  };

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


      {/* SEARCH AND FILTERS */}
      <div className="providers-filter-toolbar">
        <input
          className="provider-search-input"
          type="text"
          placeholder="Search name, email, phone or location..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />

        <select
          aria-label="Filter by category"
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option key={category._id || category.name} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by availability"
          value={availabilityFilter}
          onChange={(e) => {
            setAvailabilityFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">All Availability</option>
          <option value="Available">Available</option>
          <option value="Busy">Busy</option>
          <option value="Unavailable">Unavailable</option>
        </select>

        <select
          aria-label="Filter by verification"
          value={verificationFilter}
          onChange={(e) => {
            setVerificationFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="all">All Verification</option>
          <option value="Pending">Pending</option>
          <option value="Verified">Verified</option>
          <option value="Rejected">Rejected</option>
        </select>

        <button type="button" className="provider-filter-reset" onClick={resetFilters}>
          Reset
        </button>
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
              <th>Actions</th>
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
                        (provider.verificationStatus || "Pending") === "Verified"
                          ? "verification-verified"
                          : (provider.verificationStatus || "Pending") === "Pending"
                          ? "verification-pending"
                          : (provider.verificationStatus || "Pending") === "Rejected"
                          ? "verification-rejected"
                          : ""
                      }`}
                    >

                      {provider.verificationStatus || "Pending"}

                    </span>

                  </td>


                  <td>
                    {provider.reliabilityScore || 0}%
                  </td>

                  <td>
                    <div className="provider-row-actions">
                      <button
                        type="button"
                        className="provider-view-btn"
                        onClick={() => setSelectedProvider(provider)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="provider-edit-btn"
                        onClick={() => openEditProvider(provider)}
                      >
                        Edit
                      </button>
                    </div>
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

      {/* VIEW PROVIDER MODAL */}
      {selectedProvider && (
        <div className="provider-modal-backdrop" onClick={() => setSelectedProvider(null)}>
          <section
            className="provider-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="provider-view-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="provider-modal-header">
              <div>
                <p>PROVIDER DETAILS</p>
                <h2 id="provider-view-title">{selectedProvider.name || "Provider"}</h2>
              </div>
              <button type="button" className="provider-modal-close" onClick={() => setSelectedProvider(null)} aria-label="Close">×</button>
            </div>
            <div className="provider-details-grid">
              <div><span>Email</span><strong>{selectedProvider.email || "Not provided"}</strong></div>
              <div><span>Phone</span><strong>{selectedProvider.phone || "Not provided"}</strong></div>
              <div><span>Category</span><strong>{getProviderCategories(selectedProvider).join(", ") || "Not assigned"}</strong></div>
              <div><span>Services</span><strong>{getProviderServices(selectedProvider).join(", ") || "Not assigned"}</strong></div>
              <div><span>Location</span><strong>{selectedProvider.location || "Not provided"}</strong></div>
              <div><span>Experience</span><strong>{selectedProvider.experience || "Not provided"}</strong></div>
              <div><span>Availability</span><strong>{selectedProvider.availability || "Not set"}</strong></div>
              <div><span>Verification</span><strong>{selectedProvider.verificationStatus || "Pending"}</strong></div>
              <div><span>Reliability</span><strong>{selectedProvider.reliabilityScore ?? 0}%</strong></div>
              <div className="provider-detail-description"><span>Description</span><strong>{selectedProvider.description || "No description provided."}</strong></div>
            </div>
            <div className="provider-modal-footer">
              <button type="button" className="provider-edit-btn" onClick={() => { openEditProvider(selectedProvider); setSelectedProvider(null); }}>Edit Provider</button>
              <button type="button" className="cancel-provider-btn" onClick={() => setSelectedProvider(null)}>Close</button>
            </div>
          </section>
        </div>
      )}

      {/* EDIT PROVIDER MODAL */}
      {editingProvider && (
        <div className="provider-modal-backdrop" onClick={() => !savingEdit && setEditingProvider(null)}>
          <section
            className="provider-modal provider-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="provider-edit-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="provider-modal-header">
              <div>
                <p>PROVIDER MANAGEMENT</p>
                <h2 id="provider-edit-title">Edit Provider</h2>
              </div>
              <button type="button" className="provider-modal-close" onClick={() => !savingEdit && setEditingProvider(null)} aria-label="Close">×</button>
            </div>

            <form onSubmit={handleUpdateProvider}>
              <div className="provider-edit-grid">
                <label>Full Name<input required value={editingProvider.name || ""} onChange={(e) => handleEditFieldChange("name", e.target.value)} /></label>
                <label>Email<input required type="email" value={editingProvider.email || ""} onChange={(e) => handleEditFieldChange("email", e.target.value)} /></label>
                <label>Phone<input required value={editingProvider.phone || ""} onChange={(e) => handleEditFieldChange("phone", e.target.value)} /></label>

                <div className="provider-edit-full provider-edit-choice-section">
                  <span className="provider-edit-section-label">Categories</span>
                  <div className="provider-edit-checkbox-group">
                    {categories.length > 0 ? categories.map((item) => (
                      <label className="provider-edit-checkbox" key={item._id || item.name}>
                        <input
                          type="checkbox"
                          checked={(Array.isArray(editingProvider.category) ? editingProvider.category : []).includes(item.name)}
                          onChange={() => handleEditCategoryChange(item.name)}
                        />
                        <span>{item.name}</span>
                      </label>
                    )) : <p className="provider-edit-empty">No active categories available.</p>}
                  </div>
                </div>

                {(Array.isArray(editingProvider.category) ? editingProvider.category : []).map((categoryName) => {
                  const categoryServices = getServicesForCategory(categoryName);
                  return (
                    <div className="provider-edit-full provider-edit-choice-section" key={categoryName}>
                      <span className="provider-edit-section-label">{categoryName} services</span>
                      <div className="provider-edit-checkbox-group">
                        {categoryServices.length > 0 ? categoryServices.map((item) => (
                          <label className="provider-edit-checkbox" key={item._id || item.name}>
                            <input
                              type="checkbox"
                              checked={(Array.isArray(editingProvider.services) ? editingProvider.services : []).includes(item.name)}
                              onChange={() => handleEditServiceChange(item.name)}
                            />
                            <span>{item.name}</span>
                          </label>
                        )) : <p className="provider-edit-empty">No services available under this category.</p>}
                      </div>
                    </div>
                  );
                })}

                <label>Location<input value={editingProvider.location || ""} onChange={(e) => handleEditFieldChange("location", e.target.value)} /></label>
                <label>Experience<input value={editingProvider.experience || ""} onChange={(e) => handleEditFieldChange("experience", e.target.value)} /></label>
                <label>Availability
                  <select value={editingProvider.availability || "Available"} onChange={(e) => handleEditFieldChange("availability", e.target.value)}>
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </label>
                <label>Verification
                  <select value={editingProvider.verificationStatus || "Pending"} onChange={(e) => handleEditFieldChange("verificationStatus", e.target.value)}>
                    <option value="Pending">Pending</option>
                    <option value="Verified">Verified</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </label>
                <label className="provider-edit-full">Description
                  <textarea rows="4" value={editingProvider.description || ""} onChange={(e) => handleEditFieldChange("description", e.target.value)} />
                </label>
              </div>
              <div className="provider-modal-footer">
                <button type="submit" className="save-provider-btn" disabled={savingEdit}>
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>
                <button type="button" className="cancel-provider-btn" disabled={savingEdit} onClick={() => setEditingProvider(null)}>Cancel</button>
              </div>
            </form>
          </section>
        </div>
      )}

    </div>
  );
};

export default Providers;