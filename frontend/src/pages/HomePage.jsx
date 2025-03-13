// src/pages/HomePage.js
import React from 'react';
import HeroSection from '../components/HeroSection';
import FeaturedProducts from '../components/FeaturedProducts';
import HowItWorks from '../components/HowItWorks';
import Testimonial from '../components/Testimonial';

const HomePage = () => {
  return (
    <div>
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* How It Works */}
      <HowItWorks />

      {/* Testimonials */}
      <Testimonial />
    </div>
  );
}

export default HomePage;
