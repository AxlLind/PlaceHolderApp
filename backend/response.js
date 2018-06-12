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
        return this.createResponse(res, message, 200, codes.success, data);
    }

    invalidParam(res, param) {
        return this.createResponse(res, `Invalid parameter: ${param}`, 400, codes.invalidParam);
    }

    missingParam(res, param) {
        return this.createResponse(res, `Missing parameter ${param}`, 400, codes.missingParam);
    }

    invalidAuth(res) {
        return this.createResponse(res, 'Invalid authentication', 401, codes.invalidAuth);
    }

    serverError(res) {
        return this.createResponse(res, 'Internal server error', 500, codes.server);
    }

    invalidEndpoint(res) {
        return this.createResponse(res, 'Not a valid API-endpoint', 404, codes.invalidEndpoint);
    }

    createResponse(res, message, status, code, data) {
        const obj = { status, code, message };
        if (data)
            obj.data = data;
        return res.status(status).send(obj);
    }
}

module.exports = new Response();
