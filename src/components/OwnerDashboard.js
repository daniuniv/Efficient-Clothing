import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Firestore configuration
import { useNavigate } from 'react-router-dom';

const OwnerDashboard = () => {
  const [storeManagers, setStoreManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStoreManagers = async () => {
      try {
        // Fetch store managers with approved: false
        const q = query(
          collection(db, 'users'),
          where('role', '==', 'storeManager'),
          where('approved', '==', false)
        );
        const querySnapshot = await getDocs(q);

        const managers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStoreManagers(managers);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch store managers.');
        setLoading(false);
      }
    };

    fetchStoreManagers();
  }, []);
  
  // Approve a store manager
  const handleApprove = async (id) => {
    try {
      const userRef = doc(db, 'users', id);
      await updateDoc(userRef, { approved: true });

      // Update the local state
      setStoreManagers(prev =>
        prev.filter(manager => manager.id !== id)
      );

      alert('Store manager approved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to approve store manager.');
    }
  };

  // Logout (if required)
  const handleLogout = () => {
    // Redirect to login or implement logout functionality
    navigate('/login');
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <h2 className="text-center mb-4">Owner Dashboard</h2>

          {loading && <p>Loading store managers...</p>}

          {error && <p className="text-danger">{error}</p>}

          {!loading && storeManagers.length === 0 && (
            <p className="text-center">No store managers need approval.</p>
          )}

          {!loading && storeManagers.length > 0 && (
            <div className="card shadow-lg p-4">
              <h4 className="mb-4">Pending Approvals</h4>
              <ul className="list-group">
                {storeManagers.map(manager => (
                  <li
                    key={manager.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <p className="mb-0"><strong>Store Name:</strong> {manager.storeName || 'N/A'}</p>
                      <p className="mb-0"><strong>Email:</strong> {manager.email}</p>
                      <p className="mb-0"><strong>Contact Information:</strong> {manager.contactInfo}</p>
                    </div>
                    <button
                      onClick={() => handleApprove(manager.id)}
                      className="btn btn-success"
                    >
                      Approve
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 text-center">
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
