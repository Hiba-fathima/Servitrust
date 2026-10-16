import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../Css/Register.css"

function Register() {
const navigate = useNavigate();
const [showPassword, setShowPassword] = useState(false);

const handleRegister = async (e) => {
e.preventDefault();

try {
  const response = await axios.post(
    "https://servitrust-baxkend.onrender.com/register",
    {
      name: e.target.name.value.trim(),
      email: e.target.email.value.trim(),
      phone: e.target.phone.value.trim(),
      password: e.target.password.value,
      role: e.target.role.value,
    }
  );

  console.log("REGISTER RESPONSE:", response.data);

  alert(response.data.message || "Registration successful!");

  if (response.status === 201) {
    navigate("/login");
  }
} catch (error) {
  console.error("REGISTRATION ERROR:", error);

  alert(
    error.response?.data?.message ||
      "Registration failed. Please try again."
  );
}

};

return ( <div className="auth-page"> <div className="auth-card"> <div className="auth-logo">
Servi<span>Trust</span> </div>

```
    <h2>Create your account</h2>

    <p className="auth-subtitle">
      Join ServiTrust and find reliable local services.
    </p>

    <form onSubmit={handleRegister}>
      {/* Full Name */}
      <div className="form-group">
        <label htmlFor="name">Full Name</label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Enter your full name"
          autoComplete="name"
          required
        />
      </div>

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

      {/* Phone Number */}
      <div className="form-group">
        <label htmlFor="phone">Phone Number</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          placeholder="Enter your phone number"
          autoComplete="tel"
          required
        />
      </div>

      {/* Password with standard eye icon */}
      <div className="form-group">
        <label htmlFor="password">Password</label>

        <div className="password-input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            placeholder="Create a password"
            autoComplete="new-password"
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

      {/* Account Type */}
      <div className="form-group">
        <label htmlFor="role">Account Type</label>
        <select
          id="role"
          name="role"
          defaultValue="customer"
        >
          <option value="customer">Customer</option>
          <option value="provider">Service Provider</option>
        </select>
      </div>

      {/* Submit Button */}
      <button className="register-btn" type="submit">
        Create Account
      </button>
    </form>

    <p className="auth-footer">
      Already have an account?{" "}
      <Link to="/login">Login</Link>
    </p>
  </div>
</div>

);
}

export default Register;
