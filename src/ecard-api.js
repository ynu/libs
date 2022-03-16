/* eslint-disable camelcase */
/**
 * YNU ecard API - 基于ESOP API
 * ESOP API通用参数：
 *  - pageSize. 分页大小，最大1000
 *  - pgeNum. 页码，从1开始
 */

 const debug = require('debug')('ynu-libs:ecard-api:debug');
 const warn = require('debug')('ynu-libs:ecard-api:warn');
 const { HOST, ESOP_APPID, ESOP_TOKEN } = require('./esop-api');

/**
 * 获取商户日账单
 * @param {Object} options 参数。
 *    - shopid 商户ID
 *    - accdate 记账日期，8位数的日期，如20210203
 *    - fshopid 父商户ID
 *    - PageSize，页面大小，默认为20，最大1000
 *    - PageNum，页码，默认为1，从1开始。
 */
const daily_shop_bills = async (
  options = {
    shopid,
    accdate,
    fshopid,
    pageSize: 20,
    pageNum: 1,
  },
) => {
  const url = `${HOST}do/api/call/shopBill_ecard`;
  options.pageSize = options.pageSize || 20;
  options.pageNum = options.pageNum || 1;
  if (!options.shopid) delete options.shopid;
  if (!options.accdate) delete options.accdate;
  if (!options.fshopid) delete options.fshopid;

  debug(`daily_shop_bills::options::${JSON.stringify(options)}`);
  
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
    return {
      ret: -1,
      msg: `连接超时(${url})`,
    };
    // }
  }
}
 module.exports = {
   daily_shop_bills,
 }