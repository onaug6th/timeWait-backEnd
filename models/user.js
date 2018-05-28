/**
 * 用户信息模型
 */

var mongoose = require('../utils/mongodb'),
    Schema = mongoose.Schema;

// 定义沙琪玛的模型与数据类型    
var UserSchema = new Schema({
    userName: { type: String },
    passWord: { type: String },
    email: { type: String },
    level: { type: Number },
    registerDate : { type:String }
});

// 导出，第一个参数为表名，第二个参数为沙琪玛
module.exports = mongoose.model('user', UserSchema);