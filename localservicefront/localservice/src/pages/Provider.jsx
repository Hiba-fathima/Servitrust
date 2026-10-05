import React, {
  useEffect,
  useState
} from "react";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Css/Provider.css";


const ProviderProfile = () => {

  const navigate = useNavigate();

  const [servicesList, setServicesList] =
    useState([]);

  const [provider, setProvider] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [isEditing, setIsEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [formData, setFormData] =
    useState({
      name: "",
      phone: "",
      category: [],
      services: [],
      experience: "",
      location: "",
      description: "",
      availability: "Available"
    });


  const userId =
    localStorage.getItem("userId");


  // =========================================================
  // GET SERVICES + PROVIDER PROFILE
  // =========================================================

  useEffect(() => {

    const loadData = async () => {

      try {

        const servicesResponse =
          await axios.get(
            "http://localhost:5000/services"
          );

        setServicesList(
          servicesResponse.data
        );


        try {

          const providerResponse =
            await axios.get(
              `http://localhost:5000/providers/user/${userId}`
            );

          const providerData =
            providerResponse.data;

          setProvider(
            providerData
          );
setFormData({
  name: providerData.name || "",
  phone: providerData.phone || "",

  category: Array.isArray(providerData.category)
    ? providerData.category
    : providerData.category
      ? [providerData.category]
      : [],

  services: Array.isArray(providerData.services)
    ? providerData.services
    : providerData.services
      ? [providerData.services]
      : [],

  experience: providerData.experience || "",
  location: providerData.location || "",
  description: providerData.description || "",
  availability: providerData.availability || "Available"
});

        } catch (providerError) {

          if (
            providerError.response?.status ===
            404
          ) {

            // Provider profile does not exist yet.
            // Show onboarding form.

            setProvider(null);
            setIsEditing(false);

          } else {

            console.log(
              "GET PROVIDER ERROR:",
              providerError
            );

          }

        }

      } catch (error) {

        console.log(
          "LOAD PROFILE DATA ERROR:",
          error
        );

      } finally {

        setLoading(false);

      }

    };


    if (userId) {

      loadData();

    } else {

      navigate("/login");

    }

  }, [userId, navigate]);


  // =========================================================
  // NORMAL INPUT CHANGE
  // =========================================================

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value
    });

  };


  // =========================================================
  // UNIQUE CATEGORIES
  // =========================================================

  const categories = [
    ...new Set(
      servicesList
        .map(
          (item) =>
            item.category
        )
        .filter(Boolean)
    )
  ];


  // =========================================================
  // CATEGORY CHANGE
  // =========================================================

  const handleCategoryChange =
    (categoryName) => {

      const alreadySelected =
        formData.category.includes(
          categoryName
        );


      if (alreadySelected) {

        const updatedCategories =
          formData.category.filter(
            (item) =>
              item !== categoryName
          );


        const servicesToRemove =
          servicesList
            .filter(
              (item) =>
                item.category ===
                categoryName
            )
            .map(
              (item) =>
                item.name
            );


        const updatedServices =
          formData.services.filter(
            (serviceName) =>
              !servicesToRemove.includes(
                serviceName
              )
          );


        setFormData({
          ...formData,

          category:
            updatedCategories,

          services:
            updatedServices
        });

      } else {

        setFormData({

          ...formData,

          category: [
            ...formData.category,
            categoryName
          ]

        });

      }

    };


  // =========================================================
  // SERVICE CHANGE
  // =========================================================

  const handleServiceChange =
    (serviceName) => {

      const alreadySelected =
        formData.services.includes(
          serviceName
        );


      if (alreadySelected) {

        setFormData({

          ...formData,

          services:
            formData.services.filter(
              (item) =>
                item !== serviceName
            )

        });

      } else {

        setFormData({

          ...formData,

          services: [
            ...formData.services,
            serviceName
          ]

        });

      }

    };


  // =========================================================
  // GET SERVICES FOR CATEGORY
  // =========================================================

  const getCategoryServices =
    (categoryName) => {

      return servicesList.filter(
        (item) =>
          item.category ===
          categoryName
      );

    };


  // =========================================================
  // GET SERVICE DETAILS
  // =========================================================

  const getServiceDetails =
    (serviceName) => {

      return servicesList.find(
        (item) =>
          item.name === serviceName
      );

    };


  // =========================================================
  // START EDITING
  // =========================================================

  const handleEdit = () => {

    setIsEditing(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  };


  // =========================================================
  // CANCEL EDIT
  // =========================================================

  const handleCancelEdit = () => {

    if (!provider) {
      return;
    }

    setFormData({

      name:
        provider.name || "",

      phone:
        provider.phone || "",

      category:
        Array.isArray(provider.category)
          ? provider.category
          : [],

      services:
        Array.isArray(provider.services)
          ? provider.services
          : [],

      experience:
        provider.experience || "",

      location:
        provider.location || "",

      description:
        provider.description || "",

      availability:
        provider.availability ||
        "Available"

    });

    setIsEditing(false);

  };


  // =========================================================
  // SUBMIT / UPDATE PROFILE
  // =========================================================

  const handleSubmit =
    async (e) => {

      e.preventDefault();


      if (
        formData.category.length ===
        0
      ) {

        alert(
          "Please select at least one service category"
        );

        return;

      }


      if (
        formData.services.length ===
        0
      ) {

        alert(
          "Please select at least one service"
        );

        return;

      }


      if (!userId) {

        alert(
          "User ID not found. Please login again."
        );

        return;

      }


      try {

        setSaving(true);


        // =================================================
        // CREATE PROFILE
        // =================================================

        if (!provider) {

          const response =
            await axios.post(
              "http://localhost:5000/providers",
              {
                ...formData,
                userId
              }
            );


          alert(
            response.data.message
          );


          // Load updated profile

          const profileResponse =
            await axios.get(
              `http://localhost:5000/providers/user/${userId}`
            );


          setProvider(
            profileResponse.data
          );

          setFormData({

            name:
              profileResponse.data.name ||
              "",

            phone:
              profileResponse.data.phone ||
              "",

            category:
              profileResponse.data.category ||
              [],

            services:
              profileResponse.data.services ||
              [],

            experience:
              profileResponse.data.experience ||
              "",

            location:
              profileResponse.data.location ||
              "",

            description:
              profileResponse.data.description ||
              "",

            availability:
              profileResponse.data.availability ||
              "Available"

          });

          setIsEditing(false);

          navigate(
            "/provider/dashboard"
          );

          return;

        }


        // =================================================
        // UPDATE EXISTING PROFILE
        // =================================================

        const response =
          await axios.put(
            `http://localhost:5000/providers/${provider._id}`,
            formData
          );


        alert(
          response.data.message
        );


        setProvider(
          response.data.provider
        );


        setFormData({

          name:
            response.data.provider.name ||
            "",

          phone:
            response.data.provider.phone ||
            "",

          category:
            response.data.provider.category ||
            [],

          services:
            response.data.provider.services ||
            [],

          experience:
            response.data.provider.experience ||
            "",

          location:
            response.data.provider.location ||
            "",

          description:
            response.data.provider.description ||
            "",

          availability:
            response.data.provider.availability ||
            "Available"

        });


        setIsEditing(false);

      } catch (error) {

        console.log(
          "PROVIDER PROFILE ERROR:",
          error
        );

        console.log(
          "BACKEND RESPONSE:",
          error.response?.data
        );


        alert(
          error.response?.data?.message ||
          "Failed to save provider profile"
        );

      } finally {

        setSaving(false);

      }

    };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="provider-profile-loading">
        Loading profile...
      </div>
    );

  }


  // =========================================================
  // EXISTING PROVIDER — VIEW MODE
  // =========================================================

  if (
    provider &&
    !isEditing
  ) {

    return (

      <div className="provider-profile-page">


        {/* HEADER */}

        <div className="provider-profile-header provider-view-header">

          <div>

            <p>
              MY ACCOUNT
            </p>

            <h1>
              My Profile
            </h1>

            <span>
              View your provider information and professional details.
            </span>

          </div>


          <button
            type="button"
            className="provider-edit-profile-btn"
            onClick={handleEdit}
          >
            Edit Profile
          </button>

        </div>


        {/* PROFILE SUMMARY */}

        <div className="provider-detail-card">

          <div className="provider-detail-top">

            <div className="provider-detail-avatar">
              {provider.name
                ? provider.name
                    .charAt(0)
                    .toUpperCase()
                : "P"}
            </div>


            <div className="provider-detail-heading">

              <h2>
                {provider.name ||
                  "Provider"}
              </h2>

              <p>
                {provider.location ||
                  "Location not added"}
              </p>

              <span
                className={
                  provider.verificationStatus ===
                  "Verified"
                    ? "provider-verification verified"
                    : "provider-verification"
                }
              >
                {provider.verificationStatus ||
                  "Pending"}
              </span>

            </div>

          </div>

        </div>


        {/* PERSONAL INFORMATION */}

        <div className="provider-detail-card">

          <div className="provider-detail-section-title">

            <p>
              PERSONAL INFORMATION
            </p>

            <h2>
              Contact Details
            </h2>

          </div>


          <div className="provider-detail-grid">

            <div className="provider-detail-item">

              <span>
                Full Name
              </span>

              <strong>
                {provider.name || "-"}
              </strong>

            </div>


            <div className="provider-detail-item">

              <span>
                Phone
              </span>

              <strong>
                {provider.phone || "-"}
              </strong>

            </div>


            <div className="provider-detail-item">

              <span>
                Email
              </span>

              <strong>
                {provider.email || "-"}
              </strong>

            </div>


            <div className="provider-detail-item">

              <span>
                Service Location
              </span>

              <strong>
                {provider.location || "-"}
              </strong>

            </div>

          </div>

        </div>


        {/* PROFESSIONAL INFORMATION */}

        <div className="provider-detail-card">

          <div className="provider-detail-section-title">

            <p>
              PROFESSIONAL INFORMATION
            </p>

            <h2>
              Your Services
            </h2>

          </div>


          <div className="provider-detail-item-full">

            <span>
              Categories
            </span>

            <div className="provider-detail-tags">

              {provider.category?.map(
                (category, index) => (

                  <span key={index}>
                    {category}
                  </span>

                )
              )}

            </div>

          </div>


          <div className="provider-detail-item-full service-detail-list">

            <span>
              Services You Provide
            </span>


            <div className="provider-service-detail-list">

              {provider.services?.map(
                (serviceName) => {

                  const service =
                    getServiceDetails(
                      serviceName
                    );

                  return (

                    <div
                      key={serviceName}
                      className="provider-service-detail"
                    >

                      <strong>
                        {serviceName}
                      </strong>


                      {service?.subServices &&
                        service.subServices.length >
                          0 && (

                        <div>

                          <span>
                            Sub Services
                          </span>

                          <div className="provider-detail-tags">

                            {service.subServices.map(
                              (
                                subService,
                                index
                              ) => (

                                <span
                                  key={index}
                                >
                                  {subService}
                                </span>

                              )
                            )}

                          </div>

                        </div>

                      )}

                    </div>

                  );

                }
              )}

            </div>

          </div>

        </div>


        {/* EXPERIENCE + AVAILABILITY */}

        <div className="provider-detail-card">

          <div className="provider-detail-section-title">

            <p>
              PROFESSIONAL STATUS
            </p>

            <h2>
              Experience & Availability
            </h2>

          </div>


          <div className="provider-detail-grid">

            <div className="provider-detail-item">

              <span>
                Experience
              </span>

              <strong>
                {provider.experience ||
                  "-"}
              </strong>

            </div>


            <div className="provider-detail-item">

              <span>
                Availability
              </span>

              <strong>
                {provider.availability ||
                  "-"}
              </strong>

            </div>

          </div>

        </div>


        {/* DESCRIPTION */}

        <div className="provider-detail-card">

          <div className="provider-detail-section-title">

            <p>
              ABOUT
            </p>

            <h2>
              Professional Description
            </h2>

          </div>


          <p className="provider-detail-description">

            {provider.description ||
              "No description added."}

          </p>

        </div>


        {/* PERFORMANCE */}

        <div className="provider-detail-card">

          <div className="provider-detail-section-title">

            <p>
              SERVITRUST PERFORMANCE
            </p>

            <h2>
              Provider Overview
            </h2>

          </div>


          <div className="provider-detail-stats">

            <div>
              <strong>
                {provider.reliabilityScore ??
                  0}
              </strong>

              <span>
                Reliability Score
              </span>
            </div>


            <div>
              <strong>
                {provider.completedServices ??
                  0}
              </strong>

              <span>
                Completed Services
              </span>
            </div>


            <div>
              <strong>
                {provider.cancelledServices ??
                  0}
              </strong>

              <span>
                Cancellations
              </span>
            </div>


            <div>
              <strong>
                {provider.averageRating ??
                  0}
              </strong>

              <span>
                Average Rating
              </span>
            </div>


            <div>
              <strong>
                {provider.complaints ??
                  0}
              </strong>

              <span>
                Complaints
              </span>
            </div>

          </div>

        </div>

      </div>

    );

  }


  // =========================================================
  // ONBOARDING / EDIT FORM
  // =========================================================

  return (

    <div className="provider-profile-page">


      {/* HEADER */}

      <div className="provider-profile-header">

        <div>

          <p>
            {provider
              ? "EDIT PROVIDER PROFILE"
              : "PROVIDER ONBOARDING"}
          </p>

          <h1>

            {provider
              ? "Edit Your Profile"
              : "Complete Your Provider Profile"}

          </h1>

          <span>

            {provider
              ? "Update the information customers see on your provider profile."
              : "Tell customers about your services and experience."}

          </span>

        </div>


        {provider && (

          <button
            type="button"
            className="provider-cancel-edit-btn"
            onClick={handleCancelEdit}
          >
            Cancel
          </button>

        )}

      </div>


      {/* FORM */}

      <form
        className="provider-profile-form"
        onSubmit={handleSubmit}
      >


        <div className="form-section">


          {/* SECTION TITLE */}

          <div className="form-section-title">

            <span>
              01
            </span>

            <div>

              <h2>
                Provider Information
              </h2>

              <p>
                Enter the information customers will see.
              </p>

            </div>

          </div>


          {/* NAME + PHONE */}

          <div className="form-row">

            <div className="form-group">

              <label>
                Full Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
              />

            </div>


            <div className="form-group">

              <label>
                Phone
              </label>

              <input
                type="text"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />

            </div>

          </div>


          {/* CATEGORIES */}

          <div className="form-group full-width">

            <label>
              Service Categories
            </label>

            <p className="service-selection-help">
              Select one or more categories that match the services you provide.
            </p>


            <div className="provider-category-selection">

              {categories.length === 0 ? (

                <div className="no-category-services">

                  <p>
                    No service categories available.
                  </p>

                </div>

              ) : (

                categories.map(
                  (category) => (

                    <label
                      key={category}
                      className={
                        formData.category.includes(
                          category
                        )
                          ? "provider-category-option selected"
                          : "provider-category-option"
                      }
                    >

                      <input
                        type="checkbox"
                        checked={
                          formData.category.includes(
                            category
                          )
                        }
                        onChange={() =>
                          handleCategoryChange(
                            category
                          )
                        }
                      />

                      <span>
                        {category}
                      </span>

                    </label>

                  )
                )

              )}

            </div>


            {formData.category.length > 0 && (

              <div className="selected-categories">

                <span>
                  Selected Categories:
                </span>

                {formData.category.map(
                  (category) => (

                    <span
                      key={category}
                      className="selected-category-tag"
                    >
                      {category}
                    </span>

                  )
                )}

              </div>

            )}

          </div>


          {/* SERVICES */}

          {formData.category.length > 0 && (

            <div className="form-group full-width">

              <label>
                Services You Provide
              </label>

              <p className="service-selection-help">
                Select the services you provide under each selected category.
              </p>


              <div className="provider-category-services">

                {formData.category.map(
                  (categoryName) => {

                    const categoryServices =
                      getCategoryServices(
                        categoryName
                      );


                    return (

                      <div
                        key={categoryName}
                        className="provider-category-block"
                      >

                        <div className="provider-category-title">

                          <span>
                            CATEGORY
                          </span>

                          <h3>
                            {categoryName}
                          </h3>

                        </div>


                        {categoryServices.length === 0 ? (

                          <p className="no-subservices-text">
                            No services available under this category.
                          </p>

                        ) : (

                          <div className="provider-services-selection">

                            {categoryServices.map(
                              (item) => (

                                <div
                                  key={item._id}
                                  className="provider-service-option"
                                >

                                  <label className="service-checkbox">

                                    <input
                                      type="checkbox"
                                      checked={
                                        formData.services.includes(
                                          item.name
                                        )
                                      }
                                      onChange={() =>
                                        handleServiceChange(
                                          item.name
                                        )
                                      }
                                    />

                                    <span className="main-service-name">
                                      {item.name}
                                    </span>

                                  </label>


                                  {item.subServices &&
                                    item.subServices.length >
                                      0 && (

                                    <div className="provider-subservices">

                                      <p className="subservices-heading">
                                        Sub Services
                                      </p>

                                      <div className="subservices-list">

                                        {item.subServices.map(
                                          (
                                            subService,
                                            index
                                          ) => (

                                            <span
                                              key={index}
                                              className="provider-subservice-tag"
                                            >
                                              {subService}
                                            </span>

                                          )
                                        )}

                                      </div>

                                    </div>

                                  )}


                                  {(!item.subServices ||
                                    item.subServices.length ===
                                      0) && (

                                    <div className="no-subservices-text">
                                      No sub-services added for this service.
                                    </div>

                                  )}

                                </div>

                              )
                            )}

                          </div>

                        )}

                      </div>

                    );

                  }
                )}

              </div>


              {formData.services.length > 0 && (

                <div className="selected-services">

                  <span>
                    Selected Services:
                  </span>

                  {formData.services.map(
                    (service) => (

                      <span
                        className="selected-service-tag"
                        key={service}
                      >
                        {service}
                      </span>

                    )
                  )}

                </div>

              )}

            </div>

          )}


          {/* EXPERIENCE + LOCATION */}

          <div className="form-row">

            <div className="form-group">

              <label>
                Experience
              </label>

              <input
                type="text"
                name="experience"
                placeholder="Example: 5 Years"
                value={formData.experience}
                onChange={handleChange}
                required
              />

            </div>


            <div className="form-group">

              <label>
                Service Location
              </label>

              <input
                type="text"
                name="location"
                placeholder="Example: Calicut"
                value={formData.location}
                onChange={handleChange}
                required
              />

            </div>

          </div>


          {/* DESCRIPTION */}

          <div className="form-group full-width">

            <label>
              About Your Service
            </label>

            <textarea
              name="description"
              placeholder="Describe your service, experience and the type of work you provide..."
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
            />

          </div>


          {/* AVAILABILITY */}

          <div className="form-group full-width">

            <label>
              Availability
            </label>

            <select
              name="availability"
              value={formData.availability}
              onChange={handleChange}
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

        </div>


        {/* FOOTER */}

        <div className="provider-profile-footer">

          <div className="verification-note">

            <strong>
              Verification
            </strong>

            <p>
              Your profile will be reviewed by ServiTrust before it becomes visible to customers.
            </p>

          </div>


          <button
            type="submit"
            className="submit-provider-btn"
            disabled={saving}
          >

            {saving
              ? "Saving..."
              : provider
              ? "Save Changes"
              : "Submit Profile"}

            <span>
              →
            </span>

          </button>

        </div>

      </form>

    </div>

  );

};

export default ProviderProfile;