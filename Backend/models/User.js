const mongoose = require("mongoose");
const {
  formatPhoneNumber,
  isValidIndianPhoneNumber,
} = require("../utils/phoneUtils");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true, unique: true },
    role: { type: String, required: true }, // Role name (no enum restriction to allow dynamic roles)
    // Reference to the Role model for fine-grained permissions
    roleRef: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
    name: { type: String, required: true },
    // For educators - reference to their university (which is also a User with role='university')
    university: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // For universities - list of educators associated with this university
    educators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // For universities - contact person name (previously in University model)
    contactPerson: { type: String },
    refreshToken: { type: String }, // Added for JWT refresh token
    otp: { type: String },
    otpExpires: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    profile: {
      // Added for settings
      designation: { type: String }, // Staff designation
      department: { type: String }, // Staff department
      address: { type: String },
      zipcode: { type: String },
      state: { type: String },
      bio: { type: String },
      category: { type: String }, // Added category field
      schoolName: { type: String }, // Added school/university name field
      avatar: { type: String }, // URL to profile image
      socialLinks: {
        website: { type: String },
        linkedin: { type: String },
        twitter: { type: String },
        facebook: { type: String },
      },
    },
    status: { type: Number, default: 1 }, // 1: active, 0: inactive (soft delete)
  },
  { timestamps: true }
);

// Pre-save hook to format phone number
userSchema.pre("save", function (next) {
  // Only format the phone number if it's modified or new
  if (this.isModified("phoneNumber") || this.isNew) {
    this.phoneNumber = formatPhoneNumber(this.phoneNumber);
  }
  next();
});

// Custom validation for phone number
userSchema.path("phoneNumber").validate(function (value) {
  return isValidIndianPhoneNumber(value);
}, "Please enter a valid 10-digit Indian phone number");

module.exports = mongoose.model("User", userSchema);
