import React, { useEffect, useState } from "react";
import axios from "axios";

const Verification = () => {
  const [providers, setProviders] = useState([]);

  const getPendingProviders = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/providers"
      );

      const pendingProviders = response.data.filter(
        (provider) =>
          provider.verificationStatus === "Pending"
      );

      setProviders(pendingProviders);
    } catch (error) {
      console.log("GET VERIFICATION ERROR:", error);
    }
  };

  useEffect(() => {
    getPendingProviders();
  }, []);

  const updateVerification = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:5000/providers/${id}/verification`,
        {
          verificationStatus: status
        }
      );

      alert(
        status === "Verified"
          ? "Provider approved successfully"
          : "Provider rejected"
      );

      getPendingProviders();

    } catch (error) {
      console.log("VERIFICATION ERROR:", error);

      alert(
        error.response?.data?.message ||
        "Failed to update verification"
      );
    }
  };

  return (
    <div className="verification-page">

      <div className="verification-header">
        <div>
          <p>PROVIDER VERIFICATION</p>

          <h1>Provider Verification</h1>

          <span>
            Review and verify service providers before they
            appear to customers.
          </span>
        </div>

        <div className="verification-count">
          <strong>{providers.length}</strong>
          <span>Pending</span>
        </div>
      </div>

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

            {providers.length > 0 ? (

              providers.map((provider, index) => (

                <tr key={provider._id}>

                  <td>{index + 1}</td>

                  <td>
                    <div className="verification-provider">

                      <div className="verification-avatar">
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

                  <td>{provider.availability}</td>

                  <td>
                    <span className="pending-status">
                      {provider.verificationStatus}
                    </span>
                  </td>

                  <td>
                    <div className="verification-actions">

                      <button
                        className="approve-btn"
                        onClick={() =>
                          updateVerification(
                            provider._id,
                            "Verified"
                          )
                        }
                      >
                        Approve
                      </button>

                      <button
                        className="reject-btn"
                        onClick={() =>
                          updateVerification(
                            provider._id,
                            "Rejected"
                          )
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
                <td
                  colSpan="8"
                  className="no-pending"
                >
                  No pending providers.
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default Verification;