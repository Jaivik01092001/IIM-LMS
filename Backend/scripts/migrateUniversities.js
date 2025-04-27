/**
 * Migration script to move data from University model to User model
 * 
 * This script:
 * 1. Finds all universities in the University collection
 * 2. For each university, checks if a corresponding User with role='university' exists
 * 3. If not, creates a new User with the university data
 * 4. Updates all educators to reference the User instead of the University
 * 5. Logs the migration results
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
.then(() => console.log('MongoDB connected for migration'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const migrateUniversities = async () => {
  try {
    console.log('Starting university migration...');
    
    // Get all universities
    const universities = await University.find();
    console.log(`Found ${universities.length} universities to migrate`);
    
    let created = 0;
    let updated = 0;
    let errors = 0;
    
    // Process each university
    for (const university of universities) {
      try {
        // Check if a user already exists for this university
        let universityUser = await User.findOne({ 
          email: university.email,
          role: 'university'
        });
        
        if (!universityUser) {
          // Create a new user for this university
          universityUser = new User({
            email: university.email,
            phoneNumber: university.phone || '0000000000', // Default if missing
            role: 'university',
            name: university.name,
            contactPerson: university.contactPerson,
            educators: university.educators || [],
            profile: {
              address: university.address,
              zipcode: university.zipcode,
              state: university.state,
            },
            status: university.status
          });
          
          // Generate a random password (since we use OTP for login)
          const crypto = require('crypto');
          const password = crypto.randomBytes(8).toString('hex');
          const bcrypt = require('bcryptjs');
          universityUser.password = await bcrypt.hash(password, 10);
          
          await universityUser.save();
          created++;
          console.log(`Created new user for university: ${university.name}`);
        } else {
          // Update existing user with university data
          universityUser.name = university.name;
          universityUser.contactPerson = university.contactPerson;
          universityUser.educators = university.educators || [];
          universityUser.profile = {
            ...universityUser.profile,
            address: university.address,
            zipcode: university.zipcode,
            state: university.state,
          };
          universityUser.status = university.status;
          
          await universityUser.save();
          updated++;
          console.log(`Updated existing user for university: ${university.name}`);
        }
        
        // Update all educators to reference the User instead of the University
        const educators = await User.find({ 
          university: university._id,
          role: 'educator'
        });
        
        for (const educator of educators) {
          educator.university = universityUser._id;
          await educator.save();
          console.log(`Updated educator ${educator.name} to reference university user`);
        }
      } catch (err) {
        console.error(`Error processing university ${university.name}:`, err);
        errors++;
      }
    }
    
    console.log('\nMigration completed:');
    console.log(`- Created ${created} new university users`);
    console.log(`- Updated ${updated} existing university users`);
    console.log(`- Encountered ${errors} errors`);
    
    if (errors === 0) {
      console.log('\nAll universities successfully migrated!');
    } else {
      console.log('\nMigration completed with some errors. Check the logs above.');
    }
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

// Run the migration
migrateUniversities();
