var express = require('express');
var router = express.Router();

// 用户信息模型
const User = require('../../models/user');

//  用户信息模型
const UserInfo = require('../../models/userInfo');

/**
 * Post
 * url: /userSetting/importantProfile
 * 个人设置——重要信息更新
 */
router.post('/importantProfile', function (req, res, next) {
    var wherestr = { '_id': req.body.userID };
    var updatestr = {
        'userName': req.body.userName,
        'email': req.body.email
    };

    if(req.body.passWord){
        updatestr['passWord'] = req.body.passWord;
    }

    if(req.body.level){
        updatestr['level'] = req.body.level;
    }

    User.update(wherestr, updatestr, function (err, result) {
        if (err) {
            console.log("Error:" + err);
        }
        else if (result) {
            if (result.n == 1) {
                res.json({
                    code: 0,
                    msg: "成功",
                    detailMsg: "修改成功"
                });
            }
        }
    });
});

/**
 * get
 * url : /userSetting/getUserImportantProfile
 * 个人设置——获取用户重要信息
 */
router.get('/getUserImportantProfile', function (req, res, next) {
    //  查询条件
    var wherestr = { '_id': req.query.userID };
    //  返回字段
    var returnField = ['userName', 'email'];

    User.findById(req.query.userID, function (err, result) {
        if (err) {
            console.log("Error:" + err);
        }
        if (result) {
            User.findOne(wherestr, returnField, function (err, result) {
                if (err) {
                    console.log("Error:" + err);
                }
                else {
                    res.json({
                        code: 0,
                        msg: "成功",
                        detailMsg: "获取用户重要信息成功",
                        data: result
                    });
                }
            });
        } else {
            res.json({
                code: 1,
                msg: "失败",
                detailMsg: "没有这个用户",
                data: result
            });
        }
    });
});

/**
 * Post
 * url: /userSetting/baseProfile
 * 个人设置——基础信息更新
 */
router.post('/baseProfile', function (req, res, next) {
    var wherestr = { 'userID': req.body.userID };

    //  定义更新字段
    const updatestr = {
        userID: req.body.userID,
        userName: req.body.userName,
        realName: req.body.realName,
        gender: req.body.gender,
        phone: req.body.phone,
        birthDay: req.body.birthDay,
        weibo: req.body.weibo,
        qq: req.body.qq,
        weChat: req.body.weChat,
        intro: req.body.intro,
        address: req.body.address,
        lunch: req.body.lunch,
        zfb: req.body.zfb,
        wzry: req.body.wzry
    };

    //  沙琪玛对象
    const userInfo = new UserInfo({
        userID: req.body.userID,
        userName: req.body.userName,
        realName: req.body.realName,
        gender: req.body.gender,
        phone: req.body.phone,
        birthDay: req.body.birthDay,
        weibo: req.body.weibo,
        qq: req.body.qq,
        weChat: req.body.weChat,
        intro: req.body.intro,
        address: req.body.address,
        lunch: req.body.lunch,
        zfb: req.body.zfb,
        wzry: req.body.wzry
    });

    /**
     * @param wherestr   符合的字段
     * @param updatestr  要更新的字段
     */
    UserInfo.update(wherestr, updatestr, function (err, result) {
        if (err) {
            console.log("Error:" + err);
        }
        else if (result) {
            if (result.n == 0) {  //  如果找不到，说明第一次新增
                userInfo.save(function (err, result) {
                    if (err) {
                        console.info("Error" + err);
                        res.json({
                            code: 1,
                            msg: "保存失败",
                            detailMsg: err
                        });
                    } else if (result) {
                        res.json({
                            code: 0,
                            msg: "成功",
                            detailMsg: "首次新增信息成功"
                        });
                    }
                });
            }
            if (result.n == 1) {
                res.json({
                    code: 0,
                    msg: "成功",
                    detailMsg: "修改成功"
                });
            }
        }
    });
});

/**
 * get
 * url : /userSetting/getUserBaseProfile
 * 个人设置——获取用户基础信息
 */
router.get('/getUserBaseProfile', function (req, res, next) {
    //  查询条件
    var wherestr = { 'userID': req.query.userID };

    User.findById(req.query.userID, function (err, result) {
        if (err) {
            console.log("Error:" + err);
        }
        if (result) {
            UserInfo.findOne(wherestr, function (err, result) {
                if (err) {
                    console.log("Error:" + err);
                }
                else if (result) {
                    res.json({
                        code: 0,
                        msg: "成功",
                        detailMsg: "获取用户基础信息成功",
                        data: result
                    });
                }
                else{
                    res.json({
                        code: 1,
                        msg: "这个用户还没有填写基础信息",
                        detailMsg: "没有该用户基础信息",
                        data: result
                    });
                }
            });
        } else {
            res.json({
                code: 1,
                msg: "失败",
                detailMsg: "没有这个用户",
                data: result
            });
        }
    });
});

/**
 * get
 * url: /userSetting/updatePassword
 * 个人设置——密码修改
 */
router.get('/updatePassword', function (req, res, next) {
    var wherestr = { '_id': req.query.userID };
    var updatestr = {
        'passWord': req.query.newPassWord,
    };

    User.findById(req.query.userID, function (err, result) {
        if (err) {
            console.log("Error:" + err);
        }
        if (result) {
            if(result._doc.passWord == req.query.oldPassWord){
                User.update(wherestr, updatestr, function (err, result) {
                    if (err) {
                        console.log("Error:" + err);
                    }
                    else if (result) {
                        if (result.n == 1) {
                            res.json({
                                code: 0,
                                msg: "成功",
                                detailMsg: "修改密码成功"
                            });
                        }
                    }
                });
            }else{
                res.json({
                    code: 1,
                    msg: "失败",
                    detailMsg: "旧密码不对",
                    data: result
                });
            }
        } else {
            res.json({
                code: 1,
                msg: "失败",
                detailMsg: "没有这个用户",
                data: result
            });
        }
    });
});

/**
 * get
 * url: /userSetting/updateAvatar
 * 个人设置——头像修改
 */
router.get('/updateAvatar', function (req, res, next) {
    var wherestr = { 'userID': req.query.userID };
    var updatestr = {
        'avatar': req.query.avatar,
    };
    //  沙琪玛对象
    const userInfo = new UserInfo({
        userID: req.query.userID,
        avatar : req.query.avatar
    });

    UserInfo.find(wherestr, function (err, result) {
        if (err) {
            console.log("Error:" + err);
        }
        if (result) {
            UserInfo.update(wherestr, updatestr, function (err, result) {
                if (err) {
                    res.json({
                        code: 1,
                        msg: "出bug了！",
                        detailMsg: err
                    });
                }
                else if (result) {
                    if (result.n == 1) {
                        res.json({
                            code: 0,
                            msg: "成功",
                            detailMsg: "修改头像成功"
                        });
                    }else{
                        userInfo.save(function (err, result) {
                            if (err) {
                                console.info("Error" + err);
                                res.json({
                                    code: 1,
                                    msg: "保存失败",
                                    detailMsg: err
                                });
                            } else if (result) {
                                res.json({
                                    code: 0,
                                    msg: "成功",
                                    detailMsg: "首次新增信息并且保存头像成功"
                                });
                            }
                        });
                    }
                }
            });
        }
    });
});

/**
 * get
 * url : /userSetting/otcTest
 * 个人设置——获取用户基础信息
 */
router.get('/otcTest', function (req, res, next) {
    User.aggregate([
        {
            $lookup : {
                from : "userinfos",
                localField: "userName",
                foreignField : "userName",
                as:"detail"
            }
        },
        {
            $match : {
                userName : req.query.userName
            }
        }
    ],function(err,result){
        res.json({
            code: 0,
            msg: "success",
            data: result
        });
    });
});


module.exports = router;
