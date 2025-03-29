import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfileThunk, updatePasswordThunk } from '../redux/educator/educatorSlice';

function Settings() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState({ name: user.name, phone: user.profile?.phone || '', address: user.profile?.address || '' });
  const [password, setPassword] = useState({ oldPassword: '', newPassword: '' });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    dispatch(updateProfileThunk(profile));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    dispatch(updatePasswordThunk(password));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form onSubmit={handleProfileSubmit} className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Profile</h3>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Name"
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            type="text"
            value={profile.phone}
            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            placeholder="Phone"
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            type="text"
            value={profile.address}
            onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            placeholder="Address"
            className="w-full p-2 mb-2 border rounded"
          />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Update Profile</button>
        </form>
        <form onSubmit={handlePasswordSubmit} className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-2">Password</h3>
          <input
            type="password"
            value={password.oldPassword}
            onChange={(e) => setPassword({ ...password, oldPassword: e.target.value })}
            placeholder="Old Password"
            className="w-full p-2 mb-2 border rounded"
          />
          <input
            type="password"
            value={password.newPassword}
            onChange={(e) => setPassword({ ...password, newPassword: e.target.value })}
            placeholder="New Password"
            className="w-full p-2 mb-2 border rounded"
          />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Update Password</button>
        </form>
      </div>
    </div>
  );
}

export default Settings;