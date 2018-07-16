'use strict';
const _ = require('lodash');
const catchUnhandledErr = require('../utils/catchErr.js');

/**
* Express middleware. Parses the auth header and adds to the req object
* the properties email, pw_hash, and token.
*/
function parseAuthHeader(req, _res, next) {
  if (!req.headers.authorization)
    return next();
  const s = _.split(req.headers.authorization, ' ', 2);
  if (s.length == 2) {
    req.email   = s[0];
    req.pw_hash = s[1];
    req.token   = s[1];
  }
  next();
};

module.exports = parseAuthHeader;
