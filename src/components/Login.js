import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import { auth, db } from '../firebaseConfig'; // Ensure db is exported from firebaseConfig
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  // Handle Google Login
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account', // Forces account selection every time
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        alert(`Logged in as ${userData.role}`);

        // Store the store name in localStorage
        const storeName = userData.storeName; // Assuming the user's store name is in userData.storeName
        if (storeName) {
          localStorage.setItem('storeName', storeName);
        }

        // Redirect based on role
        if (userData.role === 'storeManager') {
          navigate('/store-manager-dashboard');
        } else if (userData.role === 'customer') {
          navigate('/customer-dashboard');
        } else {
          alert('Unknown role. Please contact support.');
        }
      } else {
        alert('User data not found in database.');
      }
    } catch (error) {
      setError(error.message);
      console.error(error.message);
    }
  };

  // Handle Email/Password Login
  const handleEmailLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        alert(`Logged in as ${userData.role}`);

        // Store the store name in localStorage
        const storeName = userData.storeName; // Assuming the user's store name is in userData.storeName
        if (storeName) {
          localStorage.setItem('storeName', storeName);
        }

        // Redirect based on role
        if (userData.role === 'storeManager') {
          navigate('/store-manager-dashboard');
        } else if (userData.role === 'customer') {
          navigate('/customer-dashboard');
        } else {
          alert('Unknown role. Please contact support.');
        }
      } else {
        alert('User data not found in database.');
      }
    } catch (error) {
      setError(error.message);
      console.error(error.message);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg p-4 rounded">
            <h2 className="text-center mb-4">Login</h2>

            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              className="btn btn-danger btn-block mb-3"
            >
              Login with Google
            </button>

            {/* Email Input */}
            <div className="form-group mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Input */}
            <div className="form-group mb-3">
              <input
                type="password"
                className="form-control"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Email Login */}
            <button
              onClick={handleEmailLogin}
              className="btn btn-primary btn-block mb-3"
            >
              Login with Email
            </button>

            {/* Error Message */}
            {error && <p className="text-danger text-center">{error}</p>}

            {/* Register Link */}
            <p className="text-center">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
