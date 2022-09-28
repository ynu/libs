const crypto = require('crypto');
const debug = require('debug')('ynu-libs:zhangmen:debug');
const warn = require('debug')('ynu-libs:zhangmen:warn');
const info = require('debug')('ynu-libs:zhangmen:info');
const dayjs = require('dayjs');
var utc = require('dayjs/plugin/utc')
dayjs.extend(utc)

const signature = (key, str) => {
  return crypto.createHmac('sha1',key)
    .update(str)
    .digest('base64');

}

const specialUrlEncode = (value) => {
  return encodeURIComponent(value).replace(/\+/g, '%20').replace(/\*/g, '%2A').replace(/%7E/g, '~');
}

const signaturePostRequestBody = (requestId, accessKeyId, accessKeySecret, timestamp, bodyJson) => {
  const params = new Map();
  params.set('zhangmen-access-key-id', accessKeyId);
  params.set('zhangmen-request-id', requestId);
  params.set('zhangmen-timestamp', timestamp);
  params.set('requestBody', bodyJson);

  // 将参数连成字符串
  const paramString = [...params]
    .sort()       // 首先需要将key按字典排序
    .map(param => `${specialUrlEncode(param[0])}=${specialUrlEncode(param[1])}`)
    .join('&');
  const stringToSign = `POST&${specialUrlEncode("/")}&${specialUrlEncode(paramString)}`;
  info(`待签名的字符串:${stringToSign}`)

  const sign = signature(`${accessKeySecret}&`, stringToSign);
  info(`生成Query签名:${sign}`);
  return sign;
}

const signatureQuery = (requestId, accessKeyId, accessKeySecret, timestamp, query = new Map()) => {
  if (!(query instanceof Map)) {
    warn('签名的参数query类型必须是Map');
    return 'error';
  }
  const params = new Map([...query]);
  params.set('zhangmen-access-key-id', accessKeyId);
  params.set('zhangmen-request-id', requestId);
  params.set('zhangmen-timestamp', timestamp);

  // 将参数连成字符串
  const paramString = [...params]
    .sort()       // 首先需要将key按字典排序
    .map(param => `${specialUrlEncode(param[0])}=${specialUrlEncode(param[1])}`)
    .join('&');
  const stringToSign = `GET&${specialUrlEncode("/")}&${specialUrlEncode(paramString)}`;
  info(`待签名的字符串:${stringToSign}`)

  const sign = signature(`${accessKeySecret}&`, stringToSign);
  info(`生成Query签名:${sign}`);
  return sign;
}

module.exports = {
  signature,
  specialUrlEncode,
  debug,
  warn,
  info,
  signatureQuery,
  signaturePostRequestBody,
}