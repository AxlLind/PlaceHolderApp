const _              = require('lodash');
const express        = require('express');
const bcrypt         = require('bcrypt');
const db             = require('./database.js');
const Response       = require('./response.js');
const config         = require('./config.js');
const sessionHandler = require('./sessionhandler.js');
const app            = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

/**
 * Middleware that verifies that req.body has the given properties.
 * @param {[string]} properties properties to verify
 */
const verifyProperties = (properties, req, res, next) => {
    const missingProp = _.find(properties, prop => !_.has(req.body, prop));
    if (missingProp)
        return Response.missingParam(res, missingProp);
    next();
}

/**
 * Returns a middleware function that verifies
 * that the arguments are properties of req.body
 * @param {string} args properties to verify
 */
const requireProps = (...args) => _.curry(verifyProperties)(args);

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

/**
 * Express middleware. Passes forward if the supplied token is valid.
 * Otherwise sends an invalidAuth response.
 */
const validateUser = (req, res, next) => {
    const missingProp = _.find(['email', 'token'], prop => !_.has(req.body, prop));
    if (missingProp)
        return Response.missingParam(res, missingProp);
    const { email, token } = req.body;
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
        .catch(err => catchUnhandledErr(err, res));
});

app.post('/api/getSharedLists', validateUser, (req, res) => {
    db.getUsersSharedLists(req.body.email)
        .then(lists => Response.success(res, 'Serving shared lists', { lists }))
        .catch(err => catchUnhandledErr(err, res));
});

app.post('/api/requestSessionToken', requireProps('email', 'pw_hash'), (req, res) => {
    const { email, pw_hash } = req.body;
    db.getUser(email)
        .then(user => {
            if (_.isEmpty(user)) {
                Response.invalidParam(res, 'email');
                return Promise.reject(config.errHandled);
            }
            return user;
        })
        .then(user => bcrypt.compare(pw_hash, user.pw_hash))
        .then(validated => {
            if (!validated) {
                Response.invalidAuth(res);
                return Promise.reject(config.errHandled);
            }
        })
        .then(() => Response.success(res, 'Session validated', {
                token: sessionHandler.requestToken(email),
            })
        )
        .catch(err => catchUnhandledErr(err, res));
});

app.post('/api/registerUser', requireProps('email', 'pw_hash'), (req, res) => {
    const { email, pw_hash } = req.body;
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
        .then(hash => db.createUser(email, hash))
        .then(() => Response.success(res, 'User created'))
        .catch(err => catchUnhandledErr(err, res));
});

app.post('/api/createList', validateUser, requireProps('list_name'), (req, res) => {
    const { email, list_name } = req.body;
    db.createList(list_name, email)
        .then(() => Response.success(res, 'List created'))
        .catch(err => catchUnhandledErr(err, res));
});

app.post('/api/addItemToList', validateUser, requireProps('list_id', 'item'), (req, res) => {
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

app.post('/api/getListItems', validateUser, requireProps('list_id'), (req, res) => {
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

app.post('/api/deleteList', validateUser, requireProps('list_id'), (req, res) => {
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

app.post('/api/deleteItemFromList', validateUser, requireProps('list_id', 'item'), (req, res) => {
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
})

// Redirects any unspecified paths here, simply return an error
app.get('*', (req, res) => Response.invalidEndpoint(res));
app.post('*', (req, res) => Response.invalidEndpoint(res));

app.listen(config.port, '0.0.0.0', () => {
    console.log(`Server up! Listening on port ${config.port}`);
});
