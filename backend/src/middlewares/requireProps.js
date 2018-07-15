'use strict';
const _ = require('lodash');
const Response = require('../response.js');

const verifyProperties = (properties, req, res, next) => {
  const missingProp = _.find(properties, prop => !_.has(req.body, prop));
  if (missingProp)
    return Response.missingParam(res, missingProp);
  next();
};

/**
* Returns a middleware function that verifies
* that the arguments are properties of req.body
* @param {string} args properties to verify
*/
const requireProps = (...args) => _.curry(verifyProperties)(args);

module.exports = requireProps;
