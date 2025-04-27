const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { formatPhoneNumber } = require('../utils/phoneUtils');

exports.createEducator = async (req, res, next) => {
  try {
    const {
      email,
      name,
      roleId,
      phoneNumber,
      address,
      zipcode,
      state,
      category, // Add category field
      schoolName // Add school/university name field
    } = req.body;

    // Prepare profile object
    const profile = {
      address,
      zipcode,
      state,
      category, // Add category field
      schoolName, // Add school/university name field
      socialLinks: {}
    };

    // Add avatar if profile image was uploaded
    if (req.file) {
      profile.avatar = `/uploads/profiles/${req.file.filename}`;
    }

    console.log('University controller - Creating educator with roleId:', roleId);

    // Determine the role based on roleId
    let roleName = 'educator'; // Default role
    if (roleId) {
      const Role = require('../models/Role');
      const role = await Role.findById(roleId);
      if (role) {
        roleName = role.name.toLowerCase(); // Convert to lowercase
        console.log('University controller - Using role name:', roleName);
      }
    }

    const educator = new User({
      email,
      role: roleName, // Use the determined role name
      name,
      phoneNumber, // No default phone number, must be provided by user
      university: req.user.id,
      roleRef: roleId || undefined, // Assign role if provided
      profile
    });

    console.log('University controller - Created educator with roleRef:', educator.roleRef);
    console.log('University controller - Created educator with role:', educator.role);

    await educator.save();

    // Add the educator to the university's educators array
    const university = await User.findOne({
      _id: req.user.id,
      role: 'university'
    });

    if (university) {
      // Initialize educators array if it doesn't exist
      if (!university.educators) {
        university.educators = [];
      }

      // Add the educator to the university's educators array if not already there
      if (!university.educators.includes(educator._id)) {
        university.educators.push(educator._id);
        await university.save();
      }
    }

    res.json(educator);
  } catch (error) {
    next(error);
  }
};

exports.getEducators = async (req, res) => {
  try {
    // Return all educators (both active and inactive)
    const educators = await User.find({
      university: req.user.id,
      role: 'educator'
    })
    .populate('university', 'name category')
    .populate('roleRef', 'name') // Populate the role reference
    .select('-password');

    res.json(educators);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving educators', error: error.message });
  }
};

exports.getEducatorById = async (req, res) => {
  try {
    const educator = await User.findOne({
      _id: req.params.id,
      university: req.user.id,
      role: 'educator'
    })
    .populate('roleRef', 'name') // Populate the role reference
    .select('-password');

    if (!educator) {
      return res.status(404).json({ message: 'Educator not found' });
    }

    console.log('University controller - Educator with populated roleRef:', educator);
    res.json(educator);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving educator', error: error.message });
  }
};

exports.deleteEducator = async (req, res) => {
  try {
    const educator = await User.findOne({
      _id: req.params.id,
      university: req.user.id,
      role: 'educator'
    });

    if (!educator) {
      return res.status(404).json({ message: 'Educator not found' });
    }

    // Soft delete - update status to 0 (inactive)
    educator.status = 0;
    await educator.save();

    res.json({ message: 'Educator deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting educator', error: error.message });
  }
};

exports.updateEducator = async (req, res) => {
  try {
    const { name, email, roleId, phoneNumber, address, zipcode, state, status, category, schoolName } = req.body;
    const educator = await User.findById(req.params.id);

    if (!educator) {
      return res.status(404).json({ msg: 'Educator not found' });
    }

    if (educator.university.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized' });
    }

    // Only update fields that are provided
    if (name) educator.name = name;
    if (email) educator.email = email;
    if (phoneNumber) educator.phoneNumber = phoneNumber;
    if (status !== undefined) educator.status = Number(status);

    // Initialize profile if it doesn't exist
    if (!educator.profile) {
      educator.profile = {};
    }

    // Ensure socialLinks exists to prevent validation errors
    if (!educator.profile.socialLinks) {
      educator.profile.socialLinks = {};
    }

    // Update profile fields only if they are provided
    if (address) educator.profile.address = address;
    if (zipcode) educator.profile.zipcode = zipcode;
    if (state) educator.profile.state = state;
    if (category) educator.profile.category = category; // Add category field
    if (schoolName) educator.profile.schoolName = schoolName; // Add school/university name field

    // Update avatar if profile image was uploaded
    if (req.file) {
      console.log('University controller - Profile image uploaded:', req.file);
      educator.profile.avatar = `/uploads/profiles/${req.file.filename}`;
      console.log('University controller - Updated avatar path:', educator.profile.avatar);
    } else {
      console.log('University controller - No profile image uploaded in the request');
    }

    if (roleId) {
      console.log('University controller - Updating educator roleId:', roleId);
      educator.roleRef = roleId;
      console.log('University controller - Updated educator roleRef:', educator.roleRef);

      // Fetch the role to get its name
      const Role = require('../models/Role');
      const role = await Role.findById(roleId);
      if (role) {
        // Update the role field based on the role name (convert to lowercase)
        educator.role = role.name.toLowerCase();
        console.log('University controller - Updated role to:', educator.role);
      }
    }

    await educator.save();
    res.json({
      educator,
      msg: 'Educator updated successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating educator', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber, address, zipcode, state } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.phoneNumber = phoneNumber || user.phoneNumber;

    // Update profile fields
    user.profile = {
      ...user.profile,
      address: address || user.profile?.address,
      zipcode: zipcode || user.profile?.zipcode,
      state: state || user.profile?.state
    };

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  // Password functionality has been removed as the system uses OTP-based login
  return res.status(400).json({ msg: "Password functionality is not available. The system uses OTP-based authentication." });
};