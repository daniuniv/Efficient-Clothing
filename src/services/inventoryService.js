import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';

// Reference to the 'inventory' collection
const inventoryRef = collection(db, 'inventory');

// Add a new item to the inventory
export const addItem = async (item) => {
  return await addDoc(inventoryRef, item);
};

// Get all items from the inventory
export const getItems = async () => {
  const snapshot = await getDocs(inventoryRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Update an item in the inventory
export const updateItem = async (id, updatedItem) => {
  const itemRef = doc(db, 'inventory', id);
  return await updateDoc(itemRef, updatedItem);
};

// Delete an item from the inventory
export const deleteItem = async (id) => {
  const itemRef = doc(db, 'inventory', id);
  return await deleteDoc(itemRef);
};
