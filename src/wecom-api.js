/**
 * 企业微信API-通用
 */
const fetch = require('node-fetch');
const warn = require('debug')('ynu-libs:wecom-api:warn');

const {
  CORP_ID, // 企业微信ID
  SECRET, // 管理组secret
} = process.env;
const qyHost = 'https://qyapi.weixin.qq.com/cgi-bin';


/**
  * 获取token
  */
const getToken = async () => {
  const res = await fetch(`${qyHost}/gettoken?corpid=${CORP_ID}&corpsecret=${SECRET}`);
  const result = await res.json();
  if (!result.errcode) return result.access_token;

  warn('getToken出错：', result);
  return null;
};


module.exports = {
  getToken,
};

