const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');
const University = require('../models/University');
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
                language: 'en',
                level: 'intermediate',
                tags: ['education', 'social-emotional', 'school climate'],
                thumbnail: 'https://example.com/thumbnail1.jpg'
            },
            {
                title: 'Bullying prevention for safer schooling experiences',
                creator: users[2]._id,
                description: 'Strategies to prevent bullying in schools',
                duration: '3 weeks',
                category: 'Education',
                language: 'en',
                level: 'beginner',
                tags: ['education', 'bullying', 'safety'],
                thumbnail: 'https://example.com/thumbnail2.jpg'
            },
            {
                title: 'Effective School Leadership',
                creator: users[2]._id,
                description: 'Develop leadership skills for school administrators',
                duration: '6 weeks',
                category: 'Leadership',
                language: 'en',
                level: 'advanced',
                tags: ['education', 'leadership', 'administration'],
                thumbnail: 'https://example.com/thumbnail3.jpg'
            },
            {
                title: 'Managing Self and Regulating Emotions',
                creator: users[2]._id,
                description: 'Learn techniques for emotional regulation',
                duration: '4 weeks',
                category: 'Psychology',
                language: 'en',
                level: 'beginner',
                tags: ['psychology', 'emotions', 'self-regulation'],
                thumbnail: 'https://example.com/thumbnail4.jpg'
            },
            {
                title: 'Innovative Educational Pedagogies',
                creator: users[2]._id,
                description: 'Explore innovative teaching methods',
                duration: '5 weeks',
                category: 'Education',
                language: 'en',
                level: 'intermediate',
                tags: ['education', 'pedagogy', 'innovation'],
                thumbnail: 'https://example.com/thumbnail5.jpg'
            },
        ];

        await Course.deleteMany({});
        await Course.insertMany(courses);
        console.log('Courses seeded');

        // Insert Universities
        await University.insertMany([
            {
                name: 'University of Technology',
                email: 'info@uot.edu',
                phone: '+919876543210',
                address: '123 University Road, Ahmedabad',
                zipcode: '380001',
                state: 'Gujarat',
                contactPerson: 'Dr. Patel',
                educators: []
            },
            {
                name: 'Global Institute of Sciences',
                email: 'contact@gis.edu',
                phone: '+919876543211',
                address: '456 Institute Avenue, Mumbai',
                zipcode: '400001',
                state: 'Maharashtra',
                contactPerson: 'Dr. Sharma',
                educators: []
            },
        ]);

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

            // Create default roles
            const roles = [
                {
                    name: 'Super Admin',
                    description: 'Full access to all system features',
                    permissions: adminPermissions,
                    createdBy: users[2]._id // Admin user
                },
                {
                    name: 'University Admin',
                    description: 'Manages university and educators',
                    permissions: {
                        // User management permissions
                        [PERMISSIONS.USER_MANAGEMENT.VIEW_USERS]: true,
                        [PERMISSIONS.USER_MANAGEMENT.CREATE_USER]: true,
                        [PERMISSIONS.USER_MANAGEMENT.EDIT_USER]: true,

                        // Course management permissions
                        [PERMISSIONS.COURSE_MANAGEMENT.VIEW_COURSES]: true,

                        // Content management permissions
                        [PERMISSIONS.CONTENT_MANAGEMENT.VIEW_CONTENT]: true,

                        // Reports permissions
                        [PERMISSIONS.REPORTS_ANALYTICS.VIEW_REPORTS]: true,
                        [PERMISSIONS.REPORTS_ANALYTICS.VIEW_ANALYTICS]: true,
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

                        // Quiz management permissions
                        [PERMISSIONS.QUIZ_MANAGEMENT.VIEW_QUIZZES]: true,
                        [PERMISSIONS.QUIZ_MANAGEMENT.CREATE_QUIZ]: true,
                        [PERMISSIONS.QUIZ_MANAGEMENT.EDIT_QUIZ]: true,
                        [PERMISSIONS.QUIZ_MANAGEMENT.VIEW_RESULTS]: true,

                        // Content management permissions
                        [PERMISSIONS.CONTENT_MANAGEMENT.VIEW_CONTENT]: true,
                        [PERMISSIONS.CONTENT_MANAGEMENT.CREATE_CONTENT]: true,
                        [PERMISSIONS.CONTENT_MANAGEMENT.EDIT_CONTENT]: true,

                        // Certificate management permissions
                        [PERMISSIONS.CERTIFICATE_MANAGEMENT.VIEW_CERTIFICATES]: true,
                        [PERMISSIONS.CERTIFICATE_MANAGEMENT.CREATE_CERTIFICATE]: true,
                    },
                    createdBy: users[2]._id
                },
                {
                    name: 'Student',
                    description: 'Enrolls in courses and takes quizzes',
                    permissions: {
                        // Course management permissions
                        [PERMISSIONS.COURSE_MANAGEMENT.VIEW_COURSES]: true,

                        // Quiz management permissions
                        [PERMISSIONS.QUIZ_MANAGEMENT.VIEW_QUIZZES]: true,
                    },
                    createdBy: users[2]._id
                }
            ];

            await Role.insertMany(roles);
            console.log(`${roles.length} roles seeded`);

            // Assign roles to users
            const superAdminRole = await Role.findOne({ name: 'Super Admin' });
            const universityAdminRole = await Role.findOne({ name: 'University Admin' });
            const educatorRole = await Role.findOne({ name: 'Educator' });

            // Update users with role references
            await User.findByIdAndUpdate(users[0]._id, { roleRef: universityAdminRole._id });
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
