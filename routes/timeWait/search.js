var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');

// 用户信息模型
const User = require('../../models/user');

//  用户信息模型
const UserInfo = require('../../models/userInfo');

//  成就信息模型
const Achievement = require('../../models/achievement');

//  论坛帖子模型
const ForumPost = require('../../models/forumPost');


//  /timeWait/search

/**
 * get
 * url : /timeWait/search/searchUser
 * 论坛——查询用户
 */
router.get('/searchUser', function (req, res, next) {

    var returnArr = [],
        count = 0;

    User.find({ userName: new RegExp(req.query.userName) }).exec(function (err, result) {
        if(err){
            console.info(err)
        }else if(result.length > 0){
            result.forEach(function (item, index) {
                User.aggregate([
                    {
                        $lookup: {
                            from: "userinfos",
                            localField: "userName",
                            foreignField: "userName",
                            as: "detail"
                        }
                    }
                    ,
                    {
                        $match: {
                            "userName": item._doc.userName
                        }
                    }
                ], function (err, infoResult) {
                    if(err){
                        console.info(err);
                    }
                    if(infoResult){
                        returnArr.push(infoResult[0]);
                        count++;
                        if (result.length == count) {
                            res.json({
                                code: 0,
                                msg: "成功",
                                data: returnArr,
                                detailMsg: "查询用户信息成功"
                            });
                        }
                    }else{
                        res.json({
                            code: 1,
                            msg: "失败",
                            detailMsg: "找不到符合条件用户"
                        });
                    }
                });
            });
        }else{
            res.json({
                code: 1,
                msg: "失败",
                detailMsg: "找不到符合条件用户"
            });
        }
    });
});

module.exports = router;