const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const util = require('util');

// Convert fs.writeFile to Promise-based
const writeFileAsync = util.promisify(fs.writeFile);

// Ensure certificates directory exists
const certificatesDir = path.join(__dirname, '../uploads/certificates');
if (!fs.existsSync(certificatesDir)) {
  fs.mkdirSync(certificatesDir, { recursive: true });
}

/**
 * Generate a certificate PDF
 * @param {Object} data Certificate data
 * @param {string} data.studentName Student's full name
 * @param {string} data.courseName Course title
 * @param {string} data.instructorName Instructor's name
 * @param {string} data.completionDate Completion date
 * @param {string} data.certificateId Unique certificate ID
 * @returns {Promise<Buffer>} PDF buffer
 */
exports.generateCertificatePDF = async (data) => {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // Add a blank page to the document
  const page = pdfDoc.addPage([842, 595]); // A4 landscape

  // Get the standard fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Set page dimensions
  const { width, height } = page.getSize();

  // Draw certificate border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: rgb(0.2, 0.4, 0.6),
    borderWidth: 3,
  });

  // Draw decorative inner border
  page.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  });

  // Add certificate title
  page.drawText('CERTIFICATE OF COMPLETION', {
    x: width / 2 - 180,
    y: height - 100,
    size: 28,
    font: helveticaBoldFont,
    color: rgb(0.2, 0.4, 0.6),
  });

  // Add certificate text
  page.drawText('This is to certify that', {
    x: width / 2 - 80,
    y: height - 150,
    size: 14,
    font: helveticaFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Add student name
  page.drawText(data.studentName, {
    x: width / 2 - (data.studentName.length * 7),
    y: height - 190,
    size: 24,
    font: helveticaBoldFont,
    color: rgb(0.2, 0.4, 0.6),
  });

  // Add completion text
  page.drawText('has successfully completed the course', {
    x: width / 2 - 120,
    y: height - 230,
    size: 14,
    font: helveticaFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Add course name
  page.drawText(data.courseName, {
    x: width / 2 - (data.courseName.length * 6),
    y: height - 270,
    size: 20,
    font: helveticaBoldFont,
    color: rgb(0.2, 0.4, 0.6),
  });

  // Add instructor text
  page.drawText('Instructor:', {
    x: width / 2 - 150,
    y: height - 320,
    size: 14,
    font: helveticaFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Add instructor name
  page.drawText(data.instructorName, {
    x: width / 2 - 80,
    y: height - 320,
    size: 14,
    font: helveticaBoldFont,
    color: rgb(0.2, 0.4, 0.6),
  });

  // Add completion date text
  page.drawText('Completion Date:', {
    x: width / 2 + 20,
    y: height - 320,
    size: 14,
    font: helveticaFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Add completion date
  page.drawText(data.completionDate, {
    x: width / 2 + 130,
    y: height - 320,
    size: 14,
    font: helveticaBoldFont,
    color: rgb(0.2, 0.4, 0.6),
  });

  // Add certificate ID
  page.drawText(`Certificate ID: ${data.certificateId}`, {
    x: width / 2 - 100,
    y: 60,
    size: 10,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Generate QR code for verification
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-certificate/${data.certificateId}`;
  const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
  const qrCodeImage = await pdfDoc.embedPng(qrCodeDataUrl);

  // Draw QR code
  page.drawImage(qrCodeImage, {
    x: 50,
    y: 50,
    width: 80,
    height: 80,
  });

  // Add verification text
  page.drawText('Scan to verify', {
    x: 60,
    y: 40,
    size: 8,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Add signature line
  page.drawLine({
    start: { x: width - 200, y: 100 },
    end: { x: width - 50, y: 100 },
    thickness: 1,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Add signature text
  page.drawText('Authorized Signature', {
    x: width - 170,
    y: 80,
    size: 10,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Serialize the PDFDocument to bytes
  const pdfBytes = await pdfDoc.save();

  return Buffer.from(pdfBytes);
};
