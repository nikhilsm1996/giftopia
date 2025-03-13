import React, { useState } from "react";
import { FaUserPlus } from "react-icons/fa";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: "", // Changed from username to name
    email: "",
    password: "",
  });

  const [message, setMessage] = useState(""); // To show success or error messages

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message); // Show success message
      } else {
        setMessage(data.message || "Something went wrong.");
      }
    } catch (error) {
      setMessage("Failed to connect to the server.");
    }
  };

  return (
    <div 
      className="d-flex justify-content-center align-items-center vh-100" 
      style={{ background: "linear-gradient(135deg, #4A90E2, #50C9C3)" }}
    >
      <div className="card p-4 shadow-lg" style={{ width: "100%", maxWidth: "400px", borderRadius: "10px" }}>
        <div className="text-center mb-3">
          <FaUserPlus size={40} className="text-primary" />
        </div>
        <h3 className="text-center mb-4">Create an Account</h3>

        {message && <div className="alert alert-info">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              className="form-control rounded-3"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-control rounded-3"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control rounded-3"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 rounded-3">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
