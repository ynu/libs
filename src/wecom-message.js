/**
 * 企业微信API-接收和发送消息
 */
 const fetch = require('node-fetch');
 const xml2js = require('xml2js');
 const { getToken } = require('./wecom-api');
 const { decrypt, getSignature } = require('@wecom/crypto');
 const warn = require('debug')('ynu-libs:wecom-message:warn');
 const error = require('debug')('ynu-libs:wecom-message:error');
 const info = require('debug')('ynu-libs:wecom-message:info');
 
 const {
   CORP_ID, // 企业微信ID
   ENCODING_AES_KEY, // 接收消息-EncodingAESKey
   SECRET,
 } = process.env;
 const qyHost = 'https://qyapi.weixin.qq.com/cgi-bin';
 

/**
 * 解析接收到的数据包
 * @param {String} xml XML数据
 */
const parseMessage = async (xml, encoding_aes_key = ENCODING_AES_KEY) => {
  const parser = new xml2js.Parser();

  // 将消息体解析为JSON
  const result = await parser.parseStringPromise(xml);

  // 对加密的消息进行解密
  const { message } = decrypt(encoding_aes_key, result.xml.Encrypt[0]);

  // 将消息块解析为JSON
  const messageJson = await parser.parseStringPromise(message);

  let json = {
    ...messageJson.xml,
    ToUserName: messageJson.xml.ToUserName[0],
    FromUserName: messageJson.xml.FromUserName[0],
    CreateTime: parseInt(messageJson.xml.CreateTime[0], 10),
    MsgType: messageJson.xml.MsgType[0],
  };

  // 以下字段不一定有，要单独处理
  if (messageJson.xml.AgentID) json.AgentID =  messageJson.xml.AgentID[0];

  // 根据消息类型优化JSON
  info(`按消息类型(MsgType)进行解析:${json.MsgType}`);
  switch (json.MsgType) {
    case 'event':
      json = {
        ...json,
        ...refineEventFromXmlJson(json),
      };
      break;
  }

  return json;
}

/**
 * 针对事件消息，优化由XML解析的JSON结构
 * @param {String} json 由XML解析的JSON结构
 */
const refineEventFromXmlJson = (json) => {
  let result = {
    ...json,
    Event: json.Event[0],
  };

  // 根据事件类型优化事件参数
  info(`按事件类型(event)进行解析:${result.Event}`);
  switch (result.Event) {
    case 'sys_approval_change':   // 审批申请状态变化
      result = {
        ...result,
        ApprovalInfo: refineApprovalInfoFromXmlJson(result.ApprovalInfo[0]),
      };
      break;
    case 'change_contact':      // 通讯录变更通知
      result = {
        ...result,
        ...refineContactFromXmlJson(result),
      }
      break;
    case 'template_card_event':
      result = {
        ...result,
        ...refineTemplateCardEventInfoFromXmlJson(result),
      }
      break;
  }
  return result;
}


/**
 * 优化ApprovalInfo数据JSON结构
 * @param {String} json ApprovalInfo数据的XML结构
 * @returns 
 */
const refineApprovalInfoFromXmlJson = (json) => {
  let result = {
    ...json,
    SpNo: json.SpNo[0],
    SpName: json.SpName[0],
    SpStatus: parseInt(json.SpStatus[0], 10),
    TemplateId: json.TemplateId[0],
    ApplyTime: parseInt(json.ApplyTime[0], 10),
    Applyer: {
      UserId: json.Applyer[0].UserId[0],
      Party: json.Applyer[0].Party[0],
    },
    SpRecord: {
      SpStatus: parseInt(json.SpRecord[0].SpStatus[0], 10),
      ApproverAttr: parseInt(json.SpRecord[0].ApproverAttr[0], 10),
      Details: {
        Approver: {
          UserId: json.SpRecord[0].Details[0].Approver[0].UserId[0],
        },
        Speech: json.SpRecord[0].Details[0].Speech[0],
        SpStatus: parseInt(json.SpRecord[0].Details[0].SpStatus[0], 10),
        SpTime: parseInt(json.SpRecord[0].Details[0].SpTime[0], 10),
      },
    },
    Notifyer: json.Notifyer ? {
      UserId: json.Notifyer[0].UserId ? json.Notifyer[0].UserId[0] : '',
    } : null,
    StatuChangeEvent: parseInt(json.StatuChangeEvent[0], 10),
  };
  return result;
}

/**
 * 
 * @param {String} json User数据的Xml结构
 */
const refineContactFromXmlJson = (json) => {
  info(`当前事件(change_contact)的ChangeType为:${json.ChangeType[0]}`);
  let result = {
    ...json,
    ChangeType: json.ChangeType[0],
  }

  // 以下数据字段不一定出现，根据情况处理
  // 成员变更
  if (json.UserID) result.UserID = json.UserID[0];
  if (json.Name) result.Name = json.Name[0];
  if (json.Department) result.Department = json.Department[0].split(',');
  if (json.MainDepartment) result.MainDepartment = json.MainDepartment[0];
  if (json.IsLeader) result.IsLeader = parseInt(json.IsLeader[0],10);
  if (json.IsLeaderInDept) result.IsLeaderInDept = json.IsLeaderInDept[0].split(',').map(lid => parseInt(lid, 10));
  if (json.DirectLeader) result.DirectLeader = json.DirectLeader[0].split(',');
  if (json.Position) result.Position = json.Position[0];
  if (json.Mobile) result.Mobile = json.Mobile[0];
  if (json.Gender) result.Gender = parseInt(json.Gender[0], 10);
  if (json.Email) result.Email = json.Email[0];
  if (json.BizMail) result.BizMail = json.BizMail[0];
  if (json.Status) result.Status = json.Status[0];
  if (json.Avatar) result.Avatar = json.Avatar[0];
  if (json.Alias) result.Alias = json.Alias[0];
  if (json.Telephone) result.Telephone = json.Telephone[0];
  if (json.Address) result.Address = json.Address[0];
  if (json.ExtAttr) result.ExtAttr = json.ExtAttr[0].Item.map(item => {
    let res = {
      ...item,
      Name: item.Name[0],
      Type: parseInt(item.Type[0], 10),
    };
    if (item.Value) res.Value = item.Value[0];
    if (item.Text) res.Text = item.Text[0].Value[0];
    if (item.Web) res.Web = {
      Title: item.Web[0].Title,
      Url: item.Web[0].Url,
    };
    return res;
  });

  // 部门变更
  if (json.Id) result.Id = parseInt(json.Id[0], 10);
  if (json.ParentId) result.ParentId = parseInt(json.ParentId[0], 10);
  if (json.Order) result.Order = parseInt(json.Order[0], 10);

  // 标签变更
  if (json.TagId) result.TagId = parseInt(json.TagId[0], 10);
  if (json.AddUserItems) result.AddUserItems = json.AddUserItems[0].split(',');
  if (json.DelUserItems) result.DelUserItems = json.DelUserItems[0].split(',');
  if (json.AddPartyItems) result.AddPartyItems = json.AddPartyItems[0].split(',').map(lid => parseInt(lid, 10));
  if (json.DelPartyItems) result.DelPartyItems = json.DelPartyItems[0].split(',').map(lid => parseInt(lid, 10));
  
  return result;
}

const refineTemplateCardEventInfoFromXmlJson = (json) => {
  let result = {
    ...json,
    EventKey: json.EventKey[0],
    TaskId: json.TaskId[0],
    CardType: json.CardType[0],
    ResponseCode: json.ResponseCode[0],
    SelectedItems: json.SelectedItems[0].SelectedItem,
  }
  return result;
}

/**
 * 将消息类型值转换为文本
 * @param {String} msgType 消息类型值
 * @returns 消息类型文本
 */
const msgTypeToText = (msgType) => {
  switch (msgType) {
    case 'event':
      return '事件消息'
    case 'text':
      return '文本消息'
    default:
      return `未定义(${msgType})`;
  }
}

/**
 * 将事件类型值转换为文本
 * @param {String} event 事件类型值
 * @returns 事件类型文本
 */
const eventTypeToText = (event) => {
  switch (event) {
    case 'subscribe':
      return '关注'
    case 'unsubscribe':
      return '取消关注'
    case 'sys_approval_change':
      return '审批申请状态变化回调通知'
    case 'change_contact':
      return '通讯录回调通知';
    default:
      return `未定义(${event})`
  }
}

/**
 * 发送消息到企业微信
 * @param {Object} message 待发送的消息
 * @param {Object} options 参数
 *  - secret 用于发送消息的secret
 *  - enable_duplicate_check 是否开启重复消息检查，0表示否，1表示是，默认0
 *  - enable_id_trans 表示是否开启id转译，0表示否，1表示是，默认0
 */
const send = async (message, options = {}) => {
  const secret = options.secret || SECRET;
  const enable_duplicate_check = options.enable_duplicate_check || 0
  const enable_id_trans = options.enable_id_trans || 0;
  const token = await getToken(secret);
  const res = await fetch(`${qyHost}/message/send?access_token=${token}`, {
    method: 'POST',
    body: JSON.stringify({
      ...message,
      enable_id_trans,
      enable_duplicate_check,
    }),
  });
  const result = await res.json();
  if (result.errcode) {
    error(`发送消息失败:${result.errmsg}(${result.errcode})`);
  } else {
    info(`消息发送成功`);
  }
  return result;
};

/**
 * 发送文本消息
 * @param {String} to 接收者
 * @param {Number|String} agentid 接收应用ID
 * @param {String} content 消息内容
 * @param {Object} options 参数
 *  - secret 用于发送消息的secret
 *  - safe 表示是否是保密消息，0表示可对外分享，1表示不能分享且内容显示水印，默认为0
 */
const sendText = async (to, agentid, content, options = {}) => {
  const safe = options.safe || 0;
  const message = {
    ...to,
    agentid,
    msgtype: 'text',
    safe,
    text: { content },
  };
  return send(message, options);
};

const sendTemplateCard = async (to, agentid, template_card, options = {}) => {
  const message = {
    ...to,
    msgtype: 'template_card',
    agentid,
    template_card,
  };
  return send(message, options);
}

const sendTextCard = async (to, agentid, textcard, options = {}) => {
  const message = {
    ...to,
    msgtype: 'textcard',
    agentid,
    textcard,
  };
  return send(message, options);
}

const sendMarkdown = async (to, agentid, content, options = {}) => {
  const message = {
    ...to,
    msgtype: 'markdown',
    agentid,
    markdown: {
      content,
    },
  };
  return send(message, options);
}
 
 
 module.exports = {
   parseMessage,
   msgTypeToText,
   eventTypeToText,
   send,
   sendText,
   sendTemplateCard,
   sendMarkdown,
   sendTextCard,
 };
 
 