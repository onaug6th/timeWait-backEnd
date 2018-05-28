const express = require('express');
const router = express.Router();

//  用户信息模型
const User = require('../../models/user');

//  用户详情信息
const UserInfo = require('../../models/userInfo');

/**
 * POST
 * url : timeWait/register
 * 通用服务——注册用
 */
router.post('/register', function (req, res, next) {
    const user = new User({
        userName: req.body.userName,
        passWord: req.body.passWord,
        email : req.body.email,
        registerDate : req.body.registerDate,
        level : 1
    });

    var wherestr = { 'userName': req.body.userName };

    User.findOne(wherestr, function (err, result) {
        if (err) {
            console.log("Error:" + err);
            res.json({
                code: 1,
                msg: "失败",
                detailMsg: err
            });
        }
        else if (!result) { //  数据库找不到该用户，允许注册
            user.save(function (err, result) {
                if (err) {
                    console.info("Error" + err);
                    res.json({
                        code: 1,
                        msg: "失败",
                        detailMsg: err
                    });
                } else if (result) {
                    resultObj = result._doc;
                    const userInfo = new UserInfo({
                        userID : resultObj._id,
                        userName: req.body.userName,
                        email : req.body.email,
                        registerDate : req.body.registerDate
                    });
                    userInfo.save(function (err, result) {
                        if (err) {
                            console.info("Error" + err);
                        }
                        if(result){
                            result;
                        }
                    });
                    res.json({
                        code: 0,
                        msg: "成功",
                        detailMsg: "注册成功"
                    });
                }
            });
        }
        else if (result) {  //  已经存在该用户了，不给注册
            res.json({
                code: 1,
                msg: "注册失败",
                detailMsg: "这个名字已经被人用了，请换个新的",
                data: req.session.user
            });
        }
    });
});

/**
 * POST
 * url : timeWait/login
 * 通用服务——登陆用
 */
router.post('/login', function (req, res, next) {
    var userName = req.body.userName,
        passWord = req.body.passWord

    //  查询条件
    var wherestr = { 'userName': userName };

    var wherestr2 = { 'email':userName };

    User.findOne(wherestr, function (err, result) {
        if (err) {
            console.log("Error:" + err);
            res.json({
                code: 1,
                msg: "失败",
                detailMsg: err
            });
        }
        else if (!result) { //  数据库找不到该用户
            User.findOne(wherestr2, function (err, result) {
                if (err) {
                    console.log("Error:" + err);
                    res.json({
                        code: 1,
                        msg: "失败",
                        detailMsg: err
                    });
                }
                else if (!result) { //  数据库找不到该用户
                    res.json({
                        code: 1,
                        msg: "失败",
                        detailMsg: "没有找到这个账号"
                    });
                }
                else if (result) {  //  找到用户了
                    const resultObject = result._doc;
                    if (resultObject.passWord == passWord) {    //  如果密码对
                        req.session.user = {
                            userName: resultObject.userName,
                            userID: resultObject._id
                        }
                        res.json({
                            code: 0,
                            msg: "成功",
                            detailMsg: "登陆成功",
                            data: req.session.user
                        });
                    } else if (resultObject.passWord != passWord) { //  如果密码不对
                        res.json({
                            code: 1,
                            msg: "失败",
                            detailMsg: "账号密码不对"
                        });
                    }
                }
            });
        }
        else if (result) {  //  找到用户了
            const resultObject = result._doc;
            if (resultObject.passWord == passWord) {    //  如果密码对
                req.session.user = {
                    userName: resultObject.userName,
                    userID: resultObject._id
                }
                res.json({
                    code: 0,
                    msg: "成功",
                    detailMsg: "登陆成功",
                    data: req.session.user
                });
            } else if (resultObject.passWord != passWord) { //  如果密码不对
                res.json({
                    code: 1,
                    msg: "失败",
                    detailMsg: "账号密码不对"
                });
            }
        }
    });
});

/**
 * get
 * url : timeWait/logout
 * 通用服务——退出用
 */
router.get('/logout', function(req, res, next) {
    try {
        req.session.user = null;
        req.session.destroy();
        res.json({
            code: 0,
            msg: "成功",
            detailMsg: "退出成功"
        });
    } catch (err) {
        res.json({
            code: 0,
            msg: "错误",
            detailMsg: err
        });
    }
});

/**
 * POST
 * url : timeWait/adminLogin
 * 通用服务——管理员登陆
 */
router.post('/adminLogin', function (req, res, next) {
    var userName = req.body.userName,
        passWord = req.body.passWord

    //  查询条件
    var wherestr = { 'userName': userName };

    User.findOne(wherestr, function (err, result) {
        if (err) {
            console.log("Error:" + err);
            res.json({
                code: 1,
                msg: "失败",
                detailMsg: err
            });
        }
        else if (!result) { //  数据库找不到该用户
            res.json({
                code: 1,
                msg: "失败",
                detailMsg: "没有找到这个账号"
            });
        }
        else if (result) {  //  找到用户了
            const resultObject = result._doc;
            if (resultObject.passWord == passWord && resultObject.level == 88 ) {    //  如果密码对,且用户等级为管理员
                req.session.user = {
                    userName: resultObject.userName,
                    userID: resultObject._id
                }
                res.json({
                    code: 0,
                    msg: "成功",
                    detailMsg: "管理员登陆成功",
                    data: {
                        isAdmin : true
                    }
                });
            } else if (resultObject.passWord != passWord) { //  如果密码不对
                res.json({
                    code: 1,
                    msg: "失败",
                    detailMsg: "账号密码不对"
                });
            } else {
                res.json({
                    code: 1,
                    msg: "失败",
                    detailMsg: "不存在此管理员账号"
                });
            }
        }
    });
});

module.exports = router;