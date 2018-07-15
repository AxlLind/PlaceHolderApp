'use strict';
const _ = require('lodash');

/**
* Express middleware. Passes forward if the supplied token is valid.
* Otherwise sends an invalidAuth response.
*/
const validateUser = (req, res, next) => {
  const missingProp = _.find(['email', 'token'], prop => !_.has(req.body, prop));
  if (missingProp)
    return Response.missingParam(res, missingProp);
  const { email, token } = req.body;
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

module.exports = validateUser;
