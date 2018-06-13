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
    success = (res, msg, data) => this.response(res, msg, 200, codes.success, data);

    invalidParam = (res, reason) => this.response(res, reason, 400, codes.invalidParam);

    missingParam = (res, param) => this.response(res, `Missing parameter ${param}`, 400, codes.missingParam);

    invalidAuth = res => this.response(res, 'Invalid authentication', 401, codes.invalidAuth);

    invalidEndpoint = res => this.response(res, 'Not a valid API-endpoint', 404, codes.invalidEndpoint);

    serverError = res => this.response(res, 'Internal server error', 500, codes.server);

    response(res, message, status, code, data) {
        const response = _.omitBy({ status, code, message, data }, _.isUndefined);
        return res.status(status).send(response);
    }
}

module.exports = new Response();
