'use strict';
const _ = require('lodash');
const Response = require('../response.js');

const verifyProperties = (obj, properties, req, res, next) => {
  const missingProp = _.find(properties, prop => !_.has(req[obj], prop));
  if (missingProp)
    return Response.missingParam(res, missingProp);
  next();
};

/**
* Returns a middleware function that verifies
* that args are properties of req.body
* @param {string} args properties to verify
*/
const bodyProps = (...args) => _.curry(verifyProperties)('body', args);

/**
* Returns a middleware function that verifies
* that args are properties of req.query
* @param {string} args properties to verify
*/
const queryProps = (...args) => _.curry(verifyProperties)('query', args);

module.exports.bodyProps = bodyProps;
module.exports.queryProps = queryProps;
