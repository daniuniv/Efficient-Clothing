import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      let productsQuery = collection(db, 'inventory');
      
      if (selectedCategory) {
        // Merging Sweatpants and Jeans into Pants category
        if (selectedCategory === "Pants") {
          productsQuery = query(productsQuery, where('category', 'in', ['Pants', 'Sweatpants', 'Jeans']));
        }
        
        // Merging Longsleeve Shirt and Sweatshirt into Longsleeve Shirt category
        else if (selectedCategory === "Longsleeve Shirt") {
          productsQuery = query(productsQuery, where('category', 'in', ['Longsleeve Shirt', 'Sweatshirt']));
        } else {
          productsQuery = query(productsQuery, where('category', '==', selectedCategory));
        }
      }
      
      if (selectedSize) {
        // Fetching products with sizes that contain the selected size
        const snapshot = await getDocs(productsQuery);
        const productList = snapshot.docs.map(doc => {
          const product = doc.data();
          const sizesArray = product.sizes.split(','); // Convert size string to array (S,M,L,XL)
          
          // Create an array [0, 0, 0, 0] for each product (S, M, L, XL)
          const sizeArray = ['S', 'M', 'L', 'XL'].map(size => sizesArray.includes(size) ? 1 : 0);
          
          // Add this information to the product data
          return { ...product, sizeArray };
        });
        
        // Filter products that match the selected size
        const filteredProducts = productList.filter(product => {
          const sizeIndex = ['S', 'M', 'L', 'XL'].indexOf(selectedSize);
          return product.sizeArray[sizeIndex] === 1;
        });

        setProducts(filteredProducts);
      } else {
        const snapshot = await getDocs(productsQuery);
        const productList = snapshot.docs.map(doc => doc.data());
        setProducts(productList);
      }
    };

    fetchProducts();
  }, [selectedCategory, selectedSize]);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Product Catalog</h2>

      {/* Filters */}
      <div className="filters">
        <select onChange={(e) => setSelectedCategory(e.target.value)} className="form-select">
          <option value="">All Categories</option>
          <option value="T-Shirt">T-Shirt</option>
          <option value="Longsleeve Shirt">Longsleeve Shirt</option>
          <option value="Hoodie">Hoodie</option>
          <option value="Pants">Pants</option>
        </select>

        <select onChange={(e) => setSelectedSize(e.target.value)} className="form-select">
          <option value="">All Sizes</option>
          <option value="S">Small</option>
          <option value="M">Medium</option>
          <option value="L">Large</option>
          <option value="XL">X-Large</option>
        </select>
      </div>

      <div className="row">
        {products.map((product, index) => (
          <div key={index} className="col-md-4 mb-4">
            <div className="card">
              <img
                src={product.imageUrl || 'https://via.placeholder.com/320'}
                className="card-img-top"
                alt={product.name}
              />
              <div className="card-body">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text">${product.price}</p>
                <button className="btn btn-primary">View Details</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Catalog;