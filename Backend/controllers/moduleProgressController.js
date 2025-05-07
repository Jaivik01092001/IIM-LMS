const UserModuleProgress = require("../models/UserModuleProgress");
const Course = require("../models/Course");
const Module = require("../models/Module");

// Get module progress for a user in a course
exports.getModuleProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Find or create progress record
    let progress = await UserModuleProgress.findOne({
      user: userId,
      course: courseId,
    }).populate({
      path: "moduleProgress.module",
      select: "title order isCompulsory",
    });

    if (!progress) {
      // If no progress record exists, create a new one with default values
      const course = await Course.findById(courseId).populate("modules");

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Initialize with first module unlocked, rest locked
      const moduleProgress = course.modules.map((module, index) => ({
        module: module._id,
        isCompleted: false,
        completedContent: [],
        lastAccessedAt: new Date(),
      }));

      progress = new UserModuleProgress({
        user: userId,
        course: courseId,
        moduleProgress,
        lastAccessedModule:
          course.modules.length > 0 ? course.modules[0]._id : null,
      });

      await progress.save();

      // Populate the module data for the response
      progress = await UserModuleProgress.findById(progress._id).populate({
        path: "moduleProgress.module",
        select: "title order isCompulsory",
      });
    }

    res.json(progress);
  } catch (error) {
    console.error("Error getting module progress:", error);
    res.status(500).json({
      message: "Error retrieving module progress",
      error: error.message,
    });
  }
};

// Update module progress
exports.updateModuleProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      moduleId,
      contentId,
      isCompleted,
      completedModules,
      completedContent,
    } = req.body;
    const userId = req.user.id;

    // Find or create progress record
    let progress = await UserModuleProgress.findOne({
      user: userId,
      course: courseId,
    });

    if (!progress) {
      // If no progress record exists, create a new one
      const course = await Course.findById(courseId).populate("modules");

      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Initialize with first module unlocked, rest locked
      const moduleProgress = course.modules.map((module, index) => ({
        module: module._id,
        isCompleted:
          completedModules && completedModules.includes(module._id.toString()),
        completedContent: [],
        lastAccessedAt: new Date(),
      }));

      progress = new UserModuleProgress({
        user: userId,
        course: courseId,
        moduleProgress,
        lastAccessedModule:
          moduleId ||
          (course.modules.length > 0 ? course.modules[0]._id : null),
      });
    }

    // Update lastAccessedModule if provided
    if (req.body.lastAccessedModule) {
      progress.lastAccessedModule = req.body.lastAccessedModule;
    }

    // If we're updating a specific module and content
    if (moduleId && contentId) {
      // Find the module in the progress
      const moduleProgressIndex = progress.moduleProgress.findIndex(
        (mp) => mp.module.toString() === moduleId
      );

      if (moduleProgressIndex !== -1) {
        // Update the module's completed content
        const moduleProgress = progress.moduleProgress[moduleProgressIndex];

        if (isCompleted) {
          // Add content to completed list if not already there
          if (!moduleProgress.completedContent.includes(contentId)) {
            moduleProgress.completedContent.push(contentId);
          }
        } else {
          // Remove content from completed list
          moduleProgress.completedContent =
            moduleProgress.completedContent.filter(
              (id) => id.toString() !== contentId
            );
        }

        // Update last accessed timestamp
        moduleProgress.lastAccessedAt = new Date();

        // Update the progress record
        progress.moduleProgress[moduleProgressIndex] = moduleProgress;

        // Update lastAccessedModule if not explicitly provided
        if (!req.body.lastAccessedModule) {
          progress.lastAccessedModule = moduleId;
        }
      }
    }

    // Check if any modules have all their content completed and should be marked as completed
    // This is important for modules with quizzes
    if (completedModules) {
      // Get the course with modules to check content completion
      const course = await Course.findById(courseId).populate({
        path: "modules",
        populate: {
          path: "content",
        },
      });

      if (course && course.modules) {
        // For each module in the progress
        progress.moduleProgress.forEach((mp) => {
          const moduleId = mp.module.toString();
          const module = course.modules.find(
            (m) => m._id.toString() === moduleId
          );

          if (module) {
            // Check if all content in this module is completed
            const allContentCompleted =
              module.content && module.content.length > 0
                ? module.content.every((content) =>
                    mp.completedContent.some(
                      (id) => id.toString() === content._id.toString()
                    )
                  )
                : true;

            // If all content is completed and the module is in the completedModules list,
            // mark it as completed
            if (allContentCompleted && completedModules.includes(moduleId)) {
              mp.isCompleted = true;
            }
          }
        });
      }
    }

    // If we're updating multiple modules and content at once
    if (completedModules && completedContent) {
      // Update each module's completion status and content
      progress.moduleProgress.forEach((mp) => {
        const moduleId = mp.module.toString();
        mp.isCompleted = completedModules.includes(moduleId);

        // Update completed content for this module
        if (completedContent[moduleId]) {
          mp.completedContent = completedContent[moduleId];
        }
      });
    }

    await progress.save();

    // Calculate overall course progress
    // We need to get the actual module content counts from the course
    const courseWithModules = await Course.findById(courseId).populate(
      "modules"
    );

    // Calculate total content items across all compulsory modules
    let totalContentItems = 0;
    let compulsoryModuleIds = [];

    if (courseWithModules && courseWithModules.modules) {
      // Populate the modules with their content and get compulsory modules
      const populatedModules = await Module.find({
        _id: { $in: courseWithModules.modules.map((m) => m._id) },
      })
        .populate("content")
        .populate("quiz");

      // Filter compulsory modules and store their IDs
      const compulsoryModules = populatedModules.filter(
        (module) => module.isCompulsory !== false
      );
      compulsoryModuleIds = compulsoryModules.map((module) =>
        module._id.toString()
      );

      // Count all content items in compulsory modules
      totalContentItems = compulsoryModules.reduce((total, module) => {
        // Count content items
        const contentCount = module.content ? module.content.length : 0;
        // Add 1 for quiz if it exists
        const quizCount = module.quiz ? 1 : 0;
        return total + contentCount + quizCount;
      }, 0);
    }

    // Count completed content items from compulsory modules in the progress record
    const completedContentItems = progress.moduleProgress.reduce(
      (total, mp) => {
        // Only count if this is a compulsory module
        if (compulsoryModuleIds.includes(mp.module.toString())) {
          // Count completed content
          const contentCount = mp.completedContent
            ? mp.completedContent.length
            : 0;

          // Add 1 for completed quiz if the module is marked as completed
          // A module is only marked as completed if its quiz is also completed
          const quizCount = mp.isCompleted ? 1 : 0;

          return total + contentCount + quizCount;
        }
        return total;
      },
      0
    );

    let overallProgress = 0;
    if (totalContentItems > 0) {
      overallProgress = Math.round(
        (completedContentItems / totalContentItems) * 100
      );
    }

    // Update the course's overall progress for this user
    const course = await Course.findById(courseId);
    if (course) {
      const enrollmentIndex = course.enrolledUsers.findIndex(
        (e) => e.user.toString() === userId
      );

      if (enrollmentIndex !== -1) {
        // Only update if the new progress is greater than the current progress
        if (overallProgress > course.enrolledUsers[enrollmentIndex].progress) {
          course.enrolledUsers[enrollmentIndex].progress = overallProgress;
          course.enrolledUsers[enrollmentIndex].lastAccessedAt = new Date();

          // If progress is 100%, mark as completed
          if (overallProgress === 100) {
            course.enrolledUsers[enrollmentIndex].status = "completed";
            course.enrolledUsers[enrollmentIndex].completedAt = new Date();
          }

          await course.save();
        }
      }
    }

    // Get the updated course with the latest progress
    const updatedCourse = await Course.findById(courseId);
    let userProgress = 0;

    if (updatedCourse) {
      const userEnrollment = updatedCourse.enrolledUsers.find(
        (e) => e.user.toString() === userId
      );

      if (userEnrollment) {
        userProgress = userEnrollment.progress;
      }
    }

    // Log the progress values for debugging
    console.log(`Progress calculation:
      - Total content items: ${totalContentItems}
      - Completed content items: ${completedContentItems}
      - Calculated progress: ${overallProgress}%
      - Stored user progress: ${userProgress}%
      - Compulsory module IDs: ${JSON.stringify(compulsoryModuleIds)}
      - Module progress: ${JSON.stringify(
        progress.moduleProgress.map((mp) => ({
          moduleId: mp.module.toString(),
          isCompleted: mp.isCompleted,
          completedContentCount: mp.completedContent
            ? mp.completedContent.length
            : 0,
        }))
      )}
    `);

    res.json({
      message: "Module progress updated successfully",
      progress,
      overallProgress,
      userProgress,
    });
  } catch (error) {
    console.error("Error updating module progress:", error);
    res.status(500).json({
      message: "Error updating module progress",
      error: error.message,
    });
  }
};
