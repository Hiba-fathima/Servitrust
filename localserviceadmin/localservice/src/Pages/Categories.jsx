import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Css/Categories.css"

const Categories = () => {
  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");

  const [editId, setEditId] = useState(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/categories");
      setCategories(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add / Update category
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      alert("Please fill all required fields");
      return;
    }

    try {
      if (editId) {
        await axios.put(
          `http://localhost:5000/categories/${editId}`,
          {
            name,
            description,
            status
          }
        );

        alert("Category updated successfully");
      } else {
        await axios.post(
          "http://localhost:5000/categories",
          {
            name,
            description,
            status
          }
        );

        alert("Category added successfully");
      }

      clearForm();
      fetchCategories();

    } catch (error) {
      alert(
        error.response?.data?.message ||
        "Something went wrong"
      );
    }
  };

  // Edit
  const handleEdit = (category) => {
    setEditId(category._id);
    setName(category.name);
    setDescription(category.description);
    setStatus(category.status);
  };

  // Delete
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:5000/categories/${id}`
      );

      alert("Category deleted successfully");

      fetchCategories();

    } catch (error) {
      alert("Failed to delete category");
    }
  };

  // Clear form
  const clearForm = () => {
    setName("");
    setDescription("");
    setStatus("Active");
    setEditId(null);
  };

  return (
    <div className="categories-page">

      <div className="categories-header">
        <div>
          <h1>Categories</h1>
          <p>
            Manage service categories for ServiTrust.
          </p>
        </div>
      </div>

      {/* FORM */}

      <div className="category-form-section">

        <h2>
          {editId ? "Edit Category" : "Add Category"}
        </h2>

        <form onSubmit={handleSubmit}>

          <div className="category-form-grid">

            <div className="form-group">
              <label>
                Category Name <span>*</span>
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Example: Cleaning"
              />
            </div>

            <div className="form-group">
              <label>
                Status
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

          </div>

          <div className="form-group">
            <label>
              Description <span>*</span>
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter category description"
              rows="4"
            />
          </div>

          <div className="category-form-buttons">

            <button type="submit">
              {editId ? "Update Category" : "Add Category"}
            </button>

            {editId && (
              <button
                type="button"
                onClick={clearForm}
                className="cancel-button"
              >
                Cancel
              </button>
            )}

          </div>

        </form>

      </div>

      {/* CATEGORY TABLE */}

      <div className="categories-table-section">

        <h2>All Categories</h2>

        <div className="table-wrapper">

          <table>

            <thead>
              <tr>
                <th>Sl No</th>
                <th>Category</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {categories.length === 0 ? (

                <tr>
                  <td colSpan="5" className="no-data">
                    No categories found.
                  </td>
                </tr>

              ) : (

                categories.map((category, index) => (

                  <tr key={category._id}>

                    <td>{index + 1}</td>

                    <td>
                      <strong>{category.name}</strong>
                    </td>

                    <td>
                      {category.description}
                    </td>

                    <td>
                      <span
                        className={
                          category.status === "Active"
                            ? "status-active"
                            : "status-inactive"
                        }
                      >
                        {category.status}
                      </span>
                    </td>

                    <td>

                      <button
                        className="edit-button"
                        onClick={() =>
                          handleEdit(category)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-button"
                        onClick={() =>
                          handleDelete(category._id)
                        }
                      >
                        Delete
                      </button>

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