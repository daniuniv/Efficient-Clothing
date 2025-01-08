import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, getDoc, doc, deleteDoc } from 'firebase/firestore';
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
        const items = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
          const cartItem = docSnapshot.data();
          const inventoryRef = doc(db, 'inventory', cartItem.productId); // Corrected here
          const inventoryDoc = await getDoc(inventoryRef); // Correct usage of getDoc

          if (!inventoryDoc.exists()) {
            throw new Error('Inventory item not found');
          }
          const inventoryData = inventoryDoc.data();

          return {
            id: docSnapshot.id,
            ...cartItem,
            images: inventoryData?.images || 'https://via.placeholder.com/100',
          };
        }));

        if (items.length === 0) {
          setError('Your cart is empty.');
        } else {
          setCartItems(items);
        }
        setLoading(false);
      } catch (err) {
        setError('Error fetching cart items: ' + err.message); // Improved error message
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
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography>{error}</Typography>
      </Box>
    );
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
              <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box display="flex" alignItems="center" p={2}>
                  <img
                    src={item.images || 'https://via.placeholder.com/100'}
                    alt={item.name}
                    style={{ width: '100px', height: '100px', objectFit: 'cover', marginRight: '16px' }}
                  />
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography variant="body2">Size: {item.size}</Typography>
                    <Typography variant="body2">Price: ${item.price}</Typography>
                    <Typography variant="body2">Quantity: {item.quantity}</Typography>

                    <Box mt={2}>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveItem(item.id)}
                        style={{ marginRight: '10px' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box mt={4}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleProceedToCheckout}
          style={{ marginTop: '20px' }}
        >
          Proceed to Checkout
        </Button>
      </Box>
    </div>
  );
};

export default CartView;
