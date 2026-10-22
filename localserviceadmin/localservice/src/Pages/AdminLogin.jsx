import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../Css/AdminLogin.css"

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://servitrust-baxkend.onrender.com";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });

      const { token, user } = response.data;

      // Only allow admin accounts into the admin dashboard.
      if (user?.role !== "admin") {
        setError("Access denied. Admin account required.");
        return;
      }

      // Save the token for authenticated API requests.
      localStorage.setItem("token", token);
      localStorage.setItem("adminUser", JSON.stringify(user));

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <form className="admin-login-form" onSubmit={handleLogin}>
        <h2>ServiTrust Admin</h2>
        <p>Sign in to manage your platform.</p>

        {error && <div className="admin-login-error">{error}</div>}

        <label htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          type="email"
          placeholder="Enter admin email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;
