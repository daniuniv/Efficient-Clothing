import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
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

      // Filter orders by the store name within subOrders
      const filteredOrders = ordersList
        .map(order => ({
          ...order, // Include main order fields
          subOrders: Array.isArray(order.subOrders) ? order.subOrders.filter(subOrder => subOrder.storeName === storeName) : [] // Ensure subOrders is an array
        }))
        .filter(order => order.subOrders.length > 0); // Ensure there are subOrders for the store

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

  // Handle status change
  const handleStatusChange = async (orderId, newStatus, subOrderId) => {
    try {
      // Get the order reference
      const orderRef = doc(db, "orders", orderId);

      // Fetch the order document to update the specific subOrder
      const orderSnapshot = await getDoc(orderRef);
      if (orderSnapshot.exists()) {
        const orderData = orderSnapshot.data();

        // Ensure subOrders is an array
        if (Array.isArray(orderData.subOrders)) {
          // Find the subOrder to update
          const subOrderIndex = orderData.subOrders.findIndex(subOrder => subOrder.orderId === subOrderId);
          if (subOrderIndex !== -1) {
            // Update the status of the specific subOrder
            const updatedSubOrders = [...orderData.subOrders];
            updatedSubOrders[subOrderIndex] = {
              ...updatedSubOrders[subOrderIndex],
              status: newStatus,
            };
            
            // Check if all sub-orders have the same status
            const allSubOrdersSameStatus = updatedSubOrders.every(subOrder => subOrder.status === newStatus);

            // If all sub-orders have the same status, update the main order's status
            if (allSubOrdersSameStatus) {
              await updateDoc(orderRef, {
                status: newStatus, // Update the main order's status
              });
            }
            // Update the entire order with the new subOrders array
            await updateDoc(orderRef, {
              subOrders: updatedSubOrders,
            });

            // Update the order status in local state (for UI)
            setOrders((prevOrders) =>
              prevOrders.map((order) =>
                order.id === orderId
                  ? {
                      ...order,
                      subOrders: order.subOrders.map((subOrder) =>
                        subOrder.orderId === subOrderId
                          ? { ...subOrder, status: newStatus }
                          : subOrder
                      ),
                    }
                  : order
              )
            );
          }
        }
      }
      // Reload the page after updating the status
      window.location.reload();
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
            <table className="table table-bordered table-striped" style={{ border: "2px solid black" }}>
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
                  <>
                    {/* Render main order details */}
                    <tr key={order.id}>
                      <td colSpan="6" className="table-secondary">
                        <strong>Main Order:</strong> {order.id}
                      </td>
                    </tr>
                    {/* Render sub-orders for this main order */}
                    {order.subOrders.map((subOrder) => (
                      <tr key={subOrder.orderId}>
                        <td>{subOrder.orderId}</td>
                        <td>
                          {/* Main Order's Delivery Address is shown for each sub-order row */}
                          {order.deliveryAddress
                            ? `${order.deliveryAddress.street || "N/A"}, ${order.deliveryAddress.city || "N/A"}`
                            : "N/A"}
                        </td>
                        <td>
                          {subOrder.items && subOrder.items.length > 0 ? (
                            <ul>
                              {subOrder.items.map((item, index) => (
                                <li key={index}>
                                  <img
                                    src={item.image}
                                    style={{
                                      width: "50px",
                                      height: "50px",
                                      objectFit: "cover",
                                      marginRight: "10px",
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
                        <td>${subOrder.totalAmount ? subOrder.totalAmount.toFixed(2) : "0.00"}</td>
                        <td>{subOrder.status || "N/A"}</td>
                        <td>
                          <select
                            value={subOrder.status || "N/A"}
                            onChange={(e) => handleStatusChange(order.id, e.target.value, subOrder.orderId)} // Correct subOrderId passed
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </>
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
