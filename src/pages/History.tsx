import React from 'react';
import { useNavigate } from 'react-router-dom';
import Archive from './Archive';

const History = () => {
  // Redirect to archive which shows the traditional analysis history
  const navigate = useNavigate();
  
  React.useEffect(() => {
    navigate('/archive', { replace: true });
  }, [navigate]);

  return <Archive />;
};

export default History;