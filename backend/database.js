'use strict';
const _      = require('lodash');
const config = require('./config.js');
const knex   = require('knex')({
    client: config.dbClient,
    connection: config.dbConn,
});

class Database {

    /* CHECKS */

    checkEmail(email) {
        return knex('users')
            .where({ email })
            .then(rows => !_.isEmpty(rows));
    }

    checkEmailVerified(email) {
        return knex('users')
            .where({ email })
            .then(rows => !_.isEmpty(rows) && rows[0].email_verified);
    }

    checkUserOwnsList(email, list_id) {
        return knex('users')
            .join('lists', 'users.user_id', '=', 'lists.user_id')
            .where({ email, list_id })
            .then(rows => !_.isEmpty(rows));
    }

    checkItemInList(list_id, item) {
        return knex('listitems')
            .where({ list_id, item })
            .then(rows => !_.isEmpty(rows));
    }

    /* GETTERS */

    getUser(email) {
        return knex('users')
            .where({ email })
            .then(rows => _.isEmpty(rows) ? {} : rows[0]);
    }

    getUsersLists(email) {
        return knex('users')
            .select('list_id', 'list_name', 'lists.date_created')
            .join('lists', 'users.user_id', '=', 'lists.user_id')
            .where({ email });
    }

    getUsersSharedLists(email) {
        return knex('users')
            .select('lists.list_id', 'lists.list_name', 'lists.date_created')
            .join('sharedlists', 'users.user_id', '=', 'sharedlists.user_id')
            .join('lists', 'sharedlists.list_id', '=', 'lists.list_id')
            .where({ email });
    }

    getListItems(list_id) {
        return knex('listitems')
            .select('item')
            .where({ list_id })
            .then(rows => _.map(rows, 'item'));
    }

    /* CREATORS */

    createUser(email, pw_hash) {
        return knex('users')
            .insert({ email, pw_hash });
    }

    createList(list_name, email) {
        return knex('users')
            .select('user_id')
            .where({ email })
            .then(rows => rows[0].user_id)
            .then(user_id => knex('lists')
                .insert({ list_name, user_id })
            );
    }

    addItemToList(list_id, item) {
        return knex('listitems')
            .insert({ list_id, item });
    }

    /* UPDATERS */

    confirmUserEmail(email) {
        return knex('users')
            .where({ email })
            .update({ email_verified: 'TRUE' });
    }

    /* DELETERS */

    deleteList(list_id) {
        return Promise.resolve()
            .then(() => knex('sharedlists')
                .where({ list_id })
                .del()
            )
            .then(() => knex('listitems')
                .where({ list_id })
                .del()
            )
            .then(() => knex('lists')
                .where({ list_id })
                .del()
            );
    }

    deleteItemFromList(list_id, item) {
        return knex('listitems')
            .where({ list_id, item })
            .del();
    }

}

module.exports = new Database();
