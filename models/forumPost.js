/**
 * 帖子模型
 */

var mongoose = require('../utils/mongodb'),
Schema = mongoose.Schema;

// 定义沙琪玛的模型与数据类型    
var ForumPostSchema = new Schema({
    postSort : { type: String },
    postAuthor : { type: String},
    postAuthorID : { type: String},
    postTitle : { type: String },
    postType : { type: String },
    postIntro : { type: String },
    postValue : { type: String },
    postDate : { type:String},
    postLike : { type:Number },
    postRead : { type:Number },
    commentCount : { type:Number}
});

// 导出，第一个参数为表名，第二个参数为沙琪玛
module.exports = mongoose.model('ForumPost',ForumPostSchema);