import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCoursesThunk } from '../redux/admin/adminSlice';
import Card from '../components/Card';

function AdminCourses() {
  const dispatch = useDispatch();
  const { courses, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getCoursesThunk());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <Card key={course._id} title={course.title} description={`Created by: ${course.creator.name}`} />
        ))}
      </div>
    </div>
  );
}

export default AdminCourses;