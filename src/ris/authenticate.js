const fetch = require('node-fetch');
const warn = require('debug')('ynu-libs:ris-auth:warn');
const error = require('debug')('ynu-libs:ris-auth:error');
const info = require('debug')('ynu-libs:ris-auth:info');

const HOST = 'https://access.ynu.edu.cn';

const authenticate = async (username, password) => {
  info('开始获取token');
  const res = await fetch(`${HOST}/shterm/api/authenticate`, {
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    method: 'POST',
    body: JSON.stringify({
      username,
      password,
    }),
  });
  switch (res.status) {
    case 200:
      info(`获取token成功`);
      return (await res.json()).ST_AUTH_TOKEN;
    case 401:
      error(`获取token失败,认证失败(${res.status})`);
      return null;
    default:
      error(`获取token失败,未知错误(${res.status})`);
      return null;
  }
}

module.exports = {
  HOST,
  authenticate,
};