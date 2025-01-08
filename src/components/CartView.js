import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Card, CardContent, Typography, IconButton, Button, Grid, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';

const CartView = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth(); // Firebase authentication instance
  const navigate = useNavigate(); // Navigation hook

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!auth.currentUser) {
        setError('You must be logged in to view your cart');
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
        }
        setLoading(false);
      } catch (err) {
        setError('Error fetching cart items');
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [auth.currentUser]);

  const handleRemoveItem = async (itemId) => {
    try {
      await deleteDoc(doc(db, 'cart', itemId));
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error removing item from cart: ', err);
    }
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout'); // Navigate to checkout page
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><Typography>Loading...</Typography></Box>;
  }

  if (error) {
    return <Box display="flex" justifyContent="center" alignItems="center" height="100vh"><Typography>{error}</Typography></Box>;
  }

  return (
    <div className="container mt-5">
      <Typography variant="h4" gutterBottom>Your Cart</Typography>

      {cartItems.length === 0 ? (
        <Typography>Your cart is empty.</Typography>
      ) : (
        <Grid container spacing={3}>
          {cartItems.map(item => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{item.name}</Typography>
                  <Typography variant="body2">Size: {item.size}</Typography>
                  <Typography variant="body2">Price: ${item.price}</Typography>
                  <Typography variant="body2">Quantity: {item.quantity}</Typography>

                  <IconButton
                    color="error"
                    onClick={() => handleRemoveItem(item.id)}
                    style={{ marginTop: '10px' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleProceedToCheckout}
        style={{ marginTop: '20px' }}
      >
        Proceed to Checkout
      </Button>
    </div>
  );
};

export default CartView;
