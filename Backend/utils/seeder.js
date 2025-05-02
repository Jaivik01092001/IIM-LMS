const mongoose = require("mongoose");
const User = require("../models/User");
const Role = require("../models/Role");
const Permission = require("../models/Permission");
const { getAllPermissions, PERMISSIONS } = require("./permissions");

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
        email: "zeel.fabaf@gmail.com",
        phoneNumber: "+919904424789",
        role: "university",
        name: "Zeel",
        profile: {
          address: "123 University St, Ahmedabad",
          zipcode: "380001",
          state: "Gujarat",
        },
      },
      {
        email: "anandkumarbarot@gmail.com",
        phoneNumber: "+918140977185",
        role: "educator",
        name: "Anand",
        profile: {
          address: "456 Educator Ave, Ahmedabad",
          zipcode: "380015",
          state: "Gujarat",
        },
      },
      {
        email: "jaivik.patel@fabaf.in",
        phoneNumber: "+919664774890",
        role: "admin",
        name: "Jaivik",
      },
      {
        email: "nishant@fabaf.in",
        phoneNumber: "+918980905254",
        role: "admin",
        name: "Nishant",
      },
      {
        email: "fabaf2021@gmail.com",
        phoneNumber: "+919924294542",
        role: "staff",
        name: "Fabaf",
      },
    ]);

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
      allPermissions.forEach((permission) => {
        adminPermissions[permission.name] = true;
      });

      // Create default roles based on permissions from permissions.js
      // Using standardized role mapping: UI name -> DB role value
      const roles = [
        {
          name: "Super Admin", // UI: Super Admin -> DB: admin
          description: "Full access to all system features",
          permissions: adminPermissions,
          createdBy: users[2]._id, // Admin user
        },
        {
          name: "IIM Staff", // UI: IIM Staff -> DB: staff
          description: "Staff members with full system access",
          permissions: adminPermissions, // Same permissions as Super Admin
          createdBy: users[2]._id,
        },
        {
          name: "School Admin", // UI: School Admin -> DB: university
          description: "Manages university and educators",
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
          createdBy: users[2]._id,
        },
        {
          name: "Educator", // UI: Educator -> DB: educator
          description: "Creates and manages courses and content",
          permissions: {
            // Course management permissions
            [PERMISSIONS.COURSE_MANAGEMENT.VIEW_COURSES]: true,
            [PERMISSIONS.COURSE_MANAGEMENT.CREATE_COURSE]: true,
            [PERMISSIONS.COURSE_MANAGEMENT.EDIT_COURSE]: true,
            [PERMISSIONS.COURSE_MANAGEMENT.DELETE_COURSE]: true,
          },
          createdBy: users[2]._id,
        },
      ];

      await Role.insertMany(roles);
      console.log(`${roles.length} roles seeded`);

      // Assign roles to users
      const superAdminRole = await Role.findOne({ name: "Super Admin" });
      const schoolAdminRole = await Role.findOne({ name: "School Admin" });
      const educatorRole = await Role.findOne({ name: "Educator" });

      // Update users with role references
      await User.findByIdAndUpdate(users[0]._id, {
        roleRef: schoolAdminRole._id,
      });
      await User.findByIdAndUpdate(users[1]._id, { roleRef: educatorRole._id });
      await User.findByIdAndUpdate(users[2]._id, {
        roleRef: superAdminRole._id,
      });

      console.log("Roles assigned to users");
    }

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
};

module.exports = seedDatabase; // ✅ Ensure correct export
