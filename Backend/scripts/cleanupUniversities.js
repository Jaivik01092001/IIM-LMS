/**
 * Cleanup script to remove the University collection after migration
 * 
 * This script:
 * 1. Verifies that all universities have been migrated to the User model
 * 2. Removes the University collection if safe to do so
 * 3. Logs the cleanup results
 * 
 * IMPORTANT: Run this script ONLY after successfully running migrateUniversities.js
 */

const mongoose = require('mongoose');
const University = require('../models/University');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected for cleanup'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const cleanupUniversities = async () => {
  try {
    console.log('Starting university cleanup...');
    
    // Get all universities from the University collection
    const universities = await University.find();
    console.log(`Found ${universities.length} universities in the University collection`);
    
    // Get all users with role='university'
    const universityUsers = await User.find({ role: 'university' });
    console.log(`Found ${universityUsers.length} users with role='university'`);
    
    // Check if all universities have been migrated
    if (universities.length > universityUsers.length) {
      console.error('ERROR: Not all universities have been migrated to the User model!');
      console.error(`University collection has ${universities.length} records, but User model has only ${universityUsers.length} university records.`);
      console.error('Please run the migration script first and ensure all universities are migrated before cleanup.');
      return;
    }
    
    // Verify that each university has a corresponding user
    let allMigrated = true;
    for (const university of universities) {
      const matchingUser = universityUsers.find(user => 
        user.email === university.email || 
        user.name === university.name
      );
      
      if (!matchingUser) {
        console.error(`ERROR: University "${university.name}" (${university._id}) has not been migrated to the User model!`);
        allMigrated = false;
      }
    }
    
    if (!allMigrated) {
      console.error('Some universities have not been migrated. Please run the migration script again.');
      return;
    }
    
    // If all universities have been migrated, drop the University collection
    console.log('All universities have been successfully migrated to the User model.');
    console.log('Dropping the University collection...');
    
    // Get the collection name from the model
    const collectionName = University.collection.name;
    
    // Drop the collection
    await mongoose.connection.db.dropCollection(collectionName);
    
    console.log(`Successfully dropped the ${collectionName} collection.`);
    console.log('Cleanup completed successfully!');
    
  } catch (err) {
    console.error('Cleanup failed:', err);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the cleanup
cleanupUniversities();
