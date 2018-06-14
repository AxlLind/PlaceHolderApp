const _ = require('lodash');
const randomstring = require('randomstring');
const config = require('./config.js');

class SessionHandler {
    constructor() {
        this.tokens = {
            testToken: 'test@test.com'
        };
    }

    validate(token, email) {
        return _.isEqual(this.tokens[token], email);
    }

    requestToken(email) {
        const token = randomstring.generate();
        this.tokens[token] = email;
        setTimeout(() => this.removeToken(token), config.sessionTime);
        return token;
    }

    removeToken(token) {
        this.tokens[token] = undefined;
    }
}

module.exports = new SessionHandler();
