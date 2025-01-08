import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Rating from '@mui/material/Rating';
import Box from '@mui/material/Box';
import StarIcon from '@mui/icons-material/Star';

const labels = {
  0.5: 'Useless',
  1: 'Useless+',
  1.5: 'Poor',
  2: 'Poor+',
  2.5: 'Ok',
  3: 'Ok+',
  3.5: 'Good',
  4: 'Good+',
  4.5: 'Excellent',
  5: 'Excellent+',
};

function getLabelText(value) {
  return `${value} Star${value !== 1 ? 's' : ''}, ${labels[value]}`;
}

const ProductDetail = () => {
  const { productId } = useParams(); // Get the productId from URL params
  const [product, setProduct] = useState(null);
  const [value, setValue] = React.useState(2);
  const [hover, setHover] = React.useState(-1);
  const [size, setSize] = useState(''); // State for selected size
  const [quantity, setQuantity] = useState(1); // State for selected quantity
  const [confirmation, setConfirmation] = useState(null); // State for confirmation message
  const auth = getAuth(); // Firebase authentication instance

  useEffect(() => {
    const fetchProduct = async () => {
      const productDoc = doc(db, 'inventory', productId);
      const docSnap = await getDoc(productDoc);

      if (docSnap.exists()) {
        setProduct(docSnap.data());
      } else {
        console.log("No such document!");
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleAddToCart = async () => {
    if (!auth.currentUser) {
      alert('You must be logged in to add items to the cart.');
      return;
    }

    if (!size) {
      alert('Please select a size');
      return;
    }

    const userId = auth.currentUser.uid; // Get logged-in user ID
    const newCartItem = {
      name: product.name,
      price: product.price,
      productId: product.id,
      size: size,
      quantity: quantity,
      userId: userId,
      createdAt: new Date(),
    };

    // Log the item being added for debugging purposes
    console.log('Adding item to cart:', newCartItem);

    // Add to the Cart collection
    try {
      // Check if the item already exists in the cart
      const cartRef = collection(db, 'cart');
      const q = query(cartRef, where('userId', '==', userId), where('productId', '==', product.id), where('size', '==', size));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert('This item is already in your cart.');
        return;
      }

      await setDoc(doc(collection(db, 'cart'), `${userId}-${product.id}-${size}`), newCartItem);
      setConfirmation('Product added to cart!');
      setTimeout(() => setConfirmation(null), 3000); // Clear confirmation after 3 seconds
    } catch (error) {
      console.error('Error adding product to cart: ', error);
      alert('There was an error adding the product to your cart.');
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  // Ensure sizes is a string before splitting it
  let sizes = [];
  if (typeof product.sizes === 'string') {
    sizes = product.sizes.split(',').map(size => size.trim()); // Split string into array
  } else if (Array.isArray(product.sizes)) {
    sizes = product.sizes.map(size => size.trim()); // In case sizes is already an array
  }

  console.log('Available Sizes:', sizes); // Debug log to check sizes

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6">
          <img
            src={product.images || 'https://via.placeholder.com/320'}
            alt={product.name}
            className="img-fluid"
          />
        </div>
        <div className="col-md-6">
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <h3>${product.price}</h3>
          <p><strong>Available Sizes:</strong> {sizes.join(', ')}</p> {/* Display sizes */}

          {/* Size Selector */}
          <select value={size} onChange={(e) => setSize(e.target.value)} className="form-control mb-2">
            <option value="">Select Size</option>
            {sizes.map((sizeOption) => (
              <option key={sizeOption} value={sizeOption}>
                {sizeOption}
              </option>
            ))}
          </select>

          {/* Quantity Selector */}
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, e.target.value))}
            className="form-control mb-2"
            min="1"
          />

          <button className="btn btn-primary mt-3" onClick={handleAddToCart}>
            Add to Cart
          </button>

          {/* Confirmation Message */}
          {confirmation && <div className="alert alert-success mt-3">{confirmation}</div>}
        </div>
      </div>

      {/* Rating Component */}
      <Rating
        name="hover-feedback"
        value={value}
        precision={0.5}
        getLabelText={getLabelText}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        onChangeActive={(event, newHover) => {
          setHover(newHover);
        }}
        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
      />
      {value !== null && (
        <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : value]}</Box>
      )}
    </div>
  );
};

export default ProductDetail;
