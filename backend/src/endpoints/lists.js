'use strict';
const _        = require('lodash');
const express  = require('express');
const Response = require('./response.js');
const config   = require('./config.js');
const db       = require('./database.js');
const catchUnhandledErr = require('../utils/catchErr.js');
const { bodyProps } = require('../middlewares/requireProps.js');

/**
 * Middleware to verify that the user owns the accessed list
 */
function ownsList(req, res, next) {
  const { email } = req, { list_id } = req.body;
  db.checkUserOwnsList(email, list_id)
    .then(ownsList => {
      if (!ownsList) {
        Response.invalidParam(res, 'You do not own that list');
        return Promise.reject(config.errHandled);
      }
    })
    .then(next)
    .catch(err => catchUnhandledErr(err, res));
}

/**
 * Middleware to verify that the user either owns or has been shared the list
 */
function accessableList(req, res, next) {
  // TODO: check if list has been shared to the user
  const { email } = req, { list_id } = req.params;
  db.checkUserOwnsList(email, list_id)
    .then(ownsList => {
      if (!ownsList) {
        Response.invalidParam(res, 'You do not own that list');
        return Promise.reject(config.errHandled);
      }
    })
    .then(next)
    .catch(err => catchUnhandledErr(err, res));
}

function getLists(req, res) {
  const { email } = req;
  db.getUsersLists(email)
    .then(lists => Response.success(res, 'Serving lists', { lists }))
    .catch(err => catchUnhandledErr(err, res));
}

function createList(req, res) {
  const { email } = req, { list_name } = req.body;
  db.createList(list_name, email)
    .then(() => Response.success(res, 'List created'))
    .catch(err => catchUnhandledErr(err, res));
}

function deleteList(req, res) {
  const { email } = req, { list_id } = req.body;
  db.deleteList(list_id)
    .then(() => Response.success(res, 'List deleted'))
    .catch(err => catchUnhandledErr(err, res));
}

function getListItems(req, res) {
  const { email } = req, { list_id } = req.body;
  db.getListItems(list_id)
    .then(items => Response.success(res, 'Items served', { items }))
    .catch(err => catchUnhandledErr(err, res));
}

function createListItem(req, res) {
  const { email } = req, { item } = req.body, { list_id } = req.params;
  db.checkItemInList(list_id, item)
    .then(inList => {
      if (inList) {
        Response.invalidParam(res, 'Item already in list');
        return Promise.reject(config.errHandled);
      }
    })
    .then(() => db.addItemToList(list_id, item))
    .then(() => Response.success(res, 'Item added'))
    .catch(err => catchUnhandledErr(err, res));
}

function deleteListItem(req, res) {
  const { email } = req, { list_id } = req.params, { item } = req.body;
  db.deleteItemFromList(list_id, item)
    .then(() => Response.success(res, 'Item deleted'))
    .catch(err => catchUnhandledErr(err, res));
}

const router = express.router();

// closed endpoint
router.use(authUser);

router.get('/', getLists);
router.post('/', bodyProps('list_name'), createList);
router.delete('/', bodyProps('list_id'), ownsList, deleteList);

router.get('/:list_id(\w{32})', accessableList, getListItems);
router.post('/:list_id(\w{32})', accessableList, bodyProps('item'), createListItem);
router.delete('/:list_id(\w{32})', accessableList, bodyProps('item'), deleteListItem);

module.exports = router;
