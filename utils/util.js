/**
 * Check if a string is valid (not null, undefined, empty, or whitespace)
 * @param {string|ObjectId} str - The string or ObjectId to validate
 * @returns {boolean} - True if string is valid, false otherwise
 */
const isValid = (str) => {
    if (str === null || str === undefined) {
        return false;
    }
    
    // Handle ObjectId (MongoDB ObjectId has toString method)
    if (typeof str === 'object' && str.toString) {
        return str.toString().trim() !== '';
    }
    
    // Handle string
    if (typeof str === 'string') {
        return str !== '' && str.trim() !== '';
    }
    
    // Handle other types (convert to string)
    return String(str).trim() !== '';
};

/**
 * Check if a number is valid (not null, undefined, NaN, or negative)
 * @param {number} num - The number to validate
 * @returns {boolean} - True if number is valid, false otherwise
 */
const isValidNumber = (num) => {
    return num !== null && num !== undefined && !isNaN(num) && num >= 0;
};

module.exports = {
    isValid,
    isValidNumber
};
