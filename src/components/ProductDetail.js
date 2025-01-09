import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebaseConfig';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
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
  const [value, setValue] = useState(2); // Rating value
  const [hover, setHover] = useState(-1);
  const [comment, setComment] = useState(''); // Comment value
  const [size, setSize] = useState(''); // State for selected size
  const [quantity, setQuantity] = useState(1); // State for selected quantity
  const [confirmation, setConfirmation] = useState(null); // State for confirmation message
  const [averageRating, setAverageRating] = useState(null); // State for average rating
  const [reviews, setReviews] = useState([]); // State for reviews
  const auth = getAuth(); // Firebase authentication instance

  useEffect(() => {
    const fetchProduct = async () => {
      const productDoc = doc(db, 'inventory', productId);
      const docSnap = await getDoc(productDoc);

      if (docSnap.exists()) {
        setProduct(docSnap.data());
      } else {
        console.log('No such document!');
      }
    };

    // Define fetchReviews inside useEffect
    const fetchReviews = async () => {
      const reviewsRef = collection(db, 'reviews');
      const q = query(reviewsRef, where('itemId', '==', productId));
      const querySnapshot = await getDocs(q);

      console.log('Fetching reviews...');
      console.log(querySnapshot.size, 'reviews found for productId:', productId);

      let reviewData = [];
      let totalRating = 0;
      let reviewCount = 0;

      querySnapshot.forEach((doc) => {
        const review = doc.data();
        reviewData.push(review);
        totalRating += review.rating;
        reviewCount++;
      });

      console.log('Total reviews fetched:', reviewData.length);

      if (reviewCount > 0) {
        setAverageRating(totalRating / reviewCount);
      } else {
        setAverageRating(0); // No reviews yet
      }

      setReviews(reviewData);
    };

    if (productId) {
      fetchProduct();
      fetchReviews(); // Fetch reviews after product data
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
      image: product.images,
      price: product.price,
      productId: product.id,
      size: size,
      quantity: quantity,
      userId: userId,
      createdAt: new Date(),
      storeName: product.storeName,
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
      setSize(''); // Reset size selection after adding to cart
      setQuantity(1); // Reset quantity after adding to cart
      setTimeout(() => setConfirmation(null), 3000); // Clear confirmation after 3 seconds
    } catch (error) {
      console.error('Error adding product to cart: ', error);
      alert('There was an error adding the product to your cart.');
    }
  };

  const handleRatingSubmit = async () => {
    if (!auth.currentUser) {
      alert('You must be logged in to submit a review.');
      return;
    }
  
    const userId = auth.currentUser.uid; // Get the current user's ID
    const userName = auth.currentUser.email;
    if (!value || value < 0.5) {
      alert('Please provide a valid rating.');
      return;
    }
  
    const newReviewData = {
      rating: value,
      comment: comment.trim(),
      createdAt: serverTimestamp(),
      customerId: userId,
      customerName: userName,
      itemId: productId,
      reviewId: `${userId}-${productId}`,
    };
  
    try {
      const reviewRef = doc(db, 'reviews', newReviewData.reviewId);
      await setDoc(reviewRef, newReviewData);
      setComment(''); // Clear the comment input
      alert('Thank you for your feedback!');
      const reviewsRef = collection(db, 'reviews');
      const q = query(reviewsRef, where('itemId', '==', productId));
      const querySnapshot = await getDocs(q);
  
      console.log('Fetching reviews...');
      console.log(querySnapshot.size, 'reviews found for productId:', productId);
  
      let fetchedReviews = [];
      let totalRating = 0;
      let reviewCount = 0;
  
      querySnapshot.forEach((doc) => {
        const review = doc.data();
        fetchedReviews.push(review);
        totalRating += review.rating;
        reviewCount++;
      });
  
      console.log('Total reviews fetched:', fetchedReviews.length);
  
      if (reviewCount > 0) {
        setAverageRating(totalRating / reviewCount);
      } else {
        setAverageRating(0); // No reviews yet
      }
  
      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('There was an error submitting your review. Please try again.');
    }
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  // Ensure sizes is a string before splitting it
  let sizes = [];
  if (typeof product.sizes === 'string') {
    sizes = product.sizes.split(',').map((size) => size.trim());
  } else if (Array.isArray(product.sizes)) {
    sizes = product.sizes.map((size) => size.trim());
  }

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
          <p><strong>Available Sizes:</strong> {sizes.join(', ')}</p>
          <p><strong>Available Quantity:</strong> {product?.stock || 'Not available'}</p>

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

      {/* Rating and Comment Section */}
      <div className="mt-5">
        <h4>Rate and Review this Product</h4>
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
        {value !== null && <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : value]}</Box>}

        <textarea
          className="form-control mt-3"
          placeholder="Write your comment here..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <button className="btn btn-success mt-3" onClick={handleRatingSubmit}>
          Submit Review
        </button>
      </div>

      {/* Average Rating and Reviews */}
      <div className="mt-5">
        <h4>Average Rating: {averageRating ? averageRating.toFixed(1) : 'No ratings yet'}</h4>
        {reviews.length > 0 ? (
          <ul className="list-unstyled">
            {reviews.map((review) => (
              <li key={review.reviewId}>
                <div>
                  <strong>{review.customerName}</strong> - {review.createdAt instanceof Timestamp ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : 'Date not available'}
                </div>
                <Rating value={review.rating} readOnly />
                <p>{review.comment}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No reviews yet. Be the first to leave a review!</p>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
