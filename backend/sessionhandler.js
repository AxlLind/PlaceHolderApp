const randomstring = require('randomstring');
const config = require('./config.js');

class SessionHandler {
    constructor() {
        this.tokens = {
            testToken: 'test@test.com'
        };
    }

    validate(token, email) {
        return this.tokens[token] === email;
    }

    request(email) {
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
