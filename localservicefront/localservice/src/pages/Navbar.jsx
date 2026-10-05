import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";

const Navbar = () => {

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const [role, setRole] = useState(
    localStorage.getItem("role")
  );

  const [showSidebar, setShowSidebar] = useState(false);


  // =====================================================
  // CHECK LOGIN STATUS
  // =====================================================

  useEffect(() => {

    const checkAuth = () => {

      setToken(
        localStorage.getItem("token")
      );

      setRole(
        localStorage.getItem("role")
      );

    };


    window.addEventListener(
      "authChange",
      checkAuth
    );


    return () => {

      window.removeEventListener(
        "authChange",
        checkAuth
      );

    };

  }, []);


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");

    setToken(null);
    setRole(null);
    setShowSidebar(false);

    window.location.href = "/login";

  };


  return (

    <div>


      {/* =====================================================
          MAIN NAVBAR
      ===================================================== */}

      <nav className="navbar">


        {/* =================================================
            LOGO
        ================================================= */}

        <Link
          to="/"
          className="logo"
        >
          Servi<span>Trust</span>
        </Link>


        {/* =================================================
            NAVIGATION LINKS
        ================================================= */}

        <div className="nav-links">


          <Link to="/">
            Home
          </Link>


          <Link to="/services">
            Services
          </Link>


          <Link to="/providers">
            Providers
          </Link>


          <Link to="/how-it-works">
            How It Works
          </Link>


          {/* ===============================================
              PROVIDER DASHBOARD ONLY
          =============================================== */}

          {token &&
            role === "provider" && (

              <Link
                to="/provider/dashboard"
                className="provider-dashboard-link"
              >
                Dashboard
              </Link>

            )}

        </div>


        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <div className="nav-buttons">


          {/* ===============================================
              NOT LOGGED IN
          =============================================== */}

          {!token && (

            <>

              <Link
                to="/login"
                className="login-btn"
              >
                Login
              </Link>


              <Link
                to="/register"
                className="get-started-btn"
              >
                Get Started
              </Link>

            </>

          )}


          {/* ===============================================
              CUSTOMER PROFILE ICON ONLY
              
              IMPORTANT:
              Provider will NOT see this icon.
          =============================================== */}

          {token &&
            role !== "provider" && (

              <button
                className="profile-toggle"
                onClick={() =>
                  setShowSidebar(true)
                }
              >

                <FaUserCircle
                  size={28}
                />

              </button>

            )}

        </div>

      </nav>


      {/* =====================================================
          CUSTOMER ACCOUNT SIDEBAR
          
          This sidebar can only be opened by customer,
          because provider has no profile icon.
      ===================================================== */}

      {showSidebar && (

        <div
          className="sidebar-overlay"
          onClick={() =>
            setShowSidebar(false)
          }
        ></div>

      )}


      <div
        className={`profile-sidebar ${
          showSidebar ? "open" : ""
        }`}
      >


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="profile-sidebar-header">


          <div>

            <span>
              ACCOUNT
            </span>


            <h2>
              Customer Panel
            </h2>

          </div>


          <button
            className="sidebar-close-btn"
            onClick={() =>
              setShowSidebar(false)
            }
          >
            ×
          </button>

        </div>


        {/* =================================================
            CUSTOMER PROFILE
        ================================================= */}

        <div className="sidebar-profile">


          <Link
            to="/profile"
            onClick={() =>
              setShowSidebar(false)
            }
          >

          <FaUserCircle
            size={48}
          />

          </Link>

          <div>
<Link
            to="/profile"
            onClick={() =>
              setShowSidebar(false)
            }
          >

            <strong>
              Customer Account
            </strong>
          </Link>

<Link
            to="/profile"
            onClick={() =>
              setShowSidebar(false)
            }
          >
            <span>
              Customer
            </span>
</Link>
          </div>

        </div>


        {/* =================================================
            CUSTOMER MENU
        ================================================= */}

        <div className="sidebar-menu">


          {/* <Link
            to="/profile"
            onClick={() =>
              setShowSidebar(false)
            }
          >

            <span>
              👤
            </span>

            View Profile

          </Link> */}


          <Link
            to="/customer/dashboard"
            onClick={() =>
              setShowSidebar(false)
            }
          >

            <span>
              ▦
            </span>

            Dashboard

          </Link>


          <Link
            to="/customer/reviews"
            onClick={() =>
              setShowSidebar(false)
            }
          >

            <span>
              ★
            </span>

            My Reviews

          </Link>


          <Link
            to="/customer/complaints"
            onClick={() =>
              setShowSidebar(false)
            }
          >

            <span>
              !
            </span>

            My Complaints

          </Link>

        </div>


        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="sidebar-footer">


          <button
            onClick={handleLogout}
          >

            <span>
              ↪
            </span>

            Logout

          </button>

        </div>

      </div>

    </div>

  );

};

export default Navbar;