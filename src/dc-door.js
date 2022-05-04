/**
 * 数据中心机房开门程序
 */
const fetch = require('node-fetch');
const info = require('debug')('ynu-libs:dc-door:info');
const warn = require('debug')('ynu-libs:dc-door:warn');
const error = require('debug')('ynu-libs:dc-door:error');
const { DC_DOOR_USER, DC_DOOR_PASS } = process.env;

const getToken = async (username, password) => {
  info('正在获取token');
  const res = await fetch(`http://opendoor.api.ynu.edu.cn/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });
  try {
    if (res.status === 200) {
      info(`获取token成功`);
      const result = await res.json();
      return result.token;
    } else {
      const result = await res.json();
      error(`获取token失败(status:${res.status})::${result.error}`);
      return null;
    }
  } catch (err) {
    error(`获取token失败::${err}`);
  } 
}

const opendoor = async (door, options) => {
  const username = options.username || DC_DOOR_USER;
  const password = options.password || DC_DOOR_PASS;
  const token = await getToken(username, password);
  const res = await fetch(`http://opendoor.api.ynu.edu.cn/door/opendoor/${door}`, {
    headers: {
      Authorization: token,
    },
  });
  try {
    const result = await res.json();
    if (result.code) {
      console.log(result);
      error(`开门(${door}号)失败::${result.data}`);
      return result.code;
    } else {
      info(`开门(${door}号)成功`);
      return result.code;
    }
  } catch (err) {
    error(`开门(${door}号)失败::${err}`);
    return -1;
  } 
}

module.exports = {
  getToken,
  opendoor,
}