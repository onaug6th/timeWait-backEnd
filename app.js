var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();

var session = require('express-session');

// 引入路由文件们
const blog = require('./routes/blog/blog');
const common_loginRegister = require('./routes/common/loginRegister');
const timeWait_userSetting = require('./routes/timeWait/userSetting');
const timeWait_userSpace = require('./routes/timeWait/userSpace');
const timeWait_adminSystem = require('./routes/timeWait/admin/adminSystem');
const timeWait_forum = require('./routes/timeWait/forum');
const timeWait_search = require('./routes/timeWait/search');
const timeWait_wall = require('./routes/timeWait/wall');

const fileupload = require('./routes/common/upload/qnupload');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false })); // ?
app.use(cookieParser('session')); // ?
app.use(session({
  secret: 'session',
  resave: true,
  saveUninitialized: true
}));

//  设置跨域
app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


// 请求路径
app.use('/blog', blog);
app.use('/timeWait', common_loginRegister);
app.use('/timeWait/userSetting', timeWait_userSetting);
app.use('/timeWait/userSpace', timeWait_userSpace);
app.use('/timeWait/admin', timeWait_adminSystem);
app.use('/timeWait/forum', timeWait_forum);
app.use('/timeWait/search', timeWait_search);
app.use('/timeWait/wall', timeWait_wall);

app.use('/file/photo', fileupload);


// 使用public下的静态文件
app.use(express.static('public'));


// 处理404错误
app.use(function (req, res) {
  res.sendFile(path.resolve(__dirname, 'public/index.html'));
});

const config = require('./config.json');

//  配置服务端口
const server = app.listen(config.server.port || 3000, config.server.host || '0.0.0.0', () => {
  let host = server.address().address;
  const port = server.address().port;
  console.log('The server listening at http://%s:%s', host, port);
});
