const esopApi = require('./src/esop-api');
const wecomApi = require('./src/wecom-api');
const wecomUserApi = require('./src/wecom-api-user');
const wecomDeptApi = require('./src/wecom-api-dept');
const wecomTagApi = require('./src/wecom-api-tag');
const wecomAgentApi = require('./src/wecom-agent');
const fcApi = require('./src/fc-api');
const ecardApi = require('./src/ecard-api');
const wecomHealth = require('./src/wecom-health');
const hikApi = require('./src/hik-api');
const wecomMessage = require('./src/wecom-message');
const wecomOa = require('./src/wecom-oa');
const dcDoor = require('./src/dc-door');
const risAuth = require('./src/ris/authenticate');

module.exports = {
  esopApi,
  wecomApi,
  wecomUserApi,
  wecomDeptApi,
  wecomTagApi,
  wecomAgentApi,
  fcApi,
  ecardApi,
  wecomHealth,
  hikApi,
  wecomMessage,
  wecomOa,
  dcDoor,
  risAuth,
};
