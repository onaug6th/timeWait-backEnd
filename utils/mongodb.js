//  引入mongoose
var mongoose = require('mongoose');
var settings = require("../config.json");

//  连接数据库
// mongoose.connect('mongodb://'+settings.mongodb.host+'/'+settings.mongodb.db,{useMongoClient: true});
mongoose.connect('mongodb://'+settings.mongodb.host+'/'+settings.mongodb.db,
    function(err){
        if(err) {
            console.err(err);
            throw err;
        }
    });

mongoose.connection.on('connected', function() {
    console.log('connect success');
});

mongoose.connection.on('error', function(err) {
    console.log('connect error');
});

mongoose.connection.on('disconnected', function() {
    console.log('connect disconnected');
});

//  导出这个数据库对象
module.exports = mongoose;