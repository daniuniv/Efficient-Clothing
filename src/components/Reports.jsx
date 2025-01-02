import React, { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [error, setError] = useState("");
  const [totalRevenue, setTotalRevenue] = useState(0);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const storeName = localStorage.getItem("storeName"); // Get the store name of the logged-in user

  // Fetch Orders Data for Sales Report
  const fetchSalesData = async () => {
    try {
      const ordersQuery = query(
        collection(db, "orders"),
        where("createdAt", ">=", new Date(startDate)),
        where("createdAt", "<=", new Date(endDate)),
        where("storeName", "==", storeName) // Filter orders by store name
      );
      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map((doc) => doc.data());

      let revenue = 0;
      orders.forEach((order) => {
        revenue += order.totalAmount || 0;
      });

      setSalesData(orders);
      setTotalRevenue(revenue);
    } catch (err) {
      console.error("Error fetching sales data:", err.message);
      setError("Failed to fetch sales data. Please try again later.");
    }
  };

  // Fetch Inventory Data
  const fetchInventoryData = async () => {
    try {
      const inventorySnapshot = await getDocs(collection(db, "inventory"));
      const inventory = inventorySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter inventory by store name
      const filteredInventory = inventory.filter(item => item.storeName === storeName);
      
      setInventoryData(filteredInventory);
    } catch (err) {
      console.error("Error fetching inventory data:", err.message);
      setError("Failed to fetch inventory data. Please try again later.");
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchSalesData();
    }
    fetchInventoryData();
  }, [startDate, endDate]);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Reports</h2>

      {error && <p className="text-danger text-center">{error}</p>}

      {/* Date Filters */}
      <div className="row mb-4">
        <div className="col-md-4">
          <label>Start Date:</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <label>End Date:</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Sales Summary */}
      <div className="card mb-4">
        <div className="card-header">
          <h4>Sales Summary</h4>
        </div>
        <div className="card-body">
          <p>
            <strong>Total Revenue:</strong> ${totalRevenue.toFixed(2)}
          </p>
          <table className="table table-bordered table-striped">
            <thead className="thead-dark">
              <tr>
                <th>Order ID</th>
                <th>Customer ID</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {salesData.length > 0 ? (
                salesData.map((order, index) => (
                  <tr key={index}>
                    <td>{order.orderId || "N/A"}</td>
                    <td>{order.customerId || "N/A"}</td>
                    <td>${order.totalAmount ? order.totalAmount.toFixed(2) : "0.00"}</td>
                    <td>{order.status || "N/A"}</td>
                    <td>{new Date(order.createdAt.seconds * 1000).toLocaleDateString() || "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No sales data found for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Report */}
      <div className="card">
        <div className="card-header">
          <h4>Inventory Report</h4>
        </div>
        <div className="card-body">
          <table className="table table-bordered table-striped">
            <thead className="thead-dark">
              <tr>
                <th>Item ID</th>
                <th>Name</th>
                <th>Stock Level</th>
                <th>Price</th>
                <th>Image</th> {/* New column for image */}
              </tr>
            </thead>
            <tbody>
              {inventoryData.length > 0 ? (
                inventoryData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name || "N/A"}</td>
                    <td>{item.stock || "0"}</td>
                    <td>${item.price ? item.price.toFixed(2) : "0.00"}</td>
                    <td>
                      {/* Display image if imageUrl exists */}
                      {item.images ? (
                        <img
                          src={item.images}
                          alt={item.name}
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                        />
                      ) : (
                        "No Image"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    No inventory data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
