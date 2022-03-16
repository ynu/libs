/**
 * 企业微信API-健康上报
 */
 const fetch = require('node-fetch');
 const dayjs = require('dayjs');
 const debug = require('debug')('ynu-libs:wecom-api-health:debug');
 const warn = require('debug')('ynu-libs:wecom-api-health:warn');
 const { getToken, qyHost } = require('./wecom-api');
 

 /**
  * 获取健康上报任务ID列表
  * @param {Object} options 参数
  *   - offset: 偏离量，默认为0
  *   - limit: 预期请求的数据量，默认为100
  *   - secret: 请求用的secret，默认由HEALTH_SECRET环境变量中读取
  * @see https://developer.work.weixin.qq.com/document/path/93677
  * @returns 任务id列表，出错时返回[]。
  */
 const report_jobids = async(options = {}) => {
   //规范输入参数
   options.offset = options.offset || 0;
   options.limit = options.limit || 100;
  const token = await getToken(process.env.HEALTH_SECRET);
  debug(`report_jobids::token::${token}`);
  const res = await fetch(`${qyHost}/health/get_report_jobids?access_token=${token}`, {
    method: 'POST',
    body: JSON.stringify(options),
  });
  const { errcode, errmsg, jobids } = await res.json();
  // 成功返回&处理错误
  switch (errcode) {
    case 0:
      return jobids;
    default:
      if (errcode) warn('report_jobids失败::', `${errmsg}(${errcode})`);
      return [];
  }
 }

 /**
  * 获取健康上报任务详情
  * @param {String} jobid 任务ID
  * @param {String} date 日期
  * @returns 任务详情
  * @see https://developer.work.weixin.qq.com/document/path/93678
  */
const report_job_info = async (jobid, date) => {
  //规范输入参数
  date = date || dayjs().format('YYYY-MM-DD');
  debug('date::', date);
  const token = await getToken(process.env.HEALTH_SECRET);
  debug(`report_job_info::token::${token}`);
  const res = await fetch(`${qyHost}/health/get_report_job_info?access_token=${token}`, {
    method: 'POST',
    body: JSON.stringify({
      jobid,
      date,
    }),
  });
  const { errcode, errmsg, job_info } = await res.json();
  // 成功返回&处理错误
  switch (errcode) {
    case 0:
      return job_info;
    default:
      if (errcode) warn('report_jobids失败::', `${errmsg}(${errcode})`);
      return null;
  }
 }

 /**
  * 获取用户填写答案
  * @param {String} jobid 任务ID
  * @param {Object} options 参数
  *   - date 填报日期，默认为当天
  *   - offset 偏移量，默认为0
  *   - limit 拉取数据量，默认为100
  * @returns 用户答案列表
  * @see https://developer.work.weixin.qq.com/document/path/93679
  */
const report_answer = async(jobid, options = {}) => {
  //规范输入参数
  options.offset = options.offset || 0;
  options.limit = options.limit || 100;
  options.date = options.date || dayjs().format('YYYY-MM-DD');

  const token = await getToken(process.env.HEALTH_SECRET);
  debug(`report_answer::token::${token}`);
  const res = await fetch(`${qyHost}/health/get_report_answer?access_token=${token}`, {
    method: 'POST',
    body: JSON.stringify({
      jobid,
      ...options,
    }),
  });
  const { errcode, errmsg, answers } = await res.json();
  // 成功返回&处理错误
  switch (errcode) {
    case 0:
      return answers;
    default:
      if (errcode) warn('report_answer失败::', `${errmsg}(${errcode})`);
      return [];
  }
 }
 
 module.exports = {
   report_jobids,
   report_job_info,
   report_answer,
 };