import React from "react";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from "react-icons/fa";

const Contact = () => {
  return (
    <div 
      className="d-flex justify-content-center align-items-center py-5" 
      style={{ background: 'linear-gradient(135deg, #4A90E2, #50C9C3)', color: "#fff" }}
    >
      <div className="container p-4">
        <div 
          className="card shadow-lg p-4 mx-auto"
          style={{ maxWidth: "600px", borderRadius: "10px", backgroundColor: "rgba(255, 255, 255, 0.95)" }}
        >
          <h2 className="text-center mb-4 text-primary">Contact Us</h2>
          <p className="text-center text-dark">
            Have any questions or need assistance? Feel free to reach out to us.
          </p>

          <form>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Name</label>
              <input type="text" className="form-control" id="name" required />
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input type="email" className="form-control" id="email" required />
            </div>
            <div className="mb-3">
              <label htmlFor="message" className="form-label">Message</label>
              <textarea className="form-control" id="message" rows="4" required></textarea>
            </div>
            <button type="submit" className="btn btn-primary w-100">
              <FaPaperPlane className="me-2" /> Send Message
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="text-dark"><FaEnvelope className="me-2 text-primary" /> <strong>Email:</strong> support@giftopia.com</p>
            <p className="text-dark"><FaPhone className="me-2 text-primary" /> <strong>Phone:</strong> +91 98765 43210</p>
            <p className="text-dark"><FaMapMarkerAlt className="me-2 text-primary" /> <strong>Address:</strong> Kochi, Kerala, India</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
