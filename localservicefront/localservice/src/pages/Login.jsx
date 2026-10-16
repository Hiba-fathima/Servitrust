import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const API_URL = "https://servitrust-baxkend.onrender.com";

const Login = () => {
const navigate = useNavigate();
const [showPassword, setShowPassword] = useState(false);

const handleLogin = async (e) => {
e.preventDefault();

try {
  const response = await axios.post(`${API_URL}/login`, {
    email: e.target.email.value.trim(),
    password: e.target.password.value,
  });

  console.log("LOGIN RESPONSE:", response.data);

  if (!response.data.token || !response.data.user) {
    alert("Invalid login response. Please try again.");
    return;
  }

  const user = response.data.user;

  // Save login details
  localStorage.setItem("token", response.data.token);
  localStorage.setItem("userId", user.id);
  localStorage.setItem("role", user.role);

  window.dispatchEvent(new Event("authChange"));

  console.log("SAVED USER ID:", user.id);

  alert(response.data.message || "Login successful!");

  // PROVIDER LOGIN
  if (user.role === "provider") {
    try {
      const providerResponse = await axios.get(
        `${API_URL}/providers/user/${user.id}`
      );

      console.log("PROVIDER PROFILE:", providerResponse.data);

      const provider = providerResponse.data.provider
        ? providerResponse.data.provider
        : providerResponse.data;

      // Check provider suspension
      if (provider.accountStatus === "Suspended") {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");

        window.dispatchEvent(new Event("authChange"));

        alert(
          "Your provider account is suspended. Please contact the administrator."
        );

        return;
      }

      navigate("/provider/dashboard");
    } catch (providerError) {
      if (providerError.response?.status === 404) {
        navigate("/provider/profile");
      } else {
        console.error(
          "PROVIDER PROFILE CHECK ERROR:",
          providerError
        );

        alert("Unable to check provider profile. Please try again.");
      }
    }
  } else {
    // CUSTOMER LOGIN
    navigate("/customer/dashboard");
  }
} catch (error) {
  console.error("LOGIN ERROR:", error);

  if (error.response?.status === 403) {
    alert(
      error.response?.data?.message ||
        "Your account is suspended. Please contact the administrator."
    );
  } else {
    alert(
      error.response?.data?.message ||
        "Login failed. Please check your email and password."
    );
  }
}

};

return ( <div className="auth-page"> <div className="auth-card"> <div className="auth-logo">
Servi<span>Trust</span> </div>

    <h2>Welcome back</h2>

    <p className="auth-subtitle">
      Login to manage your services and requests.
    </p>

    <form onSubmit={handleLogin}>
      {/* Email */}
      <div className="form-group">
        <label htmlFor="email">Email</label>

        <input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email"
          autoComplete="email"
          required
        />
      </div>

      {/* Password with eye icon */}
      <div className="form-group">
        <label htmlFor="password">Password</label>

        <div className="password-input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={
              showPassword ? "Hide password" : "Show password"
            }
            aria-pressed={showPassword}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      <div className="forgot-password">
        <Link to="/forgot-password">
          Forgot password?
        </Link>
      </div>

      <button className="register-btn" type="submit">
        Login
      </button>
    </form>

    <p className="auth-footer">
      Don't have an account?{" "}
      <Link to="/register">Create an account</Link>
    </p>
  </div>
</div>

);
};

export default Login;
