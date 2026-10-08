import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">

      <div className="admin-logo">
        Servi<span>Trust</span>
        <p>Admin Panel</p>
      </div>

      <div className="sidebar-menu">

        <Link to="/">
          Dashboard
        </Link>

        <Link to="/admin/users">
          Users
        </Link>

        <Link to="/admin/provider">
          Providers
        </Link>
        <Link to="/categories">
  Categories
</Link>

        <Link to="/admin/services">
          Services
        </Link>

        <Link to="/admin/requests">
          Service Requests
        </Link>

        <Link to="/admin/complaints">
          Complaints
        </Link>

        <Link to="/admin/reviews">
          Reviews
        </Link>

        <Link to="/admin/verification">
          Provider Verification
        </Link>

      </div>

      <div className="sidebar-bottom">
        <button>Logout</button>
      </div>

    </div>
  );
}

export default Sidebar;