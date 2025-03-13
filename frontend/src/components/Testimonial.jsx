// src/components/Testimonial.js
import React from 'react';

const Testimonial = () => {
  return (
    <section className="bg-light py-5">
      <div className="container">
        <h2 className="text-center mb-4">What Our Customers Say</h2>
        <div className="row">
          <div className="col-md-6">
            <div className="blockquote">
              <p>"Giftopia made my anniversary so special! The personalized message was perfect!"</p>
              <footer>- John D.</footer>
            </div>
          </div>
          <div className="col-md-6">
            <div className="blockquote">
              <p>"The hamper creation tool was so easy to use. Highly recommend it!"</p>
              <footer>- Sarah L.</footer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonial;
