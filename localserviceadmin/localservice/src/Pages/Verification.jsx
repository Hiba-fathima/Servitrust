import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Css/Verification.css";

const API = "https://servitrust-baxkend.onrender.com/providers";

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

  const getPendingProviders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API);
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.providers || [];

      const pendingProviders = data.filter(
        (provider) => provider.verificationStatus === "Pending"
      );

      setProviders(pendingProviders);
    } catch (err) {
      console.error("GET VERIFICATION ERROR:", err);
      setError("Unable to load pending providers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPendingProviders();
  }, []);

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

      setProviders((previous) =>
        previous.filter((provider) => provider._id !== id)
      );

      setSelectedProvider((previous) =>
        previous?._id === id
          ? { ...previous, verificationStatus: status }
          : previous
      );

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

  const getProviderName = (provider) =>
    provider.name || provider.fullName || "Unnamed Provider";

  const getServiceName = (provider) => {
    if (typeof provider.service === "string") {
      return provider.service || "Not specified";
    }

    if (provider.service && typeof provider.service === "object") {
      return (
        provider.service.name ||
        provider.service.title ||
        "Not specified"
      );
    }

    return provider.serviceName || "Not specified";
  };

  const getLocation = (provider) =>
    provider.location || provider.serviceArea || "Not specified";

  const getAvailability = (provider) =>
    provider.availability || "Not specified";

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

  const getImage = (provider) =>
    provider.image ||
    provider.profileImage ||
    provider.profilePicture ||
    provider.imageUrl ||
    "";

  const services = [
    ...new Set(
      providers.map(getServiceName).filter(
        (service) => service !== "Not specified"
      )
    ),
  ];

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

          <h1>Provider Verification</h1>

          <span>
            Review provider information before approving registration.
          </span>
        </div>

        <div className="verification-count">
          <strong>{providers.length}</strong>
          <span>Pending Verification</span>
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

      {error && (
        <div className="verification-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={getPendingProviders}>
            Retry
          </button>
        </div>
      )}

      {/* TABLE */}
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
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="no-pending">
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
                            event.currentTarget.nextElementSibling.style.display =
                              "flex";
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
                        View
                      </button>

                      <button
                        type="button"
                        className="approve-btn"
                        disabled={updatingId === provider._id}
                        onClick={() =>
                          updateVerification(provider._id, "Verified")
                        }
                      >
                        {updatingId === provider._id
                          ? "Saving..."
                          : "Approve"}
                      </button>

                      <button
                        type="button"
                        className="reject-btn"
                        disabled={updatingId === provider._id}
                        onClick={() =>
                          updateVerification(provider._id, "Rejected")
                        }
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-pending">
                  <strong>No pending providers found.</strong>
                  <span>
                    All matching providers have been reviewed, or your
                    filters returned no results.
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
                  <strong>{getProviderName(selectedProvider)}</strong>
                </div>

                <div className="verification-detail">
                  <span>Phone</span>
                  <strong>{selectedProvider.phone || "Not provided"}</strong>
                </div>

                <div className="verification-detail">
                  <span>Email</span>
                  <strong>{selectedProvider.email || "Not provided"}</strong>
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
            </div>

            {selectedProvider.verificationStatus === "Pending" && (
              <div className="verification-modal-actions">
                <button
                  type="button"
                  className="approve-btn"
                  disabled={updatingId === selectedProvider._id}
                  onClick={() =>
                    updateVerification(selectedProvider._id, "Verified")
                  }
                >
                  Approve Provider
                </button>

                <button
                  type="button"
                  className="reject-btn"
                  disabled={updatingId === selectedProvider._id}
                  onClick={() =>
                    updateVerification(selectedProvider._id, "Rejected")
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
