const fetch = require('node-fetch');
const AbortController = require('abort-controller');
const debug = require('debug')('ynu-libs:esop-api:debug');
const warn = require('debug')('ynu-libs:esop-api:warn');
const info = require('debug')('ynu-libs:esop-api:info');

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

module.exports = {
  fetchWithTimeout,
  handleEsopResult,
  debug,
  warn,
  info,
}