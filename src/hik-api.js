const HikOpenApi = require('hik-openapi');

const {
  CG_HIK_APPKEY,
  CG_HIK_SECRET,
  DL_HIK_APPKEY,
  DL_HIK_SECRET,
} = process.env;

/**
 * 创建呈贡海康系统API接口
 * @param {Object} param 输入参数
 *  - appKey，默认由CG_HIK_APPKEY获取
 *  - appSecret，默认由CG_HIK_SECRET获取
 *  - debug，默认为false
 * @returns 
 */
const createCgHikApi = ({ appKey, appSecret, debug = false } = {}) => {
  appKey = appKey || CG_HIK_APPKEY;
  appSecret = appSecret || CG_HIK_SECRET;
  debug = debug || false;
  
  const baseUrl = 'https://af-cg-ydgac.ynu.edu.cn';
  const hikApi = new HikOpenApi({
    baseUrl,
    appKey,
    appSecret,
    debug,
  });
  return new HikApi(hikApi);
}

/**
 * 创建东陆海康系统API接口
 * @param {Object} param 输入参数
 *  - appKey，默认由DL_HIK_APPKEY获取
 *  - appSecret，默认由DL_HIK_SECRET获取
 *  - debug，默认为false
 * @returns 
 */
 const createDlHikApi = ({ appKey, appSecret, debug = false } = {}) => {
  appKey = appKey || DL_HIK_APPKEY;
  appSecret = appSecret || DL_HIK_SECRET;
  
  const baseUrl = 'https://af-dl-ydgac.ynu.edu.cn';
  const hikApi = new HikOpenApi({
    baseUrl,
    appKey,
    appSecret,
    debug,
  });
  return new HikApi(hikApi);
}

class HikApi {
  constructor(hikApi) {
    this.hikApi = hikApi;
  }
  /**
   * 查询门禁设备列表
   * @param {Object} options 参数
   *  - pageNo, 从1开始，默认为1
   *  - pageSize, 默认为1000
   * @see https://open.hikvision.com/docs/docId?productId=5c67f1e2f05948198c909700&version=%2Ff95e951cefc54578b523d1738f65f0a1&curNodeId=644f602f0edd49b782737969bdcb5883#be146ecc
   */
  acsDevices(options = {}) {
    const apiUrl = '/artemis/api/resource/v2/acsDevice/search';
    const pageNo = options.pageNo || 1;
    const pageSize = options.pageSize || 1000;
    
    return this.hikApi.post(apiUrl, {
      pageNo,
      pageSize,
    });
  }

}

module.exports = {
  createCgHikApi,
  createDlHikApi,
}