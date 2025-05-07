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
        _id: "681af0cd9533dc70cee7dd70",
        email: "zeel.fabaf@gmail.com",
        phoneNumber: "+919904424789",
        role: "university",
        name: "Zeel",
        profile: {
          address: "awdwaawd",
          zipcode: "165841",
          state: "Jharkhand",
          avatar: "uploads/profiles/1746596045262-profileImage.jpg",
        },
        educators: [],
        contactPerson: "awdawda",
        status: 1,
        createdAt: "2025-05-07T05:34:05.407Z",
        updatedAt: "2025-05-07T05:34:05.407Z",
        __v: 0,
      },
      {
        _id: "681af0cd9533dc70cee7dd71",
        email: "anandkumarbarot@gmail.com",
        phoneNumber: "+918140977185",
        role: "educator",
        name: "Anand",
        profile: {
          address: "awdwaawd",
          zipcode: "165841",
          state: "Jharkhand",
          avatar: "uploads/profiles/1746596045262-profileImage.jpg",
        },
        educators: [],
        contactPerson: "awdawda",
        status: 1,
        createdAt: "2025-05-07T05:34:05.407Z",
        updatedAt: "2025-05-07T05:34:05.407Z",
        __v: 0,
      },
      {
        _id: "681af0cd9533dc70cee7dd72",
        email: "jaivik.patel@fabaf.in",
        phoneNumber: "+919664774890",
        role: "admin",
        name: "Jaivik",
        profile: {
          address: "awdwaawd",
          zipcode: "165841",
          state: "Jharkhand",
          avatar: "uploads/profiles/1746596045262-profileImage.jpg",
        },
        educators: [],
        contactPerson: "awdawda",
        status: 1,
        createdAt: "2025-05-07T05:34:05.407Z",
        updatedAt: "2025-05-07T05:34:05.407Z",
        __v: 0,
      },
      {
        _id: "681af0cd9533dc70cee7dd73",
        email: "nishant@fabaf.in",
        phoneNumber: "+918980905254",
        role: "admin",
        name: "Nishant",
        profile: {
          address: "awdwaawd",
          zipcode: "165841",
          state: "Jharkhand",
          avatar: "uploads/profiles/1746596045262-profileImage.jpg",
        },
        educators: [],
        contactPerson: "awdawda",
        status: 1,
        createdAt: "2025-05-07T05:34:05.407Z",
        updatedAt: "2025-05-07T05:34:05.407Z",
        __v: 0,
      },
      {
        _id: "681af0cd9533dc70cee7dd74",
        email: "fabaf2021@gmail.com",
        phoneNumber: "+919924294542",
        role: "staff",
        name: "Fabaf",
        profile: {
          address: "awdwaawd",
          zipcode: "165841",
          state: "Jharkhand",
          avatar: "uploads/profiles/1746596045262-profileImage.jpg",
        },
        educators: [],
        contactPerson: "awdawda",
        status: 1,
        createdAt: "2025-05-07T05:34:05.407Z",
        updatedAt: "2025-05-07T05:34:05.407Z",
        __v: 0,
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
          permissions: {
            [PERMISSIONS.COURSE_MANAGEMENT.VIEW_COURSES]: true,
            [PERMISSIONS.COURSE_MANAGEMENT.CREATE_COURSE]: true,
            [PERMISSIONS.COURSE_MANAGEMENT.EDIT_COURSE]: true,
            [PERMISSIONS.COURSE_MANAGEMENT.DELETE_COURSE]: true,
            [PERMISSIONS.SCHOOL_MANAGEMENT.VIEW_SCHOOLS]: true,
            [PERMISSIONS.SCHOOL_MANAGEMENT.CREATE_SCHOOL]: true,
            [PERMISSIONS.SCHOOL_MANAGEMENT.EDIT_SCHOOL]: true,
            [PERMISSIONS.SCHOOL_MANAGEMENT.DELETE_SCHOOL]: true,
            [PERMISSIONS.EDUCATOR_MANAGEMENT.VIEW_EDUCATORS]: true,
            [PERMISSIONS.EDUCATOR_MANAGEMENT.CREATE_EDUCATOR]: true,
            [PERMISSIONS.EDUCATOR_MANAGEMENT.EDIT_EDUCATOR]: true,
            [PERMISSIONS.EDUCATOR_MANAGEMENT.DELETE_EDUCATOR]: true,
            [PERMISSIONS.BLOG_MANAGEMENT.VIEW_BLOGS]: true,
            [PERMISSIONS.BLOG_MANAGEMENT.CREATE_BLOG]: true,
            [PERMISSIONS.BLOG_MANAGEMENT.EDIT_BLOG]: true,
            [PERMISSIONS.BLOG_MANAGEMENT.DELETE_BLOG]: true,
          },
          createdBy: users[2]._id, // Admin user
        },
        {
          name: "IIM Staff", // UI: IIM Staff -> DB: staff
          description: "Staff members with full system access",
          permissions: {
            [PERMISSIONS.COURSE_MANAGEMENT.VIEW_COURSES]: true,
            [PERMISSIONS.COURSE_MANAGEMENT.CREATE_COURSE]: true,
            [PERMISSIONS.COURSE_MANAGEMENT.EDIT_COURSE]: true,
            [PERMISSIONS.COURSE_MANAGEMENT.DELETE_COURSE]: true,
            [PERMISSIONS.SCHOOL_MANAGEMENT.VIEW_SCHOOLS]: true,
            [PERMISSIONS.SCHOOL_MANAGEMENT.CREATE_SCHOOL]: true,
            [PERMISSIONS.SCHOOL_MANAGEMENT.EDIT_SCHOOL]: true,
            [PERMISSIONS.SCHOOL_MANAGEMENT.DELETE_SCHOOL]: true,
            [PERMISSIONS.EDUCATOR_MANAGEMENT.VIEW_EDUCATORS]: true,
            [PERMISSIONS.EDUCATOR_MANAGEMENT.CREATE_EDUCATOR]: true,
            [PERMISSIONS.EDUCATOR_MANAGEMENT.EDIT_EDUCATOR]: true,
            [PERMISSIONS.EDUCATOR_MANAGEMENT.DELETE_EDUCATOR]: true,
            [PERMISSIONS.BLOG_MANAGEMENT.VIEW_BLOGS]: true,
            [PERMISSIONS.BLOG_MANAGEMENT.CREATE_BLOG]: true,
            [PERMISSIONS.BLOG_MANAGEMENT.EDIT_BLOG]: true,
            [PERMISSIONS.BLOG_MANAGEMENT.DELETE_BLOG]: false,
          },
          createdBy: users[2]._id,
        },
        {
          name: "School Admin", // UI: School Admin -> DB: university
          description: "Manages university and educators",
          permissions: {
            [PERMISSIONS.SCHOOL_MANAGEMENT.VIEW_SCHOOLS]: false,
            [PERMISSIONS.SCHOOL_MANAGEMENT.CREATE_SCHOOL]: false,
            [PERMISSIONS.SCHOOL_MANAGEMENT.EDIT_SCHOOL]: false,
            [PERMISSIONS.SCHOOL_MANAGEMENT.DELETE_SCHOOL]: false,
            [PERMISSIONS.EDUCATOR_MANAGEMENT.VIEW_EDUCATORS]: true,
            [PERMISSIONS.EDUCATOR_MANAGEMENT.CREATE_EDUCATOR]: true,
            [PERMISSIONS.EDUCATOR_MANAGEMENT.EDIT_EDUCATOR]: true,
            [PERMISSIONS.EDUCATOR_MANAGEMENT.DELETE_EDUCATOR]: true,
            [PERMISSIONS.COURSE_MANAGEMENT.VIEW_COURSES]: true,
            [PERMISSIONS.BLOG_MANAGEMENT.VIEW_BLOGS]: true,
            [PERMISSIONS.BLOG_MANAGEMENT.CREATE_BLOG]: true,
            [PERMISSIONS.BLOG_MANAGEMENT.EDIT_BLOG]: true,
            [PERMISSIONS.BLOG_MANAGEMENT.DELETE_BLOG]: true,
          },
          createdBy: users[2]._id,
        },
        {
          name: "Educator", // UI: Educator -> DB: educator
          description: "Creates and manages courses and content",
          permissions: {
            [PERMISSIONS.COURSE_MANAGEMENT.VIEW_COURSES]: true,
            [PERMISSIONS.COURSE_MANAGEMENT.CREATE_COURSE]: false,
            [PERMISSIONS.COURSE_MANAGEMENT.EDIT_COURSE]: false,
            [PERMISSIONS.COURSE_MANAGEMENT.DELETE_COURSE]: false,
            [PERMISSIONS.BLOG_MANAGEMENT.VIEW_BLOGS]: true,
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
      const staffRole = await Role.findOne({ name: "IIM Staff" });

      // Update users with role references
      await User.findByIdAndUpdate(users[0]._id, {
        roleRef: schoolAdminRole._id,
      });
      await User.findByIdAndUpdate(users[1]._id, { roleRef: educatorRole._id });
      await User.findByIdAndUpdate(users[2]._id, {
        roleRef: superAdminRole._id,
      });
      await User.findByIdAndUpdate(users[3]._id, {
        roleRef: superAdminRole._id,
      });
      await User.findByIdAndUpdate(users[4]._id, {
        roleRef: staffRole._id,
      });

      console.log("Roles assigned to users");
    }

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
};

module.exports = seedDatabase; // ✅ Ensure correct export
