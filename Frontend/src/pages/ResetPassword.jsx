import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { resetPasswordThunk } from '../redux/auth/authSlice';
import { useNavigate, useSearchParams } from 'react-router-dom';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(resetPasswordThunk({ token, newPassword })).then(() => navigate('/login'));
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          className="w-full p-2 mb-4 border rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Reset Password
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;