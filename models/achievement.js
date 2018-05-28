/**
 * 成就模型
 */

var mongoose = require('../utils/mongodb'),
Schema = mongoose.Schema;

// 定义沙琪玛的模型与数据类型    
var achievementSchema = new Schema({
    achievementName: { type: String },
    achievementIntro: { type: String },
    achievementType: { type:Number },
    achievementLevel: { type:Number }
});

// 导出，第一个参数为表名，第二个参数为沙琪玛
module.exports = mongoose.model('achievement', achievementSchema);