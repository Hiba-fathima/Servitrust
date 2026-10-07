import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Css/Profile.css";


function Profile() {

  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: ""
  });

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [originalUser, setOriginalUser] = useState(null);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();


  // =====================================================
  // GET PROFILE
  // =====================================================

  const getProfile = async () => {

    try {

      const response = await axios.get(
        "https://servitrust-baxkend.onrender.com/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUser(response.data);
      setOriginalUser(response.data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    if (token) {
      getProfile();
    }

  }, [token]);


  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {

    setUser({
      ...user,
      [e.target.name]: e.target.value
    });

  };


  // =====================================================
  // START EDIT
  // =====================================================

  const handleEdit = () => {

    setOriginalUser({
      ...user
    });

    setIsEditing(true);

  };


  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancel = () => {

    setUser({
      ...originalUser
    });

    setIsEditing(false);

  };


  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  const handleUpdate = async (e) => {

    e.preventDefault();

    try {

      setSaving(true);

      const response = await axios.put(
        "https://servitrust-baxkend.onrender.com/profile",
        {
          name: user.name,
          email: user.email,
          phone: user.phone
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      setUser(response.data.user);

      setOriginalUser(response.data.user);

      setIsEditing(false);

      alert(response.data.message);

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        "Profile update failed"
      );

    } finally {

      setSaving(false);

    }

  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="profile-loading">
        Loading profile...
      </div>
    );
  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="profile-page">

      <button
        className="profile-close-btn"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>


      <div className="profile-content">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="profile-header">

          <div className="profile-avatar">
            {user.name
              ?.charAt(0)
              .toUpperCase()}
          </div>


          <div className="profile-header-info">

            <h2>
              {user.name}
            </h2>

            <p>
              {user.role === "provider"
                ? "Service Provider"
                : "Customer"}
            </p>

          </div>


          {/* EDIT BUTTON */}

          {!isEditing && (

            <button
              type="button"
              className="profile-edit-btn"
              onClick={handleEdit}
            >
              Edit Profile
            </button>

          )}

        </div>


        <div className="profile-divider"></div>


        {/* =================================================
            PROFILE FORM / DETAILS
        ================================================= */}

        <form
          className="profile-info"
          onSubmit={handleUpdate}
        >


          {/* FULL NAME */}

          <div className="profile-info-item">

            <span>
              Full Name
            </span>

            {isEditing ? (

              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleChange}
                required
              />

            ) : (

              <strong>
                {user.name}
              </strong>

            )}

          </div>


          {/* EMAIL */}

          <div className="profile-info-item">

            <span>
              Email
            </span>

            {isEditing ? (

              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                required
              />

            ) : (

              <strong>
                {user.email}
              </strong>

            )}

          </div>


          {/* PHONE */}

          <div className="profile-info-item">

            <span>
              Phone Number
            </span>

            {isEditing ? (

              <input
                type="text"
                name="phone"
                value={user.phone}
                onChange={handleChange}
                required
              />

            ) : (

              <strong>
                {user.phone || "Not added"}
              </strong>

            )}

          </div>


          {/* ROLE — NEVER EDITABLE */}

          <div className="profile-info-item">

            <span>
              Account Type
            </span>

            <strong>
              {user.role === "provider"
                ? "Service Provider"
                : "Customer"}
            </strong>

          </div>


          {/* =================================================
              EDIT ACTIONS
          ================================================= */}

          {isEditing && (

            <div className="profile-edit-actions">

              <button
                type="button"
                className="profile-cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>


              <button
                type="submit"
                className="profile-save-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

            </div>

          )}

        </form>

      </div>

    </div>

  );

}

export default Profile;