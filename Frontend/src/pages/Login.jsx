import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginThunk } from '../redux/auth/authSlice';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginThunk({ email, password })).then(() => navigate('/'));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <img src="/logo.png" alt="Logo" className="mx-auto mb-4 w-24" />
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Login
        </button>
        <a href="/forgot-password" className="text-blue-600 text-sm mt-2 block text-center">Forgot Password?</a>
      </form>
      <div className="mt-4 text-center">
        <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-2">
          <h3 className="font-bold">Admin Login</h3>
          <p>Email: admin@example.com</p>
          <p>Password: password</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg shadow-md mb-2">
          <h3 className="font-bold">School Login</h3>
          <p>Email: school@example.com</p>
          <p>Password: password</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg shadow-md">
          <h3 className="font-bold">Educator Login</h3>
          <p>Email: educator@example.com</p>
          <p>Password: password</p>
        </div>
      </div>
    </div>
  );
}

export default Login;