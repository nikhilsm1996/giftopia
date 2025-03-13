import React from "react";
import { FaGift, FaHeart, FaStar } from "react-icons/fa"; // Icons for better UI

const About = () => {
  return (
    <div 
      className="d-flex justify-content-center align-items-center vh-100" 
      style={{ background: 'linear-gradient(135deg, #4A90E2, #50C9C3)', color: "#fff" }}
    >
      <div className="container p-4">
        <div className="card shadow-lg p-4" style={{ borderRadius: '10px', backgroundColor: "rgba(255, 255, 255, 0.9)" }}>
          <h1 className="text-center mb-4 text-primary">About <FaGift /> Giftopia</h1>
          <p className="lead text-center text-dark">
            Welcome to <strong>Giftopia</strong> – your one-stop destination for thoughtful and personalized gifting. 
          </p>

          <div className="row mt-4">
            <div className="col-md-6">
              <h3 className="text-primary"><FaHeart className="me-2" /> Our Mission</h3>
              <p className="text-dark">
                At Giftopia, we aim to make gifting special and hassle-free. Whether it's customized gifts, 
                heartfelt notes, or beautifully curated hampers, we help you create memorable experiences 
                for your loved ones.
              </p>
            </div>
            <div className="col-md-6">
              <h3 className="text-primary"><FaStar className="me-2" /> What We Offer</h3>
              <ul className="text-dark">
                <li>🎁 Personalized gifts with custom messages</li>
                <li>💌 Handwritten or digital notes</li>
                <li>🎀 Customizable gift hampers</li>
                <li>🌟 Elegant pre-made gift sets</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 text-center">
            <h3 className="text-primary">Why Choose Giftopia?</h3>
            <p className="text-dark">
              We believe that every gift tells a story. Our platform ensures that your gifts are 
              unique, meaningful, and delivered with love. Start creating your perfect gift today!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
