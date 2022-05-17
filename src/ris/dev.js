const fetch = require('node-fetch');
const warn = require('debug')('ynu-libs:ris-auth:warn');
const error = require('debug')('ynu-libs:ris-auth:error');
const info = require('debug')('ynu-libs:ris-auth:info');
const { authenticate } = require('./auth');

const { RIS_TOKEN, RIS_USERNAME, RIS_PASSWORD } = process.env;
const HOST = 'https://access.ynu.edu.cn';

const getByIP = async (ip, options = {}) => {
  info(`根据IP(${ip})获取资产信息`);
  let token = options.token || RIS_TOKEN;
  const username = options.username || RIS_USERNAME;
  const password = options.password || RIS_PASSWORD;
  if (!token) {
    token = await authenticate(username, password);
  }
  if (!token) {
    error('无法获取token,未提供token或username及password,无法创建新用户');
    return { ret: -1 };
  }
  const res = await fetch(`${HOST}/shterm/api/dev?ipIs=${ip}`, {
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'st-auth-token': token,
    },
  });
  switch (res.status) {
    case 200:
      info(`获取成功`);
      return {
        ret: 0,
        ...await res.json(),
      }
    case 404:
    case 410:
      error(`指定的IP(${ip})不存在或已被删除`);
      return {
        ret: 404,
      };
    case 400:
      const result = await res.json();
      error(`参数错误(${JSON.stringify(result)})`);
      return {
        ret: 400,
        ...result,
      }
    default:
      error(`操作失败,未知错误(${res.status}[${res.statusText}])`);
      return {
        ret: -1,
      };
  }
}

module.exports = {
  getByIP,
};