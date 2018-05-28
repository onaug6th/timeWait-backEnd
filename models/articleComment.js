/**
 * 博客文章回复模型
 */

var mongoose = require('../utils/mongodb'),
Schema = mongoose.Schema;

// 定义沙琪玛的模型与数据类型    
var ArticleCommentSchema = new Schema({
    sort : { type:String },
    floorNum : { type : Number },
    commentArticleID : { type: String },
    commentArticleTitle : { type:String},
    commentUserName: { type: String },
    commentUserID: { type: String },
    commentValue: { type: String },
    commentDate: { type: String },
    commentCount : { type : Number},
    commentLike: { type: Array }
});

// 导出，第一个参数为表名，第二个参数为沙琪玛
module.exports = mongoose.model('ArticleComment', ArticleCommentSchema);