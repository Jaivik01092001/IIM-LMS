const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { formatPhoneNumber } = require('../utils/phoneUtils');

exports.createEducator = async (req, res, next) => {
  try {
    const {
      email,
      password,
      name,
      roleId,
      phoneNumber,
      address,
      zipcode,
      state
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const educator = new User({
      email,
      password: hashedPassword,
      role: 'educator',
      name,
      phoneNumber: phoneNumber || '+919876543210', // Default phone number if not provided
      university: req.user.id,
      roleRef: roleId || undefined, // Assign role if provided
      profile: {
        address,
        zipcode,
        state
      }
    });

    await educator.save();
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
    });
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
    });

    if (!educator) {
      return res.status(404).json({ message: 'Educator not found' });
    }

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
    const { name, email, roleId, phoneNumber, address, zipcode, state, status } = req.body;
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

    if (roleId) {
      educator.roleRef = roleId;
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
  const { currentPassword, newPassword, confirmPassword } = req.body;
  console.debug(`Updating password for userId: ${req.user.id}`);

  // Validate passwords match
  if (newPassword !== confirmPassword) {
    console.warn(`Password confirmation mismatch for userId: ${req.user.id}`);
    return res.status(400).json({ msg: "New passwords do not match" });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    console.error(`User not found for userId: ${req.user.id}`);
    return res.status(404).json({ msg: "User not found" });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    console.warn(`Invalid current password attempt for userId: ${req.user.id}`);
    return res.status(400).json({ msg: "Invalid current password" });
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
  console.debug(`Password updated successfully for userId: ${req.user.id}`);
  res.json({ msg: "Password updated" });
};