var express = require('express');
var router = express.Router();

// 用户信息模型
const User = require('../../models/user');

//  用户信息模型
const UserInfo = require('../../models/userInfo');

//  成就信息模型
const Achievement = require('../../models/achievement');

//  文章信息模型
const Article = require("../../models/article");

//  帖子信息模型
const ForumPost = require('../../models/forumPost');

//  /timeWait/userSpace

/**
 * get
 * url : /userSpace/getArticleAmount
 * 管理员界面——获取用户文章数量
 */
router.get('/getArticleAmount', function (req, res, next) {
    
    Article.aggregate([{ $group: { _id: req.query.userID, total: { $sum: "$num" } } }], function (err, result) {
            if (err) {
                console.log("Error:" + err);
            }
            if (result) {
                res.json({
                    code: 0,
                    msg: "成功",
                    detailMsg: "获取用户文章数量成功",
                    data: result.length
                });
            }
        });
    });
    
    /**
     * get
     * url : /userSpace/getForumPostAmount
     * 管理员界面——获取用户总共帖子数量
     */
    router.get('/getForumPostAmount', function (req, res, next) {
    
        ForumPost.aggregate([{ $group: { _id: req.query.postAuthorID, total: { $sum: "$num" } } }], function (err, result) {
            if (err) {
                console.log("Error:" + err);
            }
            if (result) {
                res.json({
                    code: 0,
                    msg: "成功",
                    detailMsg: "获取用户总共帖子数量成功",
                    data: result.length
                });
            }
        });
    });


/**
 * get
 * url : /timeWait/userSpace/getUserAchievement
 * 个人设置——获取当前用户成就信息
 */
router.get('/getUserAchievement', function (req, res, next) {
    //  查询条件
    var wherestr = { 'userID': req.query.userID };
    //  返回字段
    var returnField = ['achievement'];

    User.findById(req.query.userID, function (err, result) {
        if (err) {
            console.log("Error:" + err);
        }
        if (result) {
            UserInfo.findOne(wherestr, returnField, function (err, result) {
                if (err) {
                    console.log("Error:" + err);
                }
                else if (result) {
                    const resultData = result._doc;
                    Achievement.find({ '_id': resultData.achievement }, function (err, result) {
                        if (err) {
                            console.log("Error:" + err);
                        }
                        if (result) {
                            res.json({
                                code: 0,
                                msg: "成功",
                                detailMsg: "获取用户成就成功",
                                data: result
                            });
                        }
                        else{
                            res.json({
                                code: 1,
                                msg: "成功",
                                detailMsg: "该用户还没有任何成就",
                                data: result
                            });
                        }
                    });
                }
                else{
                    res.json({
                        code: 1,
                        msg: "成功",
                        detailMsg: "该用户还没有任何成就",
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
 * url : /timeWait/userSpace/getAllAchievement
 * 获取全部成就列表
 */
router.get('/getAllAchievement',function (req,res,next){
    Achievement.find(function(err,result){
        if(err){
            console.log("Error:" + err);
        }
        else if (result){
            if (result) {
                res.json({
                    code: 0,
                    msg: "成功",
                    detailMsg: "获取全部成就信息成功",
                    data: result
                });
            }
        }
    })
});

/**
 * post
 * url : /timeWait/userSpace/userNewAchievement
 * 添加用户新成就
 */
router.post('/userNewAchievement',function(req,res,next){
    var wherestr = {'userID':req.body.userID};

    UserInfo.update(wherestr, {"$push":{"achievement":req.body.achievementID}},function(err,result){
        if(err){
            console.log("Error:" + err);
        }
        else if(result){
            res.json({
                code: 0,
                msg: "成功",
                detailMsg: "用户新增成就成功"
            });
        }
    });
});

module.exports = router;