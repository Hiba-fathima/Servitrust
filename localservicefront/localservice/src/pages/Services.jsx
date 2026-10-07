import React, { useEffect, useState } from "react";
import axios from "axios";
import ServiceCard from "./ServiceCard";

const Services = () => {
  const [services, setServices] = useState([]);

  // Search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 4;

  const getServices = async () => {
    try {
      const response = await axios.get(
        "https://servitrust-baxkend.onrender.com/services"
      );

      setServices(response.data);
    } catch (error) {
      console.log("Error fetching services:", error);
    }
  };

  useEffect(() => {
    getServices();
  }, []);

  // Get unique categories
  const categories = [
    "All",
    ...new Set(services.map((service) => service.category))
  ];

  // Filter services
  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      service.description
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      service.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Pagination
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService =
    indexOfLastService - servicesPerPage;

  const currentServices = filteredServices.slice(
    indexOfFirstService,
    indexOfLastService
  );

  const totalPages = Math.ceil(
    filteredServices.length / servicesPerPage
  );

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset page when searching/filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  return (
    <div>
      <section className="services-section">

        <div className="section-heading">
          <p>POPULAR SERVICES</p>

          <h2>Services for your everyday needs</h2>

          <span>
            Find trusted professionals for different types of work.
          </span>
        </div>

        {/* Search and Category Filter */}

        <div className="service-search-area">

          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>

        </div>

        {/* Services */}

        <div className="services-grid">

          {currentServices.length > 0 ? (

            currentServices.map((service) => (
              <ServiceCard
                key={service._id}
                id={service._id}
                image={service.image}
                title={service.name}
                description={service.description}
              />
            ))

          ) : (

            <div className="no-services">
              No services found.
            </div>

          )}

        </div>

        {/* Pagination */}

        {filteredServices.length > servicesPerPage && (

          <div className="pagination">

            <button
              onClick={previousPage}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => goToPage(index + 1)}
                  className={
                    currentPage === index + 1
                      ? "active-page"
                      : ""
                  }
                >
                  {index + 1}
                </button>
              )
            )}

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
            >
              Next
            </button>

          </div>
        )}

      </section>
    </div>
  );
};

export default Services;