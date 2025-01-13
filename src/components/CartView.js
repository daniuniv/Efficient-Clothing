import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // Importing useNavigate for redirection
import { Button, Card, CardContent, Typography, Grid, IconButton, LinearProgress } from "@mui/material"; // MUI components
import DeleteIcon from "@mui/icons-material/Delete"; // MUI delete icon

const CartView = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const navigate = useNavigate(); // Using navigate hook for redirection

  // Fetch cart items
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        const cartSnapshot = await getDocs(collection(db, "cart"));
        const cartList = cartSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((item) => item.userId === userId); // Filter by userId
        
        setCartItems(cartList);
      } catch (err) {
        setError("Failed to load cart items.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchCartItems();
    }
  }, [userId]);

  // Remove item from cart
  const removeItemFromCart = async (itemId) => {
    try {
      await deleteDoc(doc(db, "cart", itemId)); // Delete from cart collection
      setCartItems(cartItems.filter((item) => item.id !== itemId)); // Update local state
    } catch (err) {
      setError("Failed to remove item from cart.");
    }
  };

  // Redirect to checkout page
  const handleCheckout = () => {
    navigate("/checkout"); // Navigate to checkout page
  };

  return (
    <div className="container mt-5">
      {loading && (
        <LinearProgress
          sx={{
            height: 4,
            backgroundColor: "#f0f0f0",
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#47b49c',
            },
          }}
        />
      )}
      
      <Typography variant="h4" gutterBottom>Your Cart</Typography>
      {error && <p className="text-danger">{error}</p>}

      {cartItems.length === 0 ? (
        <p>No items in your cart.</p>
      ) : (
        <>
          <Grid container spacing={2}>
            {cartItems.map((item) => {
              // Determine object position for image based on category
              const objectPosition = ['Pants', 'Sweatpants', 'Jeans'].includes(item.category) ? 'bottom' : 'top';
              
              return (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card sx={{ border: '1px solid #000', boxShadow: 3 }}>
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item>
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                              objectPosition: objectPosition, // Position the image
                            }}
                          />
                        </Grid>
                        <Grid item xs>
                          <Typography variant="body1" fontWeight="bold">{item.name}</Typography>
                          <Typography variant="body2" fontStyle="italic">Size: {item.size}</Typography>
                          <Typography variant="body2" fontStyle="italic">Quantity: {item.quantity}</Typography>
                        </Grid>
                        <Grid item>
                          <IconButton onClick={() => removeItemFromCart(item.id)}>
                            <DeleteIcon color="error" />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
          <Button
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: '#47b49c',
              '&:hover': { backgroundColor: '#3c9b7b' },
              marginTop: '16px',
              padding: '12px',
              fontSize: '16px',
            }}
            onClick={handleCheckout} // Call handleCheckout when button is clicked
          >
            Proceed to Checkout
          </Button>
        </>
      )}
    </div>
  );
};

export default CartView;
