/**
 * 用户信息模型
 */

var mongoose = require('../utils/mongodb'),
    Schema = mongoose.Schema;

// 定义沙琪玛的模型与数据类型    
var UserInfoSchema = new Schema({
    avatar : { type:String},
    blogBackground : { type:String },
    blogAbout : {type:String},
    email : { type:String},
    registerDate:{type:String},
    userID: { type: String },
    userName: { type: String },
    realName: { type: String },
    gender: { type: String },
    phone: { type: String },
    birthDay: { type: String },
    weibo: { type: String },
    qq: { type: String },
    weChat: { type: String },
    intro: { type: String },
    address: { type: String },
    lunch: { type: String },
    zfb: { type: String },
    wzry: { type: String },
    achievement: { type:Array }
});

// 导出，第一个参数为表名，第二个参数为沙琪玛
module.exports = mongoose.model('userInfo', UserInfoSchema);