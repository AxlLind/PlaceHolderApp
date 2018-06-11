import config from './config.js'

class Backend {
    registerUser(params)        { return this.postReq(params, '/api/registerUser'); }
    getLists(params)            { return this.postReq(params, '/api/getLists'); }
    getSharedLists(params)      { return this.postReq(params, '/api/getSharedLists'); }
    requestSessionToken(params) { return this.postReq(params, '/api/requestSessionToken'); }
    createList(params)          { return this.postReq(params, '/api/createList'); }
    addItemToList(params)       { return this.postReq(params, '/api/addItemToList'); }
    getListItems(params)        { return this.postReq(params, '/api/getListItems'); }
    deleteList(params)          { return this.postReq(params, '/api/deleteList'); }
    deleteItemFromList(params)  { return this.postReq(params, '/api/deleteItemFromList'); }

    postReq(params, endpoint) {
        return fetch(`${config.server}${endpoint}`, {
            method: 'POST',
            headers: {
            Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
        }).then(res => res.json());
    }
}

export default new Backend();
