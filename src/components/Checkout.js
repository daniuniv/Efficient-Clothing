import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, setDoc, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Grid,
  Paper,
} from "@mui/material";
import { styled } from "@mui/system";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [deliveryAddress, setDeliveryAddress] = useState({ street: "", city: "", postalCode: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        const cartSnapshot = await getDocs(collection(db, "cart"));
        const cartList = cartSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((item) => item.userId === userId);

        setCartItems(cartList);
        const total = cartList.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setTotalAmount(total);
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

  const handleCheckout = async () => {
    try {
      const groupedItems = cartItems.reduce((acc, item) => {
        const storeName = item.storeName || "Unknown Store";
        if (!acc[storeName]) {
          acc[storeName] = [];
        }
        acc[storeName].push(item);
        return acc;
      }, {});

      const subOrders = [];

      for (const store in groupedItems) {
        const items = [];
        for (let item of groupedItems[store]) {
          const itemRef = doc(db, "inventory", item.productId);
          const itemSnap = await getDoc(itemRef);
          const itemData = itemSnap.data();
          const imageUrls = itemData ? itemData.images : [];
          items.push({
            name: item.name,
            size: item.size,
            quantity: item.quantity,
            price: item.price,
            productId: item.productId,
            image: imageUrls,
            storeName: item.storeName,
          });
        }
        subOrders.push({
          items,
          storeName: store,
        });
      }

      const orderId = `order-${Date.now()}`;
      const newOrder = {
        customerId: userId,
        deliveryAddress,
        orderId,
        subOrders,
        totalAmount,
        status: "Processing",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const orderRef = doc(db, "orders", orderId);
      await setDoc(orderRef, newOrder);

      for (let item of cartItems) {
        await deleteDoc(doc(db, "cart", item.id));
      }

      for (let item of cartItems) {
        const itemRef = doc(db, "inventory", item.productId);
        const itemSnap = await getDoc(itemRef);
        const itemData = itemSnap.data();
        const updatedSizes = itemData.sizes.map((sizeObj) => {
          if (sizeObj.size === item.size) {
            sizeObj.quantity -= item.quantity;
          }
          return sizeObj;
        });
        await updateDoc(itemRef, { sizes: updatedSizes });
      }

      alert("Order placed successfully!");
    } catch (err) {
      setError("Checkout failed. Please try again.");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ padding: 3 }}>
      <Paper elevation={3} sx={{ padding: 3, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center">Checkout</Typography>

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
            <CircularProgress />
          </Box>
        )}

        {error && <Typography color="error">{error}</Typography>}

        <Box marginBottom={2}>
          <Typography variant="h6" gutterBottom>Delivery Address</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Street"
                variant="outlined"
                fullWidth
                value={deliveryAddress.street}
                onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                sx={{ marginBottom: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="City"
                variant="outlined"
                fullWidth
                value={deliveryAddress.city}
                onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                sx={{ marginBottom: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Postal Code"
                variant="outlined"
                fullWidth
                value={deliveryAddress.postalCode}
                onChange={(e) => setDeliveryAddress({ ...deliveryAddress, postalCode: e.target.value })}
                sx={{ marginBottom: 2 }}
              />
            </Grid>
          </Grid>
        </Box>

        <Typography variant="h6" gutterBottom>Total: ${totalAmount.toFixed(2)}</Typography>

        <Button
  variant="contained"
  fullWidth
  onClick={handleCheckout}
  sx={{
    backgroundColor: '#47b49c',
    '&:hover': {
      backgroundColor: '#3c9b7b',
    },
    padding: '12px',
    fontSize: '16px',
  }}
>
  Confirm Order
</Button>

      </Paper>
    </Container>
  );
};

export default Checkout;
