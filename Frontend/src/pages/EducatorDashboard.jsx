import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCoursesThunk, enrollCourseThunk } from '../redux/educator/educatorSlice';
import Card from '../components/Card';

function EducatorDashboard() {
  const dispatch = useDispatch();
  const { courses, loading } = useSelector((state) => state.educator);

  useEffect(() => {
    dispatch(getCoursesThunk());
  }, [dispatch]);

  const handleEnroll = (id) => dispatch(enrollCourseThunk(id));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <Card
            key={course._id}
            title={course.title}
            description={`Created by: ${course.creator.name}`}
            actions={<button onClick={() => handleEnroll(course._id)} className="bg-blue-600 text-white p-2 rounded">Enroll</button>}
          />
        ))}
      </div>
    </div>
  );
}

export default EducatorDashboard;