import { db } from "../firebaseConfig";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";

// Reference to the 'inventory' collection
const inventoryRef = collection(db, "inventory");

// Add a new item to the inventory
export const addItem = async (item) => {
  return await addDoc(inventoryRef, item);
};

// Get all items for a specific store
export const getItemsByStoreName = async (storeName) => {
  try {
    const storeQuery = query(inventoryRef, where("storeName", "==", storeName));
    console.log("Fetching inventory for storeName:", storeName); // Debugging
    const snapshot = await getDocs(storeQuery);
    console.log("Fetched documents:", snapshot.docs.map((doc) => doc.data())); // Debugging
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Error in getItemsByStoreName:", err);
    throw err; // Ensure the error bubbles up for higher-level handling
  }
};

// Update an item in the inventory
export const updateItem = async (id, updatedItem) => {
  const itemRef = doc(db, "inventory", id);
  return await updateDoc(itemRef, updatedItem);
};

// Delete an item from the inventory
export const deleteItem = async (id) => {
  const itemRef = doc(db, "inventory", id);
  return await deleteDoc(itemRef);
};
