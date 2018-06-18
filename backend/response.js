'use strict';
const _ = require('lodash');

const codes = {
    success: 0,
    server: 1,
    invalidAuth: 2,
    invalidParam: 3,
    missingParam: 4,
    invalidEndpoint: 5,
};

class Response {
    success(res, message, data) {
        console.log(`Success: ${message}`);
        return this.response(res, 200, message, codes.success, data);
    }

    invalidParam(res, reason) {
        console.log(`Response: Invalid param - ${reason}`);
        return this.response(res, 400, reason, codes.invalidParam);
    }

    missingParam(res, param) {
        console.log(`Response: Missing param - ${param}`);
        return this.response(res, 400, `Missing parameter '${param}'`, codes.missingParam);
    }

    invalidAuth(res) {
        console.log('Response: Invalid authentication');
        return this.response(res, 401, 'Invalid authentication', codes.invalidAuth);
    }

    invalidEndpoint(res) {
        console.log('Response: Invalid API-endpoint');
        return this.response(res, 404, 'Invalid API-endpoint', codes.invalidEndpoint);
    }

    serverError(res) {
        return this.response(res, 500, 'Internal server error', codes.server);
    }

    response(res, status, message, code, data) {
        const response = _.omitBy({ message, code, data }, _.isUndefined);
        return res.status(status).send(response);
    }
}

module.exports = new Response();
