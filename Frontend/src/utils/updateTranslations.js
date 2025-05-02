/**
 * Script to update components with translations
 * 
 * This is a utility script that can be used to update components with translations.
 * It's not meant to be run directly, but rather to provide guidance on how to
 * implement translations in components.
 */

import { addUseTranslationHook, addTFunction, replaceHardcodedText } from './i18nHelper';

/**
 * Steps to implement translations in a component:
 * 
 * 1. Import the useTranslation hook:
 *    import { useTranslation } from 'react-i18next';
 * 
 * 2. Initialize the hook in your component:
 *    const { t } = useTranslation();
 * 
 * 3. Replace hardcoded text with translation keys:
 *    <h1>Dashboard</h1> -> <h1>{t('dashboard.title')}</h1>
 * 
 * 4. For dynamic content or concatenation:
 *    placeholder="Search..." -> placeholder={t('common.search') + "..."}
 * 
 * 5. For conditional text:
 *    {userRole === "admin" ? "Admin" : "User"} -> 
 *    {userRole === "admin" ? t('dashboard.admin') : t('dashboard.user')}
 */

/**
 * Common translation keys to use across components
 */
const commonTranslations = {
  // Button text
  "Submit": "common.submit",
  "Cancel": "common.cancel",
  "Save": "common.save",
  "Edit": "common.edit",
  "Delete": "common.delete",
  "Add": "common.add",
  "View": "common.view",
  "Close": "common.close",
  "Search": "common.search",
  "Filter": "common.filter",
  "Create": "common.create",
  "Update": "common.update",
  
  // Form labels
  "Name": "common.name",
  "Email": "common.email",
  "Password": "common.password",
  "Phone": "common.phone",
  "Address": "common.address",
  "City": "common.city",
  "State": "common.state",
  "Zip Code": "common.zipCode",
  
  // Status text
  "Active": "common.active",
  "Inactive": "common.inactive",
  "Loading...": "common.loading",
  "No results found": "common.noResults",
  
  // Dashboard text
  "Dashboard": "common.dashboard",
  "Welcome": "common.welcome",
  
  // Authentication text
  "Login": "common.login",
  "Logout": "common.logout",
  "Forgot Password": "common.forgotPassword",
  "Reset Password": "common.resetPassword",
  "Remember me": "common.rememberMe",
  
  // Action text
  "Actions": "common.actions",
  "Yes": "common.yes",
  "No": "common.no",
  
  // Navigation text
  "Back to Login": "common.backToLogin",
  "Settings": "common.settings",
  "Profile": "common.profile",
};

/**
 * Dashboard-specific translations
 */
const dashboardTranslations = {
  "Admin Dashboard": "dashboard.adminDashboard",
  "School Dashboard": "dashboard.schoolDashboard",
  "Tutor Dashboard": "dashboard.tutorDashboard",
  "Overview": "dashboard.overview",
  "Total Schools": "dashboard.totalSchools",
  "Total Educators": "dashboard.totalEducators",
  "Total Courses": "dashboard.totalCourses",
  "Total Students": "dashboard.totalStudents",
  "Recent Activity": "dashboard.recentActivity",
  "Quick Actions": "dashboard.quickActions",
  "Super Admin": "dashboard.superAdmin",
  "IIM Staff": "dashboard.iimStaff",
  "School Admin": "dashboard.schoolAdmin",
  "Educator": "dashboard.educator",
  "User": "dashboard.user",
};

/**
 * School-specific translations
 */
const schoolTranslations = {
  "Schools": "schools.schools",
  "Universities/Schools": "schools.schools",
  "School Details": "schools.schoolDetails",
  "Create School": "schools.createSchool",
  "Edit School": "schools.editSchool",
  "School Name": "schools.schoolName",
  "Contact Person": "schools.contactPerson",
  "Status": "schools.status",
  "Created At": "schools.createdAt",
  "Updated At": "schools.updatedAt",
};

/**
 * Educator-specific translations
 */
const educatorTranslations = {
  "Educators": "educators.educators",
  "Educator Details": "educators.educatorDetails",
  "Create Educator": "educators.createEducator",
  "Edit Educator": "educators.editEducator",
  "Educator Name": "educators.educatorName",
  "School": "educators.school",
  "Department": "educators.department",
  "Designation": "educators.designation",
};

/**
 * Course-specific translations
 */
const courseTranslations = {
  "Courses": "courses.courses",
  "Course": "courses.course",
  "All Courses": "courses.allCourses",
  "Course Details": "courses.courseDetails",
  "Create Course": "courses.createCourse",
  "Edit Course": "courses.editCourse",
  "Course Name": "courses.courseName",
  "Description": "courses.description",
  "Category": "courses.category",
  "All Categories": "courses.allCategories",
  "Duration": "courses.duration",
  "Level": "courses.level",
  "Beginner to Advanced": "courses.beginnerToAdvanced",
  "Advanced to Beginner": "courses.advancedToBeginner",
  "Instructor": "courses.instructor",
  "Sort by": "courses.sortBy",
  "Title": "courses.title",
  "Draft": "courses.draft",
  "Published": "courses.published",
};

/**
 * Staff-specific translations
 */
const staffTranslations = {
  "Staff": "staff.staff",
  "IIM Staff": "staff.staff",
  "Staff Details": "staff.staffDetails",
  "Create Staff": "staff.createStaff",
  "Edit Staff": "staff.editStaff",
  "Staff Name": "staff.staffName",
  "Department": "staff.department",
  "Designation": "staff.designation",
  "Role": "staff.role",
  "Permissions": "staff.permissions",
};

/**
 * Blog-specific translations
 */
const blogTranslations = {
  "Blog": "blog.blog",
  "Blog Details": "blog.blogDetails",
  "Create Blog": "blog.createBlog",
  "Edit Blog": "blog.editBlog",
  "Title": "blog.title",
  "Content": "blog.content",
  "Author": "blog.author",
  "Category": "blog.category",
  "Tags": "blog.tags",
  "Publish Date": "blog.publishDate",
};

/**
 * Language-specific translations
 */
const languageTranslations = {
  "Language": "language.language",
  "English": "language.english",
  "Hindi": "language.hindi",
  "Gujarati": "language.gujarati",
};

/**
 * Combine all translations
 */
export const allTranslations = {
  ...commonTranslations,
  ...dashboardTranslations,
  ...schoolTranslations,
  ...educatorTranslations,
  ...courseTranslations,
  ...staffTranslations,
  ...blogTranslations,
  ...languageTranslations,
};

/**
 * Example usage:
 * 
 * // Read component code
 * const componentCode = fs.readFileSync('path/to/component.jsx', 'utf8');
 * 
 * // Add useTranslation hook
 * let updatedCode = addUseTranslationHook(componentCode);
 * 
 * // Add t function
 * updatedCode = addTFunction(updatedCode);
 * 
 * // Replace hardcoded text with translation keys
 * updatedCode = replaceHardcodedText(updatedCode, allTranslations);
 * 
 * // Write updated code back to file
 * fs.writeFileSync('path/to/component.jsx', updatedCode, 'utf8');
 */
