import React, { useEffect, useState, useCallback } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, doc, getDoc, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const ViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [storeManagers, setStoreManagers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const ordersSnapshot = await getDocs(collection(db, "orders"));
      const ordersList = ordersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Verifică dacă ordersList are date
      if (!ordersList.length) {
        setOrders([]);
        return;
      }

      const filteredOrders = ordersList
        .map((order) => order.subOrders || []) // Asigură-te că subOrders există
        .flat()
        .filter(
          (order) =>
            order.customerId?.includes(userId) &&
            (!statusFilter || order.status === statusFilter)
        );

      setOrders(filteredOrders); // Setează ordinele filtrate
    } catch (err) {
      console.error("Error fetching orders:", err.message);
      setError("Failed to fetch orders. Please try again later.");
    } finally {
      setLoading(false); // Oprește starea de încărcare
    }
  }, [userId, statusFilter]);

  const fetchStoreManagers = useCallback(async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const storeManagersList = usersSnapshot.docs
        .filter((doc) => doc.data().role === "storeManager")
        .map((doc) => doc.id);
      setStoreManagers(storeManagersList);
    } catch (err) {
      console.error("Error fetching store managers:", err.message);
      setError("Failed to fetch store managers.");
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchOrders();
     // fetchStoreManagers();
    }
  }, [fetchOrders, userId]);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">My Orders</h2>

      {error && <p className="text-danger text-center">{error}</p>}

      {loading ? (
        <div className="text-center">Loading orders...</div>
      ) : (
        <div>
          {/* Status Filter Dropdown */}
          <div className="mb-3">
            <label htmlFor="statusFilter" className="form-label">
              Filter by Status:
            </label>
            <select
              id="statusFilter"
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Processed">Processed</option>
              <option value="Shipped">Shipped</option>
            </select>
          </div>

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
                {orders.map((order, index) => (
                  <tr key={index}>
                    <td>{order.orderId || "N/A"}</td>
                    <td>
                      {order.deliveryAddress
                        ? `${order.deliveryAddress.street || "N/A"}, ${
                            order.deliveryAddress.city || "N/A"
                          }`
                        : "N/A"}
                    </td>
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
                                  marginBottom: "10px",
                                }}
                                
                              />
                              {item.name} (x{item.quantity}) - $
                              {item.price.toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "No items"
                      )}
                    </td>
                    <td>${order.totalAmount?.toFixed(2) || "0.00"}</td>
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

export default ViewOrders;
