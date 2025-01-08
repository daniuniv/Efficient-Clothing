import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState({ city: '', postalCode: '', street: '' });
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');
  const [totalAmount, setTotalAmount] = useState(0);
  const auth = getAuth(); // Firebase authentication instance
  const navigate = useNavigate(); // Navigation hook

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!auth.currentUser) {
        setError('You must be logged in to proceed to checkout');
        setLoading(false);
        return;
      }

      const userId = auth.currentUser.uid;
      const cartRef = collection(db, 'cart');
      const q = query(cartRef, where('userId', '==', userId));

      try {
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (items.length === 0) {
          setError('Your cart is empty.');
        } else {
          setCartItems(items);
          const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
          setTotalAmount(total);
        }
        setLoading(false);
      } catch (err) {
        setError('Error fetching cart items');
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [auth.currentUser]);

  const handlePlaceOrder = async () => {
    // Validate delivery address
    if (!deliveryAddress.city || !deliveryAddress.postalCode || !deliveryAddress.street) {
      setError('Please fill in all address fields');
      return;
    }

    const userId = auth.currentUser.uid;
    const orderId = `order-${Date.now()}`; // Generate unique order ID

    // Ensure all cart item data is available and avoid undefined values
    const items = cartItems.map(item => ({
      name: item.name || '', // Default to empty string if not set
      price: item.price || 0, // Default to 0 if not set
      quantity: item.quantity || 0, // Default to 0 if not set
      size: item.size || '', // Default to empty string if not set
      productId: item.productId || '', // Default to empty string if not set
      image: item.image || '', // Default to empty string if not set
    }));

    // Check if all fields are valid
    if (items.some(item => !item.name || !item.price || !item.quantity || !item.size || !item.productId)) {
      setError('One or more cart items are missing required data');
      return;
    }

    const newOrder = {
      customerId: userId,
      deliveryAddress,
      items,
      orderId,
      status: 'Pending',
      storeName: 'My Store', // You can dynamically get the store name if needed
      totalAmount,
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentMethod,
    };

    console.log('New Order Data:', newOrder); // Log the order data for debugging

    // Add to Orders collection
    const batch = writeBatch(db); // Create a batch for atomic operation
    try {
      // Add order to Orders collection
      const orderRef = doc(collection(db, 'orders'), orderId);
      batch.set(orderRef, newOrder);

      // Remove items from Cart collection
      cartItems.forEach(item => {
        const cartDocRef = doc(db, 'cart', item.id);
        batch.delete(cartDocRef);
      });

      // Commit batch operations
      await batch.commit();

      // Show success message
      alert('Your order has been confirmed!');
      navigate('/'); // Navigate back to the home page or catalog
    } catch (err) {
      console.error('Error placing order:', err);
      setError(`There was an error placing your order: ${err.message || err}`);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-5">
      <Typography variant="h4" gutterBottom>Checkout</Typography>

      <Paper elevation={3} style={{ padding: '20px' }}>
        <Typography variant="h6" gutterBottom>Delivery Address</Typography>
        <TextField
          label="Street"
          value={deliveryAddress.street}
          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="City"
          value={deliveryAddress.city}
          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Postal Code"
          value={deliveryAddress.postalCode}
          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, postalCode: e.target.value })}
          fullWidth
          margin="normal"
        />
      </Paper>

      {error && <Typography color="error" variant="body2">{error}</Typography>}

      <Box mt={3}>
        <Typography variant="h6" gutterBottom>Payment Method</Typography>
        <TextField
          label="Payment Method"
          value={paymentMethod}
          disabled
          fullWidth
          margin="normal"
        />
      </Box>

      <Box mt={3}>
        <Typography variant="h6" gutterBottom>Total Amount: ${totalAmount}</Typography>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={handlePlaceOrder}
        fullWidth
        style={{ marginTop: '20px' }}
      >
        Confirm Order
      </Button>
    </div>
  );
};

export default Checkout;
