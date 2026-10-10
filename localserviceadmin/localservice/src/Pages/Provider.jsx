import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Css/Provider.css";

const API_URL = "https://servitrust-baxkend.onrender.com";

const getAdminToken = () =>
  localStorage.getItem("adminToken") ||
  localStorage.getItem("token") ||
  "";

const getAuthConfig = () => {
  const token = getAdminToken();

  return token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};
};

const Providers = () => {
  const [providers, setProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showForm, setShowForm] = useState(false);

  // ADD PROVIDER FORM
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [description, setDescription] = useState("");
  const [availability, setAvailability] = useState("Available");
  const [savingProvider, setSavingProvider] = useState(false);

  // SEARCH AND FILTERS
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [accountStatusFilter, setAccountStatusFilter] = useState("all");

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const providersPerPage = 4;

  // VIEW AND EDIT
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [editingProvider, setEditingProvider] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // SUSPEND AND ACTIVATE
  const [suspendingProvider, setSuspendingProvider] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [savingSuspension, setSavingSuspension] = useState(false);
  const [changingStatusId, setChangingStatusId] = useState(null);

  // GET PROVIDERS
  const getProviders = async () => {
    try {
      const response = await axios.get(`${API_URL}/providers`);

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setProviders(data);
    } catch (error) {
      console.error("GET PROVIDERS ERROR:", error);
      alert(
        error.response?.data?.message ||
          "Unable to load providers."
      );
    }
  };

  // GET SERVICES
  const getServices = async () => {
    try {
      const response = await axios.get(`${API_URL}/services`);

      setServices(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (error) {
      console.error("GET SERVICES ERROR:", error);
    }
  };

  // GET ACTIVE CATEGORIES
  const getCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setCategories(
        data.filter((category) => category.status === "Active")
      );
    } catch (error) {
      console.error("GET CATEGORIES ERROR:", error);
    }
  };

  useEffect(() => {
    getProviders();
    getServices();
    getCategories();
  }, []);

  // NORMALIZE CATEGORY VALUES
  const getProviderCategories = (provider) => {
    if (Array.isArray(provider.category)) {
      return provider.category;
    }

    if (provider.category) {
      return [provider.category];
    }

    return [];
  };

  // NORMALIZE SERVICE VALUES
  const getProviderServices = (provider) => {
    if (Array.isArray(provider.services)) {
      return provider.services;
    }

    if (provider.services) {
      return [provider.services];
    }

    return [];
  };

  // NORMALIZE ACCOUNT STATUS
  // Providers created before this feature are considered Active.
  const getAccountStatus = (provider) =>
    provider.accountStatus || "Active";

  // CATEGORY CHECKBOX
  const handleCategoryChange = (categoryName) => {
    setSelectedCategories((previous) => {
      const nextCategories = previous.includes(categoryName)
        ? previous.filter((item) => item !== categoryName)
        : [...previous, categoryName];

      setSelectedServices((previousServices) =>
        previousServices.filter((serviceName) => {
          const serviceItem = services.find(
            (item) => item.name === serviceName
          );

          return (
            serviceItem &&
            nextCategories.includes(serviceItem.category)
          );
        })
      );

      return nextCategories;
    });
  };

  // SERVICE CHECKBOX
  const handleServiceChange = (serviceName) => {
    setSelectedServices((previous) =>
      previous.includes(serviceName)
        ? previous.filter((item) => item !== serviceName)
        : [...previous, serviceName]
    );
  };

  // SERVICES FOR A CATEGORY
  const getServicesForCategory = (categoryName) =>
    services.filter((item) => item.category === categoryName);

  // RESET ADD FORM
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

  // ADD PROVIDER
  const handleAddProvider = async (event) => {
    event.preventDefault();

    if (selectedCategories.length === 0) {
      alert("Please select at least one category.");
      return;
    }

    if (selectedServices.length === 0) {
      alert("Please select at least one service.");
      return;
    }

    try {
      setSavingProvider(true);

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
        availability,
      };

      await axios.post(
        `${API_URL}/admin/providers`,
        data,
        getAuthConfig()
      );

      alert("Provider created successfully.");

      resetForm();
      setShowForm(false);

      await getProviders();
    } catch (error) {
      console.error("ADD PROVIDER ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Failed to create provider."
      );
    } finally {
      setSavingProvider(false);
    }
  };

  // SEARCH AND FILTER PROVIDERS
  const filteredProviders = providers.filter((provider) => {
    const searchText = search.trim().toLowerCase();

    const searchableText = [
      provider.name,
      provider.email,
      provider.phone,
      provider.location,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const providerCategories = getProviderCategories(provider);

    const categoryMatches =
      categoryFilter === "all" ||
      providerCategories.some(
        (category) =>
          String(category).toLowerCase() ===
          categoryFilter.toLowerCase()
      );

    const availabilityMatches =
      availabilityFilter === "all" ||
      String(provider.availability || "").toLowerCase() ===
        availabilityFilter.toLowerCase();

    const verificationMatches =
      verificationFilter === "all" ||
      String(provider.verificationStatus || "Pending").toLowerCase() ===
        verificationFilter.toLowerCase();

    const accountStatusMatches =
      accountStatusFilter === "all" ||
      getAccountStatus(provider) === accountStatusFilter;

    return (
      searchableText.includes(searchText) &&
      categoryMatches &&
      availabilityMatches &&
      verificationMatches &&
      accountStatusMatches
    );
  });

  // RESET FILTERS
  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setAvailabilityFilter("all");
    setVerificationFilter("all");
    setAccountStatusFilter("all");
    setCurrentPage(1);
  };

  // OPEN EDIT MODAL
  const openEditProvider = (provider) => {
    setEditingProvider({
      ...provider,
      category: getProviderCategories(provider),
      services: getProviderServices(provider),
      availability: provider.availability || "Available",
      verificationStatus:
        provider.verificationStatus || "Pending",
    });
  };

  // EDIT FIELD
  const handleEditFieldChange = (field, value) => {
    setEditingProvider((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // EDIT CATEGORIES
  const handleEditCategoryChange = (categoryName) => {
    setEditingProvider((previous) => {
      const currentCategories = Array.isArray(previous.category)
        ? previous.category
        : [];

      const nextCategories = currentCategories.includes(categoryName)
        ? currentCategories.filter((item) => item !== categoryName)
        : [...currentCategories, categoryName];

      const currentServices = Array.isArray(previous.services)
        ? previous.services
        : [];

      const nextServices = currentServices.filter((serviceName) => {
        const serviceItem = services.find(
          (item) => item.name === serviceName
        );

        return (
          serviceItem &&
          nextCategories.includes(serviceItem.category)
        );
      });

      return {
        ...previous,
        category: nextCategories,
        services: nextServices,
      };
    });
  };

  // EDIT SERVICES
  const handleEditServiceChange = (serviceName) => {
    setEditingProvider((previous) => {
      const currentServices = Array.isArray(previous.services)
        ? previous.services
        : [];

      return {
        ...previous,
        services: currentServices.includes(serviceName)
          ? currentServices.filter((item) => item !== serviceName)
          : [...currentServices, serviceName],
      };
    });
  };

  // SAVE PROVIDER EDIT
  const handleUpdateProvider = async (event) => {
    event.preventDefault();

    if (!editingProvider?._id) return;

    if (
      !Array.isArray(editingProvider.category) ||
      editingProvider.category.length === 0
    ) {
      alert("Please select at least one category.");
      return;
    }

    if (
      !Array.isArray(editingProvider.services) ||
      editingProvider.services.length === 0
    ) {
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

      await axios.put(
        `${API_URL}/admin/providers/${editingProvider._id}`,
        updateData,
        getAuthConfig()
      );

      alert("Provider updated successfully.");

      setEditingProvider(null);
      await getProviders();
    } catch (error) {
      console.error("UPDATE PROVIDER ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Could not update provider. Check your backend update route."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  // OPEN SUSPENSION MODAL
  const handleAccountStatusChange = (provider) => {
    const currentStatus = getAccountStatus(provider);

    if (currentStatus === "Suspended") {
      activateProvider(provider);
      return;
    }

    setSuspensionReason("");
    setSuspendingProvider(provider);
  };

  // CONFIRM SUSPENSION
  const confirmSuspendProvider = async (event) => {
    event.preventDefault();

    if (!suspendingProvider) return;

    if (!suspensionReason.trim()) {
      alert("Please enter a suspension reason.");
      return;
    }

    try {
      setSavingSuspension(true);

      const response = await axios.patch(
        `${API_URL}/admin/providers/${suspendingProvider._id}/account-status`,
        {
          accountStatus: "Suspended",
          suspensionReason: suspensionReason.trim(),
        },
        getAuthConfig()
      );

      const updatedProvider = response.data.provider;

      if (!updatedProvider) {
        throw new Error(
          "The backend did not return the updated provider."
        );
      }

      setProviders((previous) =>
        previous.map((provider) =>
          provider._id === updatedProvider._id
            ? updatedProvider
            : provider
        )
      );

      if (selectedProvider?._id === updatedProvider._id) {
        setSelectedProvider(updatedProvider);
      }

      setSuspendingProvider(null);
      setSuspensionReason("");

      alert("Provider suspended successfully.");
    } catch (error) {
      console.error("SUSPEND PROVIDER ERROR:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Could not suspend provider. Check the backend route and admin token."
      );
    } finally {
      setSavingSuspension(false);
    }
  };

  // ACTIVATE PROVIDER
  const activateProvider = async (provider) => {
    const confirmed = window.confirm(
      `Activate ${provider.name}'s account?\n\nThe provider will be allowed to use their account again.`
    );

    if (!confirmed) return;

    try {
      setChangingStatusId(provider._id);

      const response = await axios.patch(
        `${API_URL}/admin/providers/${provider._id}/account-status`,
        {
          accountStatus: "Active",
        },
        getAuthConfig()
      );

      const updatedProvider = response.data.provider;

      if (!updatedProvider) {
        throw new Error(
          "The backend did not return the updated provider."
        );
      }

      setProviders((previous) =>
        previous.map((item) =>
          item._id === updatedProvider._id
            ? updatedProvider
            : item
        )
      );

      if (selectedProvider?._id === updatedProvider._id) {
        setSelectedProvider(updatedProvider);
      }

      alert("Provider activated successfully.");
    } catch (error) {
      console.error("ACTIVATE PROVIDER ERROR:", error);

      alert(
        error.response?.data?.message ||
          error.message ||
          "Could not activate provider."
      );
    } finally {
      setChangingStatusId(null);
    }
  };

  // PAGINATION
  const totalPages = Math.ceil(
    filteredProviders.length / providersPerPage
  );

  const startIndex = (currentPage - 1) * providersPerPage;

  const currentProviders = filteredProviders.slice(
    startIndex,
    startIndex + providersPerPage
  );

  // RESET TO PAGE 1 WHEN FILTER RESULTS CHANGE
  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    categoryFilter,
    availabilityFilter,
    verificationFilter,
    accountStatusFilter,
  ]);

  // BADGE CLASS FOR VERIFICATION
  const getVerificationClass = (status) => {
    if (status === "Verified") return "verification-verified";
    if (status === "Rejected") return "verification-rejected";
    return "verification-pending";
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
            type="button"
            className="add-provider-btn"
            onClick={() => setShowForm((previous) => !previous)}
          >
            {showForm ? "Close Form" : "+ Add Provider"}
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
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Provider name"
                  required
                />
              </div>

              <div className="provider-input">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Provider email"
                  required
                />
              </div>

              <div className="provider-input">
                <label>Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Phone number"
                  required
                />
              </div>

              <div className="provider-input">
                <label>Login Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Set login password"
                  required
                />
              </div>

              {/* CATEGORIES */}
              <div className="provider-input full">
                <label>Categories</label>

                <div className="provider-checkbox-group">
                  {categories.length > 0 ? (
                    categories.map((item) => (
                      <label
                        key={item._id || item.name}
                        className="provider-checkbox"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(item.name)}
                          onChange={() =>
                            handleCategoryChange(item.name)
                          }
                        />
                        <span>{item.name}</span>
                      </label>
                    ))
                  ) : (
                    <p>No active categories available.</p>
                  )}
                </div>
              </div>

              {/* SERVICES */}
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
                          <h4>{categoryName}</h4>

                          {categoryServices.length > 0 ? (
                            <div className="provider-checkbox-group">
                              {categoryServices.map((item) => (
                                <label
                                  key={item._id || item.name}
                                  className="provider-checkbox"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedServices.includes(
                                      item.name
                                    )}
                                    onChange={() =>
                                      handleServiceChange(item.name)
                                    }
                                  />
                                  <span>{item.name}</span>
                                </label>
                              ))}
                            </div>
                          ) : (
                            <p>
                              No services available under this category.
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="provider-input">
                <label>Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Example: Calicut"
                  required
                />
              </div>

              <div className="provider-input">
                <label>Experience</label>
                <input
                  type="text"
                  value={experience}
                  onChange={(event) =>
                    setExperience(event.target.value)
                  }
                  placeholder="Example: 5 Years"
                  required
                />
              </div>

              <div className="provider-input">
                <label>Availability</label>
                <select
                  value={availability}
                  onChange={(event) =>
                    setAvailability(event.target.value)
                  }
                >
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="Unavailable">Unavailable</option>
                </select>
              </div>

              <div className="provider-input full">
                <label>Description</label>
                <textarea
                  rows="4"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
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
                disabled={savingProvider}
              >
                {savingProvider ? "Creating..." : "Create Provider"}
              </button>

              <button
                type="button"
                className="cancel-provider-btn"
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                disabled={savingProvider}
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
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          aria-label="Filter by category"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((category) => (
            <option
              key={category._id || category.name}
              value={category.name}
            >
              {category.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by availability"
          value={availabilityFilter}
          onChange={(event) =>
            setAvailabilityFilter(event.target.value)
          }
        >
          <option value="all">All Availability</option>
          <option value="Available">Available</option>
          <option value="Busy">Busy</option>
          <option value="Unavailable">Unavailable</option>
        </select>

        <select
          aria-label="Filter by verification"
          value={verificationFilter}
          onChange={(event) =>
            setVerificationFilter(event.target.value)
          }
        >
          <option value="all">All Verification</option>
          <option value="Pending">Pending</option>
          <option value="Verified">Verified</option>
          <option value="Rejected">Rejected</option>
        </select>

        <select
          aria-label="Filter by account status"
          value={accountStatusFilter}
          onChange={(event) =>
            setAccountStatusFilter(event.target.value)
          }
        >
          <option value="all">All Account Status</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
        </select>

        <button
          type="button"
          className="provider-filter-reset"
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>

      {/* PROVIDERS TABLE */}
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
              <th>Account Status</th>
              <th>Reliability</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentProviders.length > 0 ? (
              currentProviders.map((provider, index) => {
                const accountStatus = getAccountStatus(provider);

                return (
                  <tr key={provider._id}>
                    <td>{startIndex + index + 1}</td>

                    <td>
                      <div className="provider-name-cell">
                        <div className="provider-avatar">
                          {provider.name?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <strong>{provider.name}</strong>
                          <span>{provider.phone}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      {getProviderCategories(provider).join(", ") ||
                        "Not assigned"}
                    </td>

                    <td>{provider.location || "—"}</td>

                    <td>
                      <span className="provider-status">
                        {provider.availability || "Not set"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`verification-badge ${getVerificationClass(
                          provider.verificationStatus || "Pending"
                        )}`}
                      >
                        {provider.verificationStatus || "Pending"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`account-status-badge ${
                          accountStatus === "Suspended"
                            ? "account-suspended"
                            : "account-active"
                        }`}
                      >
                        {accountStatus}
                      </span>
                    </td>

                    <td>
                      {provider.reliabilityScore ?? 0}%
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

                        <button
                          type="button"
                          className={
                            accountStatus === "Suspended"
                              ? "activate-provider-btn"
                              : "suspend-provider-btn"
                          }
                          disabled={
                            savingSuspension ||
                            changingStatusId === provider._id
                          }
                          onClick={() =>
                            handleAccountStatusChange(provider)
                          }
                        >
                          {changingStatusId === provider._id
                            ? "Please wait..."
                            : accountStatus === "Suspended"
                            ? "Activate"
                            : "Suspend"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="no-providers">
                  No providers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="providers-pagination">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((page) => Math.max(1, page - 1))
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
                  className={currentPage === page ? "active" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(totalPages, page + 1)
                )
              }
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* VIEW PROVIDER MODAL */}
      {selectedProvider && (
        <div
          className="provider-modal-backdrop"
          onClick={() => setSelectedProvider(null)}
        >
          <section
            className="provider-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="provider-view-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="provider-modal-header">
              <div>
                <p>PROVIDER DETAILS</p>
                <h2 id="provider-view-title">
                  {selectedProvider.name || "Provider"}
                </h2>
              </div>

              <button
                type="button"
                className="provider-modal-close"
                onClick={() => setSelectedProvider(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="provider-details-grid">
              <div>
                <span>Email</span>
                <strong>{selectedProvider.email || "Not provided"}</strong>
              </div>

              <div>
                <span>Phone</span>
                <strong>{selectedProvider.phone || "Not provided"}</strong>
              </div>

              <div>
                <span>Category</span>
                <strong>
                  {getProviderCategories(selectedProvider).join(", ") ||
                    "Not assigned"}
                </strong>
              </div>

              <div>
                <span>Services</span>
                <strong>
                  {getProviderServices(selectedProvider).join(", ") ||
                    "Not assigned"}
                </strong>
              </div>

              <div>
                <span>Location</span>
                <strong>{selectedProvider.location || "Not provided"}</strong>
              </div>

              <div>
                <span>Experience</span>
                <strong>
                  {selectedProvider.experience || "Not provided"}
                </strong>
              </div>

              <div>
                <span>Availability</span>
                <strong>
                  {selectedProvider.availability || "Not set"}
                </strong>
              </div>

              <div>
                <span>Verification</span>
                <strong>
                  {selectedProvider.verificationStatus || "Pending"}
                </strong>
              </div>

              <div>
                <span>Account Status</span>
                <strong>{getAccountStatus(selectedProvider)}</strong>
              </div>

              {getAccountStatus(selectedProvider) === "Suspended" && (
                <>
                  <div>
                    <span>Suspension Reason</span>
                    <strong>
                      {selectedProvider.suspensionReason ||
                        "No reason recorded"}
                    </strong>
                  </div>

                  <div>
                    <span>Suspended At</span>
                    <strong>
                      {selectedProvider.suspendedAt
                        ? new Date(
                            selectedProvider.suspendedAt
                          ).toLocaleString()
                        : "Not recorded"}
                    </strong>
                  </div>
                </>
              )}

              <div>
                <span>Reliability</span>
                <strong>
                  {selectedProvider.reliabilityScore ?? 0}%
                </strong>
              </div>

              <div className="provider-detail-description">
                <span>Description</span>
                <strong>
                  {selectedProvider.description ||
                    "No description provided."}
                </strong>
              </div>
            </div>

            <div className="provider-modal-footer">
              <button
                type="button"
                className="provider-edit-btn"
                onClick={() => {
                  openEditProvider(selectedProvider);
                  setSelectedProvider(null);
                }}
              >
                Edit Provider
              </button>

              <button
                type="button"
                className="cancel-provider-btn"
                onClick={() => setSelectedProvider(null)}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {/* EDIT PROVIDER MODAL */}
      {editingProvider && (
        <div
          className="provider-modal-backdrop"
          onClick={() =>
            !savingEdit && setEditingProvider(null)
          }
        >
          <section
            className="provider-modal provider-edit-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="provider-edit-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="provider-modal-header">
              <div>
                <p>PROVIDER MANAGEMENT</p>
                <h2 id="provider-edit-title">Edit Provider</h2>
              </div>

              <button
                type="button"
                className="provider-modal-close"
                onClick={() =>
                  !savingEdit && setEditingProvider(null)
                }
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdateProvider}>
              <div className="provider-edit-grid">
                <label>
                  Full Name
                  <input
                    required
                    value={editingProvider.name || ""}
                    onChange={(event) =>
                      handleEditFieldChange(
                        "name",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  Email
                  <input
                    required
                    type="email"
                    value={editingProvider.email || ""}
                    onChange={(event) =>
                      handleEditFieldChange(
                        "email",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  Phone
                  <input
                    required
                    value={editingProvider.phone || ""}
                    onChange={(event) =>
                      handleEditFieldChange(
                        "phone",
                        event.target.value
                      )
                    }
                  />
                </label>

                <div className="provider-edit-full provider-edit-choice-section">
                  <span className="provider-edit-section-label">
                    Categories
                  </span>

                  <div className="provider-edit-checkbox-group">
                    {categories.length > 0 ? (
                      categories.map((item) => (
                        <label
                          className="provider-edit-checkbox"
                          key={item._id || item.name}
                        >
                          <input
                            type="checkbox"
                            checked={(
                              Array.isArray(editingProvider.category)
                                ? editingProvider.category
                                : []
                            ).includes(item.name)}
                            onChange={() =>
                              handleEditCategoryChange(item.name)
                            }
                          />
                          <span>{item.name}</span>
                        </label>
                      ))
                    ) : (
                      <p className="provider-edit-empty">
                        No active categories available.
                      </p>
                    )}
                  </div>
                </div>

                {(
                  Array.isArray(editingProvider.category)
                    ? editingProvider.category
                    : []
                ).map((categoryName) => {
                  const categoryServices =
                    getServicesForCategory(categoryName);

                  return (
                    <div
                      className="provider-edit-full provider-edit-choice-section"
                      key={categoryName}
                    >
                      <span className="provider-edit-section-label">
                        {categoryName} services
                      </span>

                      <div className="provider-edit-checkbox-group">
                        {categoryServices.length > 0 ? (
                          categoryServices.map((item) => (
                            <label
                              className="provider-edit-checkbox"
                              key={item._id || item.name}
                            >
                              <input
                                type="checkbox"
                                checked={(
                                  Array.isArray(editingProvider.services)
                                    ? editingProvider.services
                                    : []
                                ).includes(item.name)}
                                onChange={() =>
                                  handleEditServiceChange(item.name)
                                }
                              />
                              <span>{item.name}</span>
                            </label>
                          ))
                        ) : (
                          <p className="provider-edit-empty">
                            No services available under this category.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}

                <label>
                  Location
                  <input
                    value={editingProvider.location || ""}
                    onChange={(event) =>
                      handleEditFieldChange(
                        "location",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  Experience
                  <input
                    value={editingProvider.experience || ""}
                    onChange={(event) =>
                      handleEditFieldChange(
                        "experience",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label>
                  Availability
                  <select
                    value={editingProvider.availability || "Available"}
                    onChange={(event) =>
                      handleEditFieldChange(
                        "availability",
                        event.target.value
                      )
                    }
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </label>

                <label>
                  Verification
                  <select
                    value={
                      editingProvider.verificationStatus || "Pending"
                    }
                    onChange={(event) =>
                      handleEditFieldChange(
                        "verificationStatus",
                        event.target.value
                      )
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="Verified">Verified</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </label>

                <label className="provider-edit-full">
                  Description
                  <textarea
                    rows="4"
                    value={editingProvider.description || ""}
                    onChange={(event) =>
                      handleEditFieldChange(
                        "description",
                        event.target.value
                      )
                    }
                  />
                </label>
              </div>

              <div className="provider-modal-footer">
                <button
                  type="submit"
                  className="save-provider-btn"
                  disabled={savingEdit}
                >
                  {savingEdit ? "Saving..." : "Save Changes"}
                </button>

                <button
                  type="button"
                  className="cancel-provider-btn"
                  disabled={savingEdit}
                  onClick={() => setEditingProvider(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* SUSPENSION MODAL */}
      {suspendingProvider && (
        <div
          className="provider-modal-backdrop"
          onClick={() =>
            !savingSuspension && setSuspendingProvider(null)
          }
        >
          <section
            className="provider-modal suspension-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="suspension-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="provider-modal-header">
              <div>
                <p>ACCOUNT MANAGEMENT</p>
                <h2 id="suspension-title">Suspend Provider</h2>
              </div>

              <button
                type="button"
                className="provider-modal-close"
                onClick={() =>
                  !savingSuspension && setSuspendingProvider(null)
                }
                disabled={savingSuspension}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p className="suspension-warning">
              You are about to suspend{" "}
              <strong>{suspendingProvider.name}</strong>. The backend
              must prevent this provider from logging in and performing
              protected provider actions.
            </p>

            <form onSubmit={confirmSuspendProvider}>
              <label
                className="suspension-reason-label"
                htmlFor="suspension-reason"
              >
                Reason for suspension
              </label>

              <textarea
                id="suspension-reason"
                className="suspension-reason-input"
                value={suspensionReason}
                onChange={(event) =>
                  setSuspensionReason(event.target.value)
                }
                placeholder="Enter the reason for suspending this provider..."
                rows={4}
                maxLength={500}
                required
              />

              <div className="suspension-character-count">
                {suspensionReason.length}/500
              </div>

              <div className="provider-modal-footer">
                <button
                  type="button"
                  className="cancel-provider-btn"
                  onClick={() => {
                    setSuspendingProvider(null);
                    setSuspensionReason("");
                  }}
                  disabled={savingSuspension}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="confirm-suspension-btn"
                  disabled={savingSuspension}
                >
                  {savingSuspension
                    ? "Suspending..."
                    : "Confirm Suspension"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default Providers;
