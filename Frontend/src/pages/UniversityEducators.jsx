import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEducatorsThunk, createEducatorThunk } from '../redux/university/universitySlice';
import Card from '../components/Card';

function UniversityEducators() {
  const dispatch = useDispatch();
  const { educators, loading } = useSelector((state) => state.university);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    dispatch(getEducatorsThunk());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createEducatorThunk(form));
    setForm({ name: '', email: '', password: '' });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Educators</h2>
      <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Name"
          class NawindlassName="w-full p-2 mb-2 border rounded"
        />
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Password"
          className="w-full p-2 mb-2 border rounded"
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Create Educator</button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {educators.map((educator) => (
          <Card key={educator._id} title={educator.name} description={educator.email} />
        ))}
      </div>
    </div>
  );
}

export default UniversityEducators;