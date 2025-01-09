import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, doc, getDoc, addDoc, updateDoc } from "firebase/firestore";
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
      const filteredOrders = ordersList.map(order => order.subOrders).flat().filter(order => order.storeName.includes(storeName));
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
        const userRef = doc(db, "users", managerId);
        const managerData = await getDoc(userRef);

        const notificationsRef = collection(db, "notifications");
        await addDoc(notificationsRef, {
          userId: managerId,
          message: `New Order placed by ${order.customerId} for ${order.storeName}`,
          orderId: order.orderId,
          timestamp: new Date(),
        });
      });
    } catch (err) {
      console.error("Error notifying store manager:", err.message);
    }
  };

  // Handle status change
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      // Get the order reference
      const orderRef = doc(db, "orders", orderId);
      
      // Fetch the order document to update the specific subOrder
      const orderSnapshot = await getDoc(orderRef);
      if (orderSnapshot.exists()) {
        const orderData = orderSnapshot.data();
  
        // Find the subOrder to update
        let subOrderId=orderId;
        const subOrderIndex = orderData.subOrders.findIndex(subOrder => subOrder.orderId === subOrderId);
        if (subOrderIndex !== -1) {
          // Update the status of the specific subOrder
          const updatedSubOrders = [...orderData.subOrders];
          updatedSubOrders[subOrderIndex] = {
            ...updatedSubOrders[subOrderIndex],
            status: newStatus,
          };
  
          // Update the entire order with the new subOrders array
          await updateDoc(orderRef, {
            subOrders: updatedSubOrders,
          });
  
          // Update the order status in local state (for UI)
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.orderId === orderId
                ? {
                    ...order,
                    subOrders: order.subOrders.map((subOrder) =>
                      subOrder.id === subOrderId
                        ? { ...subOrder, status: newStatus }
                        : subOrder
                    ),
                  }
                : order
            )
          );
        }
      }
    } catch (err) {
      console.error("Error updating subOrder status:", err.message);
      setError("Failed to update subOrder status.");
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
                  <th>Action</th>
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

                    {/* Action - Change Status */}
                    <td>
                      <select
                        value={order.status || "N/A"}
                        onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
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
