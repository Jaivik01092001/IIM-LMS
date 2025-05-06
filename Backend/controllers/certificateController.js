const Certificate = require("../models/Certificate");
const Course = require("../models/Course");
const User = require("../models/User");
const { generateCertificatePDF } = require("../services/certificateService");
const { v4: uuidv4 } = require("uuid");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const fs = require("fs");
const path = require("path");
const util = require("util");

// Convert fs.writeFile to Promise-based
const writeFileAsync = util.promisify(fs.writeFile);

// Internal method for certificate generation (called from other controllers)
exports.generateCertificateInternal = async (userId, courseId) => {
  try {
    // Check if course exists
    const course = await Course.findById(courseId)
      .populate("creator", "name")
      .populate("modules");
    if (!course) {
      throw new Error("Course not found");
    }

    // Check if user is enrolled and has completed the course
    const enrollment = course.enrolledUsers.find(
      (enrollment) =>
        enrollment.user.toString() === userId &&
        enrollment.status === "completed"
    );

    if (!enrollment) {
      throw new Error("Course not completed");
    }

    // Get all compulsory modules for this course
    const Module = require("../models/Module");
    const compulsoryModules = await Module.find({
      course: courseId,
      isCompulsory: true,
    });

    // Get user's module progress
    const UserModuleProgress = require("../models/UserModuleProgress");
    const progress = await UserModuleProgress.findOne({
      user: userId,
      course: courseId,
    });

    // Check if all compulsory modules are completed
    if (progress && compulsoryModules.length > 0) {
      const completedCompulsoryModules = compulsoryModules.filter((module) => {
        const moduleProgress = progress.moduleProgress.find(
          (mp) => mp.module.toString() === module._id.toString()
        );
        return moduleProgress && moduleProgress.isCompleted;
      });

      if (completedCompulsoryModules.length < compulsoryModules.length) {
        throw new Error(
          "All compulsory modules must be completed before generating a certificate"
        );
      }
    }

    // Check if certificate already exists
    let certificate = await Certificate.findOne({
      user: userId,
      course: courseId,
    });

    if (certificate) {
      return certificate;
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Generate a unique certificate ID
    const certificateId = uuidv4();

    // Generate certificate PDF
    const certificateBuffer = await generateCertificatePDF({
      studentName: user.name,
      courseName: course.title,
      instructorName: course.creator.name,
      completionDate: new Date(
        enrollment.completedAt || Date.now()
      ).toLocaleDateString(),
      certificateId,
    });

    // Save certificate to local file system
    const certificateFileName = `${certificateId}.pdf`;
    const certificatePath = path.join(
      __dirname,
      "../uploads/certificates",
      certificateFileName
    );
    await writeFileAsync(certificatePath, certificateBuffer);

    // Create the certificate URL based on the server's URL
    const baseUrl = process.env.BACKEND_URL || "http://localhost:5000";
    const certificateUrl = `${baseUrl}/api/certificate/view/${certificateId}`;
    const verificationUrl = `${baseUrl}/api/certificate/verify/${certificateId}`;

    // Create certificate record
    certificate = await Certificate.create({
      user: userId,
      course: courseId,
      certificateId,
      certificateUrl,
      verificationUrl,
      metadata: {
        studentName: user.name,
        courseName: course.title,
        instructorName: course.creator.name,
        completionDate: new Date(
          enrollment.completedAt || Date.now()
        ).toLocaleDateString(),
      },
    });

    return certificate;
  } catch (error) {
    console.error("Error generating certificate:", error);
    throw error;
  }
};

// Generate a certificate for a completed course (API endpoint)
exports.generateCertificate = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const userId = req.user.id;

  // Check if course exists
  const course = await Course.findById(courseId)
    .populate("creator", "name")
    .populate("modules");
  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  // Check if user is enrolled and has completed the course
  const enrollment = course.enrolledUsers.find(
    (enrollment) =>
      enrollment.user.toString() === userId && enrollment.status === "completed"
  );

  if (!enrollment) {
    return next(new AppError("You have not completed this course yet", 400));
  }

  // Get all compulsory modules for this course
  const Module = require("../models/Module");
  const compulsoryModules = await Module.find({
    course: courseId,
    isCompulsory: true,
  });

  // Get user's module progress
  const UserModuleProgress = require("../models/UserModuleProgress");
  const progress = await UserModuleProgress.findOne({
    user: userId,
    course: courseId,
  });

  // Check if all compulsory modules are completed
  if (progress && compulsoryModules.length > 0) {
    const completedCompulsoryModules = compulsoryModules.filter((module) => {
      const moduleProgress = progress.moduleProgress.find(
        (mp) => mp.module.toString() === module._id.toString()
      );
      return moduleProgress && moduleProgress.isCompleted;
    });

    if (completedCompulsoryModules.length < compulsoryModules.length) {
      return next(
        new AppError(
          "You must complete all compulsory modules before generating a certificate",
          400
        )
      );
    }
  }

  // Check if certificate already exists
  let certificate = await Certificate.findOne({
    user: userId,
    course: courseId,
  });

  if (certificate) {
    return res.status(200).json({
      status: "success",
      message: "Certificate already exists",
      data: certificate,
    });
  }

  // Get user details
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Generate a unique certificate ID
  const certificateId = uuidv4();

  // Generate certificate PDF
  const certificateBuffer = await generateCertificatePDF({
    studentName: user.name,
    courseName: course.title,
    instructorName: course.creator.name,
    completionDate: new Date(
      enrollment.completedAt || Date.now()
    ).toLocaleDateString(),
    certificateId,
  });

  // Save certificate to local file system
  const certificateFileName = `${certificateId}.pdf`;
  const certificatePath = path.join(
    __dirname,
    "../uploads/certificates",
    certificateFileName
  );
  await writeFileAsync(certificatePath, certificateBuffer);

  // Create the certificate URL based on the server's URL
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const certificateUrl = `${baseUrl}/api/certificate/view/${certificateId}`;
  const verificationUrl = `${baseUrl}/api/certificate/verify/${certificateId}`;

  // Create certificate record
  certificate = await Certificate.create({
    user: userId,
    course: courseId,
    certificateId,
    certificateUrl,
    verificationUrl,
    metadata: {
      studentName: user.name,
      courseName: course.title,
      instructorName: course.creator.name,
      completionDate: new Date(
        enrollment.completedAt || Date.now()
      ).toLocaleDateString(),
    },
  });

  res.status(201).json({
    status: "success",
    data: certificate,
  });
});

// Get all certificates for the current user
exports.getMyCertificates = catchAsync(async (req, res, next) => {
  const certificates = await Certificate.find({ user: req.user.id })
    .populate("course", "title")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: certificates.length,
    data: certificates,
  });
});

// Get a specific certificate by ID
exports.getCertificate = catchAsync(async (req, res, next) => {
  const certificate = await Certificate.findById(req.params.id)
    .populate("course", "title")
    .populate("user", "name");

  if (!certificate) {
    return next(new AppError("Certificate not found", 404));
  }

  // Check if the certificate belongs to the current user or if the user is an admin
  if (
    certificate.user._id.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new AppError("You are not authorized to view this certificate", 403)
    );
  }

  res.status(200).json({
    status: "success",
    data: certificate,
  });
});

// Verify a certificate by its certificateId
exports.verifyCertificate = catchAsync(async (req, res, next) => {
  const { certificateId } = req.params;

  const certificate = await Certificate.findOne({ certificateId })
    .populate("course", "title")
    .populate("user", "name");

  if (!certificate) {
    return next(new AppError("Invalid certificate ID", 404));
  }

  // For API requests, return JSON
  if (req.headers.accept && req.headers.accept.includes("application/json")) {
    return res.status(200).json({
      status: "success",
      data: {
        isValid: true,
        certificate: {
          id: certificate.certificateId,
          studentName: certificate.metadata.studentName,
          courseName: certificate.metadata.courseName,
          instructorName: certificate.metadata.instructorName,
          issueDate: certificate.issueDate,
          completionDate: certificate.metadata.completionDate,
        },
      },
    });
  }

  // For browser requests, return HTML
  const certificateData = {
    id: certificate.certificateId,
    studentName: certificate.metadata.studentName,
    courseName: certificate.metadata.courseName,
    instructorName: certificate.metadata.instructorName,
    issueDate: new Date(certificate.issueDate).toLocaleDateString(),
    completionDate: certificate.metadata.completionDate,
    viewUrl: `${req.protocol}://${req.get(
      "host"
    )}/api/certificate/view/${certificateId}`,
  };

  // Generate HTML for the verification page
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate Verification</title>
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon">
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  </head>
  <body class="bg-gray-100 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-2xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
      <div class="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
        <h1 class="text-xl font-bold text-white">Certificate Verification</h1>
      </div>

      <div class="p-6">
        <div class="flex items-center justify-center mb-6">
          <div class="bg-green-100 rounded-full p-2">
            <svg class="h-12 w-12 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <h2 class="text-2xl font-bold text-center text-gray-900 mb-6">Certificate Verified</h2>

        <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div class="space-y-4">
            <div class="flex justify-between border-b border-gray-200 pb-2">
              <span class="text-gray-600">Certificate ID:</span>
              <span class="font-medium text-gray-900">${certificateData.id}</span>
            </div>
            <div class="flex justify-between border-b border-gray-200 pb-2">
              <span class="text-gray-600">Student Name:</span>
              <span class="font-medium text-gray-900">${certificateData.studentName}</span>
            </div>
            <div class="flex justify-between border-b border-gray-200 pb-2">
              <span class="text-gray-600">Course:</span>
              <span class="font-medium text-gray-900">${certificateData.courseName}</span>
            </div>
            <div class="flex justify-between border-b border-gray-200 pb-2">
              <span class="text-gray-600">Instructor:</span>
              <span class="font-medium text-gray-900">${certificateData.instructorName}</span>
            </div>
            <div class="flex justify-between border-b border-gray-200 pb-2">
              <span class="text-gray-600">Issue Date:</span>
              <span class="font-medium text-gray-900">${certificateData.issueDate}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Completion Date:</span>
              <span class="font-medium text-gray-900">${certificateData.completionDate}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-center">
          <a href="${certificateData.viewUrl}" target="_blank" class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Certificate
          </a>
        </div>
      </div>

      <div class="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <p class="text-sm text-gray-500 text-center">
          This certificate has been verified as authentic and was issued by IIM-LMS.
        </p>
      </div>
    </div>
  </body>
  </html>
  `;

  // Send HTML response
  res.setHeader("Content-Type", "text/html");
  res.status(200).send(html);
});

// View a certificate in a new tab
exports.viewCertificate = catchAsync(async (req, res, next) => {
  const { certificateId } = req.params;
  const certificatePath = path.join(
    __dirname,
    "../uploads/certificates",
    `${certificateId}.pdf`
  );

  // Check if the certificate file exists
  if (!fs.existsSync(certificatePath)) {
    return next(new AppError("Certificate file not found", 404));
  }

  // Set headers to display PDF in browser
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="certificate-${certificateId}.pdf"`
  );

  // Stream the file to the response
  const fileStream = fs.createReadStream(certificatePath);
  fileStream.pipe(res);
});

// Download a certificate
exports.downloadCertificate = catchAsync(async (req, res, next) => {
  const certificate = await Certificate.findById(req.params.id);

  if (!certificate) {
    return next(new AppError("Certificate not found", 404));
  }

  // Check if the certificate belongs to the current user or if the user is an admin
  if (
    certificate.user.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return next(
      new AppError("You are not authorized to download this certificate", 403)
    );
  }

  const certificatePath = path.join(
    __dirname,
    "../uploads/certificates",
    `${certificate.certificateId}.pdf`
  );

  // Check if the certificate file exists
  if (!fs.existsSync(certificatePath)) {
    return next(new AppError("Certificate file not found", 404));
  }

  // Set headers for file download
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="certificate-${certificate.certificateId}.pdf"`
  );

  // Stream the file to the response
  const fileStream = fs.createReadStream(certificatePath);
  fileStream.pipe(res);
});
