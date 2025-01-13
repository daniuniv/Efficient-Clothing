import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { useHistory } from 'react-router-dom'; 
import { collection, getDocs, deleteDoc, doc, addDoc } from 'firebase/firestore';

const Cart = ({ userId }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    if (!userId) return;

    // Fetch the cart items for the user
    const fetchCartItems = async () => {
      try {
        const cartRef = collection(db, 'Cart');
        const q = query(cartRef, where('userId', '==', userId)); // Filter by userId
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const items = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
          setCartItems(items);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cart items:', error);
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [userId]);

  const removeFromCart = async (itemId) => {
    try {
      const itemRef = doc(db, 'Cart', itemId);
      await deleteDoc(itemRef);
      setCartItems(cartItems.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const placeOrder = async () => {
    try {
      const orderData = {
        customerId: userId,
        items: cartItems.map(item => ({ ...item, quantity: item.quantity })),
        totalAmount: cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
        createdAt: new Date(),
        status: 'Pending',
        deliveryAddress: {} // Add delivery address logic as needed
      };

      await addDoc(collection(db, 'Orders'), orderData);

      // Remove items from Cart
      for (let item of cartItems) {
        await removeFromCart(item.id);
      }
      
      history.push('/view-orders');
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };

  return (
    <div>
      <h1>My Cart</h1>
      {loading ? (
        <p>Loading...</p>
      ) : cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <ul>
            {cartItems.map(item => (
              <li key={item.id}>
                <p>{item.name} - {item.quantity} x ${item.price}</p>
                <button onClick={() => removeFromCart(item.id)}>Remove</button>
              </li>
            ))}
          </ul>
          <button onClick={placeOrder} disabled={cartItems.length === 0}>
            Place Order
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;
