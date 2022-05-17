const fetch = require('node-fetch');
const warn = require('debug')('ynu-libs:ris-auth:warn');
const error = require('debug')('ynu-libs:ris-auth:error');
const info = require('debug')('ynu-libs:ris-auth:info');

const { RIS_TOKEN } = process.env;
const HOST = 'https://access.ynu.edu.cn';

const allServices = async (options = {}) => {
  info('获取所有可用服务');
  const token = options.token || RIS_TOKEN;
  const res = await fetch(`${HOST}/shterm/api/role/getAllServices`, {
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

const getLoginUserRole = async (options = {}) => {
  info('获取当前登录用户的角色信息');
  const token = options.token || RIS_TOKEN;
  const res = await fetch(`${HOST}/shterm/api/role/getLoginUserRole`, {
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
  allServices,
  getLoginUserRole,
};