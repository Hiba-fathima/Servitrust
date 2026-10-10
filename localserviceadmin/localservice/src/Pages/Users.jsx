import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Css/User.css"
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
const servicesPerPage = 10;


const [roleFilter, setRoleFilter] = useState("all");

  const getUsers = async () => {
    try {
      const response = await axios.get("https://servitrust-baxkend.onrender.com/users");
      setUsers(response.data);
    } catch (error) {
      console.log("GET USERS ERROR:", error);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);

 const deleteUser = async (id) => {
  const result = await Swal.fire({
    title: "Delete this user?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    focusCancel: true,
    confirmButtonColor: "#dc2626",
    cancelButtonColor: "#64748b",
    background: "#ffffff",
    color: "#1e293b",
  });

  if (!result.isConfirmed) return;

  try {
    await axios.delete(
      `https://servitrust-baxkend.onrender.com/users/${id}`
    );

    setUsers((prevUsers) =>
      prevUsers.filter((user) => user._id !== id)
    );

    Swal.fire({
      title: "Deleted!",
      text: "The user has been deleted successfully.",
      icon: "success",
      confirmButtonText: "OK",
      confirmButtonColor: "#2563eb",
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    Swal.fire({
      title: "Unable to delete",
      text:
        error.response?.data?.message ||
        "Something went wrong. Please try again.",
      icon: "error",
      confirmButtonText: "OK",
      confirmButtonColor: "#2563eb",
    });
  }
};


const filteredUsers = users.filter((user) => {
  const searchText = search.toLowerCase();

  const matchesSearch =
    user.name?.toLowerCase().includes(searchText) ||
    user.email?.toLowerCase().includes(searchText) ||
    user.phone?.toLowerCase().includes(searchText);

  const matchesRole =
    roleFilter === "all" ||
    user.role?.toLowerCase() === roleFilter;

  return matchesSearch && matchesRole;
});


  const indexOfLastService = currentPage * servicesPerPage;
const indexOfFirstService = indexOfLastService - servicesPerPage;

const currentServices = filteredUsers.slice(
  indexOfFirstService,
  indexOfLastService
);

const totalPages = Math.ceil(
  filteredUsers.length / servicesPerPage
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
    <div className="users-page">

      <div className="users-header">
        <div>
          <p className="users-small-title">USER MANAGEMENT</p>
          <h1>Users</h1>
          <span>Manage registered ServiTrust customers.</span>
        </div>

        <div className="users-count">
          <strong>{users.length}</strong>
          <span>Total Users</span>
        </div>
      </div>

     <div className="users-toolbar">

  <input
    type="text"
    placeholder="Search by name, email or phone..."
    value={search}
    onChange={(e) => {
      setSearch(e.target.value);
      setCurrentPage(1);
    }}
  />

  <select
className="role-filter"
value={roleFilter}
onChange={(e) => {
setRoleFilter(e.target.value);
setCurrentPage(1);
}}
  >
    <option value="all">All Users</option>
    <option value="customer">Customers</option>
    <option value="provider">Providers</option>
  </select>

</div>

      <div className="users-table-container">

        <table className="users-table">

          <thead>
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filteredUsers.length > 0 ? (

              currentServices.map((user, index) => (

                <tr key={user._id}>

                  <td>{indexOfFirstService  +index + 1}</td>

                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>

                      <span>{user.name}</span>
                    </div>
                  </td>

                  <td>{user.email}</td>


                  <td>
                    <span className="role-badge">
                      {user.role || "Customer"}
                    </span>
                  </td>

                  <td>
                    <button
                      className="delete-user-btn"
                      onClick={() => deleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </td>

                </tr>

              ))

            ) : (

              <tr>
                <td colSpan="6" className="no-users">
                  No users found.
                </td>
              </tr>

            )}

          </tbody>

        </table>


        {filteredUsers.length > servicesPerPage && (
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

export default Users;