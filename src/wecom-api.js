/**
 * 企业微信API-通用
 */
const fetch = require('node-fetch');
const { decrypt, getSignature } = require('@wecom/crypto');
const warn = require('debug')('ynu-libs:wecom-api:warn');
const error = require('debug')('ynu-libs:wecom-api:error');
const info = require('debug')('ynu-libs:wecom-api:info');

const {
  CORP_ID, // 企业微信ID
  SECRET, // 管理组secret
  ENCODING_AES_KEY, // 接收消息-EncodingAESKey
} = process.env;
const qyHost = 'https://qyapi.weixin.qq.com/cgi-bin';


/**
 * 获取access_token。
 * @param {String}} secret 用于获取TOKEN的secret，默认为环境变量中的SECRET
 * @returns access_token
 */
const getToken = async (options = {}) => {
  const secret = options.secret || SECRET || options // 兼容4.10.1之前的版本
  const corpId = options.corpId || CORP_ID;

  if (!corpId) {
    error('必须的参数corpId或环境变量CORP_ID(企业ID)未设置.');
    return null;
  }
  if (!secret) {
    error('必须的参数secret未传入,或未设置环境变量SECRET')
    return null;
  }
  info(`正在获取token(secret:${secret})`);
  const res = await fetch(`${qyHost}/gettoken?corpid=${corpId}&corpsecret=${secret}`);
  const result = await res.json();
  if (!result.errcode) {
    info(`获取token成功::${result.access_token}`);
    return result.access_token;
  }

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

/**
 * 接收消息与事件-验证URL有效性
 * @param {String} echostr 加密的字符串
 * @param {Object} options 参数
 *  - @param {Function} success 验证成功后的处理函数，默认为云函数http方式返回
 *  - @param {Function} fail 验证失败后的处理函数，默认为云函数http方式返回
 *  - @param {String} encoding_aes_key 消息接收服务器EncodingAESKey，默认由ENCODING_AES_KEY获取
 */
const verifyUrl = (
  echostr,
  options = {},
) => {
  const encoding_aes_key = options.encoding_aes_key || ENCODING_AES_KEY;
  const corpId = options.corpId || CORP_ID;
  const success = options.success || ((message) => {
    return {
      isBase64Encoded: false,
      statusCode: 200,
      headers: {
        'Content-Type': 'text/text',
      },
      body: message,
    };
  });
  const fail = options.fail || (() => {
    return {
      isBase64Encoded: false,
      statusCode: 401,
      headers: {
        'Content-Type': 'text/text',
      },
    };
 });
  const { message, id } = decrypt(encoding_aes_key, echostr);
  if(id === corpId) {
    info(`URL验证成功, message=${message}`);
    return success(message);
  } else {
    info(`URL验证失败,当前配置corpId(${corpId})与URL中的corpId(${id}不一致)`);
    return fail();
  }
};


module.exports = {
  qyHost,
  getToken,
  code2session,
  verifyUrl,
};

