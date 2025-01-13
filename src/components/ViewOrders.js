import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore"; // Use onSnapshot for real-time updates
import { getAuth } from "firebase/auth";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { styled } from "@mui/system";

// Custom styled TableCell for consistent design
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  padding: theme.spacing(2),
  textAlign: "center",
  border: "1px solid black", // Border for each table cell
}));

// Custom styled Table for adding black outline
const StyledTable = styled(Table)(({ theme }) => ({
  border: "1px solid black", // Border for the entire table
  "& thead": {
    backgroundColor: "#f5f5f5", // Light gray background for the header
  },
  "& th, td": {
    border: "1px solid black", // Adds border to table cells
  },
}));

const ViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // Filter for status
  const [sortDirection, setSortDirection] = useState("desc"); // Toggle sort order: "asc" or "desc"
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  // Fetch orders for the logged-in user in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (ordersSnapshot) => {
      try {
        setLoading(true);
        const ordersList = ordersSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((order) => order.customerId === userId); // Filter orders by userId

        // Sort orders by the `createdAt` timestamp in the desired direction
        const sortedOrders = ordersList.sort((a, b) => {
          const dateA = a.createdAt?.seconds || 0;
          const dateB = b.createdAt?.seconds || 0;
          return sortDirection === "desc" ? dateB - dateA : dateA - dateB;
        });

        // Apply status filter if any
        const filteredOrders = statusFilter
          ? sortedOrders.filter((order) => order.status === statusFilter)
          : sortedOrders;

        setOrders(filteredOrders);
      } catch (err) {
        setError("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    });

    // Cleanup on component unmount
    return () => unsubscribe();
  }, [userId, statusFilter, sortDirection]);

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Your Orders
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
          <CircularProgress />
        </Box>
      )}
      {error && <Typography color="error">{error}</Typography>}

      {/* Filters (aligned in a row) */}
      <Box display="flex" justifyContent="space-between" gap={2} marginBottom={2}>
        {/* Status Filter Dropdown */}
        <FormControl size="small" fullWidth sx={{ width: '200px' }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label="Status Filter"
            size="small"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Processing">Processing</MenuItem>
            <MenuItem value="Shipped">Shipped</MenuItem>
            <MenuItem value="Delivered">Pending</MenuItem>
          </Select>
        </FormControl>

        {/* Sort Direction Toggle */}
        <FormControl size="small" fullWidth sx={{ width: "auto" }}>
          <InputLabel>Sort by Date</InputLabel>
          <Select
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value)}
            label="Sort by Date"
            size="small"
          >
            <MenuItem value="desc">Newest First</MenuItem>
            <MenuItem value="asc">Oldest First</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {orders.length === 0 ? (
        <Typography>No orders found.</Typography>
      ) : (
        <TableContainer component={Paper}>
          <StyledTable>
            <TableHead>
              <TableRow>
                <StyledTableCell>Order ID</StyledTableCell>
                <StyledTableCell>Item Images</StyledTableCell>
                <StyledTableCell>Item Name</StyledTableCell>
                <StyledTableCell>Size</StyledTableCell>
                <StyledTableCell>Quantity</StyledTableCell>
                <StyledTableCell>Order Placed</StyledTableCell>
                <StyledTableCell>Status</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <StyledTableCell component="th" scope="row">
                    {order.orderId || `order-${order.id}`}
                  </StyledTableCell>
                  <StyledTableCell>
                    {order.subOrders?.map((subOrder, index) => (
                      <Box key={index} display="flex" flexDirection="column" alignItems="center">
                        {subOrder.items?.map((item, itemIndex) => {
                          const imageUrls = Array.isArray(item.image)
                            ? item.image
                            : item.image
                            ? item.image.split(",").map((url) => url.trim())
                            : [];
                          const firstImageUrl = imageUrls[0];

                          return (
                            <Box key={itemIndex} display="flex" alignItems="center" marginBottom="5px">
                              {firstImageUrl && (
                                <img
                                  src={firstImageUrl}
                                  alt={item.name}
                                  style={{
                                    width: 50,
                                    height: 50,
                                    objectFit: "cover",
                                    marginTop: "10px",
                                    marginRight: "5px",
                                  }}
                                />
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    ))}
                  </StyledTableCell>
                  <StyledTableCell>
                    {order.subOrders?.map((subOrder, index) => (
                      <div key={index}>
                        {subOrder.items?.map((item, i) => (
                          <div key={i}>
                            <Typography variant="body2">{item.name}</Typography>
                          </div>
                        ))}
                      </div>
                    ))}
                  </StyledTableCell>
                  <StyledTableCell>
                    {order.subOrders?.map((subOrder, index) => (
                      <div key={index}>
                        {subOrder.items?.map((item, i) => (
                          <div key={i}>
                            <Typography variant="body2">{item.size}</Typography>
                          </div>
                        ))}
                      </div>
                    ))}
                  </StyledTableCell>
                  <StyledTableCell>
                    {order.subOrders?.map((subOrder, index) => (
                      <div key={index}>
                        {subOrder.items?.map((item, i) => (
                          <div key={i}>
                            <Typography variant="body2">{item.quantity}</Typography>
                          </div>
                        ))}
                      </div>
                    ))}
                  </StyledTableCell>
                  <StyledTableCell>
                    {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}
                  </StyledTableCell>
                  <StyledTableCell>
                    {order.subOrders?.map((subOrder, index) => (
                      <div key={index}>
                        <Typography variant="body2">{subOrder.status}</Typography>
                      </div>
                    ))}
                  </StyledTableCell>
                </TableRow>
              ))}
            </TableBody>
          </StyledTable>
        </TableContainer>
      )}
    </Container>
  );
};

export default ViewOrders;
