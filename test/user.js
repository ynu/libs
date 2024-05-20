const assert = require('assert');
const { simpleList } = require('../src/wecom-api-user');

describe('wecom-user-api 测试', () => {
  describe('simpleList 获取部门成员', () => {
    it('可以正常获取数据', async () => {
      const userlist = await simpleList(4200000002, {
        fetchChild: true,
      });
      assert.ok(userlist);
    });
  });
});