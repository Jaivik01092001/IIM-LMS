import React from 'react';
import { FaBook, FaUserGraduate, FaClock, FaStar, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/Courses.css';

const Courses = ({ userType }) => {
  const navigate = useNavigate();

  // Sample data with completely different content for each card
  const coursesData = [
    {
      id: 1,
      title: "Effective Time Management",
      category: "Management",
      language: "English",
      description: "Master proven techniques to maximize productivity and achieve work-life balance through effective time management strategies.",
      instructor: "Charlie Rawal",
      lessons: 24,
      students: 82,
      duration: "20:00 hrs",
      rating: 4.9,
      createdAt: "2023-10-15",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
    {
      id: 2,
      title: "Python for Data Science",
      category: "Programming",
      language: "English",
      description: "Learn Python programming fundamentals and essential libraries for data analysis, visualization, and machine learning.",
      instructor: "David Miller",
      lessons: 36,
      students: 145,
      duration: "32:00 hrs",
      rating: 4.7,
      createdAt: "2023-11-20",
      image: "https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
    {
      id: 3,
      title: "UI/UX Design Fundamentals",
      category: "Design",
      language: "English",
      description: "Master the principles of user interface and user experience design to create intuitive and engaging digital products.",
      instructor: "Sarah Johnson",
      lessons: 28,
      students: 96,
      duration: "24:30 hrs",
      rating: 4.8,
      createdAt: "2023-09-05",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
    {
      id: 4,
      title: "Digital Marketing Masterclass",
      category: "Marketing",
      language: "Hindi",
      description: "Comprehensive guide to digital marketing including SEO, social media, email campaigns, and analytics for business growth.",
      instructor: "Rahul Sharma",
      lessons: 30,
      students: 120,
      duration: "26:00 hrs",
      rating: 4.6,
      createdAt: "2024-01-10",
      image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
    {
      id: 5,
      title: "Leadership & Team Management",
      category: "Management",
      language: "Spanish",
      description: "Develop essential leadership skills to effectively manage teams, resolve conflicts, and drive organizational success.",
      instructor: "Carlos Rodriguez",
      lessons: 22,
      students: 65,
      duration: "18:30 hrs",
      rating: 4.5,
      createdAt: "2023-08-15",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
    {
      id: 6,
      title: "Full-Stack JavaScript Development",
      category: "Programming",
      language: "English",
      description: "Master both frontend and backend development using JavaScript, Node.js, React, and MongoDB to build complete web applications.",
      instructor: "Emily Chen",
      lessons: 40,
      students: 210,
      duration: "35:00 hrs",
      rating: 4.9,
      createdAt: "2024-02-20",
      image: "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
    {
      id: 7,
      title: "Adobe Photoshop Masterclass",
      category: "Design",
      language: "French",
      description: "From beginner to expert: Learn professional photo editing, digital art creation, and graphic design using Adobe Photoshop.",
      instructor: "Sophie Dubois",
      lessons: 32,
      students: 88,
      duration: "28:00 hrs",
      rating: 4.7,
      createdAt: "2023-12-05",
      image: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
    {
      id: 8,
      title: "Content Marketing Strategy",
      category: "Marketing",
      language: "Hindi",
      description: "Create compelling content that attracts, engages, and converts your target audience while building your brand authority.",
      instructor: "Priya Patel",
      lessons: 26,
      students: 175,
      duration: "22:30 hrs",
      rating: 4.8,
      createdAt: "2024-01-25",
      image: "https://images.unsplash.com/photo-1542744094-3a31f272c490?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
    {
      id: 9,
      title: "Financial Planning & Investment",
      category: "Finance",
      language: "English",
      description: "Learn how to create a solid financial plan, understand investment options, and build wealth through strategic money management.",
      instructor: "Michael Roberts",
      lessons: 30,
      students: 135,
      duration: "25:45 hrs",
      rating: 4.9,
      createdAt: "2023-11-10",
      image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
    {
      id: 10,
      title: "Mobile App Development with Flutter",
      category: "Programming",
      language: "English",
      description: "Build beautiful, natively compiled applications for mobile, web, and desktop from a single codebase using Flutter and Dart.",
      instructor: "Alex Wong",
      lessons: 38,
      students: 165,
      duration: "30:15 hrs",
      rating: 4.8,
      createdAt: "2024-01-05",
      image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
    {
      id: 11,
      title: "3D Modeling & Animation",
      category: "Design",
      language: "Spanish",
      description: "Master the art of 3D modeling, texturing, rigging, and animation using industry-standard software for games, films, and visualization.",
      instructor: "Elena Gomez",
      lessons: 45,
      students: 92,
      duration: "40:30 hrs",
      rating: 4.6,
      createdAt: "2023-10-20",
      image: "https://images.unsplash.com/photo-1617791160505-6f00504e3519?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
    {
      id: 12,
      title: "Search Engine Optimization (SEO)",
      category: "Marketing",
      language: "French",
      description: "Learn proven SEO techniques to increase your website's visibility, drive organic traffic, and improve search engine rankings.",
      instructor: "Jean Dupont",
      lessons: 28,
      students: 155,
      duration: "23:45 hrs",
      rating: 4.7,
      createdAt: "2023-12-15",
      image: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80"
    },
  ];

  // No state needed for static filters

  

  // No filtering - display all courses
  const filteredCourses = coursesData;

  // Handle click on course card to navigate to course details
  const handleCourseClick = (courseId) => {
    navigate(`/dashboard/${userType}/courses/${courseId}`);
  };

  return (
    <div className="courses-container admin-dashboard">

      {/* Search and Filters */}
      <div className="search-filter-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search courses..."
            
          />
        </div>

        <div className="filter-dropdown">
          <select
            className="filter-select"
            defaultValue=""
          >
            <option value="">Select Category</option>
            <option value="Management">Management</option>
            <option value="Programming">Programming</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>

        <div className="filter-dropdown">
          <select
            className="filter-select"
            defaultValue=""
          >
            <option value="">Select Language</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
          </select>
        </div>

        <div className="filter-dropdown">
          <select
            className="filter-select"
            defaultValue=""
          >
            <option value="">Sort By</option>
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Course Grid */}
      <div className="dashboard-section">
        <div className="course-grid">
        {filteredCourses.map(course => (
          <div 
            key={course.id} 
            className="course-card" 
            onClick={() => handleCourseClick(course.id)}
          >
            <img src={course.image} alt={course.title} className="course-image" />
            <div className="course-details">
              <h3 className="course-title">{course.title}</h3>
              <p className="course-category">Category: {course.category} | Language: {course.language}</p>
              <p className="course-description">{course.description}</p>
              <p className="course-category">Professor</p>
              <div className="instructor">
                <img
                  src="https://i.pravatar.cc/150?img=32"
                  alt={course.instructor}
                  className="instructor-avatar"
                />
                <span className="instructor-name">{course.instructor}</span>
              </div>

              <div className="course-meta">
                <div className="meta-item">
                  <FaBook size={12} />
                  <span>{course.lessons}</span>
                </div>
                <div className="meta-item">
                  <FaUserGraduate size={12} />
                  <span>{course.students}</span>
                </div>
                <div className="meta-item">
                  <FaClock size={12} />
                  <span>{course.duration}</span>
                </div>
                <div className="meta-item">
                  <FaStar size={12} />
                  <span>{course.rating}</span>
                </div>
              </div>

              <button 
                className="enroll-btn"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click event
                  // Enrollment logic here
                }}
              >
                Enroll Now
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;