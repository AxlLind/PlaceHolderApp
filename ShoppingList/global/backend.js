'use strict';
import request from 'superagent';
import { config, codes } from './config.js'

const fetchErr = {
  code: codes.fetchErr,
  message: 'Could not reach server'
};

const authHeader = (email, token) => `${email} ${token}`;

class Backend {
  ping() { return this.get('/'); }

  /* User endpoint */
  requestSessionToken(email, pw_hash) { return this.get('/user', authHeader(email, pw_hash)); }
  registerUser(email, pw_hash)        { return this.post('/user', authHeader(email, pw_hash)); }
  testSessionToken(email, token)      { return this.get('/user/test_token', authHeader(email, token)); }

  /* Lists endpoint */
  getLists(email, token)              { return this.get('/lists', authHeader(email, token)); }
  createList(email, token, list_name) { return this.post('/lists', authHeader(email, token), { list_name }); }
  deleteList(email, token, list_id)   { return this.delete('/lists', authHeader(email, token), { list_id }); }

  /* List endpoint */
  getListItems(email, token, list_id)             { return this.get(`/lists/${list_id}`, authHeader(email, token)); }
  addItemToList(email, token, list_id, item)      { return this.post(`/lists/${list_id}`, authHeader(email, token), { item }); }
  deleteItemFromList(email, token, list_id, item) { return this.delete(`/lists/${list_id}`, authHeader(email, token), { item }); }

  get(endpoint, authHeader, params = {}) {
    return request
      .get(`${config.server}${endpoint}`)
      .query(params)
      .set('Authorization', authHeader)
      .then(res => res.json())
      .catch(() => Promise.resolve(fetchErr));
  }

  post(endpoint, authHeader, params = {}) {
    return request
      .post(`${config.server}${endpoint}`)
      .send(params)
      .set('Authorization', authHeader)
      .then(res => res.json())
      .catch(() => Promise.resolve(fetchErr));
  }

  delete(endpoint, authHeader, params = {}) {
    return request
      .delete(`${config.server}${endpoint}`)
      .send(params)
      .set('Authorization', authHeader)
      .then(res => res.json())
      .catch(() => Promise.resolve(fetchErr));
  }
}

export default new Backend();
