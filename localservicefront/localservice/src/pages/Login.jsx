import React from 'react'
import { Link } from 'react-router-dom'
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
    
  const handleLogin = async (e) => {
  e.preventDefault();

  try {

    const response = await axios.post(
      "http://localhost:5000/login",
      {
        email: e.target.email.value,
        password: e.target.password.value
      }
    );

    console.log("LOGIN RESPONSE:", response.data);


    // =========================
    // SAVE LOGIN DETAILS
    // =========================

    localStorage.setItem(
      "token",
      response.data.token
    );

    localStorage.setItem(
      "userId",
      response.data.user.id
    );

    localStorage.setItem(
      "role",
      response.data.user.role
    );

    window.dispatchEvent(
      new Event("authChange")
    );


    console.log(
      "SAVED USER ID:",
      response.data.user.id
    );


    alert(response.data.message);


    // =========================
    // PROVIDER
    // =========================

    if (
      response.data.user.role === "provider"
    ) {

      try {

        const providerResponse =
          await axios.get(
            `http://localhost:5000/providers/user/${response.data.user.id}`
          );

        console.log(
          "PROVIDER PROFILE:",
          providerResponse.data
        );


        // Profile exists
        navigate("/provider/dashboard");

      } catch (providerError) {

        if (
          providerError.response?.status === 404
        ) {

          // Profile does not exist
          navigate("/provider/profile");

        } else {

          console.log(
            "PROVIDER PROFILE CHECK ERROR:",
            providerError
          );

          alert(
            "Unable to check provider profile"
          );

        }

      }

    }

    // =========================
    // CUSTOMER
    // =========================

    else {

      navigate("/customer/dashboard");

    }


  } catch (error) {

    console.log(
      "LOGIN ERROR:",
      error
    );

    alert(
      error.response?.data?.message ||
      "Login failed"
    );

  }
};

  return (
    <div>
      <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          Servi<span>Trust</span>
        </div>

        <h2>Welcome back</h2>

        <p className="auth-subtitle">
          Login to manage your services and requests.
        </p>

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
                name="email"

              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
                name="password"

              placeholder="Enter your password"
            />
          </div>

          <div className="forgot-password">
            <Link to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          <button
            className="register-btn"
            type="submit"
          >
            Login
          </button>

        </form>

        <p className="auth-footer">
          Don't have an account?
          <Link to="/register"> Create an account</Link>
        </p>

      </div>

    </div>

    </div>
  )
}

export default Login
