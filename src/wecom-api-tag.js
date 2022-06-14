/**
 * 企业微信API-通讯录管理-标签管理
 * @see https://open.work.weixin.qq.com/api/doc/90000/90135/90209
 */
const fetch = require('node-fetch');
const info = require('debug')('ynu-libs:wecom-api-tag:info');
const debug = require('debug')('ynu-libs:wecom-api-tag:debug');
const warn = require('debug')('ynu-libs:wecom-api-tag:warn');
const { getToken } = require('./wecom-api');

const qyHost = 'https://qyapi.weixin.qq.com/cgi-bin';

const { CONTACTS_SECRET, SECRET } = process.env;

/**
 * 增加标签成员
 * @param {Number} tagid 标签ID
 * @param {Array} userlist 用户ID列表
 * @param {Array} partylist 部门ID列表
 * @returns 错误代码
 */
const addTagUsers = async (tagid, userlist, partylist = []) => {
  // 由于只能由通讯录同步应用操作全局标签，此处使用通讯录同步的secret
  debug('getToken from secret::', CONTACTS_SECRET || SECRET);
  const token = await getToken(CONTACTS_SECRET || SECRET);
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
    case 81011:
      warn('addTagUsers失败：无权限操作标签（81011）。请将通讯录同步secret设置给环境变量CONTACTS_SECRET。');
      return errcode;
    default:
      warn('addTagUsers失败::', `${errmsg}(${errcode})`);
      return errcode;
  }
};

/**
 * 创建标签
 * @param {String}} tagname 标签名称
 * @param {String}} tagid 标签id，可选
 * @returns
 */
const create = async (tagname, tagid) => {
  // 由于只能由通讯录同步应用操作全局标签，此处使用通讯录同步的secret
  debug('getToken from secret::', CONTACTS_SECRET || SECRET);
  const token = await getToken(CONTACTS_SECRET || SECRET);
  const res = await fetch(`${qyHost}/tag/create?access_token=${token}`, {
    method: 'POST',
    body: JSON.stringify({
      tagname,
      tagid,
    }),
  });
  const { errcode, errmsg } = await res.json();
  switch (errcode) {
    case 0:
      return 0;
    case 40068:
      warn(`create失败：指定的ID（${tagid}）已存在`);
      return errcode;
    case 81011:
      warn('create失败：无权限操作标签（81011）。请将通讯录同步secret设置给环境变量CONTACTS_SECRET。');
      return errcode;
    default:
      warn('create失败::', `${errmsg}(${errcode})`);
      return errcode;
  }
};

const get = async (tagid, options) => {
  info(`获取标签(${tagid})成员`);
  const secret = options.secret || SECRET;
  const token = await getToken(secret);
  const res = await fetch(`${qyHost}/tag/get?access_token=${token}&tagid=${tagid}`);
  const result = await res.json();
  const { errcode, errmsg } = result;
  switch (errcode) {
    case 0:
      return result;
    default:
      warn('get失败::', `${errmsg}(${errcode})`);
      return {
        tagname: '',
        userlist: [],
        partylist: [],
      };
  }
}

const delUsersFromTag = async (tagid, options) => {
  info(`删除标签${tagid}成员`);
  const secret = options.secret || SECRET;
  const { userlist, partylist } = options;
  const token = await getToken(secret);
  const body = { tagid };
  if (userlist) body.userlist = userlist;
  if (partylist) body.partylist = partylist;
  const res = await fetch(`${qyHost}/tag/deltagusers?access_token=${token}`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  const { errcode, errmsg } = await res.json();
  switch (errcode) {
    case 0:
      return 0;
    case 40070:
      warn(`指定的标签范围结点全部无效(40070)`);
      return errcode;
    default:
      warn('删除标签用户失败::', `${errmsg}(${errcode})`);
      return errcode;
  }
}

module.exports = {
  addTagUsers,
  create,
  get,
  delUsersFromTag,
};
