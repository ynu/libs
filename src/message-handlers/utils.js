const debug = require('debug')('ynu-libs:message-handlers:debug');
const warn = require('debug')('ynu-libs:message-handlers:warn');
const info = require('debug')('ynu-libs:message-handlers:info');

module.exports = {
  debug,
  warn,
  info,
}