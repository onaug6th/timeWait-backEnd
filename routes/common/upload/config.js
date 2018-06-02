/**
 * Created by demongao on 2017/3/14.
 * 这里的配置可以参考   https://www.jianshu.com/p/698e661fa622
 * 我就不贴出我的密钥啦。
 * config.js
 */
const path = require('path');
module.exports = {
    root: path.resolve(__dirname, '../'), //根目录
    //  七牛云 配置
    serverUrl:'',
    qiniu_config:{
        //  需要填写你的 Access Key 和 Secret Key
        accessKey:'',
        secretKey:'',
        bucket: '',
        origin: '',
    }
}
