
import React from 'react';
import { Navigate } from 'react-router-dom';

const EnhancedDashboardPage = () => {
  // Redirect to the main dashboard
  return <Navigate to="/dashboard" replace />;
};

export default EnhancedDashboardPage;
