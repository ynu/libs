const fetch = require('node-fetch');
const warn = require('debug')('ynu-libs:ris-user:warn');
const error = require('debug')('ynu-libs:ris-user:error');
const info = require('debug')('ynu-libs:ris-user:info');
const { authenticate } = require('./auth');

const { RIS_TOKEN, RIS_USERNAME, RIS_PASSWORD } = process.env;
const HOST = 'https://access.ynu.edu.cn';

const getById = async (id, options = {}) => {
  info(`根据用户 ID(${id}) 查询用户的信息`);
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
  const res = await fetch(`${HOST}/shterm/api/user/${id}`, {
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
        ... await res.json(),
      };
    case 401:
      error(`操作失败(${res.status})`);
      return { ret: 401 }
    default:
      error(`获取失败,未知错误(${res.status})`);
      console.log(res);
      return { ret: -1 };
  }
}

const create = async (loginName, userName, authType, role, department, others = {}, options = {}) => {
  info(`创建新用户(${loginName})`);
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
  const user = {
    loginName,
    userName,
    authType: {
      id: authType
    },
    role: {
      id: role
    },
    department: {
      id: department
    },
    ...others,
  };
  const res = await fetch(`${HOST}/shterm/api/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'st-auth-token': token,
    },
    body: JSON.stringify(user),
  });
  switch (res.status) {
    case 201:
      info(`创建成功`);
      return {
        ret: 0,
        ...await res.json(),
      }
    case 401:
      error(`操作失败(${res.status})`);
      return {
        ret: 401,
      };
    case 400:
      const result = await res.json();
      error(`创建失败:${JSON.stringify(result[0])}`);
      return {
        ret: 400,
        ...result[0],
      }
    default:
      error(`操作失败,未知错误(${res.status}[${res.statusText}])`);
      return {
        ret: -1,
      };
  }
}

const getByLoginName = async (loginName, options = {}) => {
  info(`根据账号名称(${loginName})获取用户信息`);
  let token = options.token || RIS_TOKEN;
  const username = options.username || RIS_USERNAME;
  const password = options.password || RIS_PASSWORD;
  if (!token) {
    token = await authenticate(username, password);
  }
  if (!token) {
    error('无法获取token,未提供token或username及password,无法执行操作');
    return { ret: -1 };
  }
  const res = await fetch(`${HOST}/shterm/api/user/loginName/${loginName}`, {
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
      error(`指定的账号(${loginName})不存在或已被删除`);
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

const disableByLoginName = async (loginName, options = {}) => {
  info(`根据账号名称(${loginName})禁用用户`);
  let token = options.token || RIS_TOKEN;
  const username = options.username || RIS_USERNAME;
  const password = options.password || RIS_PASSWORD;
  if (!token) {
    token = await authenticate(username, password);
  }
  if (!token) {
    error('无法获取token,未提供token或username及password,无法执行操作');
    return { ret: -1 };
  }
  const res = await fetch(`${HOST}/shterm/api/user/loginName/${loginName}/1`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'st-auth-token': token,
    },
  });
  switch (res.status) {
    case 204:
      info(`执行成功`);
      return {
        ret: 0,
        ...await res.json(),
      }
    case 410:
      error(`指定的账号(${loginName})不存在或已被删除`);
      return {
        ret: 404,
      };
    case 400:
      const result = await res.json();
      error(`参数错误(${JSON.stringify(result[0])})`);
      return {
        ret: 400,
        ...result[0],
      }
    default:
      error(`操作失败,未知错误(${res.status}[${res.statusText}])`);
      return {
        ret: -1,
      };
  }
}

module.exports = {
  getById,
  getByLoginName,
  create,
  disableByLoginName,
};