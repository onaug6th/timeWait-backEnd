const express = require('express');
const router = express.Router();

const qn = require('qn');
const upload = require('./multerUtil')
var config = require('./config').qiniu_config;
var serverURL = require('./config').serverUrl;

/**
 * Post
 * url: /file/photo/avatar
 * 个人设置——上传头像
 */
router.post('/avatar', function (req, res, next) {
    //  七牛相关配置信息
    let client = qn.create(config);
    //  上传单个文件
    //  这里`avatar`对应前端form中input的name值
    upload.single('avatar', 10)(req, res, function (err) {
        if (err) {
            return console.error(err);
        }
        if (req.file && req.file.buffer) {
            //  获取源文件后缀名
            var fileFormat = (req.file.originalname).split(".");
            //  获取文件所属用户用户名
            var userID = req.body.userID;
            var userName = req.body.userName;
            //  设置上传到七牛云的文件命名
            var filePath = '/images/avatar/' + userID + '.' + userName + '.' + fileFormat[fileFormat.length - 1];
            var fileBuffer = req.file.buffer;
            // 上传到七牛
            function uploadFile(){
                client.upload(fileBuffer, { key: filePath }, function (err, result) {
                    if (err) {
                        if(err.code === 614){
                            client.delete(filePath,function(err,result){
                                if(err){
                                    res.json({
                                        code: 1,
                                        msg: "失败",
                                        detailMsg: err.message
                                    });
                                }else{
                                    uploadFile();
                                }
                            });
                        }else{
                            res.json({
                                code: 1,
                                msg: "失败",
                                detailMsg: err.message
                            });
                        }
                    }
                    else if (result) {
                        res.json({
                            code: 0,
                            msg: "成功",
                            data: {
                                picSrc: "http://" + serverURL + filePath
                            }
                        });
                    }else{
                        res.json({
                            code: 1,
                            msg: "失败",
                            detailMsg: "出BUG啦，快联系程序员"
                        });
                    }
                });
            }
            uploadFile();
        }
    });
});

/**
 * Post
 * url: /file/photo/blogBackground
 * 个人博客——上传封面
 */
router.post('/blogBackground', function (req, res, next) {
    //  七牛相关配置信息
    let client = qn.create(config);
    //  上传单个文件
    //  这里`avatar`对应前端form中input的name值
    
    upload.single('blogBackground', 10)(req, res, function (err) {
        if (err) {
            return console.error(err);
        }
        if (req.file && req.file.buffer) {
            //  获取源文件后缀名
            var fileFormat = (req.file.originalname).split(".");
            //  获取文件所属用户用户名
            var userID = req.body.userID;
            var userName = req.body.userName;
            //  设置上传到七牛云的文件命名
            var filePath = '/images/blogBackground/' + userID + '.' + userName + '.' + fileFormat[fileFormat.length - 1];
            var fileBuffer = req.file.buffer;
            // 上传到七牛
            function uploadFile(){
                client.upload(fileBuffer, { key: filePath }, function (err, result) {
                    if (err) {
                        if(err.code === 614){
                            client.delete(filePath,function(err,result){
                                if(err){
                                    res.json({
                                        code: 1,
                                        msg: "失败",
                                        detailMsg: err.message
                                    });
                                }else{
                                    uploadFile();
                                }
                            });
                        }else{
                            res.json({
                                code: 1,
                                msg: "失败",
                                detailMsg: err.message
                            });
                        }
                    }
                    else if (result) {
                        res.json({
                            code: 0,
                            msg: "成功",
                            data: {
                                picSrc: "http://" + serverURL + filePath
                            }
                        });
                    }else{
                        res.json({
                            code: 1,
                            msg: "失败",
                            detailMsg: "出BUG啦，快联系程序员"
                        });
                    }
                });
            }
            uploadFile();
        }
    });
});

/**
 * Post
 * url: /file/photo/articlePicture
 * 个人博客——文章图片
 */
router.post('/articlePicture', function (req, res, next) {
    //  七牛相关配置信息
    let client = qn.create(config);
    //  上传单个文件
    //  这里`avatar`对应前端form中input的name值
    upload.single('article', 10)(req, res, function (err) {
        if (err) {
            return console.error(err);
        }
        if (req.file && req.file.buffer) {
            //  获取源文件后缀名
            var fileFormat = (req.file.originalname).split(".");
            //  获取文件所属用户用户名
            var userID = req.body.userID;
            var userName = req.body.userName;
            var time = new Date().getTime();
            //  设置上传到七牛云的文件命名
            var filePath = '/images/articlePicture/' + userID + '.' + userName + '.' + time + '.' + fileFormat[fileFormat.length - 1];
            var fileBuffer = req.file.buffer;
            // 上传到七牛
            function uploadFile(){
                client.upload(fileBuffer, { key: filePath }, function (err, result) {
                    if (err) {
                        if(err.code === 614){
                            client.delete(filePath,function(err,result){
                                if(err){
                                    res.json({
                                        code: 1,
                                        msg: "失败",
                                        detailMsg: err.message
                                    });
                                }else{
                                    uploadFile();
                                }
                            });
                        }else{
                            res.json({
                                code: 1,
                                msg: "失败",
                                detailMsg: err.message
                            });
                        }
                    }
                    else if (result) {
                        res.json("http://" + serverURL + filePath);
                    }else{
                        res.json({
                            code: 1,
                            msg: "失败",
                            detailMsg: "出BUG啦，快联系程序员"
                        });
                    }
                });
            }
            uploadFile();
        }
    });
});

/**
 * Post
 * url: /file/photo/forumPicture
 * 论坛——帖子图片
 */
router.post('/forumPicture', function (req, res, next) {
    //  七牛相关配置信息
    let client = qn.create(config);
    //  上传单个文件
    //  这里`avatar`对应前端form中input的name值
    upload.single('forum', 10)(req, res, function (err) {
        if (err) {
            return console.error(err);
        }
        if (req.file && req.file.buffer) {
            //  获取源文件后缀名
            var fileFormat = (req.file.originalname).split(".");
            //  获取文件所属用户用户名
            var userID = req.body.userID;
            var userName = req.body.userName;
            var time = new Date().getTime();
            //  设置上传到七牛云的文件命名
            var filePath = '/images/forumPicture/' + userID + '.' + userName + '.' + time + '.' + fileFormat[fileFormat.length - 1];
            var fileBuffer = req.file.buffer;
            // 上传到七牛
            function uploadFile(){
                client.upload(fileBuffer, { key: filePath }, function (err, result) {
                    if (err) {
                        if(err.code === 614){
                            client.delete(filePath,function(err,result){
                                if(err){
                                    res.json({
                                        code: 1,
                                        msg: "失败",
                                        detailMsg: err.message
                                    });
                                }else{
                                    uploadFile();
                                }
                            });
                        }else{
                            res.json({
                                code: 1,
                                msg: "失败",
                                detailMsg: err.message
                            });
                        }
                    }
                    else if (result) {
                        res.json("http://" + serverURL + filePath);
                    }else{
                        res.json({
                            code: 1,
                            msg: "失败",
                            detailMsg: "出BUG啦，快联系程序员"
                        });
                    }
                });
            }
            uploadFile();
        }
    });
});

module.exports = router;
