var mongoose = require('mongoose');
// 建立数据库连接
mongoose.connect('mongodb://127.0.0.1:27017/applySystem', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log("数据库连接成功");

});

//  定义一个schema  对象的字段应该与数据库表一一对应
var AdminsSchema = mongoose.Schema({
    apartment: String,
    admin_email: String,
    admin_name: String,
    admin_phone: String,
    admin_number: String,
    admin_password: {
        type: String,
        default: '123456'
    },
    admin_identity: {
        type: String,
        default: 'admin'
    }
})

// 定义数据库模型 来操作数据库
var Admin = mongoose.model('Admin', AdminsSchema);

module.exports = Admin;