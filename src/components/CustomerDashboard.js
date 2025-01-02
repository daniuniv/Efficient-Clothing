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
            <Link to="/browse-catalog" className="btn btn-primary btn-block">
              Browse Catalog
            </Link>
          </li>

          {/* Track Orders */}
          <li className="list-group-item">
            <Link to="/track-orders" className="btn btn-secondary btn-block">
              Track Orders
            </Link>
          </li>

          {/* View Cart */}
          <li className="list-group-item">
            <Link to="/view-cart" className="btn btn-info btn-block">
              View Cart
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CustomerDashboard;
