class Response {
    success(res, flag, message, payload) {
        return this.createResponse(res, 200, flag, message, payload);
    }

    fail(res, flag, message, payload) {
        return this.createResponse(res, 400, flag, message, payload);
    }

    createResponse(res, status, flag, message, payload) {
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
