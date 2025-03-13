import React, { useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [cartMessageType, setCartMessageType] = useState(''); // 'success' or 'error'

  const handleIncrease = () => setQuantity(prev => prev + 1);
  const handleDecrease = () => { if (quantity > 1) setQuantity(prev => prev - 1); };

  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      setCartMessage('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setCartMessage('Please log in to add items to cart');
        setCartMessageType('error');
        return;
      }

      const response = await fetch('http://localhost:5000/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: quantity
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

      setCartMessage(`Added ${quantity} of ${product.name} to cart!`);
      setCartMessageType('success');
      console.log(" SUCCESS cart message type is ",cartMessageType)
      setQuantity(1);
    } catch (error) {
      setCartMessage(`Failed to add to cart: ${error.message}`);
      setCartMessageType('error');

    } finally {
      setIsAddingToCart(false);
      console.log("FINALLY cart message type is ",cartMessageType)
      if (cartMessageType === 'success') {
        console.log(" entering finally")
        setTimeout(() => {
          setCartMessage('');
        }, 3000);
      }
    }
  };

  const toggleWishlist = () => setIsWishlisted(prev => !prev);

  const imageSource = product.image?.startsWith("http")
    ? product.image
    : `http://localhost:5000${product.image}`;

  return (
    <div className="mb-4 ml-3 pl-2" style={{ marginLeft: '1rem' }}> {/* Added left margin */}
      <div 
        className="card h-100 d-flex flex-column shadow" 
        style={{ width: '250px' }}
      >
        {/* Wishlist Button */}
        <button 
          className="btn position-absolute top-0 end-0 m-2 p-0 d-flex align-items-center justify-content-center"
          onClick={toggleWishlist} 
          style={{ 
            width: '30px', height: '30px', borderRadius: '50%', background: 'white', 
            border: '1px solid lightgray', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)', 
            color: isWishlisted ? 'red' : 'gray'
          }}>
          {isWishlisted ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
        </button>

        {/* Product Image */}
        <img 
          src={imageSource} 
          className="card-img-top" 
          alt={product.name} 
          style={{ height: '150px', objectFit: 'cover' }}
        />
        
        <div className="card-body d-flex flex-column flex-grow-1 p-2">
          <h6 className="card-title text-truncate" style={{ fontSize: '1rem' }}>{product.name}</h6>
          <p className="card-text fw-bold mb-2">₹{product.price}</p>

          {/* Quantity Selector */}
          <div className="d-flex align-items-center justify-content-center mb-2">
            <button 
              className="btn btn-outline-secondary rounded-circle p-1" 
              onClick={handleDecrease} 
              style={{ width: '25px', height: '25px', fontSize: '0.8rem' }}
              disabled={isAddingToCart}
            >-</button>
            <span className="mx-2" style={{ fontSize: '0.9rem' }}>{quantity}</span>
            <button 
              className="btn btn-outline-secondary rounded-circle p-1" 
              onClick={handleIncrease} 
              style={{ width: '25px', height: '25px', fontSize: '0.8rem' }}
              disabled={isAddingToCart}
            >+</button>
          </div>

          {/* Add to Cart Button */}
          <button 
            className="btn btn-primary mt-auto btn-sm" 
            onClick={handleAddToCart} 
            disabled={isAddingToCart}
          >
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
          
          {/* Cart Status Message */}
          {cartMessage && (
            <div className={`alert mt-2 ${cartMessageType === 'success' ? 'alert-success' : 'alert-danger'}`} 
                role="alert" style={{ fontSize: '0.75rem', padding: '0.4rem' }}>
              {cartMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;