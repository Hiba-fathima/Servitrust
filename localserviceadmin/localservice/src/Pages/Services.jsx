import React, { useEffect, useState } from "react";
import axios from "axios";

function Services() {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [subService, setSubService] = useState("");
  const [subServices, setSubServices] = useState([]);
  const [price, setPrice] = useState("");
  const [pricingType, setPricingType] = useState("Starting From");
  const [duration, setDuration] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [availability, setAvailability] = useState("Available");
  const [emergencyService, setEmergencyService] = useState("No");
  const [serviceGuarantee, setServiceGuarantee] = useState("No Warranty");
  const [status, setStatus] = useState("Active");

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [editId, setEditId] = useState(null);


  const [currentPage, setCurrentPage] = useState(1);
  const servicesPerPage = 3;

  const [searchTerm, setSearchTerm] = useState("");

  const getServices = async () => {
    try {
      const response = await axios.get(
        "https://servitrust-baxkend.onrender.com/services"
      );

      setServices(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getServices();
  }, []);

  const handleImageChange = (e) => {
    const selectedImage = e.target.files[0];

    if (selectedImage) {
      setImage(selectedImage);
      setImagePreview(URL.createObjectURL(selectedImage));
    }
  };

  const addSubService = () => {
    if (subService.trim() !== "") {
      setSubServices([
        ...subServices,
        subService.trim()
      ]);

      setSubService("");
    }
  };

  const removeSubService = (index) => {
    const updated = subServices.filter(
      (_, i) => i !== index
    );

    setSubServices(updated);
  };

  const resetForm = () => {
    setServiceName("");
    setCategory("");
    setServiceDescription("");
    setSubService("");
    setSubServices([]);
    setPrice("");
    setPricingType("Starting From");
    setDuration("");
    setServiceArea("");
    setAvailability("Available");
    setEmergencyService("No");
    setServiceGuarantee("No Warranty");
    setStatus("Active");

    setImage(null);
    setImagePreview("");
    setEditId(null);
  };

  const uploadImage = async () => {
    if (!image) {
      return "";
    }

    const formData = new FormData();

    formData.append("file", image);
    formData.append(
      "upload_preset",
      "firstimage"
    );

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/vt3f7rep/image/upload",
        formData
      );

      return response.data.secure_url;
    } catch (error) {
      console.log("IMAGE UPLOAD ERROR:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = imagePreview;

      if (image) {
        imageUrl = await uploadImage();
      }

      const data = {
        name: serviceName,
        category: category,
        description: serviceDescription,
        subServices: subServices,
        price: price,
        pricingType: pricingType,
        duration: duration,
        serviceArea: serviceArea,
        availability: availability,
        emergencyService: emergencyService,
        serviceGuarantee: serviceGuarantee,
        status: status,
        image: imageUrl
      };

      if (editId) {
        await axios.put(
          `https://servitrust-baxkend.onrender.com/services/${editId}`,
          data
        );

        alert("Service updated successfully");
      } else {
        await axios.post(
          "https://servitrust-baxkend.onrender.com/services",
          data
        );

        alert("Service added successfully");
      }

      getServices();

      resetForm();
      setShowForm(false);

    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
        "Something went wrong"
      );
    }
  };

  const editService = (service) => {
    setEditId(service._id);

    setServiceName(service.name);
    setCategory(service.category);
    setServiceDescription(service.description);
    setSubServices(service.subServices || []);
    setPrice(service.price);
    setPricingType(service.pricingType);
    setDuration(service.duration);
    setServiceArea(service.serviceArea);
    setAvailability(service.availability);
    setEmergencyService(service.emergencyService);
    setServiceGuarantee(service.serviceGuarantee);
    setStatus(service.status);

    setImage(null);
    setImagePreview(service.image || "");

    setShowForm(true);
  };

  const deleteService = async (id) => {
    try {
      const response = await axios.delete(
        `https://servitrust-baxkend.onrender.com/services/${id}`
      );

      alert(response.data.message);

      setServices(
        services.filter(
          (service) => service._id !== id
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

const filteredServices = services.filter((service) => {
  const search = searchTerm.toLowerCase();

  return (
    service.name?.toLowerCase().includes(search) ||
    service.category?.toLowerCase().includes(search)
  );
});

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;

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

  return (
    <div className="services-page">

      <div className="page-header">
        <div>
          <h1>Services</h1>
          <p>Manage local services on ServiTrust</p>
        </div>

        <button
          className="add-btn"
          onClick={() => setShowForm(true)}
        >
          + Add Service
        </button>
      </div>



      <div className="service-search">
  <input
    type="text"
    placeholder="Search services or categories..."
    value={searchTerm}
    onChange={(e) => {
      setSearchTerm(e.target.value);
      setCurrentPage(1);
    }}
  />
</div>



      {showForm && (
        <div className="form-container">

          <h2>
            {editId
              ? "Edit Service"
              : "Add New Service"}
          </h2>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div className="input-box">
                <label>Service Name</label>

                <input
                  type="text"
                  value={serviceName}
                  onChange={(e) =>
                    setServiceName(e.target.value)
                  }
                  placeholder="Example: AC Repair"
                  required
                />
              </div>

              <div className="input-box">
                <label>Category</label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  required
                >
                  <option value="">
                    Select Category
                  </option>

                  <option value="Home Maintenance">
                    Home Maintenance
                  </option>

                  <option value="Cleaning">
                    Cleaning
                  </option>

                  <option value="Plumbing">
                    Plumbing
                  </option>

                  <option value="Electrical">
                    Electrical
                  </option>

                  <option value="AC Services">
                    AC Services
                  </option>

                  <option value="Appliance Repair">
                    Appliance Repair
                  </option>

                  <option value="Painting">
                    Painting
                  </option>

                  <option value="Carpentry">
                    Carpentry
                  </option>

                  <option value="Pest Control">
                    Pest Control
                  </option>

                  <option value="Vehicle Services">
                    Vehicle Services
                  </option>

                  <option value="Gardening">
                    Gardening
                  </option>
                </select>
              </div>

              <div className="input-box">
                <label>Service Image</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />

                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Service Preview"
                    className="image-preview"
                  />
                )}
              </div>

              <div className="input-box full">
                <label>Description</label>

                <textarea
                  value={serviceDescription}
                  onChange={(e) =>
                    setServiceDescription(
                      e.target.value
                    )
                  }
                  placeholder="Describe the service"
                  required
                ></textarea>
              </div>

              <div className="input-box full">
                <label>Sub Services</label>

                <div className="sub-input">

                  <input
                    type="text"
                    value={subService}
                    onChange={(e) =>
                      setSubService(e.target.value)
                    }
                    placeholder="Example: AC Cleaning"
                  />

                  <button
                    type="button"
                    onClick={addSubService}
                  >
                    Add
                  </button>

                </div>

                <div className="sub-list">

                  {subServices.map(
                    (item, index) => (
                      <span
                        className="sub-tag"
                        key={index}
                      >
                        {item}

                        <button
                          type="button"
                          onClick={() =>
                            removeSubService(index)
                          }
                        >
                          ×
                        </button>
                      </span>
                    )
                  )}

                </div>
              </div>

              <div className="input-box">
                <label>Starting Price</label>

                <input
                  type="number"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value)
                  }
                  placeholder="₹ 500"
                  required
                />
              </div>

              <div className="input-box">
                <label>Pricing Type</label>

                <select
                  value={pricingType}
                  onChange={(e) =>
                    setPricingType(e.target.value)
                  }
                >
                  <option value="Fixed Price">
                    Fixed Price
                  </option>

                  <option value="Starting From">
                    Starting From
                  </option>

                  <option value="Hourly">
                    Hourly
                  </option>

                  <option value="Inspection & Quote">
                    Inspection & Quote
                  </option>
                </select>
              </div>

              <div className="input-box">
                <label>Estimated Duration</label>

                <input
                  type="text"
                  value={duration}
                  onChange={(e) =>
                    setDuration(e.target.value)
                  }
                  placeholder="1 - 2 Hours"
                  required
                />
              </div>

              <div className="input-box">
                <label>Service Area</label>

                <input
                  type="text"
                  value={serviceArea}
                  onChange={(e) =>
                    setServiceArea(e.target.value)
                  }
                  placeholder="Calicut"
                  required
                />
              </div>

              <div className="input-box">
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

                  <option value="Unavailable">
                    Unavailable
                  </option>
                </select>
              </div>

              <div className="input-box">
                <label>Emergency Service</label>

                <select
                  value={emergencyService}
                  onChange={(e) =>
                    setEmergencyService(
                      e.target.value
                    )
                  }
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="input-box">
                <label>Service Guarantee</label>

                <select
                  value={serviceGuarantee}
                  onChange={(e) =>
                    setServiceGuarantee(
                      e.target.value
                    )
                  }
                >
                  <option value="7 Days">
                    7 Days
                  </option>

                  <option value="30 Days">
                    30 Days
                  </option>

                  <option value="90 Days">
                    90 Days
                  </option>

                  <option value="No Warranty">
                    No Warranty
                  </option>
                </select>
              </div>

              <div className="input-box">
                <label>Status</label>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>
              </div>

            </div>

            <div className="form-buttons">

              <button
                type="submit"
                className="save-btn"
              >
                {editId
                  ? "Update Service"
                  : "Save Service"}
              </button>

              <button
                type="button"
                className="cancel-btn"
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

      <div className="table-container">

        <table>

          <thead>
            <tr>
              <th>#</th>
              <th>Image</th>
              <th>Service</th>
              <th>Category</th>
              <th>Description</th>
              <th>Sub Services</th>
              <th>Price</th>
              <th>Pricing</th>
              <th>Duration</th>
              <th>Area</th>
              <th>Availability</th>
              <th>Emergency</th>
              <th>Guarantee</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {services.length === 0 ? (
              <tr>
                <td
                  colSpan="15"
                  className="no-data"
                >
                  No services found
                </td>
              </tr>
            ) : (
              currentServices.map(
                (service, index) => (
                  <tr key={service._id}>

                    <td>{indexOfFirstService + index + 1}</td>

                    <td>
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={service.name}
                          className="service-table-image"
                        />
                      ) : (
                        "No Image"
                      )}
                    </td>

                    <td>
                      <strong>
                        {service.name}
                      </strong>
                    </td>

                    <td>
                      {service.category}
                    </td>

                    <td className="description">
                      {service.description}
                    </td>

                    <td>
                      {service.subServices &&
                        service.subServices.length > 0
                        ? service.subServices.map(
                          (
                            item,
                            subIndex
                          ) => (
                            <span
                              className="small-tag"
                              key={subIndex}
                            >
                              {item}
                            </span>
                          )
                        )
                        : "None"}
                    </td>

                    <td>
                      ₹{service.price}
                    </td>

                    <td>
                      {service.pricingType}
                    </td>

                    <td>
                      {service.duration}
                    </td>

                    <td>
                      {service.serviceArea}
                    </td>

                    <td>
                      <span className="available">
                        {service.availability}
                      </span>
                    </td>

                    <td>
                      {service.emergencyService}
                    </td>

                    <td>
                      {service.serviceGuarantee}
                    </td>

                    <td>
                      <span className="active">
                        {service.status}
                      </span>
                    </td>

                    <td>

                      <div className="action-buttons">

                        <button
                          className="edit-btn"
                          onClick={() =>
                            editService(
                              service
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            deleteService(
                              service._id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>
                )
              )
            )}

          </tbody>

        </table>
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



      </div>

    </div>
  );
}

export default Services;