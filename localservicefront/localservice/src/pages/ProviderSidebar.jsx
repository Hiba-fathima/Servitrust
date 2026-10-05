import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "../Css/ProviderSidebar.css";
const ProviderSidebar = () => {
  const navigate = useNavigate();

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");

    window.dispatchEvent(
      new Event("authChange")
    );

    navigate("/login");
  };

  return (
    <aside className="provider-sidebar">

      {/* =================================================
          SIDEBAR HEADER
      ================================================= */}

      <div className="provider-sidebar-header">

        <div className="provider-sidebar-brand">
          <span>
            SERVITRUST
          </span>

          <h2>
            Provider Dashboard
          </h2>
        </div>

        {/* PROFILE ICON */}

      <button
  type="button"
  className="provider-profile-icon"
  onClick={() => navigate("/provider/profile")}
  title="My Profile"
  aria-label="My Profile"
>
  <FaUserCircle size={27} />
</button>

      </div>


      {/* =================================================
          MAIN MENU
      ================================================= */}

      <nav className="provider-sidebar-menu">

        {/* DASHBOARD */}

        <NavLink
          to="/provider/dashboard"
          className={({ isActive }) =>
            isActive
              ? "provider-sidebar-link active"
              : "provider-sidebar-link"
          }
        >
          Dashboard
        </NavLink>


        {/* MY SERVICES */}

        <NavLink
          to="/provider/services"
          className={({ isActive }) =>
            isActive
              ? "provider-sidebar-link active"
              : "provider-sidebar-link"
          }
        >
          My Services
        </NavLink>


        {/* SERVICE REQUESTS */}

        <NavLink
          to="/provider/requests"
          className={({ isActive }) =>
            isActive
              ? "provider-sidebar-link active"
              : "provider-sidebar-link"
          }
        >
          Service Requests
        </NavLink>


        {/* REVIEWS */}

        <NavLink
          to="/provider/reviews"
          className={({ isActive }) =>
            isActive
              ? "provider-sidebar-link active"
              : "provider-sidebar-link"
          }
        >
          Reviews
        </NavLink>


        {/* COMPLAINTS */}

        <NavLink
          to="/provider/complaints"
          className={({ isActive }) =>
            isActive
              ? "provider-sidebar-link active"
              : "provider-sidebar-link"
          }
        >
          Complaints
        </NavLink>

      </nav>


      {/* =================================================
          BOTTOM ACCOUNT SECTION
      ================================================= */}

      <div className="provider-sidebar-account">

        {/* LOGOUT */}

        <button
          type="button"
          className="provider-sidebar-logout"
          onClick={handleLogout}
        >
          <span>
            ↪
          </span>

          Logout
        </button>

      </div>

    </aside>
  );
};

export default ProviderSidebar;