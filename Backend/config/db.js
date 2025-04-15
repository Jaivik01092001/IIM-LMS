const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const connectionString = `${process.env.MONGO_URI}`;
        await mongoose.connect(connectionString);
        console.log('MongoDB Connected to LMS database...');
    } catch (error) {
        console.error('MongoDB Connection Failed:', error);
        process.exit(1);
    }
};

module.exports = connectDB;