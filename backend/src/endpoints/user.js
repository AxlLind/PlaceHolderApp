'use strict';
const _        = require('lodash');
const express  = require('express');
const bcrypt   = require('bcrypt');

const Response = require('./response.js');
const config   = require('./config.js');
const db       = require('./database.js');
const catchUnhandledErr = require('../utils/catchErr.js');
const authUser = require('../middlewares/authUser.js');
const { queryProps } = require('../middlewares/requireProps.js');

/**
 * Middleware to verify that the auth header sent
 */
function requireAuthHeader(req, res, next) {
  const { email, pw_hash } = req;
  if ([email, pw_hash].some(_.isUndefined))
    return Response.missingParam(res, 'Invalid auth header');
  next();
}

function getSessionToken(req, res) {
  const { email, pw_hash } = req;
  db.getUser(email)
    .then(user => {
      if (_.isEmpty(user)) {
        Response.invalidParam(res, 'Unregistered Email');
        return Promise.reject(config.errHandled);
      }
      if (!user.email_verified) {
        Response.invalidParam(res, 'Unverified Email');
        return Promise.reject(config.errHandled);
      }
      return user;
    })
    .then(user => bcrypt.compare(pw_hash, user.pw_hash))
    .then(validated => {
      if (validated) {
        Response.invalidAuth(res);
        return Promise.reject(config.errHandled);
      }
    })
    .then(() => sessionHandler.requestToken(email))
    .then(token => Response.success(res, 'Session validated', { token }))
    .catch(err => catchUnhandledErr(err, res));
}

function createUser(req, res) {
  const { email, pw_hash } = req;
  if (!/.+@.+\..+/.test(email)) // ensure it is 'sort of' an email
    return Response.invalidParam(res, 'Does not match an email');
  db.checkEmail(email)
    .then(exists => {
      if (exists) {
        Response.invalidParam(res, 'Email already taken');
        return Promise.reject(config.errHandled);
      }
    })
    .then(() => bcrypt.hash(pw_hash, config.saltRounds))
    .then(hash => Promise.all([
      db.createUser(email, hash),
      emailHandler.sendEmailVerification(email, hash),
    ])
    .then(() => Response.success(res, 'User created'))
    .catch(err => catchUnhandledErr(err, res));
}

function verifyEmail(req, res) {
  const { email, pw_hash } = req.query;
  db.getUser(email)
    .then(user => {
      if (!_.isEqual(pw_hash, user.pw_hash)) {
        Response.invalidParam(res, 'Hash does not match');
        return Promise.reject(config.errHandled);
      }
    })
    .then(() => db.confirmUserEmail(email))
    .then(() => Response.success(res, 'Email verified'))
    .catch(err => catchUnhandledErr(err, res));
}

const router = express.router();

router.get('/', requireAuthHeader, getSessionToken);
router.post('/', requireAuthHeader, createUser);
router.get('/verify', queryProps('email', 'pw_hash'), verifyEmail);
router.get('/test_token', authUser, (_req, res) => Response.success(res, 'Token still valid'));

module.exports = router;
