import React from 'react';

const HowItWorks = () => {
  return (
    <section className="container py-5">
      <h2 className="text-center mb-4" style={{ fontSize: '2rem' }}>How It Works</h2>
      <div className="row text-center">
        <div className="col-md-4">
          <h4>1. Choose Your Gift</h4>
          <p>Select from our wide range of gift options.</p>
        </div>
        <div className="col-md-4">
          <h4>2. Add a Personal Touch</h4>
          <p>Customize your gift with a personalized message.</p>
        </div>
        <div className="col-md-4">
          <h4>3. Send with Love</h4>
          <p>Send your gift directly to your loved one.</p>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
