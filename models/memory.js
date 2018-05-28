/**
 * 印象模型
 */

var mongoose = require('../utils/mongodb'),
    Schema = mongoose.Schema;

// 定义沙琪玛的模型与数据类型    
var MemorySchema = new Schema({
    sort: { type: String },
    hidden: { type: String },
    readOnly: { type: String },
    createrID: { type: String },
    createrName: { type: String },
    createTime: { type: String },
    type: { type: String },
    intro: { type: String }
});

// 导出，第一个参数为表名，第二个参数为沙琪玛
module.exports = mongoose.model('memory', MemorySchema);