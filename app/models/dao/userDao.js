/*
 * @Description: 用户模块数据持久层
 * @Author: hai-27
 * @Date: 2020-02-07 16:51:56
 * @LastEditors: hai-27
 * @LastEditTime: 2020-02-27 02:12:30
 */
const db = require('./db.js');

module.exports = {
    // 连接数据库根据用户名和密码查询用户信息
    Login: async (userName, password) => {
        const sql = 'select * from users where userName = ? and password = ?';
        return await db.query(sql, [userName, password]);
    },
    // 连接数据库根据用户名查询用户信息
    FindUserName: async (userName) => {
        const sql = 'select * from users where userName = ?';
        return await db.query(sql, [userName]);
    },
    // 连接数据库插入用户信息
    Register: async (userName, password) => {
        const sql = 'insert into users values(null,?,?,null)';
        return await db.query(sql, [userName, password]);
    },
    // 用户支付数据
    FindUserInfo: async (cardid, email, username) => {
        const sql = 'select * from user_info where card_id = ? and email = ? and user_name = ? limit 1';
        return await db.query(sql, [cardid, email, username]);
    },
    // 用户下单ip
    FindUserIp: async (cardid, email, username) => {
        const sql = 'select ip from check_record where card_id = ? and email_add = ? and user_name = ?';
        return await db.query(sql, [cardid, email, username]);
    },
    // 连接数据库插入用户信息
    RecordUserIp: async (cardid,email,username,ip) => {
        const sql = 'insert into check_record(card_id,email_add,user_name,ip) values(?,?,?,?)';
        return await db.query(sql, [cardid,email,username,ip]);
    },
}