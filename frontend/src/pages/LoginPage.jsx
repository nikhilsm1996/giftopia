import React, { useState } from 'react';
import { FaUser } from 'react-icons/fa'; // Importing user icon

const LoginPage = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        onLoginSuccess(data.user);
        window.location.href = data.user.isAdmin ? '/admin' : '/';
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      alert('Error during login');
    }
  };

  return (
    <div 
      className="d-flex justify-content-center align-items-center vh-100" 
      style={{ background: 'linear-gradient(135deg, #4A90E2, #50C9C3)' }}
    >
      <div className="card p-4 shadow-lg" style={{ width: '100%', maxWidth: '400px', borderRadius: '10px' }}>
        <div className="text-center mb-3">
          <FaUser size={40} className="text-primary" />
        </div>
        <h3 className="text-center mb-4">Welcome Back</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email address</label>
            <input 
              type="email" 
              className="form-control rounded-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control rounded-3"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100 rounded-3">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
