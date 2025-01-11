import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import 'bootstrap/dist/css/bootstrap.min.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default to customer
  const [storeName, setStoreName] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate(); // Initialize navigate for redirection

  const handleRegister = async () => {
    try {
      // Start the registration process
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Add user role and details to Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        email: email,
        role: role,
        ...(role === 'storeManager' ? { storeName, storeAddress, contactInfo, approved: false,} : { fullName, contactInfo }),
      });

      // Show success message
      console.log('User data added to Firestore');
      if (role === 'storeManager') {
        alert(`Store Manager registered successfully. Your account is pending approval.`);
      } else {
        alert(`Customer registered successfully.`);
      }

      // Redirect to the login page after registration
      console.log('Navigating to login');
      navigate('/login');
    } catch (err) {
      // Handle errors during registration
      setError(err.message);
      console.error('Error during registration:', err.message);
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-sm">
        <h2 className="mb-4 text-center">Register</h2>

        {/* Role Selection */}
        <div className="mb-3">
          <label htmlFor="role" className="form-label fw-bold">Select Role:</label>
          <select
            id="role"
            className="form-select"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="storeManager">Store Manager</option>
            <option value="customer">Customer</option>
          </select>
        </div>

        {/* Store Manager Fields */}
        {role === 'storeManager' && (
          <>
            <div className="mb-3">
              <label className="form-label">Store Name:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter store name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Store Address:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter store address"
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Contact Information:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter contact information"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Customer Fields */}
        {role === 'customer' && (
          <>
            <div className="mb-3">
              <label className="form-label">Full Name:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Contact Information:</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter contact information"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
              />
            </div>
          </>
        )}

        {/* Email & Password */}
        <div className="mb-3">
          <label className="form-label">Email:</label>
          <input
            type="email"
            className="form-control"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Password:</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Register Button */}
        <button onClick={handleRegister} className="btn btn-primary w-100">
          Register
        </button>

        {/* Error Message */}
        {error && <p className="text-danger mt-3">{error}</p>}
      </div>
    </div>
  );
};

export default Register;
