import crypto from 'crypto';
import fs from 'fs';

/**
 * Computes SHA-256 hash of a file at the given filepath using a stream
 * @param {string} filePath
 * @returns {Promise<string>} Hex-encoded SHA-256 hash
 */
export const computeFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', (err) => reject(err));
  });
};

/**
 * Computes SHA-256 hash from a buffer
 * @param {Buffer} buffer
 * @returns {string} Hex-encoded SHA-256 hash
 */
export const computeBufferHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};
