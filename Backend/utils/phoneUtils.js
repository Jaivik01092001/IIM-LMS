/**
 * Utility functions for phone number handling
 */

/**
 * Format a phone number to ensure it has the +91 prefix
 * @param {string} phoneNumber - The phone number to format
 * @returns {string} - The formatted phone number with +91 prefix
 */
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return phoneNumber;
  
  // Remove any non-digit characters except the + sign at the beginning
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // If it's already a valid phone number with country code, return it
  if (cleaned.startsWith('+91') && cleaned.length === 13) {
    return cleaned;
  }
  
  // If it's a 10-digit number, add the +91 prefix
  if (cleaned.length === 10 && /^\d+$/.test(cleaned)) {
    return `+91${cleaned}`;
  }
  
  // If it's already a valid phone number with just the country code without +, add the +
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+${cleaned}`;
  }
  
  // Return the original cleaned number if it doesn't match any of the above patterns
  return cleaned;
};

/**
 * Validate if a phone number is a valid Indian phone number
 * @param {string} phoneNumber - The phone number to validate
 * @returns {boolean} - Whether the phone number is valid
 */
const isValidIndianPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return false;
  
  // Remove any non-digit characters except the + sign at the beginning
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Check if it's a valid Indian phone number format
  return (
    (cleaned.startsWith('+91') && cleaned.length === 13) || // +91XXXXXXXXXX
    (cleaned.length === 10 && /^\d+$/.test(cleaned)) || // XXXXXXXXXX
    (cleaned.startsWith('91') && cleaned.length === 12) // 91XXXXXXXXXX
  );
};

module.exports = {
  formatPhoneNumber,
  isValidIndianPhoneNumber
};
