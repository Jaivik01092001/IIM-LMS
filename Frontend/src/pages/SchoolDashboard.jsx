import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SchoolDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div>SchoolDashboard</div>
  )
}

export default SchoolDashboard