/*
 * @Description: 用户模块控制器
 * @Author: hai-27
 * @Date: 2020-02-07 16:51:56
 * @LastEditors: hai-27
 * @LastEditTime: 2020-03-27 16:03:09
 */
const rp = require('request-promise');
const userDao = require('../models/dao/userDao');
const { checkUserInfo, checkUserName } = require('../middleware/checkUserInfo');

module.exports = {

  /**
   * 用户登录
   * @param {Object} ctx
   */
  Login: async ctx => {

    let { userName, password } = ctx.request.body;

    // 校验用户信息是否符合规则
    if (!checkUserInfo(ctx, userName, password)) {
      return;
    }

    // 连接数据库根据用户名和密码查询用户信息
    let user = await userDao.Login(userName, password);
    // 结果集长度为0则代表没有该用户
    if (user.length === 0) {
      ctx.body = {
        code: '004',
        // msg: '用户名或密码错误'
        msg: 'wrong user name or password'
      }
      return;
    }

    // 数据库设置用户名唯一
    // 结果集长度为1则代表存在该用户
    if (user.length === 1) {

      const loginUser = {
        user_id: user[0].user_id,
        userName: user[0].userName
      };
      // 保存用户信息到session
      ctx.session.user = loginUser;

      ctx.body = {
        code: '001',
        user: loginUser,
        msg: 'login successful'
      }
      return;
    }

    //数据库设置用户名唯一
    //若存在user.length != 1 || user.length!=0
    //返回未知错误
    //正常不会出现
    ctx.body = {
      code: '500',
      // msg: '未知错误'
      msg: 'unknown mistake'
    }
  },
  /**
   * 微信小程序用户登录
   * @param {Object} ctx
   */
  miniProgramLogin: async ctx => {
    const appid = 'wxeb6a44c58ffde6c6';
    const secret = '9c40f33cf627f2e3a42f38b25e0687cc';
    let { code } = ctx.request.body;

    const api = `https://api.weixin.qq.com/sns/jscode2session?appid=${ appid }&secret=${ secret }&js_code=${ code }&grant_type=authorization_code`;
    // 通过 wx.login 接口获得临时登录凭证 code 后
    // 传到开发者服务器调用此接口完成登录流程。
    const res = await rp.get({
      json: true,
      uri: api
    })
    const { session_key, openid } = res;

    // 连接数据库根据用户名查询用户信息
    let user = await userDao.FindUserName(openid);
    if (user.length === 0) {
      // 结果集长度为0则代表不存在该用户,先注册
      try {
        // 连接数据库插入用户信息
        let registerResult = await userDao.Register(openid, openid);
        if (registerResult.affectedRows === 1) {
          // 操作所影响的记录行数为1,则代表注册成功
          await login();// 登录
        }
      } catch (error) {
        console.log(error)
      }
    } else if (user.length === 1) {
      // 如果已经存在，直接登录
      await login();
    } else {
      ctx.body = {
        code: '500',
        msg: '未知错误'
      }
    }
    async function login () {
      // 连接数据库根据用户名和密码查询用户信息
      let tempUser = await userDao.Login(openid, openid);
      if (tempUser.length === 0) {
        // 登录失败
        ctx.body = {
          code: '004',
          // msg: '登录失败'
          msg: 'Login failed'
        }
        return;
      }
      if (tempUser.length === 1) {
        // 登录成功
        const loginUser = {
          user_id: tempUser[0].user_id,
          openId: openid,
          sessionKey: session_key
        };
        // 保存用户信息到session
        ctx.session.user = loginUser;

        ctx.body = {
          code: '001',
          userId: tempUser[0].user_id,
          msg: 'login successful'
        }
        return;
      }
    }
  },
  /**
   * 查询是否存在某个用户名,用于注册时前端校验
   * @param {Object} ctx
   */
  FindUserName: async ctx => {
    let { userName } = ctx.request.body;

    // 校验用户名是否符合规则
    if (!checkUserName(ctx, userName)) {
      return;
    }
    // 连接数据库根据用户名查询用户信息
    let user = await userDao.FindUserName(userName);
    // 结果集长度为0则代表不存在该用户,可以注册
    if (user.length === 0) {
      ctx.body = {
        code: '001',
        // msg: '用户名不存在，可以注册'
        msg: 'Username does not exist, you can register'
      }
      return;
    }

    //数据库设置用户名唯一
    //结果集长度为1则代表存在该用户,不可以注册
    if (user.length === 1) {
      ctx.body = {
        code: '004',
        // msg: '用户名已经存在，不能注册'
        msg: 'Username already exists, cannot register'
      }
      return;
    }

    //数据库设置用户名唯一，
    //若存在user.length != 1 || user.length!=0
    //返回未知错误
    //正常不会出现
    ctx.body = {
      code: '500',
      // msg: '未知错误'
      msg: 'unknown mistake'
    }
  },
  Register: async ctx => {
    let { userName, password } = ctx.request.body;

    // 校验用户信息是否符合规则
    if (!checkUserInfo(ctx, userName, password)) {
      return;
    }
    // 连接数据库根据用户名查询用户信息
    // 先判断该用户是否存在
    let user = await userDao.FindUserName(userName);

    if (user.length !== 0) {
      ctx.body = {
        code: '004',
        // msg: '用户名已经存在，不能注册'
        msg: 'Username already exists, cannot register'
      }
      return;
    }

    try {
      // 连接数据库插入用户信息
      let registerResult = await userDao.Register(userName, password);
      // 操作所影响的记录行数为1,则代表注册成功
      if (registerResult.affectedRows === 1) {
        ctx.body = {
          code: '001',
          // msg: '注册成功'
          msg: 'registration success'
        }
        return;
      }
      // 否则失败
      ctx.body = {
        code: '500',
        // msg: '未知错误，注册失败'
        msg: 'Unknown error, registration failed'
      }
    } catch (error) {
      reject(error);
    }
  },

  /**
   * 用户下单地址信息校验
   * @param {Object} ctx
   */
  CheckInfo: async ctx => {
    // 获取客户端ip
    var ip = ctx.headers['x-forwarded-for'] ||
        ctx.ip ||
        ctx.connection.remoteAddress ||
        ctx.socket.remoteAddress ||
        ctx.connection.socket.remoteAddress || '';
    if(ip.split(',').length>0){
      ip = ip.split(',')[0]
    }
    ip = ip.substr(ip.lastIndexOf(':')+1,ip.length);
    console.log("ip:"+ip);
    //判断ip属地
    var geoip = require('geoip-lite');
    ip = "173.208.182.68"
    var geo = geoip.lookup(ip);
    console.log(geo)

    //支付时是否为美国IP
    if(geo == null || geo.country != 'US'){
      ctx.body = {
        code: '602',
        // msg: '支付IP不是美国'
        msg: 'you are not american'
      }
      console.log(ip)
      return;
    }

    let {email,firstname,lastname,cardid,
      company,apartment,emailme,country,agree,nodes,
      cvv,address,city,postal,province,phone} = ctx.request.body;
    var username = firstname +' ' + lastname
    console.log(ctx.request.body)
    let userinfo = await userDao.FindUserInfo(cardid,email,username);
    if (Object.keys(userinfo).length === 0){
        ctx.body = {
          code: '60',
          //用户不存在
          msg: 'User does not exist'}
        return;
    }
    var user = userinfo[0]
    console.log(user)
    if (user.cvv != cvv || user.address != address || user.city != city || user.provinces != province
    || user.postal != postal || user.phone != phone){
      ctx.body = {
        code: '601',
        // msg: '支付数据不匹配'
        msg: 'Payment data does not match'
      }
      return;
    }
    var rdm = Math.random() * 100
    let checkIp = await userDao.FindUserIp(cardid,email,username);
    for (var i in checkIp){
      console.log(checkIp[i].ip)
      if(ip == checkIp[i].ip){
        ctx.body = {
          code: '603',
          //ip是否重复支付
          msg: 'Repeat orders'
        }
        return;
      }
    }
    await userDao.RecordUserIp(cardid,email,username,ip);
    ctx.body = {
      code: '001',
      //下单成功
      msg: 'successfully ordered'
    }
    console.log(rdm)
    return;
  }
};
