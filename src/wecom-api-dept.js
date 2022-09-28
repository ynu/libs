/* eslint-disable no-console */
/**
 * 企业微信API-通讯录管理-部门管理
 * https://work.weixin.qq.com/api/doc/90000/90135/90204
 */

const fetch = require('node-fetch');
const debug = require('debug')('ynu-libs:wecom-api-dept:debug');
const warn = require('debug')('ynu-libs:wecom-api-dept:warn');
const { getToken } = require('./wecom-api');

const qyHost = 'https://qyapi.weixin.qq.com/cgi-bin';

/**
 * 创建部门
 * @param {Object} dept 部门，详见：https://work.weixin.qq.com/api/doc/90000/90135/90205
 * @returns dept
 */
const create = async (dept, options) => {
  const token = await getToken(options);
  const res = await fetch(`${qyHost}/department/create?access_token=${token}`, {
    method: 'POST',
    body: JSON.stringify(dept),
  });
  const { errcode, errmsg } = await res.json();
  // 处理错误
  switch (errcode) {
    case 0:
      return 0;
    case 60009:
      warn(`部门名称[${dept.name}]含有非法字符, 不能含有 \\:?*"<>| 等字符`);
      return errcode;
    default:
      warn('create失败::', `${errmsg}(${errcode})`);
      return errcode;
  }
};

/**
 * 更新部门
 * @param {Object} dept 部门，详见：https://work.weixin.qq.com/api/doc/90000/90135/90206
 * @returns dept
 */
const update = async (dept, options) => {
  const token = await getToken(options);
  const res = await fetch(`${qyHost}/department/update?access_token=${token}`, {
    method: 'POST',
    body: JSON.stringify(dept),
  });
  const { errcode, errmsg } = await res.json();
  switch (errcode) {
    case 0:
      break;
    case 60009:
      warn(`update失败::部门名称[${dept.name}]包含不可用字符`, `${errmsg}(${errcode})`);
      break;
    case 60001:
      warn(`update失败::部门名称[${dept.name}]长度超过限制`, `${errmsg}(${errcode})`);
    default:
      warn('update失败::', `${errmsg}(${errcode})`);
  }
  return errcode;
};

/**
 * 获取部门列表
 * https://work.weixin.qq.com/api/doc/90000/90135/90208
 * @param {String} id 父部门id
 * @returns dept
 */
const list = async (id, options) => {
  const token = await getToken(options);
  const res = await fetch(`${qyHost}/department/list?access_token=${token}&id=${id}`, {
    method: 'GET',
  });
  const { errcode, errmsg, department } = await res.json();
  // 处理错误
  switch (errcode) {
    case 0:
      return department;
    case 60123:
      warn(`无效的部门id, 部门[${id}]不存在通讯录中`);
      return [];
    default:
      warn('list失败::', `${errmsg}(${errcode})`);
      return [];
  }
};

/**
 * 删除部门（注：不能删除根部门；不能删除含有子部门、成员的部门）
 * https://work.weixin.qq.com/api/doc/90000/90135/90207
 * @param {String} id 部门id
 * @returns dept
 */
const del = async (id, options) => {
  const token = await getToken(options);
  const res = await fetch(`${qyHost}/department/delete?access_token=${token}&id=${id}`, {
    method: 'GET',
  });
  const { errcode, errmsg } = await res.json();
  if (errcode) warn('del失败::', `${errmsg}(${errcode})`);
  return errcode;
};

module.exports = {
  create,
  update,
  list,
  del,
};
