import React from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';

const History = () => {
  // For now, just redirect to the main dashboard which already shows history
  const navigate = useNavigate();
  
  React.useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  return <Dashboard />;
};

export default History;