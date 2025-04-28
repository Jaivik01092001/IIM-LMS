const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const { getAllPermissions, PERMISSIONS } = require('./permissions');

const seedDatabase = async () => {
    try {
        console.log("🔍 Checking if database seeding is required...");

        // Check if Users exist
        const userCount = await User.countDocuments();
        const permissionCount = await Permission.countDocuments();
        const roleCount = await Role.countDocuments();

        if (userCount > 0 && permissionCount > 0 && roleCount > 0) {
            console.log("✅ Database already seeded. Skipping...");
            return;
        }

        console.log("🌱 Seeding database...");

        // Insert Users with phone numbers instead of passwords
        const users = await User.insertMany([
            {
                email: 'zeel.fabaf@gmail.com',
                phoneNumber: '+919904424789',
                role: 'university',
                name: 'Zeel',
                profile: {
                    address: '123 University St, Ahmedabad',
                    zipcode: '380001',
                    state: 'Gujarat'
                }
            },
            {
                email: 'anandkumarbarot@gmail.com',
                phoneNumber: '+918140977185',
                role: 'educator',
                name: 'Anand',
                profile: {
                    address: '456 Educator Ave, Ahmedabad',
                    zipcode: '380015',
                    state: 'Gujarat'
                }
            },
            {
                email: 'jaivik.patel@fabaf.in',
                phoneNumber: '+919664774890',
                role: 'admin',
                name: 'Jaivik'
            },
            {
                email: 'nishant@fabaf.in',
                phoneNumber: '+918980905254',
                role: 'admin',
                name: 'Nishant'
            },
            {
                email: 'fabaf2021@gmail.com',
                phoneNumber: '+919924294542',
                role: 'admin',
                name: 'Nishant'
            },
        ]);

        // Predefined Courses
        const courses = [
            {
                title: 'Developing a positive social-emotional climate in schools',
                creator: users[2]._id,
                description: 'Learn how to create a positive social-emotional climate in schools',
                duration: '4 weeks',
                category: 'Education',
                subcategory: 'School Administration',
                language: 'en',
                level: 'intermediate',
                tags: ['education', 'social-emotional', 'school climate'],
                thumbnail: 'https://example.com/thumbnail1.jpg',
                hasModules: true,
                modules: [],
                content: [],
                quizzes: [],
                learningOutcomes: [
                    'Create a positive classroom environment',
                    'Implement effective emotional regulation strategies',
                    'Develop school-wide social-emotional support systems'
                ],
                requirements: [
                    'Basic understanding of educational psychology',
                    'Experience in a school setting'
                ],
                targetAudience: 'School administrators, teachers, and counselors',
                isDraft: false,
                status: 1
            },
            {
                title: 'Bullying prevention for safer schooling experiences',
                creator: users[2]._id,
                description: 'Strategies to prevent bullying in schools',
                duration: '3 weeks',
                category: 'Education',
                subcategory: 'Student Welfare',
                language: 'en',
                level: 'beginner',
                tags: ['education', 'bullying', 'safety'],
                thumbnail: 'https://example.com/thumbnail2.jpg',
                hasModules: false,
                modules: [],
                content: [],
                quizzes: [],
                learningOutcomes: [
                    'Identify various forms of bullying',
                    'Implement anti-bullying programs',
                    'Support victims of bullying effectively'
                ],
                requirements: [
                    'Basic understanding of child psychology'
                ],
                targetAudience: 'Teachers, school counselors, and parents',
                isDraft: false,
                status: 1
            },
            {
                title: 'Effective School Leadership',
                creator: users[2]._id,
                description: 'Develop leadership skills for school administrators',
                duration: '6 weeks',
                category: 'Leadership',
                subcategory: 'Education Administration',
                language: 'en',
                level: 'advanced',
                tags: ['education', 'leadership', 'administration'],
                thumbnail: 'https://example.com/thumbnail3.jpg',
                hasModules: true,
                modules: [],
                content: [],
                quizzes: [],
                learningOutcomes: [
                    'Develop a vision for school improvement',
                    'Build effective leadership teams',
                    'Implement data-driven decision making'
                ],
                requirements: [
                    'At least 2 years of teaching experience',
                    'Basic understanding of educational policy'
                ],
                targetAudience: 'Aspiring and current school leaders, principals, and administrators',
                isDraft: false,
                status: 1
            },
            {
                title: 'Managing Self and Regulating Emotions',
                creator: users[2]._id,
                description: 'Learn techniques for emotional regulation',
                duration: '4 weeks',
                category: 'Psychology',
                subcategory: 'Emotional Intelligence',
                language: 'en',
                level: 'beginner',
                tags: ['psychology', 'emotions', 'self-regulation'],
                thumbnail: 'https://example.com/thumbnail4.jpg',
                hasModules: false,
                modules: [],
                content: [],
                quizzes: [],
                learningOutcomes: [
                    'Identify emotional triggers',
                    'Apply mindfulness techniques',
                    'Develop healthy coping mechanisms'
                ],
                requirements: [
                    'No prerequisites required'
                ],
                targetAudience: 'Teachers, students, and anyone interested in emotional regulation',
                isDraft: false,
                status: 1
            },
            {
                title: 'Innovative Educational Pedagogies',
                creator: users[2]._id,
                description: 'Explore innovative teaching methods',
                duration: '5 weeks',
                category: 'Education',
                subcategory: 'Teaching Methods',
                language: 'en',
                level: 'intermediate',
                tags: ['education', 'pedagogy', 'innovation'],
                thumbnail: 'https://example.com/thumbnail5.jpg',
                hasModules: true,
                modules: [],
                content: [],
                quizzes: [],
                learningOutcomes: [
                    'Implement project-based learning',
                    'Integrate technology in the classroom',
                    'Design student-centered learning experiences'
                ],
                requirements: [
                    'Basic teaching experience',
                    'Familiarity with educational technology'
                ],
                targetAudience: 'K-12 teachers, curriculum developers, and instructional designers',
                isDraft: false,
                status: 1
            },
        ];

        await Course.deleteMany({});
        await Course.insertMany(courses);
        console.log('Courses seeded');

        // Insert Universities


        // Seed Permissions
        if (permissionCount === 0) {
            console.log("Seeding permissions...");
            const permissionsList = getAllPermissions();
            await Permission.insertMany(permissionsList);
            console.log(`${permissionsList.length} permissions seeded`);
        }
        // Seed Default Roles
        if (roleCount === 0) {
            console.log("Seeding roles...");

            // Create a map of all permissions set to true for admin role
            const adminPermissions = {};
            const allPermissions = await Permission.find();
            allPermissions.forEach(permission => {
                adminPermissions[permission.name] = true;
            });

            // Create default roles based on permissions from permissions.js
            const roles = [
                {
                    name: 'Super Admin',
                    description: 'Full access to all system features',
                    permissions: adminPermissions,
                    createdBy: users[2]._id // Admin user
                },
                {
                    name: 'IIM Staff',
                    description: 'Staff members with full system access',
                    permissions: adminPermissions, // Same permissions as Super Admin
                    createdBy: users[2]._id
                },
                {
                    name: 'School Admin',
                    description: 'Manages university and educators',
                    permissions: {
                        // School management permissions
                        [PERMISSIONS.SCHOOL_MANAGEMENT.VIEW_SCHOOLS]: true,
                        [PERMISSIONS.SCHOOL_MANAGEMENT.CREATE_SCHOOL]: true,
                        [PERMISSIONS.SCHOOL_MANAGEMENT.EDIT_SCHOOL]: true,
                        [PERMISSIONS.SCHOOL_MANAGEMENT.DELETE_SCHOOL]: true,

                        // Educator management permissions
                        [PERMISSIONS.EDUCATOR_MANAGEMENT.VIEW_EDUCATORS]: true,
                        [PERMISSIONS.EDUCATOR_MANAGEMENT.CREATE_EDUCATOR]: true,
                        [PERMISSIONS.EDUCATOR_MANAGEMENT.EDIT_EDUCATOR]: true,
                        [PERMISSIONS.EDUCATOR_MANAGEMENT.DELETE_EDUCATOR]: true,

                        // Course management permissions
                        [PERMISSIONS.COURSE_MANAGEMENT.VIEW_COURSES]: true,
                    },
                    createdBy: users[2]._id
                },
                {
                    name: 'Educator',
                    description: 'Creates and manages courses and content',
                    permissions: {
                        // Course management permissions
                        [PERMISSIONS.COURSE_MANAGEMENT.VIEW_COURSES]: true,
                        [PERMISSIONS.COURSE_MANAGEMENT.CREATE_COURSE]: true,
                        [PERMISSIONS.COURSE_MANAGEMENT.EDIT_COURSE]: true,
                        [PERMISSIONS.COURSE_MANAGEMENT.DELETE_COURSE]: true,
                    },
                    createdBy: users[2]._id
                },

            ];

            await Role.insertMany(roles);
            console.log(`${roles.length} roles seeded`);

            // Assign roles to users
            const superAdminRole = await Role.findOne({ name: 'Super Admin' });
            const schoolAdminRole = await Role.findOne({ name: 'School Admin' });
            const educatorRole = await Role.findOne({ name: 'Educator' });

            // Update users with role references
            await User.findByIdAndUpdate(users[0]._id, { roleRef: schoolAdminRole._id });
            await User.findByIdAndUpdate(users[1]._id, { roleRef: educatorRole._id });
            await User.findByIdAndUpdate(users[2]._id, { roleRef: superAdminRole._id });

            console.log('Roles assigned to users');
        }

        console.log("✅ Database seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding database:", error);
    }
};

module.exports = seedDatabase;  // ✅ Ensure correct export
