let _ = require('lodash');
let express = require('express');
let app = express();
const PORT = 3000;

app.get('/version', (req, res) => {
    res.status(400).send('1.0.0');
});

app.get('/', (req, res) => {
    res.status(400).send({
        status: 'true',
        doesThisWork: 'yes'
    });
});


app.listen(PORT, () => {
    console.log(`Server up! Port: localhost:${PORT}`);
});
