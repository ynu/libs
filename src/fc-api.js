/**
 * FCAPI
 */
 const fetch = require('node-fetch');
 const debug = require('debug')('ynu-libs:fc-api:debug');
 const warn = require('debug')('ynu-libs:fc-api:warn');

 const host = 'http://fc.api.ynu.edu.cn';

 const { FC_API_TOKEN, FC_SITE_ID } = process.env;

 /**
  * 获取集群列表
  * @returns 集群列表
  */
 const clusters = async () => {
  const res = await fetch(`${host}/site/${FC_SITE_ID}/cluster?token=${FC_API_TOKEN}`);

  const { errorCode, errorDes, result } = await res.json();
  // 处理错误
  switch (errorCode) {
    case '00000000':
      return result;
    default:
      warn('clusters失败::', `${errorDes}(${errorCode})`);
      return [];
  }
 };


const hosts = async (options = {
   limit: 20,
   offset:  0,
 }) => {
  const { limit, offset } = options;
  const url = `${host}/site/${FC_SITE_ID}/hostResource/?limit=${limit}&offset=${offset}&token=${FC_API_TOKEN}`;
  debug(`host::url::${url}`);
  const res = await fetch(url);

  const { errorCode, errorDes, result } = await res.json();
  // 处理错误
  switch (errorCode) {
    case '00000000':
      return result;
    default:
      warn('hosts失败::', `${errorDes}(${errorCode})`);
      return {
        total: 0,
        list: [],
      };
  }
 };

 const vms = async (options = {
  limit: 20,
  offset:  0,
}) => {
  const { limit, offset } = options;
 const res = await fetch(`${host}/site/${FC_SITE_ID}/vmResource/?limit=${limit}&offset=${offset}&token=${FC_API_TOKEN}`);

 const { errorCode, errorDes, result } = await res.json();
 // 处理错误
 switch (errorCode) {
   case '00000000':
     return result;
   default:
     warn('vms失败::', `${errorDes}(${errorCode})`);
     return {
      total: 0,
      list: [],
    };
 }
};
const vm = async (vmId) => {
 const res = await fetch(`${host}/site/${FC_SITE_ID}/vmResource/${vmId}&?token=${FC_API_TOKEN}`);

 const { errorCode, errorDes, result } = await res.json();
 // 处理错误
 switch (errorCode) {
   case '00000000':
     return result;
   default:
     warn('vm失败::', `${errorDes}(${errorCode})`);
     return {
      total: 0,
      list: [],
    };
 }
};

 module.exports = {
   clusters,
   hosts,
   vms,
   vm,
 };