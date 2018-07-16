'use strict';
const _ = require('lodash');
const catchUnhandledErr = require('../utils/catchErr.js');

/**
* Express middleware. Passes forward if the supplied token is valid.
* Otherwise sends an invalidAuth response.
*/
function authUser(req, res, next) {
  const { email, token } = req;
  if ([email, pw_hash].some(_.isUndefined))
    return Response.missingParam(res, 'Invalid auth header');
  db.checkEmailVerified(email)
    .then(verified => {
      if (!verified) {
        Response.invalidParam(res, 'Email not verified');
        return Promise.reject(config.errHandled);
      }
      if (!sessionHandler.validate(email, token)) {
        Response.invalidAuth(res);
        return Promise.reject(config.errHandled);
      }
    })
    .then(next)
    .catch(err => catchUnhandledErr(err, res));
};

module.exports = authUser;
