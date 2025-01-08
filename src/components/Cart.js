import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const auth = getAuth();

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!auth.currentUser) {
        return;
      }

      const userId = auth.currentUser.uid;
      const cartQuery = query(collection(db, 'cart'), where('userId', '==', userId));
      const querySnapshot = await getDocs(cartQuery);

      const items = [];
      querySnapshot.forEach((doc) => {
        items.push(doc.data());
      });

      setCartItems(items);
    };

    fetchCartItems();
  }, [auth.currentUser]);

  return (
    <div className="container mt-5">
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <div key={`${item.userId}-${item.productId}-${item.size}`} className="mb-3">
              <h4>{item.name} - {item.size}</h4>
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
