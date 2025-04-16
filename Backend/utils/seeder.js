const mongoose = require('mongoose');
const Course = require('../models/Course');
const User = require('../models/User');
const University = require('../models/University'); // Ensure the model is imported

const seedDatabase = async () => {
    try {
        console.log("🔍 Checking if database seeding is required...");

        // Check if Users exist
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            console.log("✅ Database already seeded. Skipping...");
            return;
        }

        console.log("🌱 Seeding database...");

        // Insert Users with phone numbers instead of passwords
        const users = await User.insertMany([
            { email: 'zeel.fabaf@gmail.com', phoneNumber: '+919904424789', role: 'university', name: 'User One' },
            { email: 'anandkumarbarot@gmail.com', phoneNumber: '+918140977185', role: 'educator', name: 'User Two' },
            { email: 'jaivik.patel@fabaf.in', phoneNumber: '+919664774890', role: 'admin', name: 'Admin User' },
        ]);

        // Predefined Courses
        const courses = [
            { title: 'Developing a positive social-emotional climate in schools', creator: users[2]._id },
            { title: 'Bullying prevention for safer schooling experiences', creator: users[2]._id },
            { title: 'Effective School Leadership', creator: users[2]._id },
            { title: 'Managing Self and Regulating Emotions', creator: users[2]._id },
            { title: 'Innovative Educational Pedagogies', creator: users[2]._id },
        ];

        await Course.deleteMany({});
        await Course.insertMany(courses);
        console.log('Courses seeded');

        // Insert Universities
        await University.insertMany([
            { name: 'University 1', educators: [] },
            { name: 'University 2', educators: [] },
        ]);

        console.log("✅ Database seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding database:", error);
    }
};

module.exports = seedDatabase;  // ✅ Ensure correct export
