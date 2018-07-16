const _ = require('lodash');
const config = require('../config.js');

/**
* Handles unhandled errors in a response.
* This would be an internal server error (e.g DB is down)
* @param {object} err from Promise.catch
* @param {object} res express response object
*/
const catchUnhandledErr = (err, res) => {
  if (_.isEqual(err, config.errHandled))
    return;
  console.error(`Internal server error!\n${err}`);
  Response.serverError(res);
};

module.exports = catchUnhandledErr;
