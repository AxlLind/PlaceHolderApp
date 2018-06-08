let _        = require('lodash');
let express  = require('express');
let app      = express();
let db       = require('./database.js');
let Response = require('./response.js');
const PORT   = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/version', (req, res) =>
    Response.success(res, true, 'Version passed', {
        version: '1.0.0'
    })
);

app.post('/api/createList', (req, res) => {
    db.createList('MyList', 1)
        .then(() => Response.success(res, true, 'List created'))
        .catch(() => Response.fail(res, false, 'Something went wrong'));
});

app.post('/api/test', (req, res) => {
    return Response.success(res, true, 'Testerino', {
        body: req.body,
        params: req.params,
        query: req.query,
    });
});

app.get('*', (req, res) =>
    Response.fail(res, false, 'Not valid endpoint')
);

app.listen(PORT, () => {
    console.log(`Server up! Port: localhost:${PORT}`);
});
