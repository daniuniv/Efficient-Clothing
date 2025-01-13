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
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import Rating from '@mui/material/Rating';
import Box from '@mui/material/Box';
import StarIcon from '@mui/icons-material/Star';
import { Carousel } from 'react-bootstrap'; // Bootstrap Carousel import
import { Button } from '@mui/material'; // MUI Buttons
import { CircularProgress } from '@mui/material';

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
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [value, setValue] = useState(2);
  const [hover, setHover] = useState(-1);
  const [comment, setComment] = useState('');
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [confirmation, setConfirmation] = useState(null);
  const [averageRating, setAverageRating] = useState(null);
  const [reviews, setReviews] = useState([]);
  const auth = getAuth();

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

    const fetchReviews = async () => {
      const reviewsRef = collection(db, 'reviews');
      const q = query(reviewsRef, where('itemId', '==', productId));
      const querySnapshot = await getDocs(q);

      let reviewData = [];
      let totalRating = 0;
      let reviewCount = 0;

      querySnapshot.forEach((doc) => {
        const review = doc.data();
        reviewData.push(review);
        totalRating += review.rating;
        reviewCount++;
      });

      if (reviewCount > 0) {
        setAverageRating(totalRating / reviewCount);
      } else {
        setAverageRating(0);
      }

      setReviews(reviewData);
    };

    if (productId) {
      fetchProduct();
      fetchReviews();
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
  
    if (!product) {
      alert('Product data is missing.');
      return;
    }
  
    if (!product.id || !product.name || !product.images || !product.price || !product.storeName) {
      alert('Product data is incomplete.');
      return;
    }
  
    const userId = auth.currentUser.uid;
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
  
    try {
      const cartRef = collection(db, 'cart');
      const q = query(
        cartRef,
        where('userId', '==', userId),
        where('productId', '==', product.id),
        where('size', '==', size)
      );
  
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        alert('This item is already in your cart.');
        return;
      }
  
      // Add the new item to the cart collection
      await setDoc(doc(collection(db, 'cart'), `${userId}-${product.id}-${size}`), newCartItem);
  
      // Update confirmation and reset form fields
      setConfirmation('Product added to cart!');
      setSize('');
      setQuantity(1);
      setTimeout(() => setConfirmation(null), 3000);
    } catch (error) {
      console.error('Error adding product to cart:', error);
      alert('There was an error adding the product to your cart. Please check the console for more details.');
    }
  };
  

  const handleRatingSubmit = async () => {
    if (!auth.currentUser) {
      alert('You must be logged in to submit a review.');
      return;
    }

    const userId = auth.currentUser.uid;
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
      setComment('');
      alert('Thank you for your feedback!');
      const reviewsRef = collection(db, 'reviews');
      const q = query(reviewsRef, where('itemId', '==', productId));
      const querySnapshot = await getDocs(q);

      let fetchedReviews = [];
      let totalRating = 0;
      let reviewCount = 0;

      querySnapshot.forEach((doc) => {
        const review = doc.data();
        fetchedReviews.push(review);
        totalRating += review.rating;
        reviewCount++;
      });

      if (reviewCount > 0) {
        setAverageRating(totalRating / reviewCount);
      } else {
        setAverageRating(0);
      }

      setReviews(fetchedReviews);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('There was an error submitting your review. Please try again.');
    }
  };

  if (!product) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress sx={{ color: '#5be9c5' }} />
      </Box>
    );
  }

  const sizes = product.sizes || [];

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-6">
          <Carousel>
            {product.images && product.images.split(',').map((image, index) => (
              <Carousel.Item key={index}>
                <img
                  src={image || 'https://via.placeholder.com/785x1003'}
                  alt={product.name}
                  className="d-block w-100"
                  style={{
                    height: '1003px', 
                    width: '785px',
                    objectFit: 'cover',
                  }}
                />
              </Carousel.Item>
            ))}
          </Carousel>

          <h4 className="mt-5">Customer Reviews</h4>
          <p>
            <strong>Average Rating:</strong>{' '}
            {averageRating !== null ? averageRating.toFixed(2) : 'No ratings yet'} / 5
          </p>
          <div>
            {reviews.map((review) => (
              <div key={review.reviewId} className="border-bottom pb-3 mb-3">
                <Rating value={review.rating} readOnly />
                <p><strong>{review.customerName}</strong> says:</p>
                <p>{review.comment}</p>
                <p className="text-muted">
                  {review.createdAt?.seconds
                    ? new Date(review.createdAt.seconds * 1000).toLocaleDateString()
                    : 'Unknown date'}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="col-md-6">
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <h3>${product.price}</h3>

          <div className="mb-3">
            <strong>Available Sizes:</strong>
            <div className="d-flex flex-wrap">
              {sizes.map((sizeOption) => (
                <Button
                  key={sizeOption.size}
                  onClick={() => setSize(sizeOption.size)}
                  disabled={sizeOption.quantity === 0}
                  className={`variant-size-item ${size === sizeOption.size ? 'selected' : ''}`}
                  style={{
                    margin: '5px',
                    minWidth: '72px',
                    height: '35px',
                    fontSize: '12px',
                    borderRadius: '0.45rem',
                    textTransform: 'capitalize',
                    backgroundColor: sizeOption.quantity === 0 
                      ? '#B0B0B0' 
                      : (size === sizeOption.size ? '#47b49c' : '#333'),
                    color: '#fff',
                    transition: 'background-color 0.2s ease',
                    border: '2px solid #fff',
                    outline: 'none',
                    boxShadow: '0 0 3px rgba(255, 255, 255, 0.2)',
                  }}
                >
                  {sizeOption.size}
                </Button>
              ))}
            </div>
          </div>

          <div className="d-flex align-items-center">
            <label htmlFor="quantity" style={{ marginRight: '10px' }}>Quantity:</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, e.target.value))}
              style={{ width: '60px', marginRight: '10px' }}
            />
          </div>

          <Button
            variant="contained"
            color="primary"
            onClick={handleAddToCart}
            sx={{
              marginTop: '20px',
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#47b49c',
              '&:hover': { backgroundColor: '#3c9b7b' },
            }}
          >
            Add to Cart
          </Button>

          {confirmation && (
            <div style={{ marginTop: '20px', color: '#28a745' }}>
              <strong>{confirmation}</strong>
            </div>
          )}

          <div className="mt-5">
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Rating
                name="hover-feedback"
                value={value}
                precision={0.5}
                getLabelText={getLabelText}
                onChange={(event, newValue) => setValue(newValue)}
                onChangeActive={(event, newHover) => setHover(newHover)}
              />
              {value !== null && (
                <Box sx={{ ml: 2 }}>
                  {labels[hover !== -1 ? hover : value]}
                </Box>
              )}
            </Box>
            <div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review..."
                rows="4"
                cols="50"
                style={{ marginTop: '10px', width: '100%' }}
              />
            </div>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleRatingSubmit}
              sx={{ marginTop: '10px' }}
            >
              Submit Review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
