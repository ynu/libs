/**
 * 企业微信API-通讯录管理-标签管理
 * @see https://open.work.weixin.qq.com/api/doc/90000/90135/90209
 */
const fetch = require('node-fetch');
// const debug = require('debug')('ynu-libs:wecom-api-tag:debug');
const warn = require('debug')('ynu-libs:wecom-api-tag:warn');
const { getToken } = require('./wecom-api');

const qyHost = 'https://qyapi.weixin.qq.com/cgi-bin';


/**
 * 增加标签成员
 * @param {Number} tagid 标签ID
 * @param {Array} userlist 用户ID列表
 * @param {Array} partylist 部门ID列表
 * @returns 错误代码
 */
const addTagUsers = async (tagid, userlist, partylist = []) => {
  const token = await getToken();
  const res = await fetch(`${qyHost}/tag/addtagusers?access_token=${token}`, {
    method: 'POST',
    body: JSON.stringify({
      tagid,
      userlist,
      partylist,
    }),
  });
  const { errcode, errmsg } = await res.json();
  switch (errcode) {
    case 0:
      return 0;
    case 40070:
      warn(`addTagUsers失败：all list invalid:${userlist},${partylist}`);
      return errcode;
    default:
      warn('addTagUsers失败::', `${errmsg}(${errcode})`);
      return errcode;
  }
};

module.exports = {
  addTagUsers,
};
