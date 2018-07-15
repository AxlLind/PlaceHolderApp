'use strict';
const _              = require('lodash');
const express        = require('express');
const bcrypt         = require('bcrypt');

const db             = require('./database.js');
const Response       = require('./response.js');
const config         = require('./config.js');

// handlers
const sessionHandler = require('./handlers/sessionhandler.js');
const emailHandler   = require('./handlers/emailhandler.js');

// middlewares
const authUser       = require('./middlewares/authUser.js')
const requireProps   = require('./middlewares/requireProps.js')

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

app.get('/version', (_, res) => Response.success(res, 'Version passed', { version: '0.0.1' }));

app.get('/verify', (req, res) => {
  const missingProp = _.find(['email', 'pw_hash'], prop => !_.has(req.query, prop));
  if (missingProp)
    return Response.missingParam(res, missingProp);
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
});

app.post('/api/registerUser', requireProps('email', 'pw_hash'), (req, res) => {
  const { email, pw_hash } = req.body;
  if (!/.+@.+\..+/.test(email)) // ensure it is 'sort of' an email
    return Response.invalidParam(res, 'Does not match an email');
  let hash;
  db.checkEmail(email)
    .then(exists => {
      if (exists) {
        Response.invalidParam(res, 'Email already taken');
        return Promise.reject(config.errHandled);
      }
    })
    .then(() => bcrypt.hash(pw_hash, config.saltRounds))
    .then(bcrypthash => hash = bcrypthash)
    .then(() => db.createUser(email, hash))
    .then(() => emailHandler.sendEmailVerification(email, hash))
    .then(() => Response.success(res, 'User created'))
    .catch(err => catchUnhandledErr(err, res));
});

app.post('/api/requestSessionToken', requireProps('email', 'pw_hash'), (req, res) => {
  const { email, pw_hash } = req.body;
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
});

app.post('/api/testSessionToken', authUser, (_, res) =>
  Response.success(res, 'Token still valid')
);

app.post('/api/getLists', authUser, (req, res) => {
  db.getUsersLists(req.body.email)
    .then(lists => Response.success(res, 'Serving lists', { lists }))
    .catch(err => catchUnhandledErr(err, res));
});

app.post('/api/getSharedLists', authUser, (req, res) => {
  db.getUsersSharedLists(req.body.email)
    .then(lists => Response.success(res, 'Serving shared lists', { lists }))
    .catch(err => catchUnhandledErr(err, res));
});

app.post('/api/createList', authUser, requireProps('list_name'), (req, res) => {
  const { email, list_name } = req.body;
  db.createList(list_name, email)
    .then(() => Response.success(res, 'List created'))
    .catch(err => catchUnhandledErr(err, res));
});

app.post('/api/addItemToList', authUser, requireProps('list_id', 'item'), (req, res) => {
  const { email, list_id, item } = req.body;
  db.checkUserOwnsList(email, list_id)
    .then(ownsList => {
      if (!ownsList) {
        Response.invalidParam(res, 'You do not own that list');
        return Promise.reject(config.errHandled);
      }
    })
    .then(() => db.checkItemInList(list_id, item))
    .then(inList => {
      if (inList) {
        Response.invalidParam(res, 'Item already in list');
        return Promise.reject(config.errHandled);
      }
    })
    .then(() => db.addItemToList(list_id, item))
    .then(() => Response.success(res, 'Item added'))
    .catch(err => catchUnhandledErr(err, res));
});

app.post('/api/getListItems', authUser, requireProps('list_id'), (req, res) => {
  const { email, list_id } = req.body;
  db.checkUserOwnsList(email, list_id)
    .then(ownsList => {
      if (!ownsList) {
        Response.invalidParam(res, 'You do not own that list');
        return Promise.reject(config.errHandled);
      }
    })
    .then(() => db.getListItems(list_id))
    .then(items => Response.success(res, 'Items served', { items }))
    .catch(err => catchUnhandledErr(err, res));
});

app.post('/api/deleteList', authUser, requireProps('list_id'), (req, res) => {
  const { email, list_id } = req.body;
  db.checkUserOwnsList(email, list_id)
    .then(ownsList => {
      if (!ownsList) {
        Response.invalidParam(res, 'You do not own that list');
        return Promise.reject(config.errHandled);
      }
    })
    .then(() => db.deleteList(list_id))
    .then(() => Response.success(res, 'List deleted'))
    .catch(err => catchUnhandledErr(err, res));
});

app.post('/api/deleteItemFromList', authUser, requireProps('list_id', 'item'), (req, res) => {
  const { email, list_id, item } = req.body;
  db.checkUserOwnsList(email, list_id)
    .then(ownsList => {
      if (!ownsList) {
        Response.invalidParam(res, 'You do not own that list');
        return Promise.reject(config.errHandled);
      }
    })
    .then(() => db.deleteItemFromList(list_id, item))
    .then(() => Response.success(res, 'Item deleted'))
    .catch(err => catchUnhandledErr(err, res));
});

// Redirects any unspecified paths here, simply return an error
app.all('*', (_, res) => Response.invalidEndpoint(res));

app.listen(config.port, '0.0.0.0', () => {
  console.log(`Server up! Listening on port ${config.port}`);
});
