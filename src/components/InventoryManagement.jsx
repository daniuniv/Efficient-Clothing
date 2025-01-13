import React, { useState, useEffect } from "react";
import { addItem, getItemsByStoreName, updateItem, deleteItem } from "../services/inventoryService";
import { CircularProgress, Button } from '@mui/material';
import { Box } from '@mui/material';

const InventoryManagement = () => {
  const [items, setItems] = useState([]); // Inventory items
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    price: 0,
    sizes: [{ size: "", quantity: 0 }],
    images: "",
  }); // New item form
  const [editingItem, setEditingItem] = useState(null); // Currently editing item
  const [error, setError] = useState(""); // Error state
  const [loading, setLoading] = useState(false); // Loading state
  const storeName = localStorage.getItem("storeName"); // Store name

  // Fetch items when the component mounts
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const inventoryItems = await getItemsByStoreName(storeName);
      setItems(inventoryItems); // Set items to state
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch items:", err);
      setError("Failed to fetch inventory items.");
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      setLoading(true);
      await addItem({ ...newItem, storeName }); // Add item to Firestore
      setNewItem({ name: "", category: "", price: 0, sizes: [{ size: "", quantity: 0 }], images: "" }); // Reset form
      fetchItems(); // Refresh items list
      setLoading(false);
    } catch (err) {
      console.error("Error adding item:", err);
      setError("Failed to add item.");
      setLoading(false);
    }
  };

  const handleUpdateItem = async () => {
    try {
      setLoading(true);
      if (editingItem) {
        await updateItem(editingItem.id, editingItem); // Update item in Firestore
        setEditingItem(null); // Clear editing state
        fetchItems(); // Refresh items list
      }
      setLoading(false);
    } catch (err) {
      console.error("Error updating item:", err);
      setError("Failed to update item.");
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      setLoading(true);
      await deleteItem(id); // Delete item from Firestore
      fetchItems(); // Refresh items list
      setLoading(false);
    } catch (err) {
      console.error("Error deleting item:", err);
      setError("Failed to delete item.");
      setLoading(false);
    }
  };

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = (editingItem || newItem).sizes.map((size, idx) => {
      if (index === idx) {
        return { ...size, [field]: field === "quantity" ? parseInt(value) : value };
      }
      return size;
    });

    if (editingItem) {
      setEditingItem({ ...editingItem, sizes: updatedSizes });
    } else {
      setNewItem({ ...newItem, sizes: updatedSizes });
    }
  };

  const addSizeField = () => {
    const updatedSizes = (editingItem || newItem).sizes.concat({ size: "", quantity: 0 });

    if (editingItem) {
      setEditingItem({ ...editingItem, sizes: updatedSizes });
    } else {
      setNewItem({ ...newItem, sizes: updatedSizes });
    }
  };

  const removeSizeField = (index) => {
    const updatedSizes = (editingItem || newItem).sizes.filter((_, i) => i !== index);

    if (editingItem) {
      setEditingItem({ ...editingItem, sizes: updatedSizes });
    } else {
      setNewItem({ ...newItem, sizes: updatedSizes });
    }
  };

  return (
    <div className="container mt-5">
      <h2>Inventory Management</h2>

      {/* Error Message */}
      {error && <p className="text-danger">{error}</p>}

      {/* Add/Edit Item Form */}
      <div className="card p-3 mb-4">
        <h4>{editingItem ? "Edit Item" : "Add New Item"}</h4>

        {/* Name */}
        <div className="form-group mb-3">
          <label>Name</label>
          <input
            type="text"
            className="form-control"
            value={editingItem ? editingItem.name : newItem.name}
            onChange={(e) => (editingItem ? setEditingItem({ ...editingItem, name: e.target.value }) : setNewItem({ ...newItem, name: e.target.value }))}
          />
        </div>

        {/* Category */}
        <div className="form-group mb-3">
          <label>Category</label>
          <input
            type="text"
            className="form-control"
            value={editingItem ? editingItem.category : newItem.category}
            onChange={(e) => (editingItem ? setEditingItem({ ...editingItem, category: e.target.value }) : setNewItem({ ...newItem, category: e.target.value }))}
          />
        </div>

        {/* Price */}
        <div className="form-group mb-3">
          <label>Price</label>
          <input
            type="number"
            className="form-control"
            value={editingItem ? editingItem.price : newItem.price}
            onChange={(e) => (editingItem ? setEditingItem({ ...editingItem, price: parseFloat(e.target.value) }) : setNewItem({ ...newItem, price: parseFloat(e.target.value) }))}
          />
        </div>

        {/* Sizes and Quantities */}
        <div className="form-group mb-3">
          <label>Sizes and Quantities</label>
          {(editingItem ? editingItem.sizes : newItem.sizes).map((size, index) => (
            <div key={index} className="d-flex mb-2">
              <input
                type="text"
                className="form-control me-2"
                placeholder="Size"
                value={size.size}
                onChange={(e) => handleSizeChange(index, "size", e.target.value)}
              />
              <input
                type="number"
                className="form-control me-2"
                placeholder="Quantity"
                value={size.quantity}
                onChange={(e) => handleSizeChange(index, "quantity", e.target.value)}
              />
              <button className="btn btn-danger" onClick={() => removeSizeField(index)}>Remove</button>
            </div>
          ))}
          <button className="btn btn-secondary" onClick={addSizeField}>Add Size</button>
        </div>

        {/* Images */}
        <div className="form-group mb-3">
          <label>Images (URLs)</label>
          <input
            type="text"
            className="form-control"
            value={editingItem ? editingItem.images : newItem.images}
            onChange={(e) => (editingItem ? setEditingItem({ ...editingItem, images: e.target.value }) : setNewItem({ ...newItem, images: e.target.value }))}
          />
        </div>

        {/* Submit Button */}
        <button className="btn btn-primary" onClick={editingItem ? handleUpdateItem : handleAddItem} disabled={loading}>
          {loading ? "Saving..." : (editingItem ? "Update Item" : "Add Item")}
        </button>
      </div>

      {/* Inventory List */}
      <h4>Items in Inventory</h4>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress sx={{ color: '#5be9c5' }} />
        </Box>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Sizes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <img src={item.images} alt={item.name} style={{ width: 50, height: 50, objectFit: 'contain' }} />
                </td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>{item.price}</td>
                <td>
                  {item.sizes.map((size, index) => (
                    <span key={index}>
                      {`\n${size.size} (${size.quantity} available) \n`}
                    </span>
                  ))}
                </td>
                <td>
                  <button className="btn btn-warning" onClick={() => setEditingItem(item)}>
                    Edit
                  </button>
                  <button className="btn btn-danger ms-2" onClick={() => handleDeleteItem(item.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InventoryManagement;
