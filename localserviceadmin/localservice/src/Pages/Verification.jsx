import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Css/Verification.css";

const API = "https://servitrust-baxkend.onrender.com/providers";
const NOTIFICATION_API =
  "https://servitrust-baxkend.onrender.com/notifications/provider-reminder";

const Verification = () => {
  const [providers, setProviders] = useState([]);
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");

  const providersPerPage = 8;

  // GET PENDING PROVIDERS
  const getPendingProviders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API);

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.providers || [];

      // Missing verification status is treated as Pending.
      const pendingProviders = data
        .map((provider) => ({
          ...provider,
          verificationStatus: provider.verificationStatus || "Pending",
        }))
        .filter(
          (provider) => provider.verificationStatus === "Pending"
        );

      setProviders(pendingProviders);
    } catch (err) {
      console.error("GET VERIFICATION ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load pending providers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPendingProviders();
  }, []);

  // CLOSE MODAL WITH ESCAPE KEY
  useEffect(() => {
    if (!selectedProvider) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedProvider(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [selectedProvider]);

  // APPROVE OR REJECT PROVIDER
  const updateVerification = async (id, status) => {
    const actionText = status === "Verified" ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionText} this provider?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(id);
      setError("");

      await axios.put(`${API}/${id}/verification`, {
        verificationStatus: status,
      });

      // Remove the reviewed provider from this pending-only page.
      setProviders((previous) =>
        previous.filter((provider) => provider._id !== id)
      );

      setSelectedProvider(null);

      window.alert(
        status === "Verified"
          ? "Provider approved successfully."
          : "Provider rejected."
      );
    } catch (err) {
      console.error("VERIFICATION ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to update provider verification."
      );
    } finally {
      setUpdatingId("");
    }
  };

  // PROVIDER NAME
  const getProviderName = (provider) =>
    provider.name || provider.fullName || "Unnamed Provider";

  // SERVICE NAME
  const getServiceName = (provider) => {
    if (Array.isArray(provider.services)) {
      return provider.services.length
        ? provider.services
            .map((service) =>
              typeof service === "object"
                ? service.name || service.title || ""
                : service
            )
            .filter(Boolean)
            .join(", ")
        : getServiceNameFromSingle(provider);
    }

    if (typeof provider.service === "string") {
      return provider.service || "Not specified";
    }

    if (
      provider.service &&
      typeof provider.service === "object"
    ) {
      return (
        provider.service.name ||
        provider.service.title ||
        "Not specified"
      );
    }

    return provider.serviceName || "Not specified";
  };

  const getServiceNameFromSingle = (provider) => {
    if (typeof provider.service === "string" && provider.service) {
      return provider.service;
    }

    if (
      provider.service &&
      typeof provider.service === "object"
    ) {
      return (
        provider.service.name ||
        provider.service.title ||
        "Not specified"
      );
    }

    return provider.serviceName || "Not specified";
  };

  // LOCATION
  const getLocation = (provider) =>
    provider.location ||
    provider.serviceArea ||
    provider.address ||
    "Not specified";

  // AVAILABILITY
  const getAvailability = (provider) =>
    provider.availability || "Not specified";

  // EXPERIENCE
  const getExperience = (provider) => {
    const value = provider.experience;

    if (value === undefined || value === null || value === "") {
      return "Not specified";
    }

    const text = String(value);

    return /\b(year|years|month|months)\b/i.test(text)
      ? text
      : `${text} years`;
  };

  // PROVIDER IMAGE
  const getImage = (provider) =>
    provider.image ||
    provider.profileImage ||
    provider.profilePicture ||
    provider.imageUrl ||
    "";

  // CHECK MISSING PROFILE FIELDS
  const getMissingProfileFields = (provider) => {
    const checks = [
      ["Name", provider.name || provider.fullName],
      ["Phone", provider.phone],
      ["Category", provider.category || provider.serviceCategory],
      [
        "Service",
        provider.services ||
          provider.service ||
          provider.serviceName,
      ],
      [
        "Location",
        provider.location ||
          provider.serviceArea ||
          provider.address,
      ],
      ["Experience", provider.experience],
      ["Description", provider.description || provider.about],
    ];

    return checks
      .filter(([, value]) => {
        if (value === undefined || value === null) return true;

        if (typeof value === "string") {
          return value.trim() === "";
        }

        if (Array.isArray(value)) {
          return value.length === 0;
        }

        return false;
      })
      .map(([label]) => label);
  };

  // CHECK WHETHER PROFILE IS INCOMPLETE
  const isProfileIncomplete = (provider) =>
    getMissingProfileFields(provider).length > 0;

  // SEND PROFILE COMPLETION NOTIFICATION
  const sendProfileReminder = async (provider) => {
    const missingFields = getMissingProfileFields(provider);

    if (missingFields.length === 0) {
      window.alert(
        "This provider's profile appears complete. No reminder is needed."
      );
      return;
    }

    const confirmed = window.confirm(
      `Send a profile-completion notification to ${getProviderName(
        provider
      )}?\n\nMissing information: ${missingFields.join(", ")}`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(provider._id);
      setError("");

      // Use the token stored after admin login.
      const token = localStorage.getItem("token");

      if (!token) {
        window.alert(
          "Admin login token not found. Please log in again."
        );
        return;
      }

      // Call the new backend route.
      const response = await axios.post(
        NOTIFICATION_API,
        {
          providerId: provider._id,
          title: "Complete your ServiTrust provider profile",
          message: `Please complete your provider profile. Missing information: ${missingFields.join(
            ", "
          )}. Open your ServiTrust provider profile and fill in the missing details.`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      window.alert(
        response.data?.message ||
          `Profile-completion notification sent to ${getProviderName(
            provider
          )}.`
      );
    } catch (err) {
      console.error(
        "SEND PROFILE REMINDER ERROR:",
        err.response?.data || err.message
      );

      window.alert(
        err.response?.data?.message ||
          "Notification could not be sent. Check your admin token, backend route, and provider userId."
      );
    } finally {
      setUpdatingId("");
    }
  };

  // SERVICE FILTER OPTIONS
  const services = [
    ...new Set(
      providers
        .map(getServiceName)
        .filter((service) => service !== "Not specified")
    ),
  ];

  // SEARCH AND FILTER
  const filteredProviders = providers.filter((provider) => {
    const searchText = search.toLowerCase();

    const matchesSearch = [
      getProviderName(provider),
      provider.email,
      provider.phone,
      getServiceName(provider),
      getLocation(provider),
    ].some((value) =>
      String(value || "").toLowerCase().includes(searchText)
    );

    const matchesService =
      !serviceFilter || getServiceName(provider) === serviceFilter;

    const matchesAvailability =
      !availabilityFilter ||
      getAvailability(provider).toLowerCase() ===
        availabilityFilter.toLowerCase();

    return (
      matchesSearch &&
      matchesService &&
      matchesAvailability
    );
  });

  // PAGINATION
  const totalPages = Math.ceil(
    filteredProviders.length / providersPerPage
  );

  const safePage = Math.min(
    currentPage,
    Math.max(totalPages, 1)
  );

  const startIndex = (safePage - 1) * providersPerPage;

  const currentProviders = filteredProviders.slice(
    startIndex,
    startIndex + providersPerPage
  );

  // RESET FILTERS
  const resetFilters = () => {
    setSearch("");
    setServiceFilter("");
    setAvailabilityFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="verification-page">
      {/* HEADER */}
      <div className="verification-header">
        <div>
          <p className="verification-eyebrow">
            PROVIDER MANAGEMENT
          </p>

          <h1>Pending Provider Verification</h1>

          <span>
            Review registered provider profiles, request missing
            information, and approve or reject pending providers.
          </span>
        </div>

        <div className="verification-count">
          <strong>{providers.length}</strong>
          <span>Pending Providers</span>
        </div>
      </div>

      {/* FILTERS */}
      <div className="verification-toolbar">
        <input
          type="text"
          placeholder="Search name, email, phone or location..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setCurrentPage(1);
          }}
          aria-label="Search providers"
        />

        <select
          value={serviceFilter}
          onChange={(event) => {
            setServiceFilter(event.target.value);
            setCurrentPage(1);
          }}
          aria-label="Filter by service"
        >
          <option value="">All Services</option>

          {services.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>

        <select
          value={availabilityFilter}
          onChange={(event) => {
            setAvailabilityFilter(event.target.value);
            setCurrentPage(1);
          }}
          aria-label="Filter by availability"
        >
          <option value="">All Availability</option>
          <option value="Available">Available</option>
          <option value="Unavailable">Unavailable</option>
        </select>

        <button
          type="button"
          className="verification-reset-btn"
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="verification-error" role="alert">
          <span>{error}</span>

          <button type="button" onClick={getPendingProviders}>
            Retry
          </button>
        </div>
      )}

      {/* PROVIDER TABLE */}
      <div className="verification-table-container">
        <table className="verification-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Provider</th>
              <th>Service</th>
              <th>Location</th>
              <th>Experience</th>
              <th>Availability</th>
              <th>Profile Status</th>
              <th>Status</th>
              <th>Review</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="no-pending">
                  Loading providers...
                </td>
              </tr>
            ) : currentProviders.length > 0 ? (
              currentProviders.map((provider, index) => (
                <tr key={provider._id}>
                  <td>{startIndex + index + 1}</td>

                  <td>
                    <div className="verification-provider">
                      {getImage(provider) ? (
                        <img
                          className="verification-avatar verification-photo"
                          src={getImage(provider)}
                          alt={getProviderName(provider)}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";

                            if (event.currentTarget.nextElementSibling) {
                              event.currentTarget.nextElementSibling.style.display =
                                "flex";
                            }
                          }}
                        />
                      ) : null}

                      <div
                        className="verification-avatar"
                        style={{
                          display: getImage(provider) ? "none" : "flex",
                        }}
                      >
                        {getProviderName(provider)
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div className="verification-provider-info">
                        <strong>{getProviderName(provider)}</strong>
                        <span>{provider.phone || "No phone"}</span>
                      </div>
                    </div>
                  </td>

                  <td>{getServiceName(provider)}</td>

                  <td>{getLocation(provider)}</td>

                  <td>{getExperience(provider)}</td>

                  <td>
                    <span className="verification-availability">
                      {getAvailability(provider)}
                    </span>
                  </td>

                  <td>
                    <span
                      className={
                        isProfileIncomplete(provider)
                          ? "profile-incomplete"
                          : "profile-complete"
                      }
                      title={
                        isProfileIncomplete(provider)
                          ? `Missing: ${getMissingProfileFields(
                              provider
                            ).join(", ")}`
                          : "All checked profile fields are present"
                      }
                    >
                      {isProfileIncomplete(provider)
                        ? "Incomplete"
                        : "Complete"}
                    </span>
                  </td>

                  <td>
                    <span className="pending-status">
                      {provider.verificationStatus || "Pending"}
                    </span>
                  </td>

                  <td>
                    <div className="verification-actions">
                      <button
                        type="button"
                        className="verification-view-btn"
                        onClick={() => setSelectedProvider(provider)}
                      >
                        View Profile
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-pending">
                  <strong>No pending providers found.</strong>

                  <span>
                    No providers awaiting verification match your
                    search or selected filters.
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        {!loading && filteredProviders.length > 0 && (
          <div className="verification-pagination">
            <span>
              Showing {startIndex + 1}–
              {Math.min(
                startIndex + providersPerPage,
                filteredProviders.length
              )}{" "}
              of {filteredProviders.length}
            </span>

            <div className="verification-pagination-buttons">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() =>
                  setCurrentPage((page) => Math.max(1, page - 1))
                }
              >
                Previous
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  type="button"
                  key={page}
                  className={safePage === page ? "active-page" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PROVIDER DETAILS MODAL */}
      {selectedProvider && (
        <div
          className="verification-modal-overlay"
          onClick={() => setSelectedProvider(null)}
        >
          <div
            className="verification-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="verification-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="verification-modal-header">
              <div>
                <p>PROVIDER DETAILS</p>

                <h2 id="verification-modal-title">
                  {getProviderName(selectedProvider)}
                </h2>

                <span>ID: {selectedProvider._id}</span>
              </div>

              <button
                type="button"
                className="verification-modal-close"
                aria-label="Close details"
                onClick={() => setSelectedProvider(null)}
              >
                &times;
              </button>
            </div>

            <div className="verification-modal-body">
              {getImage(selectedProvider) && (
                <div className="verification-profile-image-wrap">
                  <img
                    src={getImage(selectedProvider)}
                    alt={getProviderName(selectedProvider)}
                  />
                </div>
              )}

              <div className="verification-detail-grid">
                <div className="verification-detail">
                  <span>Provider Name</span>
                  <strong>
                    {getProviderName(selectedProvider)}
                  </strong>
                </div>

                <div className="verification-detail">
                  <span>Phone</span>
                  <strong>
                    {selectedProvider.phone || "Not provided"}
                  </strong>
                </div>

                <div className="verification-detail">
                  <span>Email</span>
                  <strong>
                    {selectedProvider.email || "Not provided"}
                  </strong>
                </div>

                <div className="verification-detail">
                  <span>Category</span>
                  <strong>
                    {Array.isArray(selectedProvider.category)
                      ? selectedProvider.category.join(", ") ||
                        "Not provided"
                      : selectedProvider.category ||
                        selectedProvider.serviceCategory ||
                        "Not provided"}
                  </strong>
                </div>

                <div className="verification-detail">
                  <span>Service</span>
                  <strong>{getServiceName(selectedProvider)}</strong>
                </div>

                <div className="verification-detail">
                  <span>Location</span>
                  <strong>{getLocation(selectedProvider)}</strong>
                </div>

                <div className="verification-detail">
                  <span>Experience</span>
                  <strong>{getExperience(selectedProvider)}</strong>
                </div>

                <div className="verification-detail">
                  <span>Availability</span>
                  <strong>{getAvailability(selectedProvider)}</strong>
                </div>

                <div className="verification-detail">
                  <span>Verification Status</span>
                  <strong>
                    {selectedProvider.verificationStatus || "Pending"}
                  </strong>
                </div>

                <div className="verification-detail full-width">
                  <span>Description / About</span>
                  <p>
                    {selectedProvider.description ||
                      selectedProvider.about ||
                      "No additional information provided."}
                  </p>
                </div>

                <div className="verification-detail full-width">
                  <span>Address</span>
                  <p>
                    {selectedProvider.address ||
                      selectedProvider.location ||
                      "Not provided"}
                  </p>
                </div>
              </div>

              {/* PROFILE COMPLETION AND NOTIFICATION */}
              <section
                className={`verification-profile-review ${
                  isProfileIncomplete(selectedProvider)
                    ? "incomplete"
                    : "complete"
                }`}
              >
                <div className="verification-profile-review-copy">
                  <span className="verification-profile-review-eyebrow">
                    PROFILE COMPLETION
                  </span>

                  <h3>
                    {isProfileIncomplete(selectedProvider)
                      ? "Profile needs attention"
                      : "Profile information looks complete"}
                  </h3>

                  <p>
                    {isProfileIncomplete(selectedProvider)
                      ? `Missing information: ${getMissingProfileFields(
                          selectedProvider
                        ).join(", ")}`
                      : "All profile fields checked by this page have been provided."}
                  </p>
                </div>

                {isProfileIncomplete(selectedProvider) && (
                  <button
                    type="button"
                    className="verification-send-notification-btn"
                    disabled={updatingId === selectedProvider._id}
                    onClick={() =>
                      sendProfileReminder(selectedProvider)
                    }
                  >
                    {updatingId === selectedProvider._id
                      ? "Sending notification..."
                      : "Send Completion Notification"}
                  </button>
                )}
              </section>
            </div>

            {/* APPROVE / REJECT */}
            {selectedProvider.verificationStatus === "Pending" && (
              <div className="verification-modal-actions">
                <button
                  type="button"
                  className="approve-btn"
                  disabled={updatingId === selectedProvider._id}
                  onClick={() =>
                    updateVerification(
                      selectedProvider._id,
                      "Verified"
                    )
                  }
                >
                  Approve Provider
                </button>

                <button
                  type="button"
                  className="reject-btn"
                  disabled={updatingId === selectedProvider._id}
                  onClick={() =>
                    updateVerification(
                      selectedProvider._id,
                      "Rejected"
                    )
                  }
                >
                  Reject Provider
                </button>
              </div>
            )}

            <div className="verification-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedProvider(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Verification;
