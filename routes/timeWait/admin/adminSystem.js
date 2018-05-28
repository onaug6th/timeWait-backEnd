var express = require('express');
var router = express.Router();

//  用户信息模型
const User = require('../../../models/user');

//  用户信息模型
const UserInfo = require('../../../models/userInfo');

//  文章信息模型
const Article = require('../../../models/article');

//  文章回复模型
const ArticleComment = require('../../../models/articleComment');

//  论坛帖子模型
const ForumPost = require('../../../models/forumPost');

//  帖子回复模型
const ForumPostComment = require('../../../models/forumPostComment');

//  成就模型
const Achievement = require('../../../models/achievement');
/**
 * get
 * url : /admin/getUserAmount
 * 管理员界面——获取用户数量
 */
router.get('/getUserAmount', function (req, res, next) {

    User.aggregate([{ $group: { _id: "$userName", total: { $sum: "$num" } } }], function (err, result) {
        if (err) {
            console.log("Error:" + err);
        }
        if (result) {
            res.json({
                code: 0,
                msg: "成功",
                detailMsg: "获取用户数量成功",
                data: result.length
            });
        }
    });
});

/**
 * get
 * url : /admin/getArticleAmount
 * 管理员界面——获取全部用户总共文章数量
 */
router.get('/getArticleAmount', function (req, res, next) {

    Article.aggregate([{ $group: { _id: "$_id", total: { $sum: "$num" } } }], function (err, result) {
        if (err) {
            console.log("Error:" + err);
        }
        if (result) {
            res.json({
                code: 0,
                msg: "成功",
                detailMsg: "获取全部用户总共文章数量成功",
                data: result.length
            });
        }
    });
});

/**
 * get
 * url : /admin/getUserList
 * 论坛——根据传入的页码与页数与查询条件进行用户查询
 */
router.get('/getUserList', function (req, res) {
    var currentPageNum = parseInt(req.query.currentPageNum),
        pageSize = parseInt(req.query.pageSize);

    var whereStr = {};

    //  遍历一次查询参数体
    for (i in req.query) {
        //  排除为空，和页码，和页数，和权限等级，和开始时间，和结束时间
        if (req.query[i] !== "" && i !== "currentPageNum" && i !== "pageSize" && i !== "level" && i !== "startDate" && i !== "endDate") {
            whereStr[i] = { $regex: req.query[i] };
        }
        //  数字不能用$regex模糊匹配
        if (i == "level") {
            whereStr[i] = req.query[i]
        }
    }

    //  如果传入了查询日期的请求参数，添加查询日期属性
    if (req.query.startDate && req.query.endDate) {
        whereStr["registerDate"] = { "$gte": (req.query.startDate), "$lt": (req.query.endDate) };
    }

    //  页数，返回用
    var pages;

    //  一共多少条数据
    var totals;

    //  计算数据总数
    User.find(whereStr).count().exec(function (err, result) {
        pages = result / pageSize < 1 ? 1 : Math.ceil(result / pageSize);
        totals = result;

        User.find(whereStr).skip(pageSize * (currentPageNum - 1)).limit(pageSize).exec(function (err, result) {
            if (err) {
                console.log("Error" + err)
            } else if (result) {
                res.json({
                    code: 0,
                    msg: "成功",
                    detailMsg: "获取用户列表成功",
                    data: {
                        list: result,
                        pages: pages
                    }
                });
            } else {
                res.json({
                    code: 0,
                    msg: "成功",
                    detailMsg: "无符合条件数据",
                    data: {
                        list: [],
                        pages: pages
                    }
                });
            }
        });
    });
});

/**
 * post
 * url : /admin/deleteUser
 * 管理员界面——删除用户资料
 */
router.post('/deleteUser', function (req, res, next) {

    //  操作返回信息
    var returnMessage = [];

    //  是否执行到最后
    var endFlag = false;

    var userList = req.body.userObject;

    userList.forEach(function (item) {

        //  重要资料
        if (req.body.kind == "importantInfo" || req.body.kind == "all") {
            User.remove({ '_id': item.userID }, function (err, result) {
                if (err) {
                    console.log("Error:" + err);
                }
                else if (result && result.result.n == 1) {
                    returnMessage.push("用户" + item.userName + "的重要资料已被删除");
                } else {
                    returnMessage.push("找不到" + item.userName + "用户的重要资料");
                }
            }).then(function () {
                sendReturnMessage();
            });
        }

        //  基础资料
        if (req.body.kind == "baseInfo" || req.body.kind == "all") {
            UserInfo.remove({ 'userID': item.userID }, function (err, result) {
                if (err) {
                    console.log("Error:" + err);
                }
                else if (result && result.result.n == 1) {
                    returnMessage.push("用户" + item.userName + "的基础资料已被删除");
                } else {
                    returnMessage.push("找不到" + item.userName + "用户的基础资料");
                }
            }).then(function () {
                sendReturnMessage();
            });
        }

        //  文章
        if (req.body.kind == "article" || req.body.kind == "all") {
            Article.remove({ 'userID': item.userID }, function (err, result) {
                if (err) {
                    console.log("Error:" + err);
                }
                else if (result && result.result.n == 1) {
                    returnMessage.push("用户" + item.userName + "的文章已被删除");
                } else {
                    returnMessage.push("找不到" + item.userName + "用户的文章");
                }
            }).then(function () {
                sendReturnMessage();
            });
        }

        //  文章回复
        if (req.body.kind == "articleComment" || req.body.kind == "all") {
            ArticleComment.remove({ 'commentUserID': item.userID }, function (err, result) {
                if (err) {
                    console.log("Error:" + err);
                }
                else if (result && result.result.n == 1) {
                    returnMessage.push("用户" + item.userName + "的文章回复已被删除");
                } else {
                    returnMessage.push("找不到" + item.userName + "用户的文章回复");
                }
            }).then(function () {
                sendReturnMessage();
            });
        }

        //  帖子
        if (req.body.kind == "forumPost" || req.body.kind == "all") {
            ForumPost.remove({ 'postAuthorID': item.userID }, function (err, result) {
                if (err) {
                    console.log("Error:" + err);
                }
                else if (result && result.result.n == 1) {
                    returnMessage.push("用户" + item.userName + "的帖子已被删除");
                } else {
                    returnMessage.push("找不到" + item.userName + "用户的帖子");
                }
            }).then(function () {
                sendReturnMessage();
            });
        }

        //  帖子回复
        if (req.body.kind == "forumPostComment" || req.body.kind == "all") {
            ForumPostComment.remove({ 'commentUserID': item.userID }, function (err, result) {
                if (err) {
                    console.log("Error:" + err);
                }
                else if (result && result.result.n == 1) {
                    returnMessage.push("用户" + item.userName + "的帖子回复已被删除");
                } else {
                    returnMessage.push("找不到" + item.userName + "用户的帖子回复");
                }
            }).then(function () {
                endFlag = true;
                sendReturnMessage();
            });
        }

        function sendReturnMessage() {
            if (userList[userList.length - 1]['userID'] == item.userID && endFlag == true || req.body.kind !== "all") {
                res.json({
                    code: 0,
                    msg: "成功",
                    detailMsg: returnMessage
                });
            }
        }
    });
});

/**
 * get
 * url : /admin/getArticleList
 * 论坛——根据传入的页码与页数与查询条件进行文章查询
 */
router.get('/getArticleList', function (req, res) {
    var currentPageNum = parseInt(req.query.currentPageNum),
        pageSize = parseInt(req.query.pageSize);

    var whereStr = {};

    //  遍历一次查询参数体
    for (i in req.query) {
        //  排除为空，和页码，和页数，和权限等级，和开始时间，和结束时间
        if (req.query[i] !== "" && i !== "currentPageNum" && i !== "pageSize" && i !== "userID" &&  i !== "startDate" && i !== "endDate") {
            whereStr[i] = { $regex: req.query[i] };
        }

        //  _id不能用$regex模糊匹配
        if (i == "userID") {
            whereStr[i] = req.query[i]
        }
    }

    //  如果传入了查询日期的请求参数，添加查询日期属性
    if (req.query.startDate && req.query.endDate) {
        whereStr["date"] = { "$gte": (req.query.startDate), "$lt": (req.query.endDate) };
    }

    //  页数，返回用
    var pages;

    //  一共多少条数据
    var totals;

    //  计算数据总数
    Article.find(whereStr).count().exec(function (err, result) {
        pages = result / pageSize < 1 ? 1 : Math.ceil(result / pageSize);
        totals = result;

        Article.find(whereStr).skip(pageSize * (currentPageNum - 1)).limit(pageSize).exec(function (err, result) {
            if (err) {
                console.log("Error" + err)
            } else if (result) {
                res.json({
                    code: 0,
                    msg: "成功",
                    detailMsg: "获取用户列表成功",
                    data: {
                        list: result,
                        pages: pages
                    }
                });
            } else {
                res.json({
                    code: 0,
                    msg: "成功",
                    detailMsg: "无符合条件数据",
                    data: {
                        list: [],
                        pages: pages
                    }
                });
            }
        });
    });
});

/**
 * post
 * url : /admin/deleteArticle
 * 管理员界面——删除用户文章
 */
router.post('/deleteArticle', function (req, res, next) {
    
    //  操作返回信息
    var returnMessage = [];

    //  是否执行到最后
    var endFlag = false;

    var userList = req.body.userObject;

    userList.forEach(function (item) {

        //  帖子回复
        if (req.body.kind == "delete") {
            Article.remove({ '_id': item._id }, function (err, result) {
                if (err) {
                    console.log("Error:" + err);
                }
                else if (result && result.result.n == 1) {
                    returnMessage.push("用户" + item.userName + "的文章"+ item.title +"已被删除");
                } else {
                    returnMessage.push("找不到" + item.userName + "用户的文章"+ item.title);
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
 * get
 * url : /admin/getArticleCommentList
 * 论坛——根据传入的页码与页数与查询条件进行文章回复查询
 */
router.get('/getArticleCommentList', function (req, res) {
    var currentPageNum = parseInt(req.query.currentPageNum),
        pageSize = parseInt(req.query.pageSize);

    var whereStr = {};

    //  遍历一次查询参数体
    for (i in req.query) {
        //  排除为空，和页码，和页数，和权限等级，和开始时间，和结束时间
        if (req.query[i] !== "" && i !== "currentPageNum" && i !== "pageSize" && i !== "userID" &&  i !== "startDate" && i !== "endDate") {
            whereStr[i] = { $regex: req.query[i] };
        }
    }
    //  _id不能用$regex模糊匹配
    if (i == "userID") {
        whereStr[i] = req.query[i]
    }

    //  如果传入了查询日期的请求参数，添加查询日期属性
    if (req.query.startDate && req.query.endDate) {
        whereStr["commentDate"] = { "$gte": (req.query.startDate), "$lt": (req.query.endDate) };
    }

    //  页数，返回用
    var pages;

    //  一共多少条数据
    var totals;

    //  计算数据总数
    ArticleComment.find(whereStr).count().exec(function (err, result) {
        pages = result / pageSize < 1 ? 1 : Math.ceil(result / pageSize);
        totals = result;

        ArticleComment.find(whereStr).skip(pageSize * (currentPageNum - 1)).limit(pageSize).exec(function (err, result) {
            if (err) {
                console.log("Error" + err)
            } else if (result) {
                res.json({
                    code: 0,
                    msg: "成功",
                    detailMsg: "获取用户列表成功",
                    data: {
                        list: result,
                        pages: pages
                    }
                });
            } else {
                res.json({
                    code: 0,
                    msg: "成功",
                    detailMsg: "无符合条件数据",
                    data: {
                        list: [],
                        pages: pages
                    }
                });
            }
        });
    });
});

/**
 * post
 * url : /admin/deleteArticleComment
 * 管理员界面——删除用户文章
 */
router.post('/deleteArticleComment', function (req, res, next) {
    
    //  操作返回信息
    var returnMessage = [];

    //  是否执行到最后
    var endFlag = false;

    var userList = req.body.userObject;

    userList.forEach(function (item) {

        //  帖子回复
        if (req.body.kind == "delete") {
            ArticleComment.remove({ '_id': item._id }, function (err, result) {
                if (err) {
                    console.log("Error:" + err);
                }
                else if (result && result.result.n == 1) {
                    returnMessage.push("用户" + item.commentUserName + "的文章回复已被删除");
                } else {
                    returnMessage.push("找不到" + item.commentUserName + "用户的文章回复");
                }
            }).then(function () {
                Article.findOneAndUpdate({"_id":{$in:item.commentArticleID}},{$inc:{commentCount:-1}},function(err,result){
                    if (err){ 
                        console.log(err);
                    }
                });
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
 * url : /admin/updateArticleComment
 * 博客——修改文章回复资料
 */
router.post('/updateArticleComment', function (req, res, next) {
    
    const updateObject = {
        sort : req.body.sort,
        floorNum : req.body.floorNum,
        commentArticleID : req.body.commentArticleID,
        commentArticleTitle : req.body.commentArticleTitle,
        commentUserName: req.body.commentUserName,
        commentUserID: req.body.commentUserID,
        commentValue: req.body.commentValue,
        commentDate: req.body.commentDate,
        commentCount : req.body.commentCount,
        commentLike: req.body.commentLike
    }

    //  这里写的十分丑，以后重写。先根据Id找出这个文章的回复数量
    ArticleComment.findById(req.body._id, function (err, result) {
        if (err) {
            console.log("Error:" + err);
        }
        else {
            ArticleComment.update({ '_id': req.body._id }, updateObject , function (err, result) {
                if (err) {
                    console.log("Error:" + err);
                }
                else if (result) {
                    res.json({
                        code: 0,
                        msg: "成功",
                        detailMsg: "更新文章回复资料成功"
                    });
                }
            });
        }
    });
});

/**
 * POST
 * url : /admin/newAchievement
 * 新成就
 */
router.post('/newAchievement', function (req, res, next) {
    const achievement = new Achievement({
        achievementName: req.body.achievementName,
        achievementType: req.body.achievementType,
        achievementIntro : req.body.achievementIntro,
        achievementLevel : req.body.achievementLevel
    });

    var wherestr = { 'achievementName': req.body.achievementName };

    Achievement.findOne(wherestr, function (err, result) {
        if (err) {
            console.log("Error:" + err);
            res.json({
                code: 1,
                msg: "失败",
                detailMsg: err
            });
        }
        else if (!result) { //  数据库找不到该用户，允许注册
            achievement.save(function (err, result) {
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
                        detailMsg: "注册成功"
                    });
                }
            });
        }
        else if (result) {  //  已经存在该用户了，不给注册
            res.json({
                code: 1,
                msg: "新增成就失败",
                detailMsg: "已存在这个成就",
                data: req.session.user
            });
        }
    });
});

module.exports = router;
