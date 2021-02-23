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
var StudentsSchema = mongoose.Schema({
    stu_academy: String,
    stu_email: String,
    stu_name: String,
    stu_number: String,
    stu_phone: String,
    stu_sex: String,
    stu_password: {
        type: String,
        default: '123456'
    },
    // stu_identity: String
})

// 定义数据库模型 来操作数据库
var Student = mongoose.model('Student', StudentsSchema);

module.exports = Student;