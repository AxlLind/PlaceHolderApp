let randomstring = require('randomstring');
let config = require('./config.js');

class SessionHandler {
    constructor() {
        this.tokens = {};
    }

    validate(token, email) {
        return this.tokens[token] === email;
    }

    addToken(email) {
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
