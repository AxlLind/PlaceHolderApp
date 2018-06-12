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
        Response.missingParam(res, prop);
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
    if (!verifyProperties(req, res, {
        email: 'Email not supplied',
        pw_hash: 'Password hash not supplied'
    })) return;

    db.getUser(req.body.email)
        .then(user => {
            if (_.isEmpty(user)) {
                Response.invalidParam(res, 'email');
                return Promise.reject('Invalid email');
            }
            return user;
        })
        .then(user => bcrypt.compare(req.body.pw_hash, user.pw_hash))
        .then(validated => {
            if (!validated) {
                Response.invalidAuth(res);
                return Promise.reject('Invalid password');
            }
        })
        .then(() => Response.success(res, 'Session validated', {
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
        return Response.invalidParam(res, 'email');
    db.checkEmail(req.body.email)
        .then(exists => {
            if (exists) {
                Response.invalidParam(res, 'email');
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
        .catch(() => Response.serverError(res));
});

app.post('/api/addItemToList', validateUser, (req, res) => {
    if (!verifyProperties(req, res, {
        list_id: 'No list name supplied',
        item: 'No item supplied'
    })) return;

    db.checkUserOwnsList(req.body.email, req.body.list_id)
        .then(ownsList => {
            if (!ownsList) {
                Response.invalidParam(res, 'list_id');
                return Promise.reject('Accessing list you do not own');
            }
        })
        .then(() => db.checkItemAlreadyInList(req.body.list_id, req.body.item))
        .then(inList => {
            if (inList) {
                Response.invalidParam(res, 'item');
                return Promise.reject('Item already in list');
            }
        })
        .then(() => db.addItemToList(req.body.list_id, req.body.item))
        .then(() => Response.success(res, 'Item added'));
});

app.post('/api/getListItems', validateUser, (req, res) => {
    if (!verifyProperties(req, res, {
        list_id: 'No list id supplied'
    })) return;

    db.checkUserOwnsList(req.body.email, req.body.list_id)
        .then(ownsList => {
            if (!ownsList) {
                Response.invalidParam(res, 'list_id');
                return Promise.reject('Accessing list you do not own');
            }
        })
        .then(() => db.getListItems(req.body.list_id))
        .then(items => Response.success(res, 'Items served', { items }));
});

app.post('/api/deleteList', validateUser, (req, res) => {
    if (!verifyProperties(req, res, {
        list_id: 'No list id supplied'
    })) return;

    db.checkUserOwnsList(req.body.email, req.body.list_id)
        .then(ownsList => {
            if (!ownsList) {
                Response.invalidParam(res, 'list_id');
                return Promise.reject('Accessing list you do not own');
            }
        })
        .then(() => db.deleteList(req.body.list_id))
        .then(() => Response.success(res, 'List deleted'))
});

app.post('/api/deleteItemFromList', validateUser, (req, res) => {
    if (!verifyProperties(req, res, {
        list_id: 'No list id supplied',
        item: 'No item supplied',
    })) return;

    db.checkUserOwnsList(req.body.email, req.body.list_id)
        .then(ownsList => {
            if (!ownsList) {
                Response.invalidParam(res, 'list_id');
                return Promise.reject('Accessing list you do not own');
            }
        })
        .then(() => db.deleteItemFromList(req.body.list_id, req.body.item))
        .then(() => Response.success(res, 'Item deleted'));
})

// Redirects any unspecified paths here, simply return an error
app.get('*', (req, res) => Response.invalidEndpoint(res));
app.post('*', (req, res) => Response.invalidEndpoint(res));

app.listen(config.port, '0.0.0.0', () => {
    console.log(`Server up! Listening on: localhost:${config.port}`);
});
