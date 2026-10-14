import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Css/Categories.css";

const API_URL = "https://servitrust-baxkend.onrender.com";

const Categories = () => {
  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch categories from the hosted backend
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      alert("Unable to load categories. Please try again.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Clear the form
  const clearForm = () => {
    setName("");
    setDescription("");
    setStatus("Active");

    setImage(null);
    setImagePreview("");
    setRemoveExistingImage(false);

    setEditId(null);

    const fileInput = document.getElementById("categoryImage");

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Handle optional image selection
  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5 MB.");
      event.target.value = "";
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveExistingImage(false);
  };

  // Add or update category
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim() || !description.trim()) {
      alert("Please enter the category name and description.");
      return;
    }

    const formData = new FormData();

    formData.append("name", name.trim());
    formData.append("description", description.trim());
    formData.append("status", status);

    // Only attach the image when one has been selected
    if (image) {
      formData.append("image", image);
    }

    // Tell the backend to remove an existing image when requested
    if (removeExistingImage) {
      formData.append("removeImage", "true");
    }

    try {
      setLoading(true);

      if (editId) {
        await axios.put(
          `${API_URL}/categories/${editId}`,
          formData
        );

        alert("Category updated successfully!");
      } else {
        await axios.post(
          `${API_URL}/categories`,
          formData
        );

        alert("Category added successfully!");
      }

      clearForm();
      await fetchCategories();
    } catch (error) {
      console.error("Category save error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to save category. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Edit category
  const handleEdit = (category) => {
    setEditId(category._id);

    setName(category.name || "");
    setDescription(category.description || "");
    setStatus(category.status || "Active");

    setImage(null);
    setImagePreview(category.image || "");
    setRemoveExistingImage(false);

    const fileInput = document.getElementById("categoryImage");

    if (fileInput) {
      fileInput.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // Remove the image from the form
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview("");
    setRemoveExistingImage(true);

    const fileInput = document.getElementById("categoryImage");

    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/categories/${id}`);

      alert("Category deleted successfully!");

      if (editId === id) {
        clearForm();
      }

      await fetchCategories();
    } catch (error) {
      console.error("Delete category error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to delete category."
      );
    }
  };

  return (
    <div className="categories-page">
      <h2>Category Management</h2>

      <p>Manage the service categories displayed on ServiTrust.</p>

      <form className="category-form" onSubmit={handleSubmit}>
        <div className="category-form-grid">
          <div className="form-group">
            <label htmlFor="categoryName">Category Name *</label>

            <input
              id="categoryName"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter category name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="categoryStatus">Status</label>

            <select
              id="categoryStatus"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="categoryDescription">
            Description *
          </label>

          <textarea
            id="categoryDescription"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Enter category description"
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="categoryImage">
            Category Image (Optional)
          </label>

          <input
            id="categoryImage"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          <small>
            Supported image formats. Maximum file size: 5 MB.
          </small>
        </div>

        {imagePreview && (
          <div className="category-image-preview">
            <img
              src={imagePreview}
              alt="Category preview"
            />

            <button
              type="button"
              className="remove-image-btn"
              onClick={handleRemoveImage}
            >
              Remove Image
            </button>
          </div>
        )}

        <div className="category-form-actions">
          <button
            type="submit"
            className="category-submit-btn"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : editId
              ? "Update Category"
              : "Add Category"}
          </button>

          {editId && (
            <button
              type="button"
              className="category-cancel-btn"
              onClick={clearForm}
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="category-table-section">
        <h3>All Categories</h3>

        <div className="category-table-wrapper">
          <table className="category-table">
            <thead>
              <tr>
                <th>Sl No</th>
                <th>Image</th>
                <th>Category</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-category">
                    No categories found.
                  </td>
                </tr>
              ) : (
                categories.map((category, index) => (
                  <tr key={category._id}>
                    <td>{index + 1}</td>

                    <td>
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="category-table-image"
                        />
                      ) : (
                        <span className="no-category-image">
                          No image
                        </span>
                      )}
                    </td>

                    <td>{category.name}</td>

                    <td>{category.description}</td>

                    <td>
                      <span
                        className={
                          category.status === "Active"
                            ? "category-status-active"
                            : "category-status-inactive"
                        }
                      >
                        {category.status}
                      </span>
                    </td>

                    <td>
                      <div className="category-action-buttons">
                        <button
                          type="button"
                          className="category-edit-btn"
                          onClick={() => handleEdit(category)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="category-delete-btn"
                          onClick={() =>
                            handleDelete(category._id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Categories;