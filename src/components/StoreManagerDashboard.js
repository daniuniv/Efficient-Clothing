import React from 'react';
import { Link } from 'react-router-dom';

const StoreManagerDashboard = () => {
  return (
    <div className="container mt-5">
      <h1 className="text-center">Store Manager Dashboard</h1>
      <div className="mt-4">
        <ul className="list-group">
          {/* Inventory Management */}
          <li className="list-group-item">
            <Link to="/inventory-management" className="btn btn-primary btn-block">
              Manage Inventory
            </Link>
          </li>

          {/* View Orders */}
          <li className="list-group-item">
            <Link to="/customer-orders" className="btn btn-secondary btn-block">
              View Customer Orders
            </Link>
          </li>

          {/* Reports */}
          <li className="list-group-item">
            <Link to="/reports" className="btn btn-info btn-block">
              View Reports
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StoreManagerDashboard;
