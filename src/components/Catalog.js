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
        if (selectedCategory === "Pants") {
          productList = productList.filter(product =>
            ['Pants', 'Sweatpants', 'Jeans'].includes(product.category)
          );
        } else if (selectedCategory === "Longsleeve Shirt") {
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
      <h2 className="text-center mb-4 custom-heading" onClick={() => window.location.href = 'http://localhost:3000/customer-dashboard'}>
        Product Catalog
      </h2>

      {/* Filters */}
      <div className="filters mb-4">
        <div className="row">
          <div className="col-md-3">
            <select
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select mb-3"
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              <option value="T-Shirt">T-Shirt</option>
              <option value="Longsleeve Shirt">Longsleeve Shirt</option>
              <option value="Hoodie">Hoodie</option>
              <option value="Pants">Pants</option>
            </select>
          </div>
          <div className="col-md-3">
            <select
              onChange={(e) => setSelectedSize(e.target.value)}
              className="form-select mb-3"
              aria-label="Filter by size"
            >
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
                aria-label="Minimum price"
              />
              <input
                type="number"
                className="max-price form-control"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                aria-label="Maximum price"
              />
            </div>
          </div>
          <div className="col-md-3 d-flex align-items-center">
            <button
              className="btn btn-secondary w-100"
              onClick={() => {
                setSelectedCategory('');
                setSelectedSize('');
                setMinPrice(0);
                setMaxPrice(1000);
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="text-center mt-5">
          <h4>No products found. Try adjusting your filters.</h4>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {products.map((product) => {
            const images = product.images.split(',');
            const firstImage = images[0];
            const secondImage = images[1] || firstImage;

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
                    }}
                    onMouseEnter={() => setHoveredProductId(product.id)}
                    onMouseLeave={() => setHoveredProductId(null)}
                  >
                    <img
                      src={hoveredProductId === product.id ? secondImage : firstImage}
                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '370px',
                        objectFit: 'cover',
                        objectPosition: 'top',
                        transition: '0.3s ease-in-out',
                      }}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div style={{ paddingLeft: '10px', marginTop: '10px' }}>
                    <h5
                      className="card-title"
                      style={{
                        fontFamily: 'sans-serif',
                        fontSize: '16px',
                        fontWeight: 'normal',
                        textTransform: 'capitalize',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      {product.name}
                    </h5>
                    <p
                      className="card-text"
                      style={{
                        fontFamily: 'sans-serif',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: 'black',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      ${product.price}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Catalog;
