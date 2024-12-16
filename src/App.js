import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';

function App() {
  return (
    <Router>
      <Routes>
        {/* Specific Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Catch-all for unmatched routes */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
