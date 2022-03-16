/**
 * 企业微信API-通用
 */
const fetch = require('node-fetch');
const warn = require('debug')('ynu-libs:wecom-api:warn');
const error = require('debug')('ynu-libs:wecom-api:error');
const info = require('debug')('ynu-libs:wecom-api:info');

const {
  CORP_ID, // 企业微信ID
  SECRET, // 管理组secret
} = process.env;
const qyHost = 'https://qyapi.weixin.qq.com/cgi-bin';


/**
 * 获取access_token。
 * @param {String}} secret 用于获取TOKEN的secret，默认为环境变量中的SECRET
 * @returns access_token
 */
const getToken = async (secret = SECRET) => {
  if (!CORP_ID) {
    error('环境变量CORP_ID（企业ID）未设置.');
    return null;
  }
  if (!secret) {
    error('必须的参数secret未传入，或未设置环境变量SECRET')
    return null;
  }
  const res = await fetch(`${qyHost}/gettoken?corpid=${CORP_ID}&corpsecret=${secret}`);
  const result = await res.json();
  if (!result.errcode) return result.access_token;

  warn('getToken出错:', result);
  return null;
};


/**
 * 获取session和userid
 * @param {String} code 临时登录凭证
 * @see https://developers.weixin.qq.com/miniprogram/dev/dev_wxwork/dev-doc/qywx-api/login/code2session.html
 */
const code2session = async (code) => {
  const access_token = await getToken();
  if (!access_token) {
    error('获取access_token失败');
    return {};
  }
  info(`access_token:${access_token}`);
  
  const res = await fetch(`${qyHost}/miniprogram/jscode2session?access_token=${access_token}&js_code=${code}&grant_type=authorization_code`);
  const result = await res.json();
  if (!result.errcode) return result;

  error('code2session出错:', result);
  return {};
}


module.exports = {
  qyHost,
  getToken,
  code2session,
};

