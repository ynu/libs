const wecomApi = {
  ...require('./src/wecom-api'),
  ...require('wecom-common'),
};
const wecomUserApi = require('wecom-user');
const wecomDeptApi = require('wecom-department');
const wecomTagApi = require('wecom-tag');
const wecomAgentApi = require('wecom-agent');
const wecomHealth = require('wecom-health');
const wecomMessage = require('wecom-message');
const wecomOa = require('wecom-oa');
const esopApi = require('./src/esop-api');
const fcApi = require('./src/fc-api');
const ecardApi = require('./src/ecard-api');
const hikApi = require('./src/hik-api');
const dcDoor = require('./src/dc-door');
const zmDoor = require('./src/zhangmen/doors');
const zmDepartment = require('./src/zhangmen/departments');

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
  zmDoor,
  zmDepartment,
};
