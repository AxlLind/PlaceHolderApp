import { config, codes } from './config.js'

class Backend {
    version()                                       { return this.getReq({}, '/version'); }
    registerUser(email, pw_hash)                    { return this.postReq({email, pw_hash}, '/api/registerUser'); }
    requestSessionToken(email, pw_hash)             { return this.postReq({email, pw_hash}, '/api/requestSessionToken'); }
    getLists(email, token)                          { return this.postReq({email, token}, '/api/getLists'); }
    getSharedLists(email, token)                    { return this.postReq({email, token}, '/api/getSharedLists'); }
    testSessionToken(email, token)                  { return this.postReq({email, token}, '/api/testSessionToken'); }
    getListItems(email, token, list_id)             { return this.postReq({email, token, list_id}, '/api/getListItems'); }
    deleteList(email, token, list_id)               { return this.postReq({email, token, list_id}, '/api/deleteList'); }
    createList(email, token, list_name)             { return this.postReq({email, token, list_name}, '/api/createList'); }
    addItemToList(email, token, list_id, item)      { return this.postReq({email, token, list_id, item}, '/api/addItemToList'); }
    deleteItemFromList(email, token, list_id, item) { return this.postReq({email, token, list_id, item}, '/api/deleteItemFromList'); }

    toQueryParams(obj) {
        let s = '?';
        for (let prop in obj)
            s += `${prop}=${obj[prop]}`;
        return s.slice(0, -1);
    }

    getReq(params, endpoint) {
        const query = _.isEmpty(params) ? '' : this.toQueryParams(params);
        return fetch(`${config.server}${endpoint}${query}`)
            .then(res => res.json())
            .catch(() => Promise.resolve({
                code: codes.fetchErr,
                message: 'Could not reach server'
            }));
    }

    postReq(params, endpoint) {
        return fetch(`${config.server}${endpoint}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
        })
        .then(res => res.json())
        .catch(() => Promise.resolve({
            code: codes.fetchErr,
            message: 'Could not reach server',
        }));
    }

}

export default new Backend();
