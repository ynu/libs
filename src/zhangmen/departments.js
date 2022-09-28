const fetch = require('node-fetch');
const { v4 } = require('uuid');

const dayjs = require('dayjs');
var utc = require('dayjs/plugin/utc')
dayjs.extend(utc)
const { signatureQuery } = require('./utils');

const host = 'http://47.114.170.66/openapi';

const list = async (options = {}) => {
  const accessKeyId = options.accessKeyId;
  const accessKeySecret = options.accessKeySecret;

  const requestId = v4();
  const timestamp = dayjs.utc().format('YYYY-MM-DD HH:mm:ss');
  
  const query = new Map();
  query.set('param2', 'param2');
  query.set('param1', 'param3');
  const queryString = [...query].map(q => q.join('=')).join('&')

  const res = await fetch(`${host}/departments?${queryString}`, {
    headers: {
      'zhangmen-request-id': requestId,
      'zhangmen-access-key-id': accessKeyId,
      'zhangmen-timestamp': timestamp,
      'zhangmen-signature': signatureQuery(requestId, accessKeyId, accessKeySecret, timestamp, query),
    },
  });
  const result = await res.json();
  return result;
};

module.exports = {
  list,
}