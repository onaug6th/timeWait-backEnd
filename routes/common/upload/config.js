/**
 * Created by demongao on 2017/3/14.
 * config.js
 */
const path = require('path');
module.exports = {
    root: path.resolve(__dirname, '../'), //根目录
    //七牛云 配置
    serverUrl:'oz1y7s5ij.bkt.clouddn.com',
    qiniu_config:{
        //需要填写你的 Access Key 和 Secret Key
        accessKey:'0c6pz4G0HTKtnoC9y8FeGXbJFQUSp-2nuhX4K90M',
        secretKey:'BPeRE65Ax1cjSyzc5SSRyKTaj5QGHG2i8kPOi6Ki',
        bucket: 'timewait',
        origin: '',
    }
}
