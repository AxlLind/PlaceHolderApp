class Response {
    success(res, message, data) {
        return this.createResponse(res, message, data, 200, true);
    }

    fail(res, message, data) {
        return this.createResponse(res, message, data, 400, false);
    }

    genericFail(res) {
        return this.createResponse(res, 'Something went wrong', undefined, 400, false);
    }

    createResponse(res, message, data, status, flag) {
        const obj = {
            status,
            flag,
            message,
        }
        if (data)
            obj.data = data;
        return res.status(status).send(obj);
    }
}

module.exports = new Response();
