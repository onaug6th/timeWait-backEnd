/**
 * 便利贴模型
 */

var mongoose = require('../utils/mongodb'),
    Schema = mongoose.Schema;

// 定义沙琪玛的模型与数据类型    
var StickyNoteSchema = new Schema({
    sort: { type: String },
    userID: { type: String },
    userName: { type: String },
    type: { type: String },
    title: { type: String },
    intro: { type: String },
    date: { type: String },
    value: { type: String },
    like: { type: Array },
    read: { type: Number }
});

// 导出，第一个参数为表名，第二个参数为沙琪玛
module.exports = mongoose.model('stickyNote', StickyNoteSchema);