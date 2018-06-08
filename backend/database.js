let _ = require('lodash');
let knex = require('knex')({
    client: 'pg',
    connection: {
        // TODO: move to a global config object
        host: 'localhost',
        user: 'postgres',
        database: 'shopping_list'
    }
});

class Database {
    checkUserExists(email) {
        return knex('users')
            .select('*')
            .where({ email })
            .then(rows => !_.isEmpty(rows));
    }

    createUser(email, pw_hash, pw_salt) {
        if (!/.+@.+\..+/.test(email))
            return Promise.reject(new Error('Invalid Email'));
        return knex('users')
            .insert({
                email,
                pw_hash,
                pw_salt,
                date_created: new Date(),
            });
        }

    createList(list_name, user_id) {
        return knex('lists')
        .insert({
            list_name,
            user_id,
            date_created: new Date(),
        });
    }

    addItemToList(list_id, item) {
        return knex('listitems')
            .insert({
                list_id,
                item,
            })
    }

}

module.exports = new Database();
