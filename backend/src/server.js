'use strict';
const express = require('express');
const helmet  = require('helmet');
const _ = require('lodash');

// endpoints
const lists_endpoint = require('./endpoints/lists');
const user_endpoint = require('./endpoints/user');

const parseAuthHeader = require('./middlewares/parseAuthHeader.js');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(parseAuthHeader);

app.get('/', (_req, res) => Response.success(res, 'Server is up', {}));

app.use('/lists', lists_endpoint);
app.use('/user', user_endpoint);

// Redirects any unspecified paths here, simply return an error
app.all('*', (_req, res) => Response.invalidEndpoint(res));

app.listen(config.port, '0.0.0.0', () => {
  console.log(`Server up! Listening on port ${config.port}`);
});
