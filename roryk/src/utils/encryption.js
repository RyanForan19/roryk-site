import CryptoJS from 'crypto-js';

// Secret key for encryption (in production, this should be environment variable)
const SECRET_KEY = 'your-secret-key-2025';

/**
 * Hash a password using SHA-256
 * @param {string} password - Plain text password
 * @returns {string} - Hashed password
 */
export const hashPassword = (password) => {
  return CryptoJS.SHA256(password + SECRET_KEY).toString();
};

/**
 * Verify a password against its hash
 * @param {string} password - Plain text password
 * @param {string} hash - Stored password hash
 * @returns {boolean} - True if password matches
 */
export const verifyPassword = (password, hash) => {
  return hashPassword(password) === hash;
};

/**
 * Encrypt data for secure storage
 * @param {any} data - Data to encrypt
 * @returns {string} - Encrypted data string
 */
export const encryptData = (data) => {
  const jsonString = JSON.stringify(data);
  return CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
};

/**
 * Decrypt data from secure storage
 * @param {string} encryptedData - Encrypted data string
 * @returns {any} - Decrypted data
 */
export const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

/**
 * Generate a unique ID
 * @returns {string} - Unique identifier
 */
export const generateId = () => {
  return CryptoJS.lib.WordArray.random(16).toString();
};