/**
 * 企业微信API-通用
 */
const fetch = require('node-fetch');
const { decrypt, getSignature } = require('@wecom/crypto');
const warn = require('debug')('ynu-libs:wecom-api:warn');
const error = require('debug')('ynu-libs:wecom-api:error');
const info = require('debug')('ynu-libs:wecom-api:info');
const debug = require('debug')('ynu-libs:wecom-api:debug');
const cache = require('memory-cache');

const {
  CORP_ID, // 企业微信ID
  SECRET, // 管理组secret
  ENCODING_AES_KEY, // 接收消息-EncodingAESKey
} = process.env;
const qyHost = 'https://qyapi.weixin.qq.com/cgi-bin';

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
  verifyUrl,
};

