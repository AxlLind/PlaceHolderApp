'use strict';
const _ = require('lodash');

class Logger {
  constructor() {

  }

  log(msg, level) {
    console[level](msg);
  }

  error(msg) { log(msg, 'error'); }
  warn(msg)  { log(msg, 'warn');  }
  info(msg)  { log(msg, 'info');  }
}

module.exports = new Logger();
