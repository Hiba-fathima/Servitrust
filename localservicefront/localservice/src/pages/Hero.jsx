import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Hero = () => {

  const navigate = useNavigate();

  const [service, setService] = useState("");
  const [location, setLocation] = useState("");

  const [services, setServices] = useState([]);
  const [results, setResults] = useState([]);

  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  // GET SERVICES
  useEffect(() => {

    const getServices = async () => {

      try {

        const response = await axios.get(
          "http://localhost:5000/services"
        );

        setServices(response.data);

      } catch (error) {

        console.log(
          "GET SERVICES ERROR:",
          error
        );

      }

    };

    getServices();

  }, []);


  // SEARCH
  const handleSearch = (e) => {

    e.preventDefault();

    if (!service.trim() && !location.trim()) {
      setShowResults(false);
      alert("Please enter a service or location");
      return;
    }

    setLoading(true);

    const serviceValue =
      service.trim().toLowerCase();

    const locationValue =
      location.trim().toLowerCase();


    const filtered = services.filter((item) => {

      const serviceName =
        item.name?.toLowerCase() || "";

      const category =
        item.category?.toLowerCase() || "";

      const serviceArea =
        item.serviceArea?.toLowerCase() || "";


      const serviceMatch =
        !serviceValue ||
        serviceName.includes(serviceValue) ||
        category.includes(serviceValue);


      const locationMatch =
        !locationValue ||
        serviceArea.includes(locationValue);


      return serviceMatch && locationMatch;

    });


    setResults(filtered);
    setShowResults(true);
    setLoading(false);

  };


  return (

    <div>

      <section className="hero">

        <div className="hero-content">

          <p className="hero-small-text">
            LOCAL SERVICES, MADE RELIABLE
          </p>


          <h1>
            Find Local Services
            <br />
            <span>You Can Trust</span>
          </h1>


          <p className="hero-description">
            Find reliable local professionals, compare their
            performance, request a service and track your work
            from start to finish.
          </p>


          {/* SEARCH */}

          <form
            className="hero-search"
            onSubmit={handleSearch}
          >

            <input
              type="text"
              placeholder="What service do you need?"
              value={service}
              onChange={(e) =>
                setService(e.target.value)
              }
            />


            <input
              type="text"
              placeholder="Enter your location"
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
            />


            <button type="submit">
              Search
            </button>

          </form>


          {/* SEARCH RESULTS */}

          {showResults && (

            <div className="hero-inline-results">

              {loading ? (

                <div className="hero-result-message">
                  Searching...
                </div>

              ) : results.length === 0 ? (

                <div className="hero-no-results">

                  <strong>
                    No matching services found
                  </strong>

                  <span>
                    Try another service or location.
                  </span>

                </div>

              ) : (

                <>
                  <div className="hero-results-title">
                    <span>
                      MATCHING SERVICES
                    </span>

                    <strong>
                      {results.length} found
                    </strong>
                  </div>


                  <div className="hero-results-list">

                    {results.map((item) => (

                      <div
                        className="hero-result-card"
                        key={item._id}
                      >

                        <div className="hero-result-left">

                          <div className="hero-result-icon">

                            {item.name
                              ?.charAt(0)
                              .toUpperCase()}

                          </div>


                          <div>

                            <h3>
                              {item.name}
                            </h3>

                            <p>
                              {item.category}
                              {item.serviceArea &&
                                ` • ${item.serviceArea}`}
                            </p>

                          </div>

                        </div>


                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/service/${item._id}`
                            )
                          }
                        >
                          View →
                        </button>

                      </div>

                    ))}

                  </div>
                </>

              )}

            </div>

          )}


          <div className="hero-features">

            <span>
              ✓ Verified Providers
            </span>

            <span>
              ✓ Reliability Scores
            </span>

            <span>
              ✓ Service Tracking
            </span>

          </div>

        </div>

      </section>

    </div>

  );
};

export default Hero;