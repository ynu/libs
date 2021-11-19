/* eslint-disable camelcase */
/**
 * YNU ESOP API
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
      warn(ESOP_APPID, ESOP_TOKEN);
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
const rs_zzjg = async () => {
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
        appid: ESOP_APPID,
        accessToken: ESOP_TOKEN,
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
 * 根据所在单位代码由人事系统获取在职教职工列表
 * @see http://docs.api.ynu.edu.cn/esop/api-jzg/query_jzg_jbxx.html
 * @param {String} szdwdm 所在单位代码
 * @returns 教职工列表
 */
const list_rs_zzjzg_by_dw = async (szdwdm) => {
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
        dqztdm: '22', // 在职状态
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
 * 查询教职工信息
 * @param {Object} parmas 查询参数 @see http://docs.api.ynu.edu.cn/esop/api-jzg/query_jzg_jbxx.html
 */
const query_jzg = async (parmas) => {
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
      body: JSON.stringify(parmas),
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
const idsUserById = async (userid) => {
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
        appid: ESOP_APPID,
        accessToken: ESOP_TOKEN,
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
 * 根据学号获取研究生信息
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
};
