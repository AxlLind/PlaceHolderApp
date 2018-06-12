import { config } from './config.js'

class Backend {
    version()                                       { return this.postReq({}, '/version'); }
    getLists(email, token)                          { return this.postReq({email, token}, '/api/getLists'); }
    getSharedLists(email, token)                    { return this.postReq({email, token}, '/api/getSharedLists'); }
    registerUser(email, pw_hash)                    { return this.postReq({email, pw_hash}, '/api/registerUser'); }
    testSessionToken(email, token)                  { return this.postReq({email, token}, '/api/testSessionToken'); }
    requestSessionToken(email, pw_hash)             { return this.postReq({email, pw_hash}, '/api/requestSessionToken'); }
    getListItems(email, token, list_id)             { return this.postReq({email, token, list_id}, '/api/getListItems'); }
    deleteList(email, token, list_id)               { return this.postReq({email, token, list_id}, '/api/deleteList'); }
    createList(email, token, list_name)             { return this.postReq({email, token, list_name}, '/api/createList'); }
    addItemToList(email, token, list_id, item)      { return this.postReq({email, token, list_id, item}, '/api/addItemToList'); }
    deleteItemFromList(email, token, list_id, item) { return this.postReq({email, token, list_id, item}, '/api/deleteItemFromList'); }

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

export default new Backend() ;
