const fetch = require('node-fetch');
const { v4 } = require('uuid');

const dayjs = require('dayjs');
var utc = require('dayjs/plugin/utc')
dayjs.extend(utc)
const { signaturePostRequestBody } = require('./utils');

const host = 'http://47.114.170.66/openapi';

const open = async (doorCode, operatorType, operatorCode, options) => {
  const accessKeyId = options.accessKeyId;
  const accessKeySecret = options.accessKeySecret;

  const requestId = v4();
  const timestamp = dayjs.utc().format('YYYY-MM-DD HH:mm:ss');

  const bodyJson = JSON.stringify({
    doorCode,
    operatorType,
    operatorCode,
  });
  const res = await fetch(`${host}/door/open`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'zhangmen-request-id': requestId,
      'zhangmen-access-key-id': accessKeyId,
      'zhangmen-timestamp': timestamp,
      'zhangmen-signature': signaturePostRequestBody(requestId, accessKeyId, accessKeySecret, timestamp, bodyJson),
    },
    body: bodyJson,
  });
  const result = await res.json();
  return result;
}

module.exports = {
  open,
}