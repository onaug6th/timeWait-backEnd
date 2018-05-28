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
//  帖子回复模型
const ForumPostComment = require('../../models/forumPostComment');
//  /timeWait/forum

/**
 * post
 * url : /timeWait/forum/newForumPost
 * 论坛——新帖子
 */
router.post('/newForumPost', function (req, res, next) {
    const forumPost = new ForumPost({
        postSort: '1',
        postAuthor: req.body.postAuthor,
        postAuthorID: req.body.postAuthorID,
        postTitle: req.body.postTitle,
        postType: req.body.postType,
        postIntro: req.body.postIntro,
        postValue: req.body.postValue,
        postDate: req.body.postDate,
        commentCount: 0,
        postRead: 0,
        postLike: 0
    });

    forumPost.save(function (err, result) {
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
                detailMsg: "新增帖子成功"
            });
        }
    });
});

/**
 * post
 * url : /timeWait/forum/updateForumPost
 * 论坛——修改帖子资料
 */
router.post('/updateForumPost', function (req, res, next) {

    const updateObject = {
        postSort: req.body.postSort,
        postAuthor: req.body.postAuthor,
        postAuthorID: req.body.postAuthorID,
        postTitle: req.body.postTitle,
        postType: req.body.postType,
        postIntro: req.body.postIntro,
        postValue: req.body.postValue,
        postDate: req.body.postDate,
        postLike: req.body.postLike,
        postRead: req.body.postRead,
        commentCount: req.body.commentCount
    }

    //  这里写的十分丑，以后重写。先根据Id找出这个文章的回复数量
    ForumPost.findById(req.body._id, function (err, result) {
        if (err) {
            console.log("Error:" + err);
        }
        else {
            ForumPost.update({ '_id': req.body._id }, updateObject, function (err, result) {
                if (err) {
                    console.log("Error:" + err);
                }else if (result) {
                    res.json({
                        code: 0,
                        msg: "成功",
                        detailMsg: "更新帖子资料成功"
                    });
                } else {
                    res.json({
                        code: 1,
                        msg: "失败",
                        detailMsg: "找不到该数据"
                    });
                }
            });
        }
    });
});

/**
 * get
 * url : /timeWait/forum/getForumPostList
 * 论坛——根据传入的页码与页数与帖子类型进行查询
 */
router.get('/getForumPostList', function (req, res) {
    var currentPageNum = parseInt(req.query.currentPageNum);
    var pageSize = parseInt(req.query.pageSize);

    var whereStr = {};
    for (i in req.query) {
        if (i !== "currentPageNum" && i !== "pageSize" && i !== "startDate" && i !== "endDate" && i !== "isReturnPostValue") {
            whereStr[i] = req.query[i];
        }

        //  _id不能用$regex模糊匹配
        if (i == "postAuthorID") {
            whereStr[i] = req.query[i]
        }
    }

    //  如果传入了查询日期的请求参数，添加查询日期属性
    if (req.query.startDate && req.query.endDate) {
        whereStr["postDate"] = { "$gte": (req.query.startDate), "$lt": (req.query.endDate) };
    }

    //  页数
    var pages;

    //  一共多少条数据
    var totals;

    const returnField = ['postAuthor', 'postAuthorID', 'postTitle', 'postType', 'postIntro', 'postDate', 'postSort' ,'postLike','postRead','commentCount'];

    //  需要返回完整数据吗?
    if (req.query.isReturnPostValue) {
        returnField.push("postValue");
    } else {
        whereStr['postSort'] = '1'
    }

    //  计算数据总数
    ForumPost.find(whereStr).count().exec(function (err, result) {
        pages = result / pageSize < 1 ? 1 : Math.ceil(result / pageSize);
        totals = result;

        ForumPost.find(whereStr, returnField).skip(pageSize * (currentPageNum - 1)).limit(pageSize).sort({ _id: -1 }).exec(function (err, result) {
            if (err) {
                console.log("Error" + err)
            }
            if (result) {
                res.json({
                    code: 0,
                    msg: "成功",
                    detailMsg: "获取论坛帖子列表成功",
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
 * url : /timeWait/forum/getForumPostDetail
 * 论坛——获取帖子详细内容
 */
router.get('/getForumPostDetail', function (req, res, next) {
    //  查询条件
    var postID = req.query.postID;

    //  更新阅读数量 + 1
    ForumPost.findOneAndUpdate({ "_id": { $in: postID } }, { $inc: { postRead: 1 } }).then(function(){
        /**
         *  聚合查询
         * 
         * $lookup : {
         *      from : 另外一个表
         *      localField : 当前表字段
         *      foreignField : 另外一个表的字段
         *      as : 返回值
         * }
         * 
         * $match : {
         *      过滤条件
         * }
         */
        ForumPost.aggregate([
            {
                $lookup : {
                    from : "userinfos",
                    localField: "postAuthor",
                    foreignField : "userName",
                    as:"detail"
                }
            },
            {
                $match : {
                    _id : mongoose.Types.ObjectId(postID)
                }
            }
        ],function(err,result){
            res.json({
                code: 0,
                msg: "成功",
                detailMsg: "获取帖子详细内容成功",
                data: result
            });
        });
    });
});

/**
 * get
 * url : /timeWait/forum/getForumPostComment
 * 论坛——获取当前帖子的回复
 */
router.get('/getForumPostComment', function (req, res, next) {
    //  查询条件
    var whereStr = {};
    for (i in req.query) {
        if (i !== "currentPageNum" && i !== "pageSize" && i !== "startDate" && i !== "endDate" && i !== "isReturnPostValue") {
            whereStr[i] = req.query[i];
        }
    }

    var currentPageNum = parseInt(req.query.currentPageNum);
    var pageSize = parseInt(req.query.pageSize);

    //  需要返回完整数据吗?
    if (req.query.isReturnPostValue) {

    } else {
        whereStr['sort'] = '1'
    }

    //  如果传入了查询日期的请求参数，添加查询日期属性
    if (req.query.startDate && req.query.endDate) {
        whereStr["commentDate"] = { "$gte": (req.query.startDate), "$lt": (req.query.endDate) };
    }

    //  计算数据总数
    ForumPostComment.find(whereStr).count().exec(function (err, result) {
        pages = result / pageSize < 1 ? 1 : Math.ceil(result / pageSize);
        totals = result;

        ForumPostComment.find(whereStr).skip(pageSize * (currentPageNum - 1)).limit(pageSize).exec(function (err, result) {
            if (err) {
                console.log("Error" + err)
            }
            if (result) {
                res.json({
                    code: 0,
                    msg: "成功",
                    detailMsg: "获取当前帖子回复列表成功",
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
 * url : /timeWait/forum/getForumPostCommentAndInfo
 * 论坛——获取当前帖子的回复和回复人资料
 */
router.get('/getForumPostCommentAndInfo', function (req, res, next) {
    //  查询条件
    var whereStr = {};
    for (i in req.query) {
        if (i !== "currentPageNum" && i !== "pageSize" && i !== "startDate" && i !== "endDate" && i !== "isReturnPostValue") {
            whereStr[i] = req.query[i];
        }
    }
    var currentPageNum = parseInt(req.query.currentPageNum),pageSize = parseInt(req.query.pageSize);

    //  需要返回完整数据吗?
    if (req.query.isReturnPostValue) { } else {  whereStr['sort'] = '1' }

    //  如果传入了查询日期的请求参数，添加查询日期属性
    if (req.query.startDate && req.query.endDate) {
        whereStr["commentDate"] = { "$gte": (req.query.startDate), "$lt": (req.query.endDate) };
    }

    //  计算数据总数
    ForumPostComment.find(whereStr).count().exec(function (err, result) {
        pages = result / pageSize < 1 ? 1 : Math.ceil(result / pageSize);
        totals = result;

        ForumPostComment.aggregate([
            {
                $lookup : {
                    from : "userinfos",
                    localField: "commentUserID",
                    foreignField : "userID",
                    as:"detail"
                }
            },
            {
                $match : {
                    commentPostID : whereStr["commentPostID"]
                }
            }
        ],function(err,result){
            res.json({
                code: 0,
                msg: "成功",
                detailMsg: "获取论坛评论列表与用户信息成功",
                data: {
                    list:result,
                    pages:pages
                }
            });
        });
    });
});

/**
 * post
 * url : /timeWait/forum/newForumPostComment
 * 论坛——新增当前帖子的回复
 */
router.post('/newForumPostComment', function (req, res, next) {
    //  这里写的十分丑，以后重写。先根据Id找出这个文章的回复数量
    ForumPost.findById(req.body.commentPostID, function (err, result) {
        if (err) {
            console.log("Error:" + err);
        }
        else {
            const resultObj = result._doc;
            commentCount = resultObj.commentCount;
            //  再更新回复数量+1
            ForumPost.update({ '_id': req.body.commentPostID }, { 'commentCount': commentCount + 1 }, function (err, result) {
                if (err) {
                    console.log("Error:" + err);
                }
                else if (result) {
                    console.log("update success start to save comment");

                    //  定义数据模型
                    const forumPostComment = new ForumPostComment({
                        sort: "1",
                        floorNum: commentCount + 1,
                        commentPostID: req.body.commentPostID,
                        commentPostName: req.body.commentPostName,
                        commentUserName: req.body.commentUserName,
                        commentUserID: req.body.commentUserID,
                        commentValue: req.body.commentValue,
                        commentDate: req.body.commentDate,
                        commentCount: 0,
                        commentLike: 0
                    });

                    forumPostComment.save(function (err, result) {
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
                                detailMsg: "新增帖子回复成功"
                            });
                        }
                    });
                }
            });
        }
    });
});

/**
 * get
 * url : /timeWait/forum/addLikeCount
 * 论坛——增加点赞数量
 */
router.get('/addLikeCount', function (req, res, next) {

    //  这里写的十分丑，以后重写。先根据Id找出这个文章的回复数量
    ForumPost.findOneAndUpdate({ "_id": { $in: req.query.postID } }, { $inc: { postLike: 1 } }, function (err, result) {
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
 * url : /timeWait/forum/deleteForumPost
 * 论坛——隐藏用户帖子
 */
router.get('/deleteForumPost', function (req, res, next) {

    const updateObject = {
        'postSort': '0'
    };

    //  这里写的十分丑，以后重写。先根据Id找出这个文章的回复数量
    ForumPost.findById(req.query._id, function (err, result) {
        if (err) {
            console.log("Error:" + err);
        }
        else {
            //  再更新回复数量+1
            ForumPost.update({ '_id': req.query._id }, updateObject, function (err, result) {
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
 * url : timeWait/forum/deleteForumPost
 * 论坛——删除用户帖子
 */
router.post('/deleteForumPost', function (req, res, next) {

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

/**
 * post
 * url : timeWait/forum/deleteForumComment
 * 论坛——删除用户帖子回复
 */
router.post('/deleteForumComment', function (req, res, next) {

    //  操作返回信息
    var returnMessage = [];

    //  是否执行到最后
    var endFlag = false;

    var userList = req.body.userObject;

    userList.forEach(function (item) {

        //  帖子回复
        if (req.body.kind == "delete") {
            ForumPostComment.remove({ '_id': item._id }, function (err, result) {
                if (err) {
                    console.log("Error:" + err);
                }
                else if (result && result.result.n == 1) {
                    returnMessage.push("用户" + item.commentUserName + "的文章回复已被删除");
                } else {
                    returnMessage.push("找不到" + item.commentUserName + "用户的文章回复");
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

/**
 * post
 * url : /timeWait/forum/updateForumComment
 * 论坛——修改帖子回复内容
 */
router.post('/updateForumComment', function (req, res, next) {

    const updateObject = {
        sort: req.body.sort,
        floorNum: req.body.floorNum,
        commentPostID: req.body.commentPostID,
        commentPostName: req.body.commentPostName,
        commentUserName: req.body.commentUserName,
        commentUserID: req.body.commentUserID,
        commentValue: req.body.commentValue,
        commentDate: req.body.commentDate,
        commentCount: req.body.commentCount,
        commentLike: req.body.commentLike
    }

    //  这里写的十分丑，以后重写。先根据Id找出这个文章的回复数量
    ForumPostComment.findById(req.body._id, function (err, result) {
        if (err) {
            console.log("Error:" + err);
        }
        else {
            ForumPostComment.update({ '_id': req.body._id }, updateObject, function (err, result) {
                if (err) {
                    console.log("Error:" + err);
                }
                if (result) {
                    res.json({
                        code: 0,
                        msg: "成功",
                        detailMsg: "更新帖子回复内容成功"
                    });
                } else {
                    res.json({
                        code: 1,
                        msg: "失败",
                        detailMsg: "找不到该数据"
                    });
                }
            });
        }
    });
});

module.exports = router;