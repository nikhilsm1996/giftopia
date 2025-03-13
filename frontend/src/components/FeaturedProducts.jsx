import React, { useState, useEffect } from 'react';
const API_BASE_URL = 'http://localhost:5000'; // Your Express server URL

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        // Get the first 3 products from the backend
        const products = data.slice(0, 3);
        setFeaturedProducts(products);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setError('Failed to load featured products');
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Create a function to get the full image URL
  const getImageUrl = (imagePath) => {
    // If the path already includes http, return it as is
    if (imagePath.startsWith('http')) return imagePath;
    
    // If the path starts with /uploads, append it to the API base URL
    return `${API_BASE_URL}${imagePath}`;
  };

  if (loading) return <div className="text-center py-5">Loading featured products...</div>;
  if (error) return <div className="text-center py-5 text-danger">{error}</div>;

  return (
    <section className="container py-5">
      <h2 className="text-center mb-4">Featured Products</h2>
      <div className="row">
        {featuredProducts.map((product) => (
          <div className="col-md-4 mb-4" key={product._id}>
            <div className="card h-100"> {/* Add h-100 class to make all cards the same height */}
              <div style={{ height: '200px', overflow: 'hidden' }}> {/* Fixed height container for image */}
                <img 
                  src={getImageUrl(product.image)} 
                  alt={product.name} 
                  className="card-img-top" 
                  style={{ height: '100%', width: '100%', objectFit: 'cover' }} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getImageUrl('/uploads/sample.jpg');
                  }}
                />
              </div>
              <div className="card-body d-flex flex-column"> {/* Use flex column for consistent spacing */}
                <h5 className="card-title text-truncate">{product.name}</h5>
                <p className="card-text flex-grow-1" style={{ 
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  height: '4.5rem' /* Approx 3 lines of text */
                }}>{product.description}</p>
                <p className="card-text fw-bold mb-2">₹{product.price}</p>
                <a href="/products" className="btn btn-primary mt-auto">Shop Now</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default FeaturedProducts;