import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import "./DualSlider.js";
import DualSlider from './DualSlider.js';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [hoveredProductId, setHoveredProductId] = useState(null); // Track hover state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      let querySnapshot = await getDocs(collection(db, 'inventory'));
      let productList = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id, // Get the Firestore document ID
      }));

      if (selectedCategory) {
        // Merging Sweatpants and Jeans into Pants category
        if (selectedCategory === "Pants") {
          productList = productList.filter(product =>
            ['Pants', 'Sweatpants', 'Jeans'].includes(product.category)
          );
        }
        
        // Merging Sweatshirt into Longsleeve Shirt category
        else if (selectedCategory === "Longsleeve Shirt") {
          productList = productList.filter(product =>
            ['Longsleeve Shirt', 'Sweatshirt'].includes(product.category)
          );
        } else {
          productList = productList.filter(product => product.category === selectedCategory);
        }
      }

      if (selectedSize) {
        productList = productList.filter(product => product.sizes.split(',').includes(selectedSize));
      }

      productList = productList.filter(product => product.price >= minPrice && product.price <= maxPrice);

      setProducts(productList);
    };

    fetchProducts();
  }, [selectedCategory, selectedSize, minPrice, maxPrice]);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4 custom-heading" onClick={() => window.location.href = 'http://localhost:3000/customer-dashboard'}>Product Catalog</h2>

      {/* Filters */}
      <div className="filters mb-4">
        <div className="row">
          <div className="col-md-3">
            <select onChange={(e) => setSelectedCategory(e.target.value)} className="form-select mb-3">
              <option value="">All Categories</option>
              <option value="T-Shirt">T-Shirt</option>
              <option value="Longsleeve Shirt">Longsleeve Shirt</option>
              <option value="Hoodie">Hoodie</option>
              <option value="Pants">Pants</option>
            </select>
          </div>
          <div className="col-md-3">
            <select onChange={(e) => setSelectedSize(e.target.value)} className="form-select mb-3">
              <option value="">All Sizes</option>
              <option value="S">Small</option>
              <option value="M">Medium</option>
              <option value="L">Large</option>
              <option value="XL">X-Large</option>
            </select>
          </div>
          <div className="col-md-3">
            <DualSlider minPrice={minPrice} setMinPrice={setMinPrice} maxPrice={maxPrice} setMaxPrice={setMaxPrice} />
            <div className="d-flex justify-content-between">
              <input
                type="number"
                className="min-price form-control"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
              />
              <input
                type="number"
                className="max-price form-control"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="row row-cols-1 row-cols-md-3 g-4">
        {products.map((product) => {
          // Split the images and take the first two
          const images = product.images.split(',');
          const firstImage = images[0];
          const secondImage = images[1] || firstImage; // If no second image, show the first one

          return (
            <div key={product.id} className="col d-flex justify-content-center">
            <div className="text-left" style={{ width: '370px' }}>
              <div 
                onClick={() => navigate(`/product/${product.id}`)} 
                style={{
                  cursor: 'pointer',
                  position: 'relative',
                  width: '100%',
                  height: '370px',
                  backgroundColor: '#f8f9fa',
                  display: 'flex',
                  flexDirection: 'column', // Align vertically (default)
                  alignItems: 'flex-start', // Align children to the left
                }}
                onMouseEnter={() => setHoveredProductId(product.id)}
                onMouseLeave={() => setHoveredProductId(null)}
              >
                <img
                  src={hoveredProductId === product.id ? secondImage : firstImage}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '370px', // Adjust height to fit layout
                    objectFit: 'cover',
                    transition: '0.3s ease-in-out',
                  }}
                  referrerPolicy="no-referrer"
                />
              </div>
          
              {/* Name and Price aligned to the left */}
              <div style={{
                display: 'flex',
                flexDirection: 'column', // Stack name and price vertically
                width: '100%',
                marginTop: '10px',
                paddingLeft: '10px', // Add left padding for better alignment
                textAlign: 'left', // Ensure left alignment
              }}>
                <h5 
                  className="card-title" 
                  style={{
                    fontFamily: 'sans-serif', // Set sans-serif font
                    fontSize: '16px',
                    fontWeight: 'normal',
                    textTransform: 'capitalize',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis', // Add "..." if title is too long
                    whiteSpace: 'nowrap',
                    cursor: 'pointer', // Make title clickable
                  }}
                  onClick={() => navigate(`/product/${product.id}`)} // Clicking on title also takes the user to product details
                >
                  {product.name}
                </h5>
                <p 
                  className="card-text" 
                  style={{
                    fontFamily: 'sans-serif', // Set sans-serif font
                    fontSize: '16px',
                    fontWeight: 'bold', // Make price bold
                    color: 'black', // Set price color to black
                    cursor: 'pointer', // Make price clickable
                  }}
                  onClick={() => navigate(`/product/${product.id}`)} // Clicking on price takes the user to product details
                >
                  ${product.price}
                </p>
              </div>
            </div>
          </div>
          
          );
        })}
      </div>
    </div>
  );
};

export default Catalog;
