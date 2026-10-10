import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "../Css/Services.css";

const API = "https://servitrust-baxkend.onrender.com/services";
const ITEMS_PER_PAGE = 8;

const Services = () => {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getServices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(API);
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.services || [];

      setServices(data);
    } catch (err) {
      console.error("GET SERVICES ERROR:", err);
      setError("Unable to load services. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getServices();
  }, []);

  const categories = useMemo(
    () => [
      ...new Set(
        services
          .map((service) => service.category)
          .filter(Boolean)
      ),
    ],
    [services]
  );

  const getServiceName = (service) =>
    service.name || service.title || "Unnamed Service";

  const getImage = (service) =>
    service.image ||
    service.imageUrl ||
    service.imageURL ||
    service.serviceImage ||
    "";

  const getPrice = (service) => {
    if (
      service.price === undefined ||
      service.price === null ||
      service.price === ""
    ) {
      return "Price not set";
    }

    const price = Number(service.price);

    return Number.isNaN(price)
      ? String(service.price)
      : `₹${price.toLocaleString("en-IN")}`;
  };

  const getPricing = (service) => {
    const price = getPrice(service);
    const pricingType = service.pricingType || service.priceType || "";

    if (price === "Price not set") {
      return pricingType || price;
    }

    return pricingType ? `${price} / ${pricingType}` : price;
  };

  const getDuration = (service) => {
    const duration = service.duration;

    if (
      duration === undefined ||
      duration === null ||
      String(duration).trim() === ""
    ) {
      return "Not specified";
    }

    const value = String(duration).trim();

    if (/\b(hours?|hrs?|minutes?|mins?|days?)\b/i.test(value)) {
      return value;
    }

    const numericDuration = Number(value);

    if (!Number.isNaN(numericDuration)) {
      return `${numericDuration} ${
        numericDuration === 1 ? "hour" : "hours"
      }`;
    }

    return value;
  };

  const getAvailability = (service) =>
    service.availability || "Available";

  const getServiceStatus = (service) => service.status || "Active";

  const filteredServices = services.filter((service) => {
    const searchText = search.toLowerCase();

    const matchesSearch = [
      getServiceName(service),
      service.category,
      service.description,
      service.serviceArea,
      service.location,
      service.pricingType,
    ].some((value) =>
      String(value || "").toLowerCase().includes(searchText)
    );

    const matchesCategory =
      !categoryFilter || service.category === categoryFilter;

    const matchesAvailability =
      !availabilityFilter ||
      getAvailability(service).toLowerCase() ===
        availabilityFilter.toLowerCase();

    const matchesStatus =
      !statusFilter ||
      getServiceStatus(service).toLowerCase() ===
        statusFilter.toLowerCase();

    return (
      matchesSearch &&
      matchesCategory &&
      matchesAvailability &&
      matchesStatus
    );
  });

  const totalPages = Math.ceil(
    filteredServices.length / ITEMS_PER_PAGE
  );

  const safePage = Math.min(
    currentPage,
    Math.max(totalPages, 1)
  );

  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;

  const currentServices = filteredServices.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setAvailabilityFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  const openView = (service) => {
    setSelectedService(service);
  };

  const closeView = () => {
    setSelectedService(null);
  };

  useEffect(() => {
    if (!selectedService) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") closeView();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [selectedService]);

  return (
    <div className="services-page">
      {/* PAGE HEADER */}
      <div className="services-header">
        <div>
          <p className="services-eyebrow">SERVICE MANAGEMENT</p>
          <h1>Services</h1>
          <span>
            Manage services, pricing, availability and service details.
          </span>
        </div>

        <div className="services-count">
          <strong>{services.length}</strong>
          <span>Total Services</span>
        </div>
      </div>

      {/* FILTERS */}
      <div className="services-toolbar">
        <input
          type="text"
          placeholder="Search services, category or location..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setCurrentPage(1);
          }}
          aria-label="Search services"
        />

        <select
          value={categoryFilter}
          onChange={(event) => {
            setCategoryFilter(event.target.value);
            setCurrentPage(1);
          }}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
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

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setCurrentPage(1);
          }}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <button
          type="button"
          className="services-reset-btn"
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>

      {error && (
        <div className="services-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={getServices}>
            Retry
          </button>
        </div>
      )}

      {/* SERVICES TABLE */}
      <div className="services-table-container">
        <table className="services-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Service Name</th>
              <th>Category</th>
              <th>Pricing</th>
              <th>Duration</th>
              <th>Service Area</th>
              <th>Availability</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="services-empty">
                  Loading services...
                </td>
              </tr>
            ) : currentServices.length > 0 ? (
              currentServices.map((service, index) => (
                <tr key={service._id || service.id || index}>
                  <td>{startIndex + index + 1}</td>

                  <td>
                    <div className="service-name-cell">
                      {getImage(service) ? (
                        <img
                          className="service-thumbnail"
                          src={getImage(service)}
                          alt={getServiceName(service)}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                            event.currentTarget.nextElementSibling.style.display =
                              "flex";
                          }}
                        />
                      ) : null}

                      <div
                        className="service-thumbnail-placeholder"
                        style={{
                          display: getImage(service) ? "none" : "flex",
                        }}
                        aria-hidden="true"
                      >
                        {getServiceName(service).charAt(0).toUpperCase()}
                      </div>

                      <strong>{getServiceName(service)}</strong>
                    </div>
                  </td>

                  <td>{service.category || "Not specified"}</td>

                  <td>
                    <span className="service-pricing">
                      {getPricing(service)}
                    </span>
                  </td>

                  <td>{getDuration(service)}</td>

                  <td>
                    {service.serviceArea ||
                      service.location ||
                      "Not specified"}
                  </td>

                  <td>
                    <span
                      className={`service-badge availability-${getAvailability(
                        service
                      )
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {getAvailability(service)}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`service-badge status-${getServiceStatus(
                        service
                      ).toLowerCase()}`}
                    >
                      {getServiceStatus(service)}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="service-view-btn"
                      onClick={() => openView(service)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="services-empty">
                  <strong>No services found</strong>
                  <span>
                    Try changing your search or filter selections.
                  </span>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        {!loading && filteredServices.length > 0 && (
          <div className="services-pagination">
            <span className="services-pagination-info">
              Showing {startIndex + 1}–
              {Math.min(
                startIndex + ITEMS_PER_PAGE,
                filteredServices.length
              )}{" "}
              of {filteredServices.length}
            </span>

            <div className="services-pagination-buttons">
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
                  className={
                    safePage === page ? "active-page" : ""
                  }
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

      {/* VIEW SERVICE MODAL */}
      {selectedService && (
        <div
          className="service-modal-overlay"
          onClick={closeView}
        >
          <div
            className="service-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="service-modal-header">
              <div>
                <p>SERVICE DETAILS</p>
                <h2 id="service-modal-title">
                  {getServiceName(selectedService)}
                </h2>
                <span>
                  ID: {selectedService._id || selectedService.id || "N/A"}
                </span>
              </div>

              <button
                type="button"
                className="service-modal-close"
                onClick={closeView}
                aria-label="Close service details"
              >
                &times;
              </button>
            </div>

            <div className="service-modal-body">
              {getImage(selectedService) && (
                <div className="service-modal-image-wrap">
                  <img
                    src={getImage(selectedService)}
                    alt={getServiceName(selectedService)}
                    className="service-modal-image"
                  />
                </div>
              )}

              <div className="service-detail-grid">
                <div className="service-detail-item">
                  <span>Service Name</span>
                  <strong>{getServiceName(selectedService)}</strong>
                </div>

                <div className="service-detail-item">
                  <span>Category</span>
                  <strong>
                    {selectedService.category || "Not specified"}
                  </strong>
                </div>

                <div className="service-detail-item">
                  <span>Pricing</span>
                  <strong>{getPricing(selectedService)}</strong>
                </div>

                <div className="service-detail-item">
                  <span>Duration</span>
                  <strong>{getDuration(selectedService)}</strong>
                </div>

                <div className="service-detail-item">
                  <span>Service Area</span>
                  <strong>
                    {selectedService.serviceArea ||
                      selectedService.location ||
                      "Not specified"}
                  </strong>
                </div>

                <div className="service-detail-item">
                  <span>Availability</span>
                  <strong>{getAvailability(selectedService)}</strong>
                </div>

                <div className="service-detail-item">
                  <span>Status</span>
                  <strong>{getServiceStatus(selectedService)}</strong>
                </div>

                <div className="service-detail-item">
                  <span>Emergency Service</span>
                  <strong>
                    {selectedService.emergencyService || "Not specified"}
                  </strong>
                </div>

                <div className="service-detail-item">
                  <span>Service Guarantee</span>
                  <strong>
                    {selectedService.serviceGuarantee || "Not specified"}
                  </strong>
                </div>

                <div className="service-detail-item full-width">
                  <span>Description</span>
                  <p>
                    {selectedService.description ||
                      "No description provided."}
                  </p>
                </div>

                <div className="service-detail-item full-width">
                  <span>Subservices</span>

                  {Array.isArray(selectedService.subServices) &&
                  selectedService.subServices.length > 0 ? (
                    <div className="service-subservices">
                      {selectedService.subServices.map(
                        (subservice, index) => (
                          <span key={`${subservice}-${index}`}>
                            {typeof subservice === "string"
                              ? subservice
                              : subservice.name || "Subservice"}
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <p>No subservices added.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="service-modal-footer">
              <button
                type="button"
                className="service-modal-close-btn"
                onClick={closeView}
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

export default Services;
