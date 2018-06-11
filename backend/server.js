const _              = require('lodash');
const express        = require('express');
const bcrypt         = require('bcrypt');
const db             = require('./database.js');
const Response       = require('./response.js');
const config         = require('./config.js');
const sessionHandler = require('./sessionhandler.js');
const app            = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const verifyProperties = (req, res, properties) => {
    for (let prop in properties) {
        if (_.has(req.body, prop))
            continue;
        Response.fail(res, properties[prop]);
        return false;
    }
    return true;
}

const validateUser = (req, res, next) => {
    if (!verifyProperties(req, res, {
        token: 'Token not supplied',
        email: 'Email not supplied'
    })) return;

    if (!sessionHandler.validate(req.body.token, req.body.email))
        return Response.fail(res, 'Invalid session token');
    next();
}

app.post('/version', (req, res) =>
    Response.success(res, 'Version passed', { version: '0.0.1' })
);

app.post('/api/getLists', validateUser, (req, res) => {
    db.getUsersLists(req.body.email)
        .then(lists => Response.success(res, 'Serving lists', { lists }))
        .catch(() => Response.genericFail(res));
});

app.post('/api/getSharedLists', validateUser, (req, res) => {
    db.getUsersSharedLists(req.body.email)
        .then(lists => Response.success(res, 'Serving shared lists', { lists }))
        .catch(() => Response.genericFail(res));
});

app.post('/api/requestSessionToken', (req, res) => {
    if (!verifyProperties(req, res, {
        email: 'Email not supplied',
        pw_hash: 'Password hash not supplied'
    })) return;

    db.getUser(req.body.email)
        .then(user => {
            if (_.isEmpty(user)) {
                Response.fail(res, 'No account tied to that email');
                return Promise.reject('Invalid email');
            }
            return user;
        })
        .then(user => bcrypt.compare(req.body.pw_hash, user.pw_hash))
        .then(validated => {
            if (!validated) {
                Response.fail(res, 'Invalid password');
                return Promise.reject('Invalid password');
            }
        })
        .then(() =>
            Response.success(res, 'Session validated', {
                token: sessionHandler.addToken(req.body.email),
            })
        );
});

app.post('/api/registerUser', (req, res) => {
    if (!verifyProperties(req, res, {
        email: 'Email not supplied',
        pw_hash: 'Password hash not supplied'
    })) return;
    if (!/.+@.+\..+/.test(req.body.email)) // ensure it is 'sort of' an email
        return Response.fail(res, 'Invalid email');
    db.checkEmail(req.body.email)
        .then(exists => {
            if (exists) {
                Response.fail(res, 'Email already tied to an account')
                return Promise.reject('Invalid email');
            }
        })
        .then(() => bcrypt.hash(req.body.pw_hash, config.saltRounds))
        .then(hash => db.createUser(req.body.email, hash))
        .then(() => Response.success(res, 'User created'));
});

app.post('/api/createList', validateUser, (req, res) => {
    if (!verifyProperties(req, res, {
        list_name: 'No list name supplied'
    })) return;

    db.createList(req.body.list_name, req.body.email)
        .then(() => Response.success(res, 'List created'))
        .catch(() => Response.genericFail(res));
});

app.post('/api/addItemToList', validateUser, (req, res) => {
    if (!verifyProperties(req, res, {
        list_id: 'No list name supplied',
        item: 'No item supplied'
    })) return;

    db.addItemToList(req.body.list_id, req.body.item)
        .then(() => Response.success(res, 'Item added'))
        .catch(() => Response.genericFail(res));
});

app.post('/api/getListItems', validateUser, (req, res) => {
    if (!verifyProperties(req, res, {
        list_id: 'No list id supplied'
    })) return;

    db.checkUserOwnsList(req.body.email, req.body.list_id)
        .then(ownsList => {
            if (!ownsList) {
                Response.fail(res, 'Accessing list you do not own');
                return Promise.reject('Accessing list you do not own');
            }
        })
        .then(() => db.getListItems(req.body.list_id))
        .then(items => Response.success(res, 'Items served', { items }))
});

app.post('/api/deleteList', validateUser, (req, res) => {
    if (!verifyProperties(req, res, {
        list_id: 'No list id supplied'
    })) return;

    db.checkUserOwnsList(req.body.email, req.body.list_id)
        .then(ownsList => {
            if (!ownsList) {
                Response.fail(res, 'Accessing list you do not own');
                return Promise.reject('Accessing list you do not own');
            }
        })
        .then(() => db.deleteList(req.body.list_id));
});

app.post('/api/deleteItemFromList', validateUser, (req, res) => {
    if (!verifyProperties(req, res, {
        list_id: 'No list id supplied',
        item: 'No item supplied',
    })) return;

    db.checkUserOwnsList(req.body.email, req.body.list_id)
        .then(ownsList => {
            if (!ownsList) {
                Response.fail(res, 'Accessing list you do not own');
                return Promise.reject('Accessing list you do not own');
            }
        })
        .then(() => db.deleteItemFromList(req.body.list_id, req.body.item));
})

// Redirects any unspecified paths here, simply return an error
app.get('*', (req, res) => Response.fail(res, 'Not valid endpoint'));
app.post('*', (req, res) => Response.fail(res, 'Not valid endpoint'));

app.listen(config.port, '0.0.0.0', () => {
    console.log(`Server up! Listening on: localhost:${config.port}`);
});
