const _              = require('lodash');
const express        = require('express');
const bcrypt         = require('bcrypt');
const db             = require('./database.js');
const Response       = require('./response.js');
const config         = require('./config.js');
const sessionHandler = require('./sessionhandler.js');
const app            = express();

app.use(express.json());
app.use(express.urlencoded());

const verifyProperties = (properties, req, res, next) => {
    const verified = _.every(properties, prop => _.has(req.body, prop));
    if (!verified)
        Response.missingParam(res, prop);
    return verified;
}

const requireProps = (...args) => _.curry(verifyProperties)(args);

const validateUser = (req, res, next) => {
    if (!verifyProperties(['email', 'token'], req, res))
        return;

    const {token, email} = req.body;
    if (!sessionHandler.validate(token, email))
        return Response.invalidAuth(res);
    next();
}

app.post('/version', (req, res) =>
    Response.success(res, 'Version passed', { version: '0.0.1' })
);

app.post('/api/testSessionToken', validateUser, (req, res) =>
    Response.success(res, 'Token still valid')
);

app.post('/api/getLists', validateUser, (req, res) => {
    db.getUsersLists(req.body.email)
        .then(lists => Response.success(res, 'Serving lists', { lists }))
        .catch(() => Response.serverError(res));
});

app.post('/api/getSharedLists', validateUser, (req, res) => {
    db.getUsersSharedLists(req.body.email)
        .then(lists => Response.success(res, 'Serving shared lists', { lists }))
        .catch(() => Response.serverError(res));
});

app.post('/api/requestSessionToken', (req, res) => {
    if (!verifyProperties(['email', 'pw_hash'], req, res))
        return;

    const {email, pw_hash} = req.body;
    db.getUser(email)
        .then(user => {
            if (_.isEmpty(user)) {
                Response.invalidParam(res, 'email');
                return Promise.reject('Invalid email');
            }
            return user;
        })
        .then(user => bcrypt.compare(pw_hash, user.pw_hash))
        .then(validated => {
            if (!validated) {
                Response.invalidAuth(res);
                return Promise.reject('Invalid password');
            }
        })
        .then(() => Response.success(res, 'Session validated', {
                token: sessionHandler.addToken(email),
            })
        );
});

app.post('/api/registerUser', (req, res) => {
    if (!verifyProperties(['email', 'pw_hash'], req, res))
        return;

    const {email, pw_hash} = req.body;
    if (!/.+@.+\..+/.test(email)) // ensure it is 'sort of' an email
        return Response.invalidParam(res, 'Does not match an email');

    db.checkEmail(email)
        .then(exists => {
            if (exists) {
                Response.invalidParam(res, 'Email already taken');
                return Promise.reject('Invalid email');
            }
        })
        .then(() => bcrypt.hash(pw_hash, config.saltRounds))
        .then(hash => db.createUser(email, hash))
        .then(() => Response.success(res, 'User created'));
});

app.post('/api/createList', validateUser, (req, res) => {
    if (!verifyProperties(['list_name'], req, res))
        return;

    db.createList(req.body.list_name, req.body.email)
        .then(() => Response.success(res, 'List created'))
        .catch(() => Response.serverError(res));
});

app.post('/api/addItemToList', validateUser, (req, res) => {
    if (!verifyProperties(['list_id', 'item'], req, res))
        return;

    const {email, list_id, item} = req.body;
    db.checkUserOwnsList(email, list_id)
        .then(ownsList => {
            if (!ownsList) {
                Response.invalidParam(res, 'You do not own that list');
                return Promise.reject('Accessing list you do not own');
            }
        })
        .then(() => db.checkItemAlreadyInList(list_id, item))
        .then(inList => {
            if (inList) {
                Response.invalidParam(res, 'Item already in list');
                return Promise.reject('Item already in list');
            }
        })
        .then(() => db.addItemToList(list_id, item))
        .then(() => Response.success(res, 'Item added'));
});

app.post('/api/getListItems', validateUser, (req, res) => {
    if (!verifyProperties(['list_id'], req, res))
        return;

    const {email, list_id} = req.body;
    db.checkUserOwnsList(email, list_id)
        .then(ownsList => {
            if (!ownsList) {
                Response.invalidParam(res, 'You do not own that list');
                return Promise.reject('Accessing list you do not own');
            }
        })
        .then(() => db.getListItems(list_id))
        .then(items => Response.success(res, 'Items served', { items }));
});

app.post('/api/deleteList', validateUser, (req, res) => {
    if (!verifyProperties(['list_id'], req, res))
        return;

    const {email, list_id} = req.body;
    db.checkUserOwnsList(email, list_id)
        .then(ownsList => {
            if (!ownsList) {
                Response.invalidParam(res, 'You do not own that list');
                return Promise.reject('Accessing list you do not own');
            }
        })
        .then(() => db.deleteList(list_id))
        .then(() => Response.success(res, 'List deleted'))
});

app.post('/api/deleteItemFromList', validateUser, (req, res) => {
    if (!verifyProperties(['list_id', 'item'], req, res))
        return;

    const {email, list_id, item} = req.body;
    db.checkUserOwnsList(email, list_id)
        .then(ownsList => {
            if (!ownsList) {
                Response.invalidParam(res, 'You do not own that list');
                return Promise.reject('Accessing list you do not own');
            }
        })
        .then(() => db.deleteItemFromList(list_id, item))
        .then(() => Response.success(res, 'Item deleted'));
})

// Redirects any unspecified paths here, simply return an error
app.get('*', (req, res) => Response.invalidEndpoint(res));
app.post('*', (req, res) => Response.invalidEndpoint(res));

app.listen(config.port, '0.0.0.0', () => {
    console.log(`Server up! Listening on: localhost:${config.port}`);
});
