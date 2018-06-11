class Response {
    success(res, message, payload) {
        return this.createResponse(res, message, payload, 200, true);
    }

    fail(res, message, payload) {
        return this.createResponse(res, message, payload, 400, false);
    }

    createResponse(res, message, payload, status, flag) {
        const obj = {
            status,
            flag,
            message,
        }
        if (payload)
            obj.payload = payload;
        return res.status(status).send(obj);
    }
}

module.exports = new Response();
