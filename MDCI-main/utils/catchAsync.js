// utils/catchAsync.js

/**
 * Wraps an async Express route handler and catches any errors,
 * passing them to the global error handling middleware using `next()`.
 *
 * @param {Function} fn - The async route handler
 * @returns {Function} A wrapped route handler
 */
module.exports = function catchAsync(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
