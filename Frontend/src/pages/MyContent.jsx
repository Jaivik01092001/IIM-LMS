import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyContentThunk, createContentThunk } from '../redux/educator/educatorSlice';
import Card from '../components/Card';

function MyContent() {
  const dispatch = useDispatch();
  const { myContent, loading } = useSelector((state) => state.educator);
  const [form, setForm] = useState({ title: '', description: '', file: null });

  useEffect(() => {
    dispatch(getMyContentThunk());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    if (form.file) formData.append('file', form.file);
    dispatch(createContentThunk(formData));
    setForm({ title: '', description: '', file: null });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Content</h2>
      <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Title"
          className="w-full p-2 mb-2 border rounded"
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description"
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="file"
          onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
          className="mb-2"
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Create</button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myContent.map((item) => (
          <Card key={item._id} title={item.title} description={item.description} />
        ))}
      </div>
    </div>
  );
}

export default MyContent;