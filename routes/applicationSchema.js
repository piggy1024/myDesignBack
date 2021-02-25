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
var ApplicationSchema = mongoose.Schema({
    app_theme: String, // 主题
    stu_id: String, // 申请人工号或者学号
    app_name: String, // 申请人名称
    app_phone: String, // 申请人电话
    app_type: String, // 申请活动类型
    app_roomType: { // 申请教室类型
        type: Boolean,
        default: false
    },
    applicant: String, // 申请单位
    app_size: String, // 申请教室大小
    app_start_time: Date, // 申请开始使用时间
    app_end_time: Date, // 申请结束使用时间
    app_content: String, // 活动内容
    app_passTime: String, // 申请通过时间
    status: { // 通过状态
        type: Number,
        default: 0
    },
    c_id: String, // 教室id
    reason: String // 审批理由
})

// 定义数据库模型 来操作数据库
var Application = mongoose.model('Application', ApplicationSchema);

module.exports = Application;