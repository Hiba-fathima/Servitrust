import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {

   const navigate = useNavigate();
  const handleRegister = async (e) => {

    e.preventDefault();

    try {

      const response = await axios.post(
        "https://servitrust-baxkend.onrender.com/register",
        {
          name: e.target.name.value,
          email: e.target.email.value,
          phone: e.target.phone.value,
          password: e.target.password.value,
          role: e.target.role.value
        }
      );

      console.log(response.data);

      alert(response.data.message);
         if (response.status === 201) {
                navigate("/login")     // navigate to another page here
            }

    } catch (error) {

      console.log(error);

      alert("Registration failed");

    }

  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          Servi<span>Trust</span>
        </div>

        <h2>Create your account</h2>

        <p className="auth-subtitle">
          Join ServiTrust and find reliable local services.
        </p>

        <form onSubmit={handleRegister}>

          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>

            <input
              type="text"
              name="phone"
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Create a password"
              required
            />
          </div>

          <div className="form-group">
            <label>Account Type</label>

            <select name="role">
              <option value="customer">Customer</option>
              <option value="provider">Service Provider</option>
            </select>
          </div>

          <button
            className="register-btn"
            type="submit"
          >
            Create Account
          </button>

        </form>

        <p className="auth-footer">
          Already have an account?
          <Link to="/login"> Login</Link>
        </p>

      </div>

    </div>
  );
}

export default Register;