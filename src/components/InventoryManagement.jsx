import React, { useState, useEffect } from "react";
import { addItem, getItemsByStoreName, updateItem, deleteItem } from "../services/inventoryService";

const InventoryManagement = () => {
  const [items, setItems] = useState([]); // Inventory items
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    price: 0,
    stock: 0,
    sizes: "",
    images: "",
  }); // New item form
  const [editingItem, setEditingItem] = useState(null); // Currently editing item
  const [error, setError] = useState("");
  const storeName = localStorage.getItem("storeName"); // Replace this with logic to fetch the logged-in manager's store name

  const [filters, setFilters] = useState({
    category: "",
    size: "",
    priceRange: [0, 1000],
  });

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const inventoryItems = await getItemsByStoreName(storeName);
  
      // Apply filters here
      const filteredItems = inventoryItems.filter(item => {
        const categoryMatch = !filters.category || item.category === filters.category;
        const sizeMatch = !filters.size || item.sizes.split(',').includes(filters.size);
        const priceMatch =
          (!filters.priceRange || filters.priceRange.length === 0) ||
          (item.price >= filters.priceRange[0] && item.price <= filters.priceRange[1]);
  
        return categoryMatch && sizeMatch && priceMatch;
      });
  
      console.log("Filtered:");
      console.log(filteredItems);
  
      setItems(filteredItems); // Set filtered items
      console.log("Final:");
      console.log(filteredItems);
    } catch (err) {
      setError("Failed to fetch inventory items.");
    }
  };
  

  const handleAddItem = async () => {
    try {
      const itemWithStoreName = { ...newItem, storeName }; // Attach storeName to the item
      await addItem(itemWithStoreName);
      setNewItem({
        name: "",
        category: "",
        price: 0,
        stock: 0,
        sizes: "",
        images: "",
      }); // Reset form
      fetchItems(); // Refresh items
    } catch (err) {
      console.error("Error adding item:", err.message);
      setError("Failed to add item.");
    }
  };

  const handleUpdateItem = async () => {
    try {
      if (editingItem) {
        await updateItem(editingItem.id, editingItem);
        setEditingItem(null); // Exit edit mode
        fetchItems(); // Refresh items
      }
    } catch (err) {
      console.error("Error updating item:", err.message);
      setError("Failed to update item.");
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await deleteItem(id);
      fetchItems(); // Refresh items
    } catch (err) {
      console.error("Error deleting item:", err.message);
      setError("Failed to delete item.");
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
        <div className="form-group mb-3">
          <label>Name</label>
          <input
            type="text"
            className="form-control"
            value={editingItem ? editingItem.name : newItem.name}
            onChange={(e) =>
              editingItem
                ? setEditingItem({ ...editingItem, name: e.target.value })
                : setNewItem({ ...newItem, name: e.target.value })
            }
          />
        </div>
        <div className="form-group mb-3">
          <label>Category</label>
          <input
            type="text"
            className="form-control"
            value={editingItem ? editingItem.category : newItem.category}
            onChange={(e) =>
              editingItem
                ? setEditingItem({ ...editingItem, category: e.target.value })
                : setNewItem({ ...newItem, category: e.target.value })
            }
          />
        </div>
        <div className="form-group mb-3">
          <label>Price</label>
          <input
            type="number"
            className="form-control"
            value={editingItem ? editingItem.price : newItem.price}
            onChange={(e) =>
              editingItem
                ? setEditingItem({ ...editingItem, price: parseFloat(e.target.value) })
                : setNewItem({ ...newItem, price: parseFloat(e.target.value) })
            }
          />
        </div>
        <div className="form-group mb-3">
          <label>Stock</label>
          <input
            type="number"
            className="form-control"
            value={editingItem ? editingItem.stock : newItem.stock}
            onChange={(e) =>
              editingItem
                ? setEditingItem({ ...editingItem, stock: parseInt(e.target.value) })
                : setNewItem({ ...newItem, stock: parseInt(e.target.value) })
            }
          />
        </div>
        <div className="form-group mb-3">
          <label>Sizes</label>
          <input
            type="text"
            className="form-control"
            placeholder="Comma-separated sizes (e.g., S,M,L,XL)"
            value={editingItem ? editingItem.sizes : newItem.sizes}
            onChange={(e) =>
              editingItem
                ? setEditingItem({ ...editingItem, sizes: e.target.value })
                : setNewItem({ ...newItem, sizes: e.target.value })
            }
          />
        </div>
        <div className="form-group mb-3">
          <label>Images (URLs)</label>
          <input
            type="text"
            className="form-control"
            placeholder="Comma-separated image URLs"
            value={editingItem ? editingItem.images : newItem.images}
            onChange={(e) =>
              editingItem
                ? setEditingItem({ ...editingItem, images: e.target.value })
                : setNewItem({ ...newItem, images: e.target.value })
            }
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={editingItem ? handleUpdateItem : handleAddItem}
        >
          {editingItem ? "Update Item" : "Add Item"}
        </button>
      </div>

      {/* Inventory List */}
      <h4>Inventory</h4>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Sizes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <img
                  src={item.images ? item.images.split(",")[0] : "https://via.placeholder.com/50"}
                  alt={item.name}
                  style={{ width: "50px", height: "50px" }}
                />
              </td>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>${item.price}</td>
              <td>{item.stock}</td>
              <td>{item.sizes.join(', ')}</td>
              <td>
                <button className="btn btn-sm btn-warning" onClick={() => setEditingItem(item)}>
                  Edit
                </button>
                <button className="btn btn-sm btn-danger ms-2" onClick={() => handleDeleteItem(item.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryManagement;
