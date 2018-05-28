var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');

// 用户信息模型
const User = require('../../models/user');

//  用户信息模型
const UserInfo = require('../../models/userInfo');

//  成就信息模型
const StickyNote = require('../../models/stickyNote');



//  /timeWait/wall


/**
 * post
 * url : /timeWait/wall/newStickyNote
 * 墙——新贴纸
 */
router.post('/newStickyNote', function (req, res, next) {
    const stickyNote = new StickyNote({
        sort : '1',
        userID: req.body.userID,
        userName: req.body.userName,
        title: req.body.title,
        intro: req.body.intro,
        type: req.body.type,
        date: req.body.date,
        value: req.body.value,
        like : [],
        read : 0
    });

    stickyNote.save(function (err, result) {
        if (err) {
            console.info("Error" + err);
            res.json({
                code: 1,
                msg: "失败",
                detailMsg: err
            });
        } else if (result) {
            res.json({
                code: 0,
                msg: "成功",
                detailMsg: "保存成功"
            });
        }
    });
});

/**
 * get
 * url : /timeWait/wall/getStickyNoteList
 * 墙——根据传入的页码与页数与进行查询
 */
router.get('/getStickyNoteList', function (req, res) {
    var currentPageNum = parseInt(req.query.currentPageNum);
    var pageSize = parseInt(req.query.pageSize);

    var whereStr = {};
    for (i in req.query) {
        if (i !== "currentPageNum" && i !== "pageSize" && i !== "startDate" && i !== "endDate") {
            whereStr[i] = req.query[i];
        }

        //  _id不能用$regex模糊匹配
        if (i == "userID") {
            whereStr[i] = req.query[i]
        }
    }


    //  页数
    var pages;

    //  一共多少条数据
    var totals;

    whereStr['sort'] = '1';

    //  计算数据总数
    StickyNote.find(whereStr).count().exec(function (err, result) {
        pages = result / pageSize < 1 ? 1 : Math.ceil(result / pageSize);
        totals = result;

        StickyNote.find(whereStr).skip(pageSize * (currentPageNum - 1)).limit(pageSize).sort({ _id: -1 }).exec(function (err, result) {
            if (err) {
                console.log("Error" + err)
            }
            if (result) {
                res.json({
                    code: 0,
                    msg: "成功",
                    detailMsg: "获取墙上的贴纸列表成功",
                    data: {
                        list: result,
                        pages: pages
                    }
                });
            }
        });
    });

});

/**
 * get
 * url : /wall/addLikeCount
 * 个人博客——增加点赞数量
 */
router.get('/addLikeCount', function (req, res, next) {
    StickyNote.findById(req.query._id,["like"],function(err,result){
        if(err){
            console.info('has Error' + e);
        }
        if(result){
            var resultObj = result._doc;
            if(resultObj.like.indexOf(req.query.userID) != -1){
                res.json({
                    code: 1,
                    msg: "点赞不成功",
                    detailMsg: "已经点过赞了"
                });
            }else{
                //  这里写的十分丑，以后重写。先根据Id找出这个文章的回复数量
                Article.findOneAndUpdate({"_id":{$in:req.query._id}},{$push:{like:req.query.userID}},function(err,result){
                    if (err){ 
                        console.log(err);
                    }
                    if(result){
                        res.json({
                            code: 0,
                            msg: "成功",
                            detailMsg: "新增点赞数量成功"
                        });
                    }
                });
            }
        }
    });
});

/**
 * get
 * url : /timeWait/forum/addLikeCount
 * 论坛——增加贴纸已读数量
 */
router.get('/addLikeCount', function (req, res, next) {
    
    //  这里写的十分丑，以后重写。先根据Id找出这个文章的回复数量
    StickyNote.findOneAndUpdate({ "_id": { $in: req.query._id } }, { $inc: { read: 1 } }, function (err, result) {
        if (err) {
            console.log(err);
        }
        if (result) {
            res.json({
                code: 0,
                msg: "成功",
                detailMsg: "新增点赞数量成功"
            });
        }
    });
});

/**
 * get
 * url : /timeWait/wall/deleteStickyNote
 * 论坛——隐藏用户贴纸
 */
router.get('/deleteStickyNote', function (req, res, next) {

    const updateObject = {
        'sort': '0'
    };

    //  这里写的十分丑，以后重写。先根据Id找出这个文章的回复数量
    StickyNote.findById(req.query._id, function (err, result) {
        if (err) {
            console.log("Error:" + err);
        }
        else {
            //  再更新回复数量+1
            StickyNote.update({ '_id': req.query._id }, updateObject, function (err, result) {
                if (err) {
                    console.log("Error:" + err);
                }
                else if (result) {
                    res.json({
                        code: 0,
                        msg: "成功",
                        detailMsg: "更新帖子资料成功"
                    });
                }
            });
        }
    });
});

/**
 * post
 * url : timeWait/wall/deleteStickyNote
 * 论坛——删除用户贴纸
 */
router.post('/deleteStickyNote', function (req, res, next) {

    //  操作返回信息
    var returnMessage = [];

    //  是否执行到最后
    var endFlag = false;

    var userList = req.body.userObject;

    userList.forEach(function (item) {

        //  帖子回复
        if (req.body.kind == "delete") {
            ForumPost.remove({ '_id': item._id }, function (err, result) {
                if (err) {
                    console.log("Error:" + err);
                }
                else if (result && result.result.n == 1) {
                    returnMessage.push("用户" + item.postAuthor + "的文章" + item.postTitle + "已被删除");
                } else {
                    returnMessage.push("找不到" + item.postAuthor + "用户的文章" + item.postTitle + "");
                }
            }).then(function () {
                endFlag = true;
                sendReturnMessage(item);
            });
        }
    });

    function sendReturnMessage(item) {
        if (userList[userList.length - 1]['_id'] == item['_id'] && endFlag == true) {
            res.json({
                code: 0,
                msg: "成功",
                detailMsg: returnMessage
            });
        }
    }
});


module.exports = router;