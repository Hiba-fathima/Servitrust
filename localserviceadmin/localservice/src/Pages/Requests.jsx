import React, { useEffect, useState } from "react";
import axios from "axios";

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");



  const [currentPage, setCurrentPage] = useState(1);
    const servicesPerPage = 1;
  



  const getRequests = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/service-requests"
      );

      setRequests(response.data);

    } catch (error) {
      console.log("GET REQUESTS ERROR:", error);
    }
  };

  useEffect(() => {
    getRequests();
  }, []);

  const filteredRequests = requests.filter((request) => {
    const searchText = search.toLowerCase();

    return (
      request.customerName
        ?.toLowerCase()
        .includes(searchText) ||
      request.providerName
        ?.toLowerCase()
        .includes(searchText) ||
      request.serviceName
        ?.toLowerCase()
        .includes(searchText) ||
      request.location
        ?.toLowerCase()
        .includes(searchText)
    );
  });


  
  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;

  const currentServices = filteredRequests.slice(
    indexOfFirstService,
    indexOfLastService
  );

  const totalPages = Math.ceil(
    filteredRequests.length / servicesPerPage
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

  return (
    <div className="requests-page">

      <div className="requests-header">

        <div>
          <p>SERVICE MANAGEMENT</p>

          <h1>Service Requests</h1>

          <span>
            Monitor customer requests and provider assignments.
          </span>
        </div>

        <div className="requests-count">
          <strong>{requests.length}</strong>
          <span>Total Requests</span>
        </div>

      </div>


      <div className="requests-toolbar">

        <input
          type="text"
          placeholder="Search customer, provider, service or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>


      <div className="requests-table-container">

        <table className="requests-table">

          <thead>
            <tr>
              <th>#</th>
              <th>Customer</th>
              <th>Provider</th>
              <th>Service</th>
              <th>Date</th>
              <th>Time</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {filteredRequests.length > 0 ? (

              currentServices.map((request, index) => (

                <tr key={request._id}>

                  <td>{indexOfFirstService + index + 1}</td>

                  <td>
                    <div className="customer-cell">

                      <div className="customer-avatar">
                        {request.customerName
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <strong>
                          {request.customerName}
                        </strong>

                        <span>
                          {request.customerEmail}
                        </span>
                      </div>

                    </div>
                  </td>

                  <td>
                    <span className="provider-name">
                      {request.providerName}
                    </span>
                  </td>

                  <td>{request.serviceName}</td>

                  <td>{request.preferredDate}</td>

                  <td>{request.preferredTime}</td>

                  <td>{request.location}</td>

                  <td>
                    <span
                      className={`request-status ${request.status?.toLowerCase()}`}
                    >
                      {request.status}
                    </span>
                  </td>

                </tr>

              ))

            ) : (

              <tr>
                <td
                  colSpan="8"
                  className="no-requests"
                >
                  No service requests found.
                </td>
              </tr>

            )}

          </tbody>

        </table>

{filteredRequests.length > servicesPerPage && (
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

        

      </div>



      

    </div>
  );
};

export default Requests;