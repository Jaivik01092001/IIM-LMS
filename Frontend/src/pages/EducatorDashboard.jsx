import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EducatorDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <div>EducatorDashboard</div>
  )
}

export default EducatorDashboard