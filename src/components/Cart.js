import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth(); // Firebase authentication instance

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="container mt-5">
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <div>Your cart is empty.</div>
      ) : (
        <div>
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <h4>{item.name}</h4>
              <p>Size: {item.size}</p>
              <p>Price: ${item.price}</p>
              <p>Quantity: {item.quantity}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Cart;
