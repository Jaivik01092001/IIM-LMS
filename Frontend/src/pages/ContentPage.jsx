import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getContentThunk, addCommentThunk } from '../redux/educator/educatorSlice';
import Card from '../components/Card';

function ContentPage() {
  const dispatch = useDispatch();
  const { content, loading } = useSelector((state) => state.educator);
  const [comment, setComment] = useState('');

  useEffect(() => {
    dispatch(getContentThunk());
  }, [dispatch]);

  const handleComment = (id) => {
    dispatch(addCommentThunk(id, comment));
    setComment('');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Content</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {content.map((item) => (
          <Card
            key={item._id}
            title={item.title}
            description={item.description}
            actions={
              <>
                <input
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment"
                  className="p-2 border rounded mr-2"
                />
                <button onClick={() => handleComment(item._id)} className="bg-blue-600 text-white p-2 rounded">Comment</button>
              </>
            }
          />
        ))}
      </div>
    </div>
  );
}

export default ContentPage;