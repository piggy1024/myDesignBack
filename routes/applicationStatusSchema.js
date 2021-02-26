var mongoose = require('mongoose');
var Application = require('./applicationSchema');
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
var statusSchema = mongoose.Schema({
    app_id: {
        type: String,
        ref: Application // ref后的application代表的是主表application的Model。
    },
    department_status: {
        type: String,
        default: '0'
    },
    department_reason: {
        type: String,
        default: ''
    },
    logistics_status: {
        type: String,
        default: '0'
    },
    logistics_reason: {
        type: String,
        default: ''
    },
    school_dean_status: {
        type: String,
        default: '0'
    },
    school_dean_reason: {
        type: String,
        default: ''
    },
    technology_center_status: {
        type: String,
        default: '0'
    },
    technology_center_reason: {
        type: String,
        default: ''
    },
    stu_status_id: {
        type: String,
        default: ''
    }
})

// 定义数据库模型 来操作数据库
var Status = mongoose.model('applications_statu', statusSchema);

module.exports = Status;