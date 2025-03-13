import React from 'react';

const Profile = () => {
  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h2 className="text-center mb-3">Profile</h2>
        <div className="mb-2">
          <strong>Name:</strong> John Doe
        </div>
        <div className="mb-2">
          <strong>Email:</strong> john@example.com
        </div>
        <div className="mb-2">
          <strong>Phone:</strong> +91 9876543210
        </div>
      </div>
    </div>
  );
};

export default Profile;
