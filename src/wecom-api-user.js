/**
 * 企业微信API-通讯录管理-成员管理
 * https://work.weixin.qq.com/api/doc/90000/90135/90194
 */
const fetch = require('node-fetch');
const debug = require('debug')('ynu-libs:wecom-api-user:debug');
const warn = require('debug')('ynu-libs:wecom-api-user:warn');
const { getToken } = require('./wecom-api');

const { SECRET } = process.env;

const qyHost = 'https://qyapi.weixin.qq.com/cgi-bin';


/**
 * 获取部门成员
 * @see https://work.weixin.qq.com/api/doc/90000/90135/90200
 * @param {String} id 部门id
 * @param {Boolean} fetchChild 是否递归获取子部门成员
 * @returns 成员列表
 */
const simpleList = async (id, fetchChild = false) => {
  const token = await getToken();
  const res = await fetch(`${qyHost}/user/simplelist?access_token=${token}&department_id=${id}&fetch_child=${fetchChild ? 1 : 0}`, {
    method: 'GET',
  });
  const { errcode, errmsg, userlist } = await res.json();
  debug('simpleList结果长度::', userlist.length);
  if (errcode === 0) return userlist;
  warn('simpleList::出错', `${errmsg}(${errcode})`);
  return [];
};

/**
 * 更新成员
 * @param {Object} dept 成员信息，详见：https://work.weixin.qq.com/api/doc/90000/90135/90197
 * @returns 错误代码
 */
const update = async (user) => {
  const token = await getToken();
  const res = await fetch(`${qyHost}/user/update?access_token=${token}`, {
    method: 'POST',
    body: JSON.stringify(user),
  });
  const { errcode, errmsg } = await res.json();
  if (errcode) warn('update失败::', `${errmsg}(${errcode})`);
  return errcode;
};

/**
 * 创建成员
 * @param {Object} dept 成员信息，详见：https://work.weixin.qq.com/api/doc/90000/90135/90195
 * @returns 错误代码
 */
const create = async (user) => {
  const token = await getToken();
  const res = await fetch(`${qyHost}/user/create?access_token=${token}`, {
    method: 'POST',
    body: JSON.stringify(user),
  });
  const { errcode, errmsg } = await res.json();
  switch (errcode) {
    case 0:
      return 0;
    case 40066:
      warn(`用户create失败(40066)：不合法的部门列表:${user.department}(${errcode})`);
      return errcode;
    case 60104:
      warn(`用户create失败(60104):用户[${user.name}](${user.userid})拟加入部门:${user.department}, 手机号码(${user.mobile})已存在`);
      return errcode;
    case 60103:
      warn(`用户create失败(60103):用户[${user.name}](${user.userid})拟加入部门:${user.department}, 手机号码(${user.mobile})不正确`);
      return errcode;
    default:
      warn('用户create失败::', `${errmsg}(${errcode})`);
      return errcode;
  }
};

/**
 * 读取成员
 * https://work.weixin.qq.com/api/doc/90000/90135/90200
 * @param {String} userid 成员id
 * @returns 成员
 */
const get = async (userid, options = {}) => {
  const secret = options.secret || SECRET;
  const token = await getToken(secret);
  const res = await fetch(`${qyHost}/user/get?access_token=${token}&userid=${userid}`, {
    method: 'GET',
  });
  const user = await res.json();
  const { errcode, errmsg } = user;

  // 处理错误
  switch (errcode) {
    case 0:
      return user;
    case 60111:
      debug('userid不存在::', `userid:${userid}`);
      return null;
    default:
      debug('get失败::', `userid:${userid}, ${errmsg}(${errcode})`);
      return null;
  }
};

module.exports = {
  simpleList,
  update,
  create,
  get,
};
