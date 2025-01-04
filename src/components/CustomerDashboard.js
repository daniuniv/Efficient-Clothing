import React from 'react';
import { Link } from 'react-router-dom';

const CustomerDashboard = () => {
  return (
    <div className="container mt-5">
      <h1 className="text-center">Customer Dashboard</h1>
      <div className="mt-4">
        <ul className="list-group">
          {/* Browse Catalog */}
          <li className="list-group-item">
            <Link to="/catalog" className="btn btn-success btn-block">
              Browse Catalog
            </Link>
          </li>

          {/* Other customer-related links can be added here */}
        </ul>
      </div>
    </div>
  );
};

export default CustomerDashboard;
