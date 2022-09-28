/* eslint-disable camelcase */
/**
 * YNU ESOP API
 * ESOP API通用参数：
 *  - pageSize. 分页大小，最大1000
 *  - pgeNum. 页码，从1开始
 */
const fetch = require('node-fetch');
const AbortController = require('abort-controller');
const debug = require('debug')('ynu-libs:esop-api:debug');
const warn = require('debug')('ynu-libs:esop-api:warn');

/**
 * 从环境变量读取密钥等私密字段
 */
const { ESOP_APPID, ESOP_TOKEN } = process.env;
const HOST = 'https://apis.ynu.edu.cn/';


/**
  * 带timeout功能的fetch
  * @param {String} url 请求的Url
  * @param {Object}} options fetch的options参数
  * @param {Number}} timeout 超时时间，默认为10000ms
  * @returns res
  */
const fetchWithTimeout = async (url, options, timeout = 10000) => {
  /**
    * fetch无法设置请求超时时间，需要使用abort信号来进行超时处理
    * 详见：https://github.com/node-fetch/node-fetch#request-cancellation-with-abortsignal
    */
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeout); // 超时时间为10秒
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        ...options,
      });
      resolve(res);
    } catch (error) {
      reject(error);
    } finally {
      clearTimeout(timer); // 最终必须重置计时器
    }
  });
};

/**
  * 处理ESOP的返回数据
  * @param {Object} res fetch结果
  * @param {Boolean} singleData 返回结果是否是单一数据，默认为true
  * @returns 返回的数据
  */
const handleEsopResult = async (res, singleData = true) => {
  let esopResult = {
    ret: -1,
    data: null,
    msg: '',
  };
  switch (res.status) {
    case 200: {
      const result = await res.json();
      debug('ESOP::RESULT::total::', result.pageInfo.total);
      esopResult = {
        ...esopResult,
        ret: 0,
        data: singleData ? result.dataSet[0] : result.dataSet,
        pageInfo: result.pageInfo,
      };
      break;
    }
    case 401: {
      const err = await res.json();
      warn('Handle ESOP ERROR::', err);
      esopResult.msg = '此功能暂时不可用(HTTP Status:401)';
      break;
    }
    case 400: {
      warn(ESOP_APPID, ESOP_TOKEN);
      warn('res::', res.statusText);
      esopResult.msg = `此功能暂时不可用(HTTP Status:400, ${res.statusText})`;
      break;
    }
    default: {
      warn('Handle ESOP ERROR ====================');
      warn('res::', res.status);
      esopResult.msg = '此功能暂时不可用';
      break;
    }
  }
  return esopResult;
};

/**
 * 根据教工号查询教职工人事基本信息
 * @see http://docs.api.ynu.edu.cn/esop/api-jzg/query_jzg_jbxx.html
 * @param {String} zgh 教工号
 * @returns 响应对象
 * {
 *    ret,
 *    data,
 *    msg,
 * }
 */
const jzgById = async (zgh) => {
  const url = `${HOST}do/api/call/info_jzg_rs`; // 查询教职工信息的api

  let ret = -1;
  let data = null;
  let msg = '';
  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        appid: ESOP_APPID,
        accessToken: ESOP_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        zgh,
      }),
    });
    debug('res1::', res.statusText);
    switch (res.status) {
      case 200: {
        const result = await res.json();
        ret = 0;
        // eslint-disable-next-line prefer-destructuring
        data = result.dataSet[0];
        break;
      }
      case 401: {
        const err = await res.json();
        warn(err);
        warn(ESOP_APPID, ESOP_TOKEN);
        msg = '此功能暂时不可用';
        break;
      }
      default: {
        warn('fetch ERROR ====================');
        warn('res::', res.status);
        msg = '此功能暂时不可用';
        break;
      }
    }
  } catch (error) {
    // if (error instanceof fetch.AbortError) {
    msg = '连接超时';
    // }
  }
  return {
    ret,
    data,
    msg,
  };
};

/**
 * 获取人事系统组织机构数据
 * @see http://docs.api.ynu.edu.cn/esop/api-jzg/xzjg_jzg.html
 * @returns 响应对象
 * {
 *    ret,
 *    data,
 *    msg,
 * }
 */
const rs_zzjg = async (options = {}) => {
  const appid = options.appid || ESOP_APPID;
  const accessToken = options.accessToken || ESOP_TOKEN;

  const url = `${HOST}do/api/call/xzjg_jzg`;

  let result = {
    ret: -1,
    data: null,
    msg: '',
  };
  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        appid,
        accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    result = await handleEsopResult(res, false);
  } catch (error) {
    // if (error instanceof fetch.AbortError) {
    warn('ERROR::', error);
    result.msg = `连接超时(${url})`;
    // }
  }
  return result;
};

/**
 * 根据所在单位代码由人事系统获取教职工列表
 * @see http://docs.api.ynu.edu.cn/esop/api-jzg/query_jzg_jbxx.html
 * @param {String} szdwdm 所在单位代码
 * @returns 教职工列表
 */
const list_rs_jzg_by_dw = async (szdwdm) => {
  const url = `${HOST}do/api/call/query_jzg`;

  let result = {
    ret: -1,
    data: null,
    msg: '',
  };
  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        appid: ESOP_APPID,
        accessToken: ESOP_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        szdwdm,
      }),
    });
    result = await handleEsopResult(res, false);
  } catch (error) {
    // if (error instanceof fetch.AbortError) {
    warn('ERROR::', error);
    result.msg = `连接超时(${url})`;
    // }
  }
  return result;
};

/**
 * 根据所在单位代码由人事系统获取在职教职工列表
 * @see http://docs.api.ynu.edu.cn/esop/api-jzg/query_jzg_jbxx.html
 * @param {String} szdwdm 所在单位代码
 * @returns 教职工列表
 */
const list_rs_zzjzg_by_dw = async (szdwdm) => {
  const result = await list_rs_jzg_by_dw(szdwdm);
  if (result.data) {
    return {
      ...result,
      data: result.data.filter(jzg => jzg.DQZTDM === '22'),
    };
  }
  return result;
};

/**
 * 查询教职工信息
 * @param {Object} parmas 查询参数 @see http://docs.api.ynu.edu.cn/esop/api-jzg/query_jzg_jbxx.html
 */
const query_jzg = async (params, options) => {
  const appid = options.appid || ESOP_APPID;
  const accessToken = options.accessToken || ESOP_TOKEN;
  const url = `${HOST}do/api/call/query_jzg`;

  let result = {
    ret: -1,
    data: null,
    msg: '',
  };
  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        appid,
        accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    result = await handleEsopResult(res, false);
  } catch (error) {
    // if (error instanceof fetch.AbortError) {
    warn('ERROR::', error);
    result.msg = `连接超时(${url})`;
    // }
  }
  return result;
};

/**
  * 查询ids帐号基本信息
  * @param {String} userid 帐号id
  * @returns 帐号信息
  */
const idsUserById = async (userid, options = {}) => {
  const appid = options.appid || ESOP_APPID;
  const accessToken = options.accessToken || ESOP_TOKEN;

  const url = `${HOST}do/api/call/zhjbxx_tysfrz`;
  let result = {
    ret: -1,
    data: null,
    msg: '',
  };
  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        appid,
        accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userid,
      }),
    });
    result = await handleEsopResult(res);
  } catch (error) {
    // if (error instanceof fetch.AbortError) {
    warn('ERROR::', error);
    result.msg = `连接超时(${url})`;
    // }
  }
  return result;
};

/**
  * 根据院系代码由本科教务系统获取特定年级本科生列表
  * @param {String} yxdm 所在单位代码
  * @param {Number} xznj 现在年级
  * @param {String} sfzj 是否在籍，1为是，0为否，默认为1。
  * @returns 本科生列表
  */
// eslint-disable-next-line camelcase
const list_bks_by_yx_nj = async (yxdm, xznj, sfzj = '1') => {
  const url = `${HOST}do/api/call/query_bks`;

  let result = {
    ret: -1,
    data: null,
    msg: '',
  };
  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        appid: ESOP_APPID,
        accessToken: ESOP_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        yxdm,
        xznj,
        sfzj, // 是否在籍
      }),
    });
    result = await handleEsopResult(res, false);
  } catch (error) {
    // if (error instanceof fetch.AbortError) {
    warn('ERROR::', error);
    result.msg = `连接超时(${url})`;
    // }
  }
  return result;
};

const query_bks = async (params = {}, options = {}) => {
  const appid = options.appid || ESOP_APPID;
  const accessToken = options.accessToken || ESOP_TOKEN;

  const url = `${HOST}do/api/call/query_bks`;

  let result = {
    ret: -1,
    data: null,
    msg: '',
  };
  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        appid,
        accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    result = await handleEsopResult(res, false);
  } catch (error) {
    // if (error instanceof fetch.AbortError) {
    warn('ERROR::', error);
    result.msg = `连接超时(${url})`;
    // }
  }
  return result;
}

const query_yjs = async (params = {}, options = {}) => {
  const appid = options.appid || ESOP_APPID;
  const accessToken = options.accessToken || ESOP_TOKEN;

  const url = `${HOST}do/api/call/query_yjs`;

  let result = {
    ret: -1,
    data: null,
    msg: '',
  };
  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        appid,
        accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    result = await handleEsopResult(res, false);
  } catch (error) {
    // if (error instanceof fetch.AbortError) {
    warn('ERROR::', error);
    result.msg = `连接超时(${url})`;
    // }
  }
  return result;
}

/**
 * 根据学号获取本科生信息
 * @param {String} xh 学号
 * @returns 本科生信息
 * {
 *  ret, data, msg,
 * }
 */
const bksByXh = async (xh) => {
  const url = `${HOST}do/api/call/query_bks`;

  let result = {
    ret: -1,
    data: null,
    msg: '',
  };
  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        appid: ESOP_APPID,
        accessToken: ESOP_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        xh,
      }),
    });
    result = await handleEsopResult(res);
  } catch (error) {
    // if (error instanceof fetch.AbortError) {
    warn('ERROR::', error);
    result.msg = `连接超时(${url})`;
    // }
  }
  return result;
};

/**
 * 根据院系代码、年级获取在校研究生
 * @param {String} yxdm 院系代码
 * @param {Number} nj 年级
 * @returns 研究生列表
 */
const list_yjs_by_yx_nj = async (yxdm, nj) => {
  const url = `${HOST}do/api/call/query_yjs`;

  let result = {
    ret: -1,
    data: null,
    msg: '',
  };
  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        appid: ESOP_APPID,
        accessToken: ESOP_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        yxdm,
        nj,
        sfzx: '1', // 是否在校
      }),
    });
    result = await handleEsopResult(res, false);
  } catch (error) {
    // if (error instanceof fetch.AbortError) {
    console.log('ERROR::', error);
    result.msg = `连接超时(${url})`;
    // }
  }
  return result;
};

/**
 * 根据学号获取研究生信息
 * @param {String} xh 学号
 * @returns 研究生信息
 * {
 *  ret, data, msg,
 * }
 */
const yjsByXh = async (xh) => {
  const url = `${HOST}do/api/call/query_yjs`;

  let result = {
    ret: -1,
    data: null,
    msg: '',
  };
  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        appid: ESOP_APPID,
        accessToken: ESOP_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        xh,
      }),
    });
    result = await handleEsopResult(res);
  } catch (error) {
    // if (error instanceof fetch.AbortError) {
    warn('ERROR::', error);
    result.msg = `连接超时(${url})`;
    // }
  }
  return result;
};

/**
 * 根据用户ID，获取与此ID同组的其他帐号。
 * @param {String} userid 用户ID
 * @returns
 * 获取成功返回此ID同组的所有ID的列表；若未绑定其他帐号则返回空数组。
 * 若出现异常则返回null
 */
const ids_grouped_users = async(userid, options = {}) => {
  const appid = options.appid || ESOP_APPID;
  const accessToken = options.accessToken || ESOP_TOKEN;

  const url = `${HOST}do/api/call/tzsyyh_tysfrz`;

  let result = {
    ret: -1,
    data: null,
    msg: '',
  };
  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        appid,
        accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userid,
      }),
    });
    result = await handleEsopResult(res, false);
  } catch (error) {
    // if (error instanceof fetch.AbortError) {
    warn('ERROR::', error);
    result.msg = `连接超时(${url})`;
    // }
  }
  return result;
}

/**
 * 获取在籍本科生人数
 * @returns 执行成功时，返回在籍本科生人数；执行失败时返回0；
 * @see http://docs.api.ynu.edu.cn/esop/api-bkjw/counter_bks.html#统计本科生数量
 */
const bks_count = async () => {
  const url = `${HOST}do/api/call/count_bks`;

  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        appid: ESOP_APPID,
        accessToken: ESOP_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sfzj: '1',
      }),
    });
    const result = await handleEsopResult(res);
    if (!result.ret) return result.data.RESULT;
    else {
      warn(`获取在籍本科生人数失败:${result.msg}`);
      return 0;
    }
  } catch (error) {
    // if (error instanceof fetch.AbortError) {
    warn('ERROR::', error);
    result.msg = `连接超时(${url})`;
    // }
  }
}

/**
 * 获取在校研究生人数
 * @returns 执行成功时，返回在校研究生人数；执行失败时返回0；
 */
 const yjs_count = async () => {
  const url = `${HOST}do/api/call/count_yjs`;

  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        appid: ESOP_APPID,
        accessToken: ESOP_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sfzx: "1",
      }),
    });
    const result = await handleEsopResult(res);
    if (!result.ret) return result.data.RESULT;
    else {
      warn(`获取在校研究生人数失败:${result.msg}`);
      return 0;
    }
  } catch (error) {
    // if (error instanceof fetch.AbortError) {
    warn('ERROR::', error);
    result.msg = `连接超时(${url})`;
    // }
  }
}

/**
 * 获取教职工人数
 * @returns 执行成功时，返回教职工人数；执行失败时返回0；
 */
 const jzg_count = async (options = {
   yrfsdm: '', // 用人方式代码
   dqztdm: '', // 当前状态代码
 }) => {
  const url = `${HOST}do/api/call/count_jzg`;

  // 构造传入的参数
  const body = {};
  if (options.yrfsdm) body.yrfsdm = options.yrfsdm;
  if (options.dqztdm) body.dqztdm = options.dqztdm;

  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        appid: ESOP_APPID,
        accessToken: ESOP_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const result = await handleEsopResult(res);
    if (!result.ret) return result.data.RESULT;
    else {
      warn(`jzg_count失败:${result.msg}`);
      return 0;
    }
  } catch (error) {
    // if (error instanceof fetch.AbortError) {
    warn('ERROR::', error);
    result.msg = `连接超时(${url})`;
    // }
  }
}

/**
 * 根据用户ID获取用户已绑定的手机号（若用户设置了身份绑定，则将获取其绑定的账号的手机号）
 * @param {String} userid 用户ID
 * @returns
 * 用于的手机号码，若为绑定手机号，则返回空字符串。
 */
const ids_get_mobile_phone = async (userid, options) => {

  let result = {
    ret: -1,
    data: null,
    msg: '',
  };

  // // 优先由给定的帐号获取手机号
  const result1 = await idsUserById(userid, options);
  if (!result1.data) {
    warn(`esopApi.idsUserById(${userid})获取用户信息时发生错误`);
    return result;
  }
  if (result1.data.TELEPHONENUMBER) {
    return {
      ret: 0,
      data: result1.data.TELEPHONENUMBER,
    };
  }
  // 若给定的帐号没有绑定手机号，则检查用户是否进行了身份绑定
  const result2 = await ids_grouped_users(userid, options);
  if (!result2.data) {
    warn(`esopApi.ids_grouped_users(${userid})获取用户绑定信息时发生错误`);
    return result2;
  }
  for (let i = 0; i < result2.data.length; i++) {
    const user = result2.data[i];
    if (user.USERID === userid) continue;
    // const result3 = await idsUserById(user.USERID);
    // if (!result3.data) {
    //   warn(`esopApi.idsUserById(${user.USERID})获取用户信息时发生错误`);
    //   return result;
    // }
    if (user.TELEPHONENUMBER) {
      return {
        ret: 0,
        data: user.TELEPHONENUMBER,
      };
    }
  }
  return {
    ret: 0,
    data: '',
  };
}

/**
 * 获取一卡通POS机信息（含最后记账日期）
 * @returns 返回POS机列表
 */
 const posdevice_ecard = async (options = {
   pageSize: 20,
   pageNum: 1,
 }) => {
  const url = `${HOST}do/api/call/posdevice_ecard`;

  options.pageSize = options.pageSize || 20;
  options.pageNum = options.pageNum || 1;

  try {
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: {
        appid: ESOP_APPID,
        accessToken: ESOP_TOKEN,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...options,
      }),
    });
    const result = await handleEsopResult(res, false);
    return result;
  } catch (error) {
    // if (error instanceof fetch.AbortError) {
    warn('获取一卡通POS机信息（含最后记账日期）ERROR::', error);
    result.msg = `连接超时(${url})`;
    return result;
    // }
  }
}

module.exports = {
  fetchWithTimeout,
  handleEsopResult,
  jzgById,
  rs_zzjg,
  list_rs_zzjzg_by_dw,
  idsUserById,
  list_bks_by_yx_nj,
  bksByXh,
  list_yjs_by_yx_nj,
  yjsByXh,
  query_jzg,
  ids_grouped_users,
  ids_get_mobile_phone,
  list_rs_jzg_by_dw,
  bks_count,
  yjs_count,
  jzg_count,
  posdevice_ecard,
  query_bks,
  query_yjs,
  HOST,
  ESOP_APPID,
  ESOP_TOKEN,
};
