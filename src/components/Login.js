import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account', // Forces account selection every time
    });
  
    try {
      const result = await signInWithPopup(auth, provider);
      alert('Logged in with Google!');
    } catch (error) {
      setError(error.message);
      console.error(error.message);
    }
  };
  

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('Logged in with Email!');
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
