import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, doc, getDoc, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [storeManagers, setStoreManagers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // For loading state
  const auth = getAuth(); // Firebase authentication instance
  const storeName = localStorage.getItem("storeName"); // Get the store name of the logged-in user

  // Fetch orders from Firestore
  const fetchOrders = async () => {
    try {
      setLoading(true); // Start loading
      const ordersSnapshot = await getDocs(collection(db, "orders"));
      const ordersList = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter orders by the store name
    
      console.log(ordersList);

      const filteredOrders = ordersList.map(order => order.subOrders).flat().filter(order => order.storeName.includes(storeName));
     
      console.log(filteredOrders);
      
      setOrders(filteredOrders);
    } catch (err) {
      console.error("Error fetching orders:", err.message);
      setError("Failed to fetch orders. Please try again later.");
    } finally {
      setLoading(false); // End loading
    }
  };

  // Fetch store managers from Firestore
  const fetchStoreManagers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const storeManagersList = usersSnapshot.docs
        .filter(doc => doc.data().role === "storeManager")
        .map(doc => doc.id);
      setStoreManagers(storeManagersList);
    } catch (err) {
      console.error("Error fetching store managers:", err.message);
      setError("Failed to fetch store managers.");
    }
  };

  // Notify store managers of the new order
  const notifyStoreManager = async (order) => {
    try {
      storeManagers.forEach(async (managerId) => {
        console.log("Notifying manager with ID: ", managerId);
        const userRef = doc(db, "users", managerId);
        const managerData = await getDoc(userRef);
        console.log("Manager Data: ", managerData.data());

        const notificationsRef = collection(db, "notifications");
        await addDoc(notificationsRef, {
          userId: managerId,
          message: `New Order placed by ${order.customerId} for ${order.storeName}`,
          orderId: order.orderId,
          timestamp: new Date(),
        });
        console.log("Notification added successfully");
      });
    } catch (err) {
      console.error("Error notifying store manager:", err.message);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStoreManagers();
  }, []); // Run once on mount

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">My Orders</h2>

      {error && <p className="text-danger text-center">{error}</p>}

      {loading ? (
        <div className="text-center">Loading orders...</div> // Loading state
      ) : (
        <div>
          {orders.length === 0 ? (
            <div className="text-center">You have no orders for this store.</div>
          ) : (
            <table className="table table-bordered table-striped">
              <thead className="thead-dark">
                <tr>
                  <th>Order ID</th>
                  <th>Delivery Address</th>
                  <th>Items</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    {/* Order ID */}
                    <td>{order.orderId || "N/A"}</td>

                    {/* Delivery Address */}
                    <td>
                      {order.deliveryAddress
                        ? `${order.deliveryAddress.street || "N/A"}, ${order.deliveryAddress.city || "N/A"}`
                        : "N/A"}
                    </td>

                    {/* Items */}
                    <td>
                      {order.items && order.items.length > 0 ? (
                        <ul>
                          {order.items.map((item, index) => (
                            <li key={index}>
                              <img
                                src={item.image}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                  marginRight: "10px",
                                  marginBottom: '10px',
                                }}
                                
                              />
                              {item.name} (x{item.quantity}) - ${item.price.toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "No items"
                      )}
                    </td>

                    {/* Total Amount */}
                    <td>${order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}</td>

                    {/* Status */}
                    <td>{order.status || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
