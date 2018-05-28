const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

//  用户信息模型
const User = require('../../models/user');

//  文章模型
const Article = require('../../models/article');

//  用户资料模型
const UserInfo = require('../../models/userInfo');

//  文章回复模型
const ArticleComment = require('../../models/articleComment');

/**
 * POST
 * url : /blog/NewPost
 * 个人博客——新文章
 */
router.post('/NewPost', function (req, res, next) {
    const article = new Article({
        sort : '1',
        userID: req.body.userID,
        userName: req.body.userName,
        title: req.body.title,
        intro: req.body.intro,
        type: req.body.type,
        date: req.body.date,
        value: req.body.value,
        like : [],
        read : 0,
        commentCount : 0
    });

    article.save(function (err, result) {
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
 * url : /blog/getArticleList
 * 个人博客——获取文章列表
 */
router.get('/getArticleList', function (req, res, next) {
    //  查询条件
    var whereStr
    if(req.query.type == ""){
        whereStr = { 'userID': req.query.userID ,"sort" :'1'};
    }
    if(req.query.type !== ""){
        whereStr = { 'userID': req.query.userID , 'type' : req.query.type ,"sort":'1' };
    }
    //  返回字段
    var returnField = ['title', 'type', 'date', 'like', 'intro','read','commentCount'];

    //  分页
    var currentPageNum = parseInt(req.query.currentPageNum);
    var pageSize = parseInt(req.query.pageSize);

    User.findById(req.query.userID,function(err,result){
        if (err) {
            console.log("Error:" + err);
        }
        if(result){
            //  计算数据总数
            Article.find(whereStr).count().exec(function (err, result) {
                pages = result / pageSize < 1 ? 1 : Math.ceil(result / pageSize);
                totals = result;

                Article.find(whereStr).skip(pageSize * (currentPageNum - 1)).limit(pageSize).sort({ _id: -1 }).exec(function (err, result) {
                    if (err) {
                        console.log("Error" + err)
                    }
                    if (result) {
                        res.json({
                            code: 0,
                            msg: "成功",
                            detailMsg: "获取文章列表成功",
                            data: {
                                list: result,
                                pages: pages
                            }
                        });
                    }
                });
            })
        }else {
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
 * url : /blog/getArticleDetail
 * 个人博客——获取文章详细内容
 */
router.get('/getArticleDetail', function (req, res, next) {
    //  查询条件
    var articleID = req.query.articleID;

    Article.findById(articleID, function (err, result) {
        if (err) {
            console.log("Error:" + err);
        }
        else {
            Article.findOneAndUpdate({"_id":{$in:req.query.articleID}},{$inc:{read:1}}).then(function(){
                result._doc.like = result._doc.like.length;
                res.json({
                    code: 0,
                    msg: "成功",
                    detailMsg: "获取文章详细内容成功",
                    data: result
                });
            });
        }
    })
});
/**
 * get
 * url : /blog/getArticleType
 * 个人博客——获取当前用户文章分类
 */
router.get('/getArticleType', function (req, res, next) {
    var typeList = [];
    var count = 0;

    Article.distinct("type", { userID: req.query.userID ,sort : '1'}, function (err, result) {
        if (err) {
            console.log("Error:" + err);
        } else if(result.length > 0){
            result.forEach(function(item,index){
                Article.aggregate([{ $match: { type: item } } ], function (err, infoResult) {
                    if (err) {
                        console.log("Error:" + err);
                    }
                    else if (infoResult) {
                        typeList.push({
                            name:item,
                            length:infoResult.length
                        });
                        count++;
                        if (result.length == count) {
                            res.json({
                                code: 0,
                                msg: "成功",
                                data: typeList,
                                detailMsg: "获取文章分类列表成功"
                            });
                        }
                    }else{
                        res.json({
                            code: 0,
                            msg: "成功",
                            detailMsg: "该用户还没发布过文章"
                        });
                    }
                });
            });
        }else{
            res.json({
                code: 0,
                msg: "成功",
                detailMsg: "该用户还没发布过文章"
            });
        }
    });
});


/**
 * get
 * url : /blog/getUserInfo
 * 个人博客——获取当前用户信息
 */
router.get('/getUserInfo', function (req, res, next) {
    UserInfo.findOne({'userID':req.query.userID},function(err,result){
        if(err){
            console.info("Error" + err);
        }
        else if(result){
            res.json({
                code: 0,
                msg: "成功",
                detailMsg: "获取用户信息成功",
                data: result
            });
        }else if(!result){
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
 * url : /blog/getArticleComment
 * 个人博客——获取当前文章的回复
 */
router.get('/getArticleComment', function (req, res, next) {
    //  查询条件
    var whereStr = { commentArticleID: req.query.commentArticleID , sort : '1' };

    var currentPageNum = parseInt(req.query.currentPageNum);
    var pageSize = parseInt(req.query.pageSize);

    //  计算数据总数
    ArticleComment.find(whereStr).count().exec(function (err, result) {
        pages = result / pageSize < 1 ? 1 : Math.ceil(result / pageSize);
        totals = result;

        ArticleComment.find(whereStr).skip(pageSize * (currentPageNum - 1)).limit(pageSize).exec(function (err, result) {
            if (err) {
                console.log("Error" + err)
            }
            if (result) {
                res.json({
                    code: 0,
                    msg: "成功",
                    detailMsg: "获取当前文章回复列表成功",
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
 * url : /blog/getArticleCommentAndInfo
 * 个人博客——获取当前文章的回复
 */
router.get('/getArticleCommentAndInfo', function (req, res, next) {
    //  查询条件
    var whereStr = { commentArticleID: req.query.commentArticleID , sort : '1' },
        currentPageNum = parseInt(req.query.currentPageNum),
        pageSize = parseInt(req.query.pageSize);

    //  计算数据总数
    ArticleComment.find(whereStr).count().exec(function (err, result) {
        pages = result / pageSize < 1 ? 1 : Math.ceil(result / pageSize);
        totals = result;

        ArticleComment.aggregate([
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
                    commentArticleID : whereStr["commentArticleID"]
                }
            }
        ],function(err,result){
            res.json({
                code: 0,
                msg: "成功",
                detailMsg: "获取评论列表与用户信息成功",
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
 * url : /blog/newArticleComment
 * 博客——新增当前文章的回复
 */
router.post('/newArticleComment', function (req, res, next) {
    
    //  这里写的十分丑，以后重写。先根据Id找出这个文章的回复数量
    Article.findById(req.body.commentArticleID, function (err, result) {
        if (err) {
            console.log("Error:" + err);
        }
        else {
            const resultObj = result._doc;
            commentCount = resultObj.commentCount;
            //  再更新回复数量+1
            Article.update({ '_id': req.body.commentArticleID }, { 'commentCount': commentCount + 1 }, function (err, result) {
                if (err) {
                    console.log("Error:" + err);
                }
                else if (result) {
                    console.log("update success start to save comment");

                    //  定义数据模型
                    const articleComment = new ArticleComment({
                        sort : "1",
                        floorNum : commentCount + 1,
                        commentArticleID: req.body.commentArticleID,
                        commentArticleTitle:req.body.commentArticleTitle,
                        commentUserName: req.body.commentUserName,
                        commentUserID: req.body.commentUserID,
                        commentValue: req.body.commentValue,
                        commentDate: req.body.commentDate,
                        commentCount: 0,
                        commentLike:[]
                    });

                    articleComment.save(function (err, result) {
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
                                detailMsg: "新增文章回复成功"
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
 * url : /blog/addLikeCount
 * 个人博客——增加点赞数量
 */
router.get('/addLikeCount', function (req, res, next) {
    Article.findById(req.query.articleID,["like"],function(err,result){
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
                Article.findOneAndUpdate({"_id":{$in:req.query.articleID}},{$push:{like:req.query.userID}},function(err,result){
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
 * post
 * url : /blog/updateArticle
 * 博客——更新文章资料
 */
router.post('/updateArticle', function (req, res, next) {
    
    const updateObject = {
        title : req.body.title,
        intro : req.body.intro,
        type : req.body.type,
        value : req.body.value,
        sort : req.body.sort 
    }

    //  这里写的十分丑，以后重写。先根据Id找出这个文章的回复数量
    Article.findById(req.body._id, function (err, result) {
        if (err) {
            console.log("Error:" + err);
        }
        else {
            Article.update({ '_id': req.body._id }, updateObject , function (err, result) {
                if (err) {
                    console.log("Error:" + err);
                }
                else if (result) {
                    res.json({
                        code: 0,
                        msg: "成功",
                        detailMsg: "更新文章资料成功"
                    });
                }
            });
        }
    });
});

/**
 * get
 * url : /blog/deleteArticle
 * 论坛——隐藏用户帖子
 */
router.get('/deleteArticle', function (req, res, next) {
    
    const updateObject = {
        'sort' : '0'
    };

    //  这里写的十分丑，以后重写。先根据Id找出这个文章的回复数量
    Article.findById(req.query._id, function (err, result) {
        if (err) {
            console.log("Error:" + err);
        }
        else {
            //  再更新回复数量+1
            Article.update({ '_id': req.query._id }, updateObject , function (err, result) {
                if (err) {
                    console.log("Error:" + err);
                }
                else if (result) {
                    res.json({
                        code: 0,
                        msg: "成功",
                        detailMsg: "更新文章资料成功"
                    });
                }
            });
        }
    });
});


/**
 * get
 * url : /blog/getUserInfoOrderByArticleID
 * 个人博客——根据文章id获取用户信息
 */
router.get('/getUserInfoOrderByArticleID', function (req, res, next) {
    //  查询条件
    var articleID = req.query.articleID;

    Article.findById(articleID, function (err, result) {
        if (err) {
            console.log("Error:" + err);
        }
        else {
            const resultObj = result._doc;
            
            Article.aggregate([
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
                        'userName' : resultObj.userName
                    }
                }
            ],function(err,result){
                res.json({
                    code: 0,
                    msg: "成功",
                    detailMsg: "获取博客信息成功",
                    data: result[0].detail[0]
                });
            });
        }
    })
});

/**
 * post
 * url : /blog/updateBlogBackground
 * 个人博客——更新用户博客背景图片
 */
router.post('/updateBlogBackground', function (req, res, next) {
    var wherestr = { 'userID': req.body.userID };
    var updatestr = {
        'blogBackground': req.body.blogBackground,
    };

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
                            detailMsg: "修改博客背景成功"
                        });
                    }
                }
            });
        }
    });
});

/**
 * post
 * url : /blog/saveAbout
 * 个人博客——更新用户博客关于
 */
router.post('/saveAbout', function (req, res, next) {
    var wherestr = { 'userID': req.body.userID };
    var updatestr = {
        'blogAbout': req.body.blogAbout,
    };

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
                            detailMsg: "修改博客关于成功"
                        });
                    }
                }
            });
        }
    });
});


module.exports = router;