let _              = require('lodash');
let express        = require('express');
let bcrypt         = require('bcrypt');
let db             = require('./database.js');
let Response       = require('./response.js');
let config         = require('./config.js');
let sessionHandler = require('./sessionhandler.js');
let app            = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const validateUser = (req, res, next) => {
    if (!req.body.token || !req.body.email)
        return Response.fail(res, 'Email or session token not supplied');
    if (!sessionHandler.validate(req.body.token, req.body.email))
        return Response.fail(res, 'Invalid session token');
    next();
}

app.post('/version', (req, res) =>
    Response.success(res, 'Version passed', {
        version: '1.0.0'
    })
);

app.post('/api/getLists', validateUser, (req, res) => {
    db.getUsersLists(req.body.email)
        .then(lists => Response.success(res, 'Serving lists', { lists }))
        .catch(() => Response.fail(res, 'Something went wrong'));
});

app.post('/api/getSharedLists', validateUser, (req, res) => {
    db.getUsersSharedLists(req.body.email)
        .then(lists => Response.success(res, 'Serving shared lists', { lists }))
        .catch(() => Response.fail(res, 'Something went wrong'));
});

app.post('/api/testSessionToken', (req, res) => {
    if (sessionHandler.validate(req.body.token, req.body.email))
        return Response.success(res, 'Valid token');
    return Response.fail(res, 'Invalid token');
});

app.post('/api/requestSessionToken', (req, res) => {
    if (!req.body.email)
        return Response.fail(res, 'Email not supplied');
    if (!req.body.pw_hash)
        return Response.fail(res, 'Password hash not supplied');
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
    if (!req.body.email)
        return Response.fail(res, 'Email not supplied');
    if (!req.body.pw_hash)
        return Response.fail(res, 'Password hash not supplied');
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
    if (!req.body.list_name)
        return Response.fail(res, 'No list name supplied');
    db.createList(req.body.list_name, req.body.email)
        .then(() => Response.success(res, 'List created'))
        .catch(() => Response.fail(res, 'Something went wrong'));
});

app.get('*', (req, res) => Response.fail(res, 'Not valid endpoint'));

app.listen(config.port, () => {
    console.log(`Server up! Listening on: localhost:${config.port}`);
});
