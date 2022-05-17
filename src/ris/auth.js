const fetch = require('node-fetch');
const warn = require('debug')('ynu-libs:ris-auth:warn');
const error = require('debug')('ynu-libs:ris-auth:error');
const info = require('debug')('ynu-libs:ris-auth:info');

const { RIS_TOKEN } = process.env;
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

const authTypes = async (options = {}) => {
  info('获取系统的所有认证方式');
  const token = options.token || RIS_TOKEN;
  const res = await fetch(`${HOST}/shterm/api/authType`, {
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'st-auth-token': token,
    },
  });
  switch (res.status) {
    case 200:
      info(`获取token成功`);
      return res.json();
    case 401:
      error(`操作失败(${res.status})`);
      return null;
    default:
      error(`获取失败,未知错误(${res.status})`);
      console.log(res);
      return null;
  }
}

module.exports = {
  HOST,
  authenticate,
  authTypes,
};