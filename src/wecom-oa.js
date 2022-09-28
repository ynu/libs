/**
 * 企业微信API-OA
 */
const fetch = require('node-fetch');
const { getToken } = require('./wecom-api');
const warn = require('debug')('ynu-libs:wecom-oa:warn');
const error = require('debug')('ynu-libs:wecom-oa:error');
const info = require('debug')('ynu-libs:wecom-oa:info');

const {
  CORP_ID, // 企业微信ID
  ENCODING_AES_KEY, // 接收消息-EncodingAESKey
  APPROVAL_SECRET,
  SECRET,
} = process.env;
const qyHost = 'https://qyapi.weixin.qq.com/cgi-bin';


/**
 * 获取审批单详情
 * @param {String} sp_no 审批单号
 * @param {String} secret 对应应用的SECRET
 * @returns 审批单详情
 */
const getApprovalDetail = async (sp_no, options = {}) => {
  info(`获取审批详情[${sp_no}]`);
  if (typeof(options) == 'string') options = {
    secret: options,
  }
  const secret = options.secret || APPROVAL_SECRET || SECRET;
  const corpId = options.corpId || CORP_ID;
  const token = await getToken(options);
  const res = await fetch(`${qyHost}/oa/getapprovaldetail?access_token=${token}`, {
    method: 'POST',
    body: JSON.stringify({
      sp_no,
    }),
  });
return res.json();
}

/**
 * 获取审批单提交的数据
 * @param {String} sp 审批单详情数据
 * @returns 审批单提交数据
 */
const getApplyData = sp => {
  let result = {};
  sp.info.apply_data.contents.forEach(({ control, id, title, value}) => {
    result[id] = {
      id,
      control,
      text: title[0].text,
    };
    switch (control) {
      case 'Selector':
        result[id].value = value.selector.options.map(opt => opt.value[0].text);
        break;
      case 'Text':
      case 'Textarea':
        result[id].value = value.text;
        break;
      case 'Number':
        result[id].value = parseFloat(value.new_number);
        break;
      case 'Money':
        result[id].value = parseFloat(value.new_money);
      case 'Tips':
        result[id].value = '';
        break;
      case 'Date':
        result[id].value = value.date;
        break;
      case 'Contact':
      case 'File':
      case 'Table':
      case 'Attendance':
      case 'Vacation':
      case 'PunchCorrection':
      case 'DateRange':
      default:
        result[id].value = value;
    }
  });
  return result;
}


module.exports = {
  getApprovalDetail,
  getApplyData,
};