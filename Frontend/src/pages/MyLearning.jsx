import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyCoursesThunk } from '../redux/educator/educatorSlice';
import Card from '../components/Card';

function MyLearning() {
  const dispatch = useDispatch();
  const { myCourses, loading } = useSelector((state) => state.educator);

  useEffect(() => {
    dispatch(getMyCoursesThunk());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Learning</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {myCourses.map((course) => (
          <Card
            key={course._id}
            title={course.title}
            description={`Status: ${course.enrolledUsers.find(e => e.user === course.userId)?.status}`}
            actions={<a href={`/resume/${course._id}`} className="bg-blue-600 text-white p-2 rounded">Resume</a>}
          />
        ))}
      </div>
    </div>
  );
}

export default MyLearning;