import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // For loading state
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
      const filteredOrders = ordersList.filter(order => order.storeName === storeName);

      setOrders(filteredOrders);
    } catch (err) {
      console.error("Error fetching orders:", err.message);
      setError("Failed to fetch orders. Please try again later.");
    } finally {
      setLoading(false); // End loading
    }
  };

  useEffect(() => {
    fetchOrders();
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
                                src={item.images}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                  marginRight: "10px",
                                  marginBottom: '10px',
                                }}
                                alt={item.name}
                              />
                              {item.name} (x{item.stock}) - ${item.price.toFixed(2)}
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
