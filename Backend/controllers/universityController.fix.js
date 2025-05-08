// This is a fix for the getOngoingCourses method in universityController.js
// Replace the existing method with this one

exports.getOngoingCourses = async (req, res) => {
  try {
    // Get the university ID (school ID)
    const universityId = req.user.id;

    console.log("Finding ongoing courses for university ID:", universityId);

    // First, find all educators belonging to this university
    const educators = await User.find({
      university: universityId,
      role: "educator"
    }).select('_id');

    // Extract educator IDs
    const educatorIds = educators.map(educator => educator._id);
    
    // Add the university's own ID to the list of creators to check
    const creatorIds = [universityId, ...educatorIds];
    
    console.log("Looking for courses created by:", creatorIds);

    // Find all courses created by the university or its educators
    // that have enrolled users
    const courses = await Course.find({
      status: 1, // Only active courses
      creator: { $in: creatorIds }, // Courses created by the university or its educators
      "enrolledUsers.0": { $exists: true } // Only courses with at least one enrolled user
    })
    .populate({
      path: "creator",
      select: "name profile.avatar"
    })
    .populate({
      path: "enrolledUsers.user",
      select: "name email profile.avatar"
    });
    
    console.log(`Found ${courses.length} courses with enrollments`);

    // Format the response to include course details and enrolled users
    const formattedCourses = courses.map(course => {
      // Filter to only include users with "in_progress" status
      const ongoingUsers = course.enrolledUsers.filter(
        enrollment => enrollment.status === "in_progress"
      );

      // Only include courses that have at least one ongoing user
      if (ongoingUsers.length === 0) {
        return null;
      }

      return {
        id: course._id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        creator: course.creator ? {
          id: course.creator._id,
          name: course.creator.name,
          avatar: course.creator.profile?.avatar
        } : null,
        enrolledCount: ongoingUsers.length,
        enrolledUsers: ongoingUsers.map(enrollment => ({
          id: enrollment.user._id,
          name: enrollment.user.name,
          email: enrollment.user.email,
          avatar: enrollment.user.profile?.avatar,
          progress: enrollment.progress,
          enrolledAt: enrollment.enrolledAt
        }))
      };
    }).filter(course => course !== null); // Remove null entries

    res.json(formattedCourses);
  } catch (error) {
    console.error("Error getting ongoing courses:", error);
    res.status(500).json({
      message: "Error retrieving ongoing courses",
      error: error.message
    });
  }
};
