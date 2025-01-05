import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      let querySnapshot = await getDocs(collection(db, 'inventory'));
      let productList = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id, // Get the Firestore document ID
      }));

      if (selectedCategory) {
        productList = productList.filter(product => product.category === selectedCategory);
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
            <div className="price-range">
              <input
                type="range"
                className="min-input form-range"
                min="0"
                max="1000"
                step="1"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
              />
              <input
                type="range"
                className="max-input form-range"
                min="0"
                max="1000"
                step="1"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
            </div>
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
        {products.map((product, index) => (
          <div key={index} className="col">
            <div className="card shadow-lg rounded">
              <img
                src={product.images}
                className="card-img-top rounded"
                alt={product.name}
                style={{ height: '320px', objectFit: 'cover', backgroundColor: '#f8f9fa' }}
                referrerPolicy="no-referrer"
              />
              <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text text-muted">${product.price}</p>
                <button
                  className="btn btn-primary w-100"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Catalog;